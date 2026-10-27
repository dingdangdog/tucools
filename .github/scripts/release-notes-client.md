Desktop installers for Windows, macOS, and Linux. This release does not include the page image, the engine image, or the model pack.

Tag: `client-v__VERSION__`

Installers are unsigned. They include the bundled engine runtime and start it when the app opens. They do not include the engine source, and users do not install Python. The macOS arm64 and Intel packages are frozen on their own architectures. Local image tools work offline.

| Platform | File |
| --- | --- |
| Windows x64 | TuCools-__VERSION__-windows-x64.exe |
| macOS Apple silicon | TuCools-__VERSION__-mac-arm64.dmg, plus a zip with the same name |
| macOS Intel | TuCools-__VERSION__-mac-x64.dmg, plus a zip with the same name |
| Linux x64 | TuCools-__VERSION__-linux-x86_64.AppImage and TuCools-__VERSION__-linux-amd64.deb |

A platform file appears after that platform's job succeeds. The other platforms can be published later onto this same release.

If macOS blocks the app, allow it in System Settings → Privacy & Security, or run `xattr -dr com.apple.quarantine` on the app. Make the AppImage executable before running it. Install the deb with `dpkg -i`.

Checksum files are `SHA256SUMS-windows.txt`, `SHA256SUMS-macos-arm64.txt`, `SHA256SUMS-macos-x64.txt`, and `SHA256SUMS-linux.txt`. Matching blockmap files can be ignored.

Model pack directories: `%APPDATA%\tucools\model-pack` on Windows, `~/Library/Application Support/tucools/model-pack` on macOS, and `~/.local/share/tucools/model-pack` on Linux. `TUCOOLS_MODEL_PACK` overrides these paths. The model pack stays on the `models` release.

Page and engine images are separate releases. Their titles start with `TuCools Web` and `TuCools Engine`.
