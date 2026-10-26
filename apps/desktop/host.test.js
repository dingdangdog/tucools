const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const { chooseEngine } = require("./host");

function tempResources() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tucools-engine-"));
}

test("packaged Windows uses the bundled executable", () => {
  const resources = tempResources();
  const engine = path.join(resources, "engine");
  fs.mkdirSync(engine);
  const executable = path.join(engine, "tucools-engine.exe");
  fs.writeFileSync(executable, "");
  try {
    const choice = chooseEngine(resources, true);
    assert.equal(choice.mode, "bundled");
    assert.equal(choice.executable, executable);
  } finally {
    fs.rmSync(resources, { recursive: true, force: true });
  }
});

test("packaged Windows does not fall back to Python", () => {
  const resources = tempResources();
  fs.mkdirSync(path.join(resources, "engine"));
  try {
    const choice = chooseEngine(resources, true);
    assert.equal(choice.mode, "missing");
  } finally {
    fs.rmSync(resources, { recursive: true, force: true });
  }
});

test("development still selects the repository engine", () => {
  const previous = process.env.TUCOOLS_RUNTIME;
  delete process.env.TUCOOLS_RUNTIME;
  const resources = tempResources();
  try {
    const choice = chooseEngine(resources, false);
    assert.equal(choice.mode, "python");
    assert.equal(choice.engineDir, path.resolve(__dirname, "../../services/engine"));
  } finally {
    if (previous === undefined) delete process.env.TUCOOLS_RUNTIME;
    else process.env.TUCOOLS_RUNTIME = previous;
    fs.rmSync(resources, { recursive: true, force: true });
  }
});
