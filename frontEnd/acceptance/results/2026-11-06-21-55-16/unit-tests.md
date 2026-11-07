# Unit test results (UT-ALL)

209 passed, 0 failed, 209 total. Finished 11/6/2026, 9:56:01 PM.

## test-utils/setup.test.ts

- PASS: shared test setup runs the tests as iOS
- PASS: shared test setup fails any fetch the test did not mock
- PASS: shared test setup starts every test logged out with a fresh router

## src/utils/handleLogin.test.ts

- PASS: handleLogin rejects email "" / password "secret" without calling the server
- PASS: handleLogin rejects email "   " / password "secret" without calling the server
- PASS: handleLogin rejects email "user@csus.edu" / password "" without calling the server
- PASS: handleLogin rejects email "user@csus.edu" / password "   " without calling the server
- PASS: handleLogin sends trimmed credentials and returns the user on 200
- PASS: handleLogin returns the server message on an error response
- PASS: handleLogin falls back to a default message when the error response is empty
- PASS: handleLogin reports when the server is unreachable

## src/__tests__/quaternaryprofile.test.tsx

- PASS: Quaternary Profile View tests loadProfile
- PASS: Quaternary Profile View tests loadChangeLog
- PASS: Quaternary Profile View tests loadProfile API error

## src/__tests__/scanner.test.tsx

- PASS: scanner screen renders shows the title, camera view, Kemyze ID field and Search button
- PASS: scanner screen renders only reads QR codes
- PASS: validateQRCode searches for a valid Kemyze QR code
- PASS: validateQRCode searches for a code in the wrong format and shows the server error
- PASS: validateQRCode rejects the empty value "" without a request
- PASS: validateQRCode rejects the empty value "   " without a request
- PASS: handleInvalidQRCode shows an error message
- PASS: handleInvalidQRCode lets scanning resume with the next code
- PASS: handleBarCodeScanned loads the scanned container into the popup
- PASS: handleBarCodeScanned puts the scanned ID in the Kemyze ID field
- PASS: handleBarCodeScanned ignores repeat scans of the same code
- PASS: handleBarCodeScanned still reads a different code right away
- PASS: handleBarCodeScanned stops reading codes while the popup is open
- PASS: fetchContainerData opens the scan popup on success
- PASS: fetchContainerData searches the typed Kemyze ID when Search is pressed
- PASS: fetchContainerData shows "not found" when the server answers 404
- PASS: fetchContainerData shows "not found" when the server answers 400
- PASS: fetchContainerData shows a server error when the server answers 500
- PASS: fetchContainerData shows a network error when the server cannot be reached
- PASS: fetchContainerData reports a timeout when the request is aborted
- PASS: fetchContainerData reports malformed data from the server
- PASS: fetchContainerData shows the message for an incomplete container response
- PASS: fetchContainerData opens the SDS directly when only the SDS is returned
- PASS: fetchContainerData asks the server for "null" when Search is pressed with an empty Kemyze ID
- PASS: fetchContainerData sends only one request while a search is already running
- PASS: handleEditContainer shows Edit Information for access level 1
- PASS: handleEditContainer shows Edit Information for access level 2
- PASS: handleEditContainer shows Edit Information for access level 3
- PASS: handleEditContainer hides Edit Information for access level 4
- PASS: handleEditContainer hides Edit Information for access level 5
- PASS: handleEditContainer goes to Edit Container with the container ID
- PASS: handleViewSDS opens the SDS for the scanned container
- PASS: handleViewSDS shows an error when the SDS cannot be opened
- PASS: handleViewSDS shows an error when the container has no ID for its SDS

## src/__tests__/scannerbypass.test.tsx

- PASS: scanner bypass screen renders shows the Back link, title, camera view, Kemyze ID field and Search button
- PASS: scanner bypass screen renders only reads QR codes
- PASS: scanner bypass screen renders goes back to the previous screen from Back
- PASS: scanner bypass screen renders goes to the login screen from Back when there is no previous screen
- PASS: validateQRCode searches for a valid Kemyze QR code as a guest
- PASS: validateQRCode searches for a code in the wrong format and shows the server error
- PASS: validateQRCode rejects the empty value "" without a request
- PASS: validateQRCode rejects the empty value "   " without a request
- PASS: handleInvalidQRCode shows an error message and pauses the camera
- PASS: handleInvalidQRCode lets scanning resume after Scan Again
- PASS: handleBarCodeScanned loads the scanned container into the popup
- PASS: handleBarCodeScanned puts the scanned ID in the Kemyze ID field
- PASS: handleBarCodeScanned ignores repeat scans of the same code
- PASS: handleBarCodeScanned pauses the camera until Ok is pressed
- PASS: fetchContainerData opens the scan popup on success
- PASS: fetchContainerData closes the popup with Done
- PASS: fetchContainerData searches the typed Kemyze ID when Search is pressed
- PASS: fetchContainerData shows "not found" when the server answers 404
- PASS: fetchContainerData shows "not found" when the server answers 400
- PASS: fetchContainerData shows a server error when the server answers 500
- PASS: fetchContainerData shows a network error when the server cannot be reached
- PASS: fetchContainerData reports a timeout when the request is aborted
- PASS: fetchContainerData reports malformed data from the server
- PASS: fetchContainerData shows the message for an incomplete container response
- PASS: fetchContainerData opens the SDS directly when only the SDS is returned
- PASS: fetchContainerData asks the server for "null" when Search is pressed with an empty Kemyze ID
- PASS: no edit action for guests never shows Edit Information in the popup
- PASS: no edit action for guests never opens Edit Container
- PASS: handleViewSDS opens the SDS for the scanned container
- PASS: handleViewSDS shows an error when the SDS cannot be opened
- PASS: handleViewSDS shows an error when the container has no ID for its SDS

