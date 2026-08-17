#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
caprice_dir="${CAPRICE32_DIR:-$(cd "$project_dir/../caprice32" && pwd)}"
output_dir="$project_dir/public/emulator"

if ! command -v em++ >/dev/null 2>&1; then
  echo "Erreur: em++ est introuvable. Installez et activez Emscripten (voir README.md)." >&2
  exit 1
fi

if [[ ! -f "$caprice_dir/src/cap32.cpp" ]]; then
  echo "Erreur: sources Caprice32 introuvables dans $caprice_dir" >&2
  exit 1
fi

mkdir -p "$output_dir"
mapfile -d '' sources < <(find "$caprice_dir/src" -name '*.cpp' -print0)

em++ \
  "$caprice_dir/main.cpp" "${sources[@]}" \
  -std=c++17 -O3 \
  -I"$caprice_dir/src" \
  -I"$caprice_dir/src/gui/includes" \
  -I"$caprice_dir/src/capsimg/LibIPF" \
  -I"$caprice_dir/src/capsimg/Device" \
  -I"$caprice_dir/src/capsimg/CAPSImg" \
  -I"$caprice_dir/src/capsimg/Codec" \
  -I"$caprice_dir/src/capsimg/Core" \
  -DAPP_PATH=\"/\" -DVERSION=\"web\" \
  -sUSE_SDL=2 -sUSE_FREETYPE=1 -sUSE_LIBPNG=1 -sUSE_ZLIB=1 \
  -sASYNCIFY -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=67108864 \
  -sENVIRONMENT=web -sEXIT_RUNTIME=0 -sFORCE_FILESYSTEM=1 \
  -sEXPORTED_FUNCTIONS=_main,_fflush \
  -sEXPORTED_RUNTIME_METHODS=callMain,FS \
  --preload-file "$caprice_dir/rom@/rom" \
  --preload-file "$caprice_dir/resources@/resources" \
  --preload-file "$project_dir/web/cap32.cfg@/cap32.cfg" \
  -o "$output_dir/caprice32.js"

echo "Build navigateur créé dans $output_dir"
