<p align="center">
  <a href="./README.md"><strong>English</strong></a>
  &nbsp;·&nbsp;
  <a href="./README.zh-CN.md">中文</a>
</p>

<div align="center">
  <h1>TuCools</h1>
  <p>Image tools on your own machine. The desktop app and Docker open the same page.</p>
</div>

<p align="center">
  <img alt="release" src="https://img.shields.io/github/v/release/dingdangdog/tucools" />
  <img alt="stars" src="https://img.shields.io/github/stars/dingdangdog/tucools" />
  <img alt="forks" src="https://img.shields.io/github/forks/dingdangdog/tucools" />
</p>
<p align="center">
  <img alt="issues-open" src="https://img.shields.io/github/issues/dingdangdog/tucools?color=important" />
  <img alt="issues-closed" src="https://img.shields.io/github/issues-closed/dingdangdog/tucools?color=green" />
  <a href="https://github.com/dingdangdog/tucools/pkgs/container/tucools-web"><img alt="tucools-web" src="https://img.shields.io/badge/ghcr.io-tucools--web-2496ED" /></a>
  <a href="https://github.com/dingdangdog/tucools/pkgs/container/tucools-engine"><img alt="tucools-engine" src="https://img.shields.io/badge/ghcr.io-tucools--engine-2496ED" /></a>
</p>

The Chinese name is 图酷. Compress, crop, convert, watermark, and the other everyday tools finish in the page, and the image stays on this device. Cutout, enhance, and erase call TuCools' own engine. They need a [model pack](https://github.com/dingdangdog/tucools/releases/tag/models) downloaded separately. Open the app and use it. No sign-in.