## src/__tests__/index.test.tsx

- PASS: login screen renders shows the title, both fields and all buttons
- PASS: login screen renders opens the guest scanner from QR Scanner Bypass
- PASS: onPressLogin shows "Missing email" for email "" / password ""
- PASS: onPressLogin shows "Missing email" for email "   " / password "secret"
- PASS: onPressLogin shows "Missing password" for email "user@csus.edu" / password ""
- PASS: onPressLogin shows "Missing password" for email "user@csus.edu" / password "   "
- PASS: onPressLogin shows the server message when login fails
- PASS: onPressLogin sets the active user and opens the scanner on success
- PASS: handleForgotPassword rejects email "" without sending a request
- PASS: handleForgotPassword rejects email "   " without sending a request
- PASS: handleForgotPassword rejects email "not-an-email" without sending a request
- PASS: handleForgotPassword rejects email "user@csus" without sending a request
- PASS: handleForgotPassword rejects email "user @csus.edu" without sending a request
- PASS: handleForgotPassword sends the reset request and shows the success message
- PASS: handleForgotPassword shows the server error message
- PASS: handleForgotPassword reports a timeout when the request is aborted
- PASS: handleForgotPassword reports a network error
- PASS: showPopup uses Alert.alert on iOS
- PASS: showPopup uses window.alert on web

## src/__tests__/add_container.test.tsx

- PASS: Add Container screen renders the add container form and primary controls
- PASS: Add Container screen loads root and dependent location options through loadVarLocationOptions
- PASS: Add Container screen uploads a selected SDS PDF for the active user
- PASS: Add Container screen creates a new root location and refreshes the location list
- PASS: Add Container screen saves reviewed changes with the uploaded SDS and active user

## src/__tests__/edit_container.test.tsx

- PASS: Edit Container screen adds a new root location and refreshes location options
- PASS: Edit Container screen renders the edit form with the loaded container details
- PASS: Edit Container screen gets the container, every location level, and its change log on load
- PASS: Edit Container screen retries loadChangeLog after an initial failure
- PASS: Edit Container screen uploads a selected SDS PDF for the active user and current container
- PASS: Edit Container screen sends changed container data after review confirmation

## src/__tests__/scanpopup.test.tsx

- PASS: ScanPopup renders the container info without the "Text strings" error
- PASS: ScanPopup renders when the container has no ID
- PASS: ScanPopup shows Edit Information only for users who can edit

## src/__tests__/editprofile.test.tsx

- PASS: Edit Profile screen renders the loaded profile form and primary controls
- PASS: Edit Profile screen saves reviewed profile changes for the selected user
- PASS: Edit Profile screen does not send a save request when the reviewed name is empty
- PASS: Edit Profile screen adds a new root location and refreshes location options

## src/__tests__/createprofile.test.tsx

- PASS: Create Profile Screen renders the profile creation screen
- PASS: Create Profile Screen tests sendAddUser
- PASS: Create Profile Screen tests handleCreateProfile field validation
- PASS: Create Profile Screen tests addNewLocation

## src/__tests__/inventory.test.tsx

- PASS: fetchAllContainers loads the first page for the logged-in user when the screen opens
- PASS: fetchAllContainers leaves the userID off when no one is logged in
- PASS: fetchAllContainers shows "No chemicals found." for an empty inventory
- PASS: fetchAllContainers shows an error popup when the server answers with an error
- PASS: fetchAllContainers shows an error popup when the request cannot reach the server
- PASS: fetchAllContainers reloads the first page when Show All is pressed
- PASS: addMoreContainers loads the next page and adds it below the first page
- PASS: addMoreContainers asks for the page after that on the next scroll
- PASS: addMoreContainers keeps the Show Low filter when loading the next page
- PASS: addMoreContainers keeps the Expiring Soon filter when loading the next page
- PASS: addMoreContainers keeps the Recently Changed filter when loading the next page
- PASS: addMoreContainers keeps the search text when loading the next page
- PASS: addMoreContainers stops asking for more after the server sends an empty page
- PASS: addMoreContainers stops asking for more after the server sends a partly filled page
- PASS: addMoreContainers shows "Loading more…" and sends only one request while a page is loading
- PASS: Chemical Inventory screen renders shows the title, search field and all filter buttons
- PASS: Chemical Inventory screen renders shows a container card's name, CAS #, ID, location and status
- PASS: Chemical Inventory screen renders shows N/A when a container has no CAS #
- PASS: Chemical Inventory screen renders shows View SDS, QR Label and Edit Info on every card
- PASS: Chemical Inventory screen renders View SDS opens that container's Safety Data Sheet
- PASS: Chemical Inventory screen renders QR Label opens the label popup for that container
- PASS: Chemical Inventory screen renders Edit Info opens the Edit Container page for that container
- PASS: Chemical Inventory screen renders Add New opens the Add Container page
- PASS: Chemical Inventory screen renders Edit Info shows Access Denied for a user without edit rights
- PASS: Chemical Inventory screen renders Add New shows Access Denied for a user without edit rights

