# 模型包

抠图、优化和消除的模型文件单独发布。用户自己下载并解压，不放进安装包，也不放进 Docker 镜像。

下载 [model-pack.zip](https://github.com/dingdangdog/tucools/releases/download/models/model-pack.zip)。发布页是 [models](https://github.com/dingdangdog/tucools/releases/tag/models)。安装步骤见仓库 [README](../README.md)。某个 AI 功能没有可用模型时，页面停用该功能，并给出仓库地址和这个模型发布页。

解压后的目录名可以自定，结构固定如下：

```text
model-pack/
  models/
    u2net.onnx
    u2netp.onnx
    u2net_human_seg.onnx
    isnet-general-use.onnx
    isnet-anime.onnx
    big-lama.pt
    upscayl-lite-4x.bin
    upscayl-lite-4x.param
    upscayl-standard-4x.bin
    upscayl-standard-4x.param
    realesrgan-x4plus.bin
    realesrgan-x4plus.param
    digital-art-4x.bin
    digital-art-4x.param
    realesrgan-x4plus-anime.bin
    realesrgan-x4plus-anime.param
  bin/
    windows/upscayl-bin.exe
    linux/upscayl-bin
    macos/upscayl-bin
```

完整文件名也写在 `deploy/model-pack.json`。某个工具只用到其中一部分时，健康检查会列出还缺的文件。超分程序和对应的 `.bin`、`.param` 属于模型包，因为安装包和镜像里都没有它们。

## 放到哪里

开发时，引擎默认读取仓库根目录的 `model-pack`。已有旧版图酷运行时可以这样准备，这只是本机目录，不会打进安装包或镜像：

```powershell
powershell -File scripts/link-models.ps1
```

安装后的程序默认读取：

| 系统 | 目录 |
| --- | --- |
| Windows | `%APPDATA%\tucools\model-pack` |
| macOS | `~/Library/Application Support/tucools/model-pack` |
| Linux | `~/.local/share/tucools/model-pack`。如果设置了 `XDG_DATA_HOME`，则放在它下面的 `tucools/model-pack`。 |

也可以把解压目录指到别的位置：

```powershell
$env:TUCOOLS_MODEL_PACK = "D:\downloads\model-pack"
```

Docker 把宿主机上的同一个目录只读挂到容器内的 `/model-pack`。镜像构建不会复制这些文件。没有设置变量时，挂载仓库根目录的 `model-pack`。

打开抠图、优化或消除时，页面只检查当前功能：`/api/engine/health/cutout`、`/api/engine/health/enhance`、`/api/engine/health/erase`。抠图不查看超分程序和消除模型，优化和消除也只查看自己的文件。总览地址 `/api/engine/health` 仍会一次列出三个功能。

没有可用模型时会停用当前功能，并写上这个目录。放好文件后点「重新检查」。只缺一部分模型时，当前功能仍可用，侧栏会列出还没安装的文件。