Installers are on [Releases](https://github.com/dingdangdog/tucools/releases). For cutout, enhance, and erase without reading the source, start with [How to use the AI tools](docs/2026-10-26-如何使用AI功能.md) (Chinese).

## Examples

| You want to | Open |
| --- | --- |
| Compress a JPEG to about 200KB | Compress |
| Fit the long edge to 1920 and pad the rest | Resize |
| Drag a crop, preview it, and export PNG | Crop |
| Make an ID-photo ratio and fill blue or red | ID photo size, inside Crop. It crops and fills a color |
| Put each image on its own PDF page, preview, then export | To PDF |
| Remove the background | Cutout. Needs the model pack |
| Paint out a passer-by, a watermark, or clutter | Erase. Needs the model pack |

ID photo size, social sizes, store sizes, and circle are modes of Crop. Split is separate: it cuts one image into pieces.

## Features

**Standard.** No model pack. The image stays on this device.

- **Compress.** JPEG, PNG, and WebP by quality, longest edge, or target size.
- **Resize.** Scale to a width and height, or place the image on a canvas with margins.
- **Convert.** PNG, JPEG, WebP, BMP, and ICO.
- **Crop.** The result updates while you drag. Click to enlarge, then export PNG. ID photo size, social sizes, store sizes, and circle are in the same tool. ID photo size fills a background color.
- **Split.** Cut on a vertical, horizontal, or diagonal line, or into a grid. The pieces can be joined back.
- **Watermark** and **Add text.** A translucent watermark, or one large line in the center.
- **Grayscale.**
- **To PDF.** One image per page. The preview follows the paper, direction, and order.
- **Favicon.** PNG at 16, 32, 48, and 180, plus one ICO.

**Info.** No model pack.

- **Strip info.** View the EXIF, then save a new image without that metadata.
- **Image info.** View the EXIF and export JSON.
- **Prompt extract.** Read the prompt, negative prompt, and generation parameters already stored in a PNG or JPEG.

**AI.** These three call the local engine and need the model pack below. One image at a time, up to 50MB.

- **Cutout.** General, Light, Portrait, High precision, or Anime. Exports a transparent PNG.
- **Enhance.** General enhance, Standard enhance, High-quality enhance, Digital art, or Anime, plus a scale factor.
- **Erase.** Paint the area to remove. The engine fills it in.

## Desktop app

Download the build for your system from [Releases](https://github.com/dingdangdog/tucools/releases):

| System | File |
| --- | --- |
| Windows x64 | `TuCools-<version>-windows-x64.exe` |
| macOS Apple silicon | `TuCools-<version>-mac-arm64.dmg`, and a zip with the same name |
| macOS Intel | `TuCools-<version>-mac-x64.dmg`, and a zip with the same name |
| Linux x64 | `TuCools-<version>-linux-x86_64.AppImage` and `TuCools-<version>-linux-amd64.deb` |

A release that only has notes does not include these files yet. Pick a release that has them, or use Docker below.

The installers are not code-signed. On Windows, choose to run it when the publisher warning appears. On macOS, allow it in System Settings → Privacy & Security. On Linux, mark the AppImage executable before opening it, or install the deb with `dpkg -i`.

Standard and Info tools work as soon as the app opens. Cutout, enhance, and erase also need the model pack in the directory below. On those pages, **Download and install** fetches and unpacks it for you. The website and Docker still use the release page.

## Docker

The published stack listens on port **13175**. Image tags, the GPU file, and site options are in [docs/deploy.md](docs/deploy.md) (Chinese).

1. **Install Docker.** [Docker Engine](https://docs.docker.com/engine/install/) with Compose is enough.
2. **Start.**

   ```bash
   git clone https://github.com/dingdangdog/tucools.git
   cd tucools
   docker compose -f deploy/docker-compose.deploy.yml up -d
   ```

   Open http://127.0.0.1:13175 .

3. **NVIDIA, optional.** Add the GPU file only when the machine has an NVIDIA GPU and the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html). The driver needs CUDA 12.8 or newer. Without a GPU, leave this file out. Compose cannot create the engine container if it is included.

   ```bash
   docker compose -f deploy/docker-compose.deploy.yml -f deploy/docker-compose.gpu.yml up -d
   ```

4. **Models.** The images do not contain them. Unpack the model pack so `tucools/model-pack/models` and `tucools/model-pack/bin` exist, run the same start command again, then choose **Check again** on the page.

Without a GPU, cutout, enhance, and erase use the CPU. Enhance inside the Linux container also needs `bin/linux/upscayl-bin` from the model pack.

Images: [`ghcr.io/dingdangdog/tucools-web`](https://github.com/dingdangdog/tucools/pkgs/container/tucools-web) and [`ghcr.io/dingdangdog/tucools-engine`](https://github.com/dingdangdog/tucools/pkgs/container/tucools-engine).

## Models

Only cutout, enhance, and erase need models.

Download [model-pack.zip](https://github.com/dingdangdog/tucools/releases/download/models/model-pack.zip) (about 900MB) from the [models](https://github.com/dingdangdog/tucools/releases/tag/models) release. After unpacking, two folders should sit side by side:

- `models` holds the cutout, erase, and enhance weights
- `bin` holds the enhance program for Windows, Linux, and macOS

A path like `model-pack/model-pack/models` has one extra folder. Remove that inner level so `models` and `bin` are neighbors.

**Desktop app.** Put that pair here:

| System | Directory |
| --- | --- |
| Windows | `%APPDATA%\tucools\model-pack` |
| macOS | `~/Library/Application Support/tucools/model-pack` |
| Linux | `~/.local/share/tucools/model-pack`. When `XDG_DATA_HOME` is set, use `$XDG_DATA_HOME/tucools/model-pack` |

On Windows, press Win+R, enter `%APPDATA%\tucools`, and create `model-pack` if it is missing. The directory itself should contain `models` and `bin`.

To point at another unpacked folder before launch:

```powershell
$env:TUCOOLS_MODEL_PACK = "D:\downloads\model-pack"
```

```bash
export TUCOOLS_MODEL_PACK="$HOME/downloads/model-pack"
```

**Docker** reads `model-pack` in the cloned repository, or `TUCOOLS_MODEL_PACK` if you set it before start. That directory also needs `models` and `bin` directly inside it.

Open cutout, enhance, or erase again and choose **Check again**.

- Cutout works for each effect whose file is present. One example is `models/u2net.onnx`.
- Erase needs `models/big-lama.pt`.
- Enhance needs the `.bin` and `.param` for the chosen effect, plus this system's program: `bin/windows/upscayl-bin.exe`, `bin/macos/upscayl-bin`, or `bin/linux/upscayl-bin`.

If enhance will not start on macOS or Linux, mark the program executable and check again:

```bash
chmod +x "bin/macos/upscayl-bin"
chmod +x "bin/linux/upscayl-bin"
```

Effects whose files are already present stay available. The page lists what is still missing. File names are in [docs/models.md](docs/models.md).

## Languages

The interface opens in Simplified Chinese, and that address has no prefix. Switch language from the top bar. The English interface calls the product TuCools. Every other language calls it 图酷.

| Language | Prefix |
| --- | --- |
| Traditional Chinese | `/zh_hant` |
| English | `/en` |
| Spanish | `/es` |
| German | `/de` |
| Japanese | `/ja` |
| Brazilian Portuguese | `/pt_br` |
| Hindi | `/hi` |
| Vietnamese | `/vn` |
| Arabic | `/ar` |
| Bengali | `/bn` |

The website keeps the language in the address. It does not follow the browser language. On its first open, with no saved language, the desktop app follows the system language. Arabic pages run right to left.

## Development

Page, engine, and packaging steps are in [develop.md](develop.md) (Chinese).

```powershell
npm install
npm run dev:web
```

The dev page listens on http://127.0.0.1:13175 . Standard tools work before the engine is running. Cutout, enhance, and erase also need the engine and the model pack.

## Docs

The longer guides are in Chinese.

- [Deploy](docs/deploy.md): Docker, installers, images, and site options
- [Models](docs/models.md): file names and where each one is used
- [How to use the AI tools](docs/2026-10-26-如何使用AI功能.md): cutout, enhance, and erase without reading the source
- [Development](develop.md): page, engine, and local startup