## src/__tests__/tertiaryprofilemanagement.test.tsx

- PASS: loadAccounts first page requests the first page for the logged-in user on open
- PASS: loadAccounts first page lists the accounts from the first page
- PASS: loadAccounts first page shows a loading message until the first page arrives
- PASS: loadAccounts first page shows the empty message when no accounts come back
- PASS: loadAccounts search sends the trimmed search text from the first offset and replaces the list
- PASS: loadAccounts search searches when the keyboard search key is pressed
- PASS: loadAccounts search does not search while the text is only being typed
- PASS: loadAccounts search reloads the full list when the search box is cleared
- PASS: loadAccounts search runs the same search again when Search is pressed twice
- PASS: loadAccounts search ignores an older search that answers after a newer one
- PASS: loadAccounts filters sends recently_active when Recently Active is selected
- PASS: loadAccounts filters turns Recently Active off when Recently Inactive is selected
- PASS: loadAccounts scrolling to the end requests the next page from next_offset and adds it to the list
- PASS: loadAccounts scrolling to the end does not repeat an account that is on both pages
- PASS: loadAccounts scrolling to the end keeps the search text when loading the next page
- PASS: loadAccounts scrolling to the end does not load a page when the list stops short of the end
- PASS: loadAccounts scrolling to the end loads a page when the list stops within 24 of the end
- PASS: loadAccounts scrolling to the end shows a loading message and sends one request while a page is loading
- PASS: loadAccounts no more accounts shows the end message after the last page
- PASS: loadAccounts no more accounts hides the end message while more pages are available
- PASS: loadAccounts no more accounts shows the end message once the next page turns out to be the last
- PASS: loadAccounts no more accounts does not request another page after the last one
- PASS: loadAccounts no more accounts does not request another page when has_more is false
- PASS: loadAccounts no more accounts does not request another page when next_offset is missing
- PASS: loadAccounts no logged-in user shows the login message without calling the server
- PASS: loadAccounts no logged-in user does not call the server when Search is pressed
- PASS: loadAccounts server errors shows the JSON error message
- PASS: loadAccounts server errors shows a plain text error
- PASS: loadAccounts server errors shows the message when a 200 response has success false
- PASS: loadAccounts server errors shows the default message when the error has no text
- PASS: loadAccounts server errors shows the error when the network request fails
- PASS: loadAccounts server errors clears the error when a later search works
- PASS: loadAccounts server errors shows the error when the next page fails to load
- PASS: confirmDelete confirmation sheet stays closed until Delete is pressed
- PASS: confirmDelete confirmation sheet shows the chosen account and does not delete it yet
- PASS: confirmDelete confirmation sheet closes without deleting when Cancel is pressed
- PASS: confirmDelete confirmation sheet closes without deleting when the area outside the sheet is pressed
- PASS: confirmDelete success sends the logged-in user and the chosen account to the delete endpoint
- PASS: confirmDelete success removes only that account from the list and closes the sheet
- PASS: confirmDelete success does not reload the list after deleting
- PASS: confirmDelete success names the account when the server sends no message
- PASS: confirmDelete success shows Deleting... and sends one request while the delete is running
- PASS: confirmDelete server errors shows the JSON error message and keeps the account
- PASS: confirmDelete server errors shows a plain text error and keeps the account
- PASS: confirmDelete server errors shows the default message when the error has no text and keeps the account
- PASS: confirmDelete server errors keeps the account in the list after the sheet is closed
- PASS: confirmDelete server errors shows the error when the network request fails
- PASS: confirmDelete server errors clears the error and deletes when the retry works
- PASS: confirmDelete no logged-in user shows the login message without calling the delete endpoint
- PASS: screen renders shows the title and back button
- PASS: screen renders shows the search field and button
- PASS: screen renders shows Add New and the account filters
- PASS: screen renders shows the header when no user is logged in
- PASS: screen renders shows the name, location and privilege level on each account card
- PASS: screen renders shows Edit and Delete on every account card
- PASS: screen renders shows access level 1 as Primary
- PASS: screen renders shows access level 2 as Secondary
- PASS: screen renders shows access level 3 as Tertiary
- PASS: screen renders shows access level 4 as Quaternary
- PASS: screen renders shows access level 5 as Quinary
- PASS: screen renders shows access level 9 as Level 9
- PASS: screen renders opens the create profile page from Add New
- PASS: screen renders opens the edit page for the chosen account from Edit
- PASS: screen renders goes back from the back button
