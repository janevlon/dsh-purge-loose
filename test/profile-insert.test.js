import { test } from "node:test";
import assert from "node:assert/strict";
import { profileHasPurgeBodyInsert, rewritePnpmAllowBuilds } from "../lib/profile-insert.js";

test("已有本体 insert 不重复", () => {
  assert.equal(profileHasPurgeBodyInsert("- insert:\n    - id: dsh-purge\n"), true);
});

test("allowBuilds 覆盖 tarball spec", () => {
  const out = rewritePnpmAllowBuilds("allowBuilds:\n  dsh-purge: true\n");
  assert.match(out, /dsh-purge@https:\/\/codeload/);
});
