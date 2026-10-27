const RELEASES_URL = "https://api.github.com/repos/dingdangdog/tucools/releases?per_page=100";
const headers = { accept: "application/vnd.github+json" };

export interface ReleasePoint {
  version: string;
  publishedAt: string;
}

interface GitHubRelease {
  tag_name?: string;
  draft?: boolean;
  prerelease?: boolean;
  published_at?: string | null;
}

export function parseVersion(value: string): [number, number, number] | null {
  const match = /^(?:v)?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareVersions(left: [number, number, number], right: [number, number, number]): number {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index]! - right[index]!;
  }
  return 0;
}

export function formatReleaseDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type ReleaseChannel = "web" | "engine" | "client";

export function currentReleaseChannel(): ReleaseChannel {
  if (typeof window !== "undefined" && window.tucools) return "client";
  return "web";
}

function channelVersion(tagName: string, channel: ReleaseChannel): string | null {
  const match = new RegExp(`^${channel}-v(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)$`).exec(tagName.trim());
  if (!match) return null;
  return `${match[1]}.${match[2]}.${match[3]}`;
}

function releasePoint(release: GitHubRelease, channel: ReleaseChannel): ReleasePoint | null {
  if (release.draft || release.prerelease || !release.published_at) return null;
  const version = channelVersion(release.tag_name || "", channel);
  if (!version) return null;
  return { version, publishedAt: release.published_at };
}

export function newestRelease(releases: GitHubRelease[], channel: ReleaseChannel): ReleasePoint | null {
  let best: ReleasePoint | null = null;
  let bestParsed: [number, number, number] | null = null;
  for (const release of releases) {
    const point = releasePoint(release, channel);
    const parsed = point ? parseVersion(point.version) : null;
    if (!point || !parsed) continue;
    if (!bestParsed || compareVersions(parsed, bestParsed) > 0) {
      best = point;
      bestParsed = parsed;
    }
  }
  return best;
}

export async function loadPublishedAt(version: string, channel: ReleaseChannel, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  const parsed = parseVersion(version);
  if (!parsed) return null;
  const response = await fetchImpl(`https://api.github.com/repos/dingdangdog/tucools/releases/tags/${channel}-v${parsed.join(".")}`, { headers });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("http");
  const body = (await response.json()) as GitHubRelease;
  return body.published_at || null;
}

export type VersionCheck =
  | { status: "newer"; version: string; publishedAt: string }
  | { status: "current" }
  | { status: "none" }
  | { status: "invalid" };

export async function checkForUpdate(version: string, channel: ReleaseChannel, fetchImpl: typeof fetch = fetch): Promise<VersionCheck> {
  const current = parseVersion(version);
  if (!current) return { status: "invalid" };
  const response = await fetchImpl(RELEASES_URL, { headers });
  if (!response.ok) throw new Error("http");
  const body = (await response.json()) as GitHubRelease[];
  if (!Array.isArray(body)) throw new Error("http");
  const newest = newestRelease(body, channel);
  const parsed = newest ? parseVersion(newest.version) : null;
  if (!newest || !parsed) return { status: "none" };
  if (compareVersions(parsed, current) <= 0) return { status: "current" };
  return { status: "newer", version: newest.version, publishedAt: newest.publishedAt };
}
