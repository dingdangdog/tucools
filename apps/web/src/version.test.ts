import assert from "node:assert/strict";
import test from "node:test";
import { checkForUpdate, loadPublishedAt, newestRelease, parseVersion } from "./version.ts";

test("ignores the model pack tag and prereleases, then keeps the highest version", () => {
  const newest = newestRelease([
    { tag_name: "models", published_at: "2026-10-26T00:00:00Z" },
    { tag_name: "v0.0.3", published_at: "2026-10-01T00:00:00Z" },
    { tag_name: "v0.2.0", draft: true, published_at: "2026-10-20T00:00:00Z" },
    { tag_name: "v0.9.0-beta", prerelease: true, published_at: "2026-10-20T00:00:00Z" },
    { tag_name: "v0.1.0", published_at: "2026-09-01T00:00:00Z" },
  ]);
  assert.deepEqual(newest, { version: "0.1.0", publishedAt: "2026-09-01T00:00:00Z" });
  assert.equal(parseVersion("v0.1.0")?.join("."), "0.1.0");
  assert.equal(parseVersion("models"), null);
});

test("compares the current version with the release list", async () => {
  const releases = [
    { tag_name: "models", published_at: "2026-10-26T00:00:00Z" },
    { tag_name: "v0.2.0", published_at: "2026-10-20T00:00:00Z" },
    { tag_name: "v0.1.0", published_at: "2026-09-01T00:00:00Z" },
  ];
  const fetchImpl = async () => new Response(JSON.stringify(releases), { status: 200 });
  const newer = await checkForUpdate("0.1.0", fetchImpl);
  assert.deepEqual(newer, { status: "newer", version: "0.2.0", publishedAt: "2026-10-20T00:00:00Z" });
  const current = await checkForUpdate("0.2.0", fetchImpl);
  assert.equal(current.status, "current");
  const ahead = await checkForUpdate("0.3.0", fetchImpl);
  assert.equal(ahead.status, "current");
});

test("reads the current tag and treats a missing release as no date", async () => {
  const found = await loadPublishedAt("0.1.0", async () => new Response(JSON.stringify({ published_at: "2026-09-01T08:00:00Z" }), { status: 200 }));
  assert.equal(found, "2026-09-01T08:00:00Z");
  const missing = await loadPublishedAt("0.1.0", async () => new Response("missing", { status: 404 }));
  assert.equal(missing, null);
});
