## Installers

Installers, the web image, and the engine image are built separately. An asset is missing until its publish job finishes.

Installers are unsigned and do not include the model pack. Windows, macOS, and Linux installers include the bundled engine runtime and start it when the app opens. They do not include the engine's Python source, and users do not install Python. The macOS arm64 and Intel packages are frozen on their own architectures. Local image tools work offline.

| Platform | File |
| --- | --- |
| Windows x64 | TuCools-__VERSION__-windows-x64.exe |
| macOS Apple silicon | TuCools-__VERSION__-mac-arm64.dmg, plus a zip with the same name |
| macOS Intel | TuCools-__VERSION__-mac-x64.dmg, plus a zip with the same name |
| Linux x64 | TuCools-__VERSION__-linux-x86_64.AppImage and TuCools-__VERSION__-linux-amd64.deb |

If macOS blocks the app, allow it in System Settings → Privacy & Security, or run `xattr -dr com.apple.quarantine` on the app. Make the AppImage executable before running it. Install the deb with `dpkg -i`.

Checksum files are `SHA256SUMS-windows.txt`, `SHA256SUMS-macos-arm64.txt`, `SHA256SUMS-macos-x64.txt`, and `SHA256SUMS-linux.txt`. Matching blockmap files can be ignored.

Model pack directories: `%APPDATA%\tucools\model-pack` on Windows, `~/Library/Application Support/tucools/model-pack` on macOS, and `~/.local/share/tucools/model-pack` on Linux. `TUCOOLS_MODEL_PACK` overrides these paths.

## Docker images

Images do not include the model pack. The `linux/amd64` engine image installs PyTorch for CUDA 12.8. The `linux/arm64` engine image is the CPU build.

- Web: __WEB_IMAGE__:__VERSION__
- Engine: __ENGINE_IMAGE__:__VERSION__

Digest files are `tucools-web-__VERSION__.txt` and `tucools-engine-__VERSION__.txt`. Whether `latest` moves depends on the image publish option. Republishing an older version does not move a newer `latest` by default.

A package is private the first time it is published. To let others pull the images, make `tucools-web` and `tucools-engine` public on GitHub Packages.

To deploy this version, set `TUCOOLS_VERSION=__VERSION__` and run:

    docker compose -f deploy/docker-compose.deploy.yml -f deploy/docker-compose.gpu.yml up -d

Omit `-f deploy/docker-compose.gpu.yml` when the machine has no NVIDIA GPU. See `docs/deploy.md`.
