// 确认推送到 GHCR 的多架构清单能在包页面显示描述。
// 索引和每个平台清单都要有 org.opencontainers.image.description。
// 证明清单会被 GitHub 显示成 unknown/unknown，这里直接拒绝。

import { execFileSync } from "node:child_process";

const DESCRIPTION = "org.opencontainers.image.description";
const OCI_INDEX = "application/vnd.oci.image.index.v1+json";
const PLATFORMS = ["linux/amd64", "linux/arm64"];

export function checkIndex(index, expected) {
  if (!index || index.mediaType !== OCI_INDEX) {
    throw new Error(`清单索引类型是 ${index?.mediaType || "空"}，GitHub 读不到注解。`);
  }
  const description = index.annotations?.[DESCRIPTION];
  if (!description) {
    throw new Error("清单索引没有描述，GitHub 包页面会显示 No description provided。");
  }
  if (description !== expected) {
    throw new Error(`清单索引描述与本次发布不一致：${description}`);
  }
  const digests = [];
  const seen = new Set();
  for (const item of index.manifests || []) {
    const reference = item.annotations?.["vnd.docker.reference.type"];
    if (reference) {
      throw new Error(`清单含有 ${reference}，GitHub 会多出未知架构。`);
    }
    const platform = `${item.platform?.os}/${item.platform?.architecture}`;
    if (!PLATFORMS.includes(platform)) {
      throw new Error(`包页面只应列出 linux/amd64 和 linux/arm64，当前有 ${platform}。`);
    }
    if (seen.has(platform)) {
      throw new Error(`架构重复：${platform}`);
    }
    seen.add(platform);
    if (!item.digest?.startsWith("sha256:")) {
      throw new Error(`${platform} 缺少摘要。`);
    }
    digests.push({ platform, digest: item.digest });
  }
  for (const platform of PLATFORMS) {
    if (!seen.has(platform)) {
      throw new Error(`缺少 ${platform}。`);
    }
  }
  return digests;
}

export function checkPlatformManifest(manifest, expected, platform) {
  const description = manifest?.annotations?.[DESCRIPTION];
  if (!description) {
    throw new Error(`${platform} 清单没有描述，GitHub 包页面会显示 No description provided。`);
  }
  if (description !== expected) {
    throw new Error(`${platform} 描述与本次发布不一致：${description}`);
  }
}

function inspectRaw(ref) {
  const raw = execFileSync("docker", ["buildx", "imagetools", "inspect", "--raw", ref], {
    encoding: "utf8",
  });
  return JSON.parse(raw);
}

function assertFails(fn) {
  try {
    fn();
  } catch (error) {
    if (error instanceof Error && error.message) return;
  }
  throw new Error("自测未按预期失败。");
}

function selfTest() {
  const expected = "图酷图像处理引擎，提供抠图、优化和消除。镜像不含模型包。";
  const goodIndex = {
    mediaType: OCI_INDEX,
    annotations: { [DESCRIPTION]: expected },
    manifests: [
      { digest: "sha256:aa", platform: { os: "linux", architecture: "amd64" } },
      { digest: "sha256:bb", platform: { os: "linux", architecture: "arm64" } },
    ],
  };
  const digests = checkIndex(goodIndex, expected);
  if (digests.length !== 2) throw new Error("自测没有读到两个架构。");
  checkPlatformManifest({ annotations: { [DESCRIPTION]: expected } }, expected, "linux/amd64");

  assertFails(() => checkIndex({ mediaType: OCI_INDEX, manifests: goodIndex.manifests }, expected));
  assertFails(() =>
    checkIndex(
      {
        ...goodIndex,
        manifests: [
          ...goodIndex.manifests,
          {
            digest: "sha256:cc",
            platform: { os: "unknown", architecture: "unknown" },
            annotations: { "vnd.docker.reference.type": "attestation-manifest" },
          },
        ],
      },
      expected,
    ),
  );
  assertFails(() => checkPlatformManifest({ annotations: {} }, expected, "linux/amd64"));
  assertFails(() =>
    checkPlatformManifest({ annotations: { [DESCRIPTION]: "别的描述" } }, expected, "linux/arm64"),
  );
  console.log("自测通过。");
}

function main() {
  const image = process.env.IMAGE;
  const version = process.env.VERSION;
  const expected = process.env.EXPECTED;
  if (!image || !version || !expected) {
    throw new Error("需要 IMAGE、VERSION 和 EXPECTED。");
  }
  const ref = `${image}:${version}`;
  const index = inspectRaw(ref);
  const digests = checkIndex(index, expected);
  for (const item of digests) {
    const manifest = inspectRaw(`${image}@${item.digest}`);
    checkPlatformManifest(manifest, expected, item.platform);
  }
  console.log(`描述：${expected}`);
  console.log(`架构：${digests.map((item) => item.platform).join("、")}`);
}

try {
  if (process.env.SELF_TEST === "1") selfTest();
  else main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
