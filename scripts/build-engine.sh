#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
python="$root/.venv/bin/python"
engine="$root/services/engine"
dist="$engine/dist/tucools-engine"
bin="$dist/tucools-engine"
force=0
if [[ "${1:-}" == "--force" ]]; then
  force=1
fi

if [[ ! -x "$python" ]]; then
  python3 -m venv "$root/.venv"
fi

import_check() {
  "$python" -c "import torch, torchvision, uvicorn, fastapi, onnxruntime, rembg, cv2, PIL, numpy, multipart, pydantic, scipy, skimage, pymatting"
}

install_requirements() {
  if [[ "$(uname -s)" == "Darwin" ]]; then
    # CPU 索引没有 macOS 轮子。torch 版本由 requirements.txt 按架构选择。
    filtered="$(mktemp)"
    grep -vE '^--extra-index-url' "$engine/requirements.txt" > "$filtered"
    "$python" -m pip install -r "$filtered"
    rm -f "$filtered"
  else
    "$python" -m pip install -r "$engine/requirements.txt"
  fi
  "$python" -m pip cache purge || true
}

if ! import_check; then
  install_requirements
  import_check
fi

needs_build=1
if [[ "$force" -eq 0 && -f "$bin" ]]; then
  needs_build=0
  while IFS= read -r -d '' file; do
    if [[ "$file" -nt "$bin" ]]; then
      needs_build=1
      break
    fi
  done < <(find "$engine" -type f \( -name '*.py' -o -name '*.spec' \) \
    ! -path '*/dist/*' ! -path '*/build/*' ! -path '*/tmp/*' ! -path '*/__pycache__/*' -print0)
fi
if [[ "$needs_build" -eq 0 ]]; then
  echo "Engine executable is up to date: $bin"
  exit 0
fi

if ! "$python" -c "import PyInstaller"; then
  "$python" -m pip install pyinstaller
fi

(
  cd "$engine"
  "$python" -m PyInstaller --noconfirm --clean tucools-engine.spec
)

if [[ ! -f "$bin" ]]; then
  echo "Did not create $bin" >&2
  exit 1
fi
chmod +x "$bin"

leaked=()
for rel in \
  app.py entry.py jobs.py runtime_info.py \
  vendor/cutout.py vendor/enhance.py vendor/erase.py \
  _internal/app.py _internal/entry.py _internal/jobs.py _internal/runtime_info.py \
  _internal/vendor/cutout.py _internal/vendor/enhance.py _internal/vendor/erase.py
do
  if [[ -f "$dist/$rel" ]]; then
    leaked+=("$dist/$rel")
  fi
done
if [[ ${#leaked[@]} -gt 0 ]]; then
  echo "Engine source is still in the frozen output: ${leaked[*]}" >&2
  exit 1
fi

rm -rf "$engine/build"
echo "Engine executable: $bin"
