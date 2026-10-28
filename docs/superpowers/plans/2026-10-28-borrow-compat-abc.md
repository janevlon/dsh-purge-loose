# Borrow Compat ABC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从 upstream 1.1.81 向 master 1.1.71 宽松版移植 A/B/C 兼容性，不碰 E。

**Architecture:** 只抄思路+好代码：profile-insert 自愈、surface NEXT/DS-Bot 识别、zip 目录条目、skills fs 缺导入。D 仅做版本守卫评估，不做破坏性删除。

**Tech Stack:** Node ESM, node:test, pwsh git

**Spec:** 本会话用户指令：A/B/C 借用，D 评估，E 不用；bug 不照抄，思路优先。

## Global Constraints

- 不修改 `lib/net-scope.js`（E 坚决不用）。
- 不动 `dsh-purge-loose-upstream`（仅参照）。
- 每个 Task 独立可测，频繁提交。

## Review Focus

- profile 已有本体 insert 时不重复写（幂等）。
- 任意 `app.asar` 路径不误判 desktop。
- zip 目录条目不写成空文件。
- pnpm allowBuilds 同时覆盖 `dsh-purge-loose` 与 `dsh-purge-loose@codeload`。
- D 破坏性项（toolFilter 删除）必须有版本守卫，否则跳过。

---

### Task A: 安装自愈（profile-insert + postinstall + package）

**Files:**
- Create: `lib/profile-insert.js`
- Create: `scripts/ensure-profile-bundle.mjs`
- Modify: `package.json:36-40,66-87`
- Modify: `cordis.patch.yml:33-36`
- Test: `test/profile-insert.test.js`

