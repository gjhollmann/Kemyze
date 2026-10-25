---
name: sds-qr-scanning
description: Work on Kemyze QR code scanning, container lookup, QR label printing, and Safety Data Sheet (SDS) PDF upload and viewing. Use when editing the scanner screen, scan popup, QR label popup, PDF/print utilities, or the getSDS/uploadSDS backend views.
---

# SDS & QR Scanning Skill

## Core Principles
- Any user — including guests — must always be able to view a container's SDS after scanning. Never put SDS viewing behind a higher access level.
- Scanning must not fire duplicate requests. Keep the existing scan lock and in-flight guards.
- SDS files are PDFs stored in the database and sent as base64.

## Where things live
- Scanner screen: `frontEnd/src/app/Pages/scanner.tsx` (uses `expo-camera` `CameraView` and `useCameraPermissions`).
- Guest path: `frontEnd/src/app/SubPages/scannerbypass.tsx`.
- Popups: `frontEnd/components/ScanPopup.tsx`, `frontEnd/components/QRLabelPopup.tsx`.
- Helpers: `frontEnd/utils/ScanResUtils.ts` (`handleContainerResponse`), `PDFUtils.ts` (`openBase64Pdf`), `PrintLabelUtils.ts`.
- Backend: `containers/views.py` → `getContainer`, `getSDS`, `uploadSDS`. Bulk upload command: `containers/management/commands/upload_sds.py`.

## Follow this order
1. Read the scan handler in `scanner.tsx` before changing it. Keep `scanLockRef`, `isFetchingRef`, and `lastScanRef` behavior intact.
2. Put parsing/formatting logic in `frontEnd/utils/`, not in the screen. This keeps it unit-testable.
3. Handle camera permission denied, invalid QR content, and "container not found" with a clear `Alert`.
4. For SDS upload, accept PDFs only (`expo-document-picker` with `application/pdf`) and validate the MIME type on the server too.
5. Unit test the util functions with mocked responses. Do not unit test the live camera.

## Common Pitfalls
- Using `useState` for scan locks. React state updates are async, so rapid scans slip through. Use refs, as the existing code does.
- Loading very large base64 PDFs into state repeatedly.
- Forgetting the guest path when changing the scanned-container response shape.
