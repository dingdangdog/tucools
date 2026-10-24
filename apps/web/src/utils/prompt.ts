const AI_KEYWORDS = [
  "Steps:",
  "Sampler:",
  "CFG scale:",
  "Seed:",
  "Size:",
  "Model:",
  "Negative prompt:",
  "parameters",
  "DPM++",
  "Euler",
];

function textOf(bytes: Uint8Array) {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export function extractPngText(bytes: Uint8Array) {
  let text = "";
  let offset = 8;
  while (offset < bytes.length - 8) {
    const length =
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3];
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    if (type === "tEXt" || type === "iTXt") {
      text += `${textOf(bytes.slice(offset + 8, offset + 8 + length))}\n`;
    }
    offset += 12 + length;
    if (type === "IEND") break;
  }
  return text;
}

export function extractJpegText(bytes: Uint8Array) {
  let text = "";
  let offset = 2;
  while (offset < bytes.length - 4) {
    const marker = (bytes[offset] << 8) | bytes[offset + 1];
    const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (marker === 0xffe1 || marker === 0xfffe) {
      text += `${textOf(bytes.slice(offset + 4, offset + 2 + segmentLength))}\n`;
    }
    offset += 2 + segmentLength;
    if (marker >= 0xffc0 && marker <= 0xffcf && marker !== 0xffc4 && marker !== 0xffc8) break;
  }
  return text;
}

export function formatPrompt(rawText: string) {
  const clean = rawText.replace(/\0/g, "").replace(/\r/g, "").trim();
  if (!AI_KEYWORDS.some((keyword) => clean.includes(keyword))) return "";
  const paramMatch = clean.match(/parameters[:\s]*(.*)/is);
  if (!paramMatch?.[1]) return clean;
  const sections = paramMatch[1].trim().split(/(?=Negative prompt:|Steps:)/);
  const parts: string[] = [];
  const promptText = sections[0]?.replace(/\n+/g, " ").trim();
  if (promptText && !promptText.toLowerCase().startsWith("negative prompt")) {
    parts.push(`Prompt:\n${promptText}`);
  }
  const negative = sections.find((section) => section.trim().startsWith("Negative prompt:"));
  const negativeMatch = negative?.match(/Negative prompt:\s*(.*?)(?=\n*Steps:|$)/s);
  if (negativeMatch?.[1]) parts.push(`Negative prompt:\n${negativeMatch[1].replace(/\n+/g, " ").trim()}`);
  const parameters = sections.find((section) => section.includes("Steps:"));
  if (parameters) {
    const paramText = parameters.replace(/^.*?(Steps:)/s, "Steps:");
    const lines = paramText
      .split(/,\s*(?=[A-Za-z])/)
      .map((item) => item.trim())
      .filter(Boolean);
    parts.push(`Parameters:\n${lines.join("\n")}`);
  }
  return parts.join("\n\n");
}

export async function readEmbeddedPrompt(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const raw =
    file.type === "image/png" || name.endsWith(".png")
      ? extractPngText(bytes)
      : extractJpegText(bytes);
  return formatPrompt(raw);
}