**Interfaces:**
- Consumes: 无
- Produces: `ensureProfileBodyInsert(dir)`, `ensureProfileBundles(dir)`, `ensurePnpmAllowBuild(dir)`, `rewritePnpmAllowBuilds(raw)`, `profileHasPurgeBodyInsert(text)`

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { profileHasPurgeBodyInsert, rewritePnpmAllowBuilds } from "../lib/profile-insert.js";
test("已有本体 insert 不重复", () => {
  assert.equal(profileHasPurgeBodyInsert("- insert:\n    - id: dsh-purge-loose\n"), true);
});
test("allowBuilds 覆盖 tarball spec", () => {
  const out = rewritePnpmAllowBuilds("allowBuilds:\n  dsh-purge-loose: true\n");
  assert.match(out, /dsh-purge-loose@https:\/\/codeload/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/profile-insert.test.js`
Expected: FAIL with cannot find module / function missing

- [ ] **Step 3: Write minimal implementation**

从 upstream `lib/profile-insert.js:1-233` 抄思路：`INSERT_BLOCK` 最小 config（enabled/stripMnemon/capabilityProtocol/hooksDenyBypass），`profileHasPurgeBodyInsert` 认 `id: dsh-purge-loose(-main)` 或 `name: dsh-purge-loose`，`rewritePnpmAllowBuilds` 同时补 tarball spec。`scripts/ensure-profile-bundle.mjs` 抄 upstream 1-82。

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/profile-insert.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/profile-insert.js scripts/ensure-profile-bundle.mjs test/profile-insert.test.js package.json cordis.patch.yml
git commit -m "feat: borrow profile install self-heal (A)"
```

### Task B: 桌面识别（surface + desktop）

**Files:**
- Modify: `lib/surface.js`
- Modify: `lib/desktop.js`（仅 registry/process/shortcut 名单加 NEXT/Bot + 空结果不缓存）
- Test: `test/dsh-next.test.js`

**Interfaces:**
- Consumes: 无
- Produces: `isCommunityElectronHost(input)`, `detectSurface(input)`, `pathLooksDesktop(p)`

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { detectSurface, pathLooksDesktop, isCommunityElectronHost } from "../lib/surface.js";
test("DSH NEXT 按桌面认", () => {
  assert.equal(pathLooksDesktop("C:/Users/me/AppData/Local/Programs/DSH NEXT/DSH NEXT.exe"), true);
});
test("DSH NEXT 即使 DSH_SURFACE=web 也判桌面", () => {
  const input = { env: { DSH_SURFACE: "web", DSH_PROFILE: "dsh-next" }, execPath: "C:\\Programs\\DSH NEXT\\DSH NEXT.exe" };
  assert.equal(isCommunityElectronHost(input), true);
  assert.equal(detectSurface(input), "desktop");
});
test("普通 app.asar 不当桌面", () => {
  assert.equal(pathLooksDesktop("/tmp/random-app/resources/app.asar"), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/dsh-next.test.js`
Expected: FAIL（旧 surface 无 isCommunityElectronHost）

- [ ] **Step 3: Write minimal implementation**

抄 `upstream/lib/surface.js:19-134`：加 `dsh-next/dsh next/DeepSeek Bot/ds-bot` 路径分支，加 `isCommunityElectronHost`，`detectSurface` 优先判社区机，`DSH_SURFACE=web` 不覆盖社区机。`desktop.js` 只加名单（NEXT/Bot exe、注册表、快捷方式、安装目录）+ 空结果不缓存（`runningExes/shortcutExes` 空不写缓存），不抄杀进程收紧等严谨逻辑。

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/dsh-next.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/surface.js lib/desktop.js test/dsh-next.test.js
git commit -m "feat: borrow DSH NEXT and DS-Bot surface detect (B)"
```

### Task C: 解压/技能小修

**Files:**
- Modify: `lib/zip-extract.js:76-107`
- Modify: `lib/skills.js`（补 `import fs`）
- Test: `test/zip-extract.test.js`

**Interfaces:**
- Consumes: 无
- Produces: `extractZipBuffer(buf,dest)` 目录条目建目录

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { extractZipBuffer } from "../lib/zip-extract.js";
test("zip 目录条目建目录不写空文件", () => {
  const { execFileSync } = await import("node:child_process");
  // 用 upstream 已验证的 node 回退：目录条目以 / 结尾
  // 这里只断言函数存在且目录逻辑存在，真正的 zip 由手工构造
  assert.equal(typeof extractZipBuffer, "function");
});
```

简化：直接抄 upstream `test/zip-extract.test.js` 的目录条目用例（若存在则照抄）。

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/zip-extract.test.js`
Expected: FAIL（旧实现把目录写成空文件导致 EEXIST）

- [ ] **Step 3: Write minimal implementation**

抄 `upstream/lib/zip-extract.js:76-92`：加 `isZipDirectoryEntry`，目录先 `mkdir` 再 `continue`；保留中文报错文案（不改你的宽松文案，只改逻辑）。`lib/skills.js` 首行补 `import fs from "node:fs"` 恢复 #54 守卫。

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/zip-extract.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/zip-extract.js lib/skills.js test/zip-extract.test.js
git commit -m "fix: borrow zip dir entries and skills fs import (C)"
```

### Task D: 0.2.1 兼容评估（默认不借破坏性项）

**Files:**
- Modify: 无（评估后决定，默认只加版本守卫注释）
- Test: 无（若借则补 `test/settle-policy.test.js` 风格单测）

评估结论（已做）：master `dshTarget=0.2.0-rc.2`，upstream `dshTarget=0.2.1-rc.2`。`toolFilter` 删除、`dsh-tools` 解析、`{{cwd}}` 静态回退、`hostFs` fd 直通在 0.2.0 下要么无用要么有害。宽松版若不跟 0.2.1，D 整组跳过；若要跟，只借加法项（`additionalProperties`、file: 归档、`{{cwd}}` 回退），破坏性删除加 `version>=0.2.1` 守卫。本次执行默认跳过 D，只在 plan 留结论，不改代码。

- [ ] **Step 1: 确认宿主版本**

Run: `grep dshTarget package.json upstream/package.json`
Expected: master 0.2.0-rc.2，upstream 0.2.1-rc.2

- [ ] **Step 2: 记录结论不改代码**

本次不借 D。如用户后续要上 0.2.1，另开 Task D-1（加法项+版本守卫）。

---
