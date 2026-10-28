# dsh-purge-loose

DeepSeek Harness 宽松版插件。Forked from [YuJunZhiXue/dsh-purge](https://github.com/YuJunZhiXue/dsh-purge)
(MIT-era snapshot)，合并了上游部分兼容性修复（安装自愈、DSH NEXT/DS Bot 识别、
zip 目录条目、skills 缺导入），去掉了严格的靶场门禁。非盈利、仅本机研究自用。

## License

Apache-2.0，见 [LICENSE](./LICENSE)，署名见 [NOTICE](./NOTICE)。
原作者版权归 YuJunZhiXue，本 fork 改动部分版权归 bamboostrip。

## Install

```sh
# 本仓库私有期间：用 git 安装
dsh plugin --profile web add git@github.com:bamboostrip/dsh-purge-loose.git
# npm 发布后：
pnpm add dsh-purge-loose
```
