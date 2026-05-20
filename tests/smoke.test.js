const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("project structure exists", () => {
  const root = path.resolve(__dirname, "..");
  assert.ok(fs.existsSync(path.join(root, "server.js")), "expected server.js to exist");
  assert.ok(
    fs.existsSync(path.join(root, "lib", "telegram-nearby.js")),
    "expected lib/telegram-nearby.js to exist"
  );
});
