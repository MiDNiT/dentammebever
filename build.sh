#!/usr/bin/env bash
# build.sh – brukes av Cloudflare Pages for å bygge Zola-siden
# Laster ned riktig Linux-binary automatisk siden bin/zola er kompilert for macOS.

set -euo pipefail

ZOLA_VERSION="0.22.1"
ZOLA_URL="https://github.com/getzola/zola/releases/download/v${ZOLA_VERSION}/zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz"
ZOLA_BIN="/tmp/zola"

echo "⬇️  Laster ned Zola v${ZOLA_VERSION} for Linux..."
curl -sL "$ZOLA_URL" | tar xz -C /tmp

chmod +x "$ZOLA_BIN"

echo "🦫 Bygger siden med Zola..."
"$ZOLA_BIN" build

echo "✅ Bygg fullført!"
