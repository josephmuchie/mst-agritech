#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
QT_ROOT="${QT_ROOT:-$HOME/Qt/6.11.2/macos}"
APP_PATH="${APP_PATH:-$REPO_ROOT/desktop/qt-client/build/MST Agritech.app}"
MACDEPLOYQT="$QT_ROOT/bin/macdeployqt"
SQL_DRIVER_DIR="$QT_ROOT/plugins/sqldrivers"
DISABLED_DIR="$(mktemp -d "${TMPDIR:-/tmp}/mst-qt-sqldrivers.XXXXXX")"

restore_sql_plugins() {
  if compgen -G "$DISABLED_DIR/*.dylib" > /dev/null; then
    mv "$DISABLED_DIR"/*.dylib "$SQL_DRIVER_DIR"/
  fi
  rmdir "$DISABLED_DIR" 2>/dev/null || true
}
trap restore_sql_plugins EXIT

if [[ ! -x "$MACDEPLOYQT" ]]; then
  echo "macdeployqt not found at: $MACDEPLOYQT" >&2
  echo "Set QT_ROOT to your Qt macOS install, for example:" >&2
  echo '  QT_ROOT="$HOME/Qt/6.11.2/macos" desktop/qt-client/scripts/deploy-macos.sh' >&2
  exit 1
fi

if [[ ! -d "$APP_PATH" ]]; then
  echo "App bundle not found at: $APP_PATH" >&2
  echo "Build the app before deploying." >&2
  exit 1
fi

if [[ -d "$SQL_DRIVER_DIR" ]]; then
  for plugin in "$SQL_DRIVER_DIR"/*.dylib; do
    [[ -e "$plugin" ]] || continue
    if [[ "$(basename "$plugin")" != "libqsqlite.dylib" ]]; then
      mv "$plugin" "$DISABLED_DIR"/
    fi
  done
fi

xattr -cr "$APP_PATH" || true

"$MACDEPLOYQT" "$APP_PATH" -always-overwrite

# macdeployqt can copy files with extended attributes. Clear those after
# deployment and sign manually so codesign does not fail with "resource fork,
# Finder information, or similar detritus not allowed".
xattr -cr "$APP_PATH" || true
codesign --force --deep --sign - "$APP_PATH"

DMG_PATH="${DMG_PATH:-${APP_PATH%.app}.dmg}"
rm -f "$DMG_PATH"
hdiutil create -volname "MST Agritech" -srcfolder "$APP_PATH" -ov -format UDZO "$DMG_PATH"

echo "Deployment complete: $DMG_PATH"
