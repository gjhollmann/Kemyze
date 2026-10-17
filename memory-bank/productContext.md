# Product Context

## Why it exists
School chemistry labs need to know what chemicals they have, where they are, when they expire, and how to handle them safely. Paper logs and binders of SDS sheets are slow to search and easy to let go out of date.

## How it should work
1. An authorized user adds a container with its details and uploads the SDS PDF.
2. The app generates a QR label that is printed and stuck on the container.
3. Anyone scans the QR code with the app:
   - Guests see the SDS and basic safety information.
   - Authorized users also see full container details and can edit them.
4. Every create, edit, and delete is recorded in the container's change log.

## User types
- Administrator: manages instructor accounts, inventory, SDS files.
- Authorized Instructor: views and updates containers in their department.
- Staff: views chemical and SDS information.
- Guest / Student: scans QR codes to view SDS.

## UX goals
- Scanning is fast and never double-fires.
- SDS is always one tap away after a scan.
- Clear alerts when something fails (no permission, not found, network error).
