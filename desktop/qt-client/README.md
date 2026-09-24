# MST Agritech Desktop

Cross-platform Qt desktop client for MST Agritech. The app is built with Qt 6 Widgets and C++ so it can run on macOS and Windows from the same codebase.

## Current capabilities

- Local-first desktop workflow backed by SQLite.
- Offline create, update, and delete operations for the same business areas exposed in the web app:
  - Dashboard
  - Farmers
  - Buyers
  - Orders
  - Payments
  - Shipments
  - Marketplace
  - Analytics & Reports
  - Master Data
  - Settings
- Configurable API base URL, tenant slug, operator email, platform defaults, maintenance mode, and sync retry policy.
- Sync queue that stores every offline mutation and attempts to POST changes to:

  ```text
  {API_BASE_URL}/api/v1/desktop-sync/changes
  ```

  The desktop client keeps records queued if the API is offline or the endpoint has not been implemented yet.

## Local data

Qt stores the SQLite database in the platform application data directory:

- macOS: `~/Library/Application Support/MST/MST Agritech Desktop/mst-agritech-offline.sqlite`
- Windows: `%APPDATA%\MST\MST Agritech Desktop\mst-agritech-offline.sqlite`

The database contains:

- `app_settings` - local desktop and platform configuration.
- `records` - local records grouped by module.
- `sync_queue` - pending and completed offline change batches.

## Build on macOS

Install Qt 6.4 or newer and CMake. With Homebrew:

```bash
brew install qt cmake ninja
```

Configure and build:

```bash
cmake -S desktop/qt-client -B desktop/qt-client/build \
  -G Ninja \
  -DCMAKE_PREFIX_PATH="$(brew --prefix qt)"
cmake --build desktop/qt-client/build
```

Run:

```bash
open "desktop/qt-client/build/MST Agritech.app"
```

If the app was built as a regular executable instead of a bundle, run:

```bash
desktop/qt-client/build/MST\ Agritech
```

### Deploy/package on macOS

After a successful build, package the `.app` with the Qt frameworks and plugins:

```bash
QT_ROOT="$HOME/Qt/6.11.2/macos" desktop/qt-client/scripts/deploy-macos.sh
```

The script creates a DMG and works around Qt SQL plugins that are not used by this app but may reference missing local libraries such as ODBC, Mimer, or Postgres.app.

If you installed a different Qt version, replace `6.11.2` with that version. If your build path is different, pass `APP_PATH="/path/to/MST Agritech.app"`.

## Build on Windows

Install:

- Qt 6.4 or newer for MSVC or MinGW
- CMake
- Ninja or Visual Studio Build Tools

Example with MSVC Qt:

```powershell
cmake -S desktop/qt-client -B desktop/qt-client/build `
  -G Ninja `
  -DCMAKE_PREFIX_PATH="C:\Qt\6.7.3\msvc2019_64"
cmake --build desktop/qt-client/build --config Release
```

Run:

```powershell
desktop\qt-client\build\MST Agritech.exe
```

For redistribution on Windows, run `windeployqt` from the matching Qt installation:

```powershell
windeployqt "desktop\qt-client\build\MST Agritech.exe"
```

## Backend sync contract

The current desktop app sends a sync envelope shaped like:

```json
{
  "tenantSlug": "default",
  "operatorEmail": "operator@example.com",
  "changes": [
    {
      "queueId": 1,
      "recordId": 12,
      "module": "Orders",
      "operation": "UPSERT",
      "payload": {
        "localId": 12,
        "module": "Orders",
        "title": "ORD-1001",
        "status": "PENDING",
        "amount": 1250,
        "currency": "USD"
      }
    }
  ]
}
```

The backend should return any `2xx` response after accepting the batch. The client will then mark the submitted queue rows as synced.
