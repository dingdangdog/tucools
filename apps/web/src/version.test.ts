import assert from "node:assert/strict";
import test from "node:test";
import { checkForUpdate, currentReleaseChannel, loadPublishedAt, newestRelease, parseVersion } from "./version.ts";

const releases = [
  { tag_name: "models", published_at: "2026-10-26T00:00:00Z" },
  { tag_name: "v0.9.0", published_at: "2026-10-01T00:00:00Z" },
  { tag_name: "web-v0.3.0", draft: true, published_at: "2026-10-20T00:00:00Z" },
  { tag_name: "web-v0.9.0-beta", prerelease: true, published_at: "2026-10-20T00:00:00Z" },
  { tag_name: "web-v0.1.0", published_at: "2026-09-01T00:00:00Z" },
  { tag_name: "client-v0.4.0", published_at: "2026-10-20T00:00:00Z" },
  { tag_name: "engine-v1.0.0", published_at: "2026-10-21T00:00:00Z" },
];

test("keeps the highest release of one product and ignores the others", () => {
  assert.deepEqual(newestRelease(releases, "web"), { version: "0.1.0", publishedAt: "2026-09-01T00:00:00Z" });
  assert.deepEqual(newestRelease(releases, "client"), { version: "0.4.0", publishedAt: "2026-10-20T00:00:00Z" });
  assert.deepEqual(newestRelease(releases, "engine"), { version: "1.0.0", publishedAt: "2026-10-21T00:00:00Z" });
  assert.equal(parseVersion("v0.1.0")?.join("."), "0.1.0");
  assert.equal(parseVersion("web-v0.1.0"), null);
  assert.equal(parseVersion("models"), null);
  assert.equal(currentReleaseChannel(), "web");
});

test("compares the current version with the same product only", async () => {
  const fetchImpl = async () => new Response(JSON.stringify(releases), { status: 200 });
  const newer = await checkForUpdate("0.1.0", "client", fetchImpl);
  assert.deepEqual(newer, { status: "newer", version: "0.4.0", publishedAt: "2026-10-20T00:00:00Z" });
  const current = await checkForUpdate("0.4.0", "client", fetchImpl);
  assert.equal(current.status, "current");
  const web = await checkForUpdate("0.1.0", "web", fetchImpl);
  assert.equal(web.status, "current");
  const ahead = await checkForUpdate("0.3.0", "web", fetchImpl);
  assert.equal(ahead.status, "current");
});

test("reads the product tag and treats a missing release as no date", async () => {
  let seen = "";
  const found = await loadPublishedAt("0.1.0", "web", async (url) => {
    seen = String(url);
    return new Response(JSON.stringify({ published_at: "2026-09-01T08:00:00Z" }), { status: 200 });
  });
  assert.equal(seen, "https://api.github.com/repos/dingdangdog/tucools/releases/tags/web-v0.1.0");
  assert.equal(found, "2026-09-01T08:00:00Z");
  const missing = await loadPublishedAt("0.1.0", "client", async () => new Response("missing", { status: 404 }));
  assert.equal(missing, null);
});
