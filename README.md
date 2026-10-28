# dsh-purge-loose

DeepSeek Harness 宽松版插件：提示词注入与宿主补丁管理，附带 DSH NEXT / DS Bot 桌面识别、
安装自愈、zip 解压与技能导入修复。**非盈利、仅限本机研究自用。**

## 来源声明（必读）

本项目 Forked from [YuJunZhiXue/dsh-purge](https://github.com/YuJunZhiXue/dsh-purge)
（MIT 时期快照为底，合并了上游 1.1.73~1.1.81 的部分兼容性更新）。
原作者版权归 YuJunZhiXue，本 fork 改动部分版权归 janevlon。
许可证 Apache-2.0（见 [LICENSE](./LICENSE)），署名见 [NOTICE](./NOTICE)。
**禁止倒卖、白标、商用；fork/二开必须保留署名并注明来源。**

与上游的区别（宽松版）：
- 保留：安装自愈（bundles/insert/allowBuilds）、DSH NEXT 与 DS Bot 桌面识别、
  zip 目录条目修复、skills 缺 `fs` 导入修复、更新源优先走 npm。
- 去掉：上游的严格靶场门禁（域名先解析、私网放行、公网硬拦等）。
  宽松不等于无约束——下面“使用范围”仍然有效，使用者自负其责。

## 使用范围与免责

1. 只用于你有权管理的**本机官方 DeepSeek Harness**（`@deepseek-ai` 包与本机配置），
   不得用于未授权的网站、服务器、账号与信息系统。
2. 不扫描、不攻击公网与第三方系统；不做外挂、内存修改、反作弊绕过。
3. 遵守所在地法律法规与模型服务商条款；违法后果由行为人自行承担，与作者无关。
4. 本项目按“现状”提供，不做任何明示或暗示担保。
5. 与 DeepSeek 官方无任何雇佣、商业、授权或背书关系。“官方”仅指评测对象是
   本机已安装的官方 Harness 包。

## 安装

前置：目标宿主（`dsh web` 用 `web`，官方桌面 EXE 用 `desktop`）各装各的，不要串。

```sh
# 有 dsh 命令（推荐，用 codeload 避开 github.com/archive 的 302）
dsh plugin --profile web add https://codeload.github.com/janevlon/dsh-purge-loose/tar.gz/refs/heads/master
# 桌面端：
dsh plugin --profile desktop add https://codeload.github.com/janevlon/dsh-purge-loose/tar.gz/refs/heads/master

# 只有 pnpm（在对应 profile 目录里执行）：
cd "$DSH_HOME/profiles/web"
pnpm add --allow-build=dsh-purge-loose https://codeload.github.com/janevlon/dsh-purge-loose/tar.gz/refs/heads/master
```

装完：宿主**完全退出重开** → 点 `dsh-purge-loose` 按钮进 **Clean** → 点 **Apply** →
等自动重启一次。面板“检测更新”优先查 npm（`dsh-purge-loose`），npm 未发布时回退 GitHub。

## 开发

```sh
pnpm install
pnpm test   # node --test，共 6 个用例
```

## License

Apache-2.0，见 [LICENSE](./LICENSE)。再发布必须保留 [NOTICE](./NOTICE) 署名、
注明改动文件，并在 README 保留本来源声明。
