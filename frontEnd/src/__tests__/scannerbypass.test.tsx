/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock factories run before imports, so they must use require(). */
// Unit tests for the guest Scanner Bypass / Quick Scan, src/app/SubPages/scannerbypass.tsx (KM-154).
// Kept outside src/app because Expo Router treats every file there as a route.
import { Alert, Linking } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import ScannerBypass from '../app/SubPages/scannerbypass';
import { BASE_URL } from '../../constants/api';
import { openBase64Pdf } from '../../utils/PDFUtils';
import { fetchMock, jsonResponse, mockRouter } from '../../test-utils';

// Opening an SDS PDF needs the device file system, so it is replaced with a mock.
jest.mock('../../utils/PDFUtils', () => ({ openBase64Pdf: jest.fn() }));

jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn() }));

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// Simple stand-in for the scan popup: shows what the screen passes to it
// and its buttons, so these tests check the screen and not the popup layout.
type PopupProps = {
  visible: boolean;
  scanResult: { chemicalName: string; cas: string; location: string; quantity: string } | null;
  editPrivilege: boolean;
  onClose: () => void;
  onViewSds: () => void;
  onEdit?: () => void;
};

jest.mock('../../components/ScanPopup', () => {
  const { Text, View } = require('react-native');
  return {
    ScanPopup: ({ visible, scanResult, editPrivilege, onClose, onViewSds, onEdit }: PopupProps) =>
      visible ? (
        <View>
          <Text>{scanResult?.chemicalName}</Text>
          <Text>CAS: {scanResult?.cas}</Text>
          <Text>{scanResult?.location}</Text>
          <Text>{scanResult?.quantity}</Text>
          <Text onPress={onClose}>Done</Text>
          <Text onPress={onViewSds}>View SDS</Text>
          {editPrivilege && <Text onPress={onEdit}>Edit Information</Text>}
        </View>
      ) : null,
  };
});

const CONTAINER = {
  container_id: '42',
  chemical_name: 'Acetone',
  cas_number: '67-64-1',
  acqn_date: '2026-01-05',
  expr_date: '2027-01-05',
  location: 'Room 101',
  quantity: '500 mL',
  sds_sheet: 'JVBERi0xLjQ=',
};

// Guests always search with the read-only access level 5.
const containerUrl = (kemId: string) => `${BASE_URL}containers/getContainer?kemID=${kemId}&accessLevel=5`;

const NOT_FOUND = ['Error', 'The container does not exist or the request was invalid.'];

let alertSpy: jest.SpyInstance;

// The screen waits 500 ms before handling a scan and starts a 10 s abort timer
// that is not cleared when a request fails, so the tests control the clock.
beforeEach(() => {
  jest.useFakeTimers();
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// Simulates the camera reading a QR code, then lets the 500 ms scan delay pass.
async function scan(data: string) {
  const onBarcodeScanned = screen.getByTestId('camera-view').props.onBarcodeScanned;
  await act(async () => {
    onBarcodeScanned({ data });
    jest.advanceTimersByTime(500);
  });
}

// Presses a button on the native alert that was shown with this title.
async function pressAlertButton(title: string, buttonText: string) {
  const call = alertSpy.mock.calls.find(([shownTitle]) => shownTitle === title);
  const button = call?.[2]?.find((b: { text: string }) => b.text === buttonText);
  await act(async () => button.onPress());
}

// Shows the container popup by scanning a code the server knows.
async function openPopup() {
  fetchMock().mockResolvedValueOnce(jsonResponse(CONTAINER));
  await render(<ScannerBypass />);
  await scan('42');
  await waitFor(() => expect(screen.getByText('Acetone')).toBeOnTheScreen());
}

describe('scanner bypass screen renders', () => {
  it('shows the Back link, title, camera view, Kemyze ID field and Search button', async () => {
    await render(<ScannerBypass />);

    expect(screen.getByText('‹ Back')).toBeOnTheScreen();
    expect(screen.getByText('Quick Scan')).toBeOnTheScreen();
    expect(screen.getByTestId('camera-view')).toBeOnTheScreen();
    expect(screen.getByText('Scan a QR label to view the Safety Data Sheet (SDS)')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('')).toBeOnTheScreen();
    expect(screen.getByText('Search')).toBeOnTheScreen();
  });

  it('only reads QR codes', async () => {
    await render(<ScannerBypass />);

    expect(screen.getByTestId('camera-view').props.barcodeScannerSettings).toEqual({ barcodeTypes: ['qr'] });
  });

  it('goes back to the previous screen from Back', async () => {
    await render(<ScannerBypass />);

    await fireEvent.press(screen.getByLabelText('Go back'));

    expect(Haptics.selectionAsync).toHaveBeenCalled();
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('goes to the login screen from Back when there is no previous screen', async () => {
    mockRouter.canGoBack.mockReturnValueOnce(false);
    await render(<ScannerBypass />);

    await fireEvent.press(screen.getByLabelText('Go back'));

    expect(mockRouter.replace).toHaveBeenCalledWith('/');
    expect(mockRouter.back).not.toHaveBeenCalled();
  });
});

describe('validateQRCode', () => {
  it('searches for a valid Kemyze QR code as a guest', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse(CONTAINER));
    await render(<ScannerBypass />);

    await scan('42');

    expect(alertSpy).toHaveBeenCalledWith('QR Code Scanned, retrieving containerID', 'Data: 42', expect.any(Array));
    expect(fetchMock()).toHaveBeenCalledWith(containerUrl('42'), expect.objectContaining({ method: 'GET' }));
  });

  it('searches for a code in the wrong format and shows the server error', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ error: 'Not found' }, 404));
    await render(<ScannerBypass />);

    await scan('not-a-kemyze-id');

    expect(fetchMock()).toHaveBeenCalledWith(containerUrl('not-a-kemyze-id'), expect.anything());
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith(...NOT_FOUND));
  });

  it.each(['', '   '])('rejects the empty value "%s" without a request', async (data) => {
    await render(<ScannerBypass />);

    await scan(data);

    expect(fetchMock()).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      'Invalid QR Code',
      'The QR code could not be read. Please try again.',
      [expect.objectContaining({ text: 'Scan Again' })],
    );
  });
});

describe('handleInvalidQRCode', () => {
  it('shows an error message and pauses the camera', async () => {
    await render(<ScannerBypass />);

    await scan(' ');

    expect(alertSpy).toHaveBeenCalledWith('Invalid QR Code', 'The QR code could not be read. Please try again.', expect.any(Array));
    expect(screen.getByTestId('camera-view').props.onBarcodeScanned).toBeUndefined();
  });

  it('lets scanning resume after Scan Again', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse(CONTAINER));
    await render(<ScannerBypass />);
    await scan(' ');

    await pressAlertButton('Invalid QR Code', 'Scan Again');
    await act(async () => jest.advanceTimersByTime(2000));
    await scan('42');

    expect(fetchMock()).toHaveBeenCalledWith(containerUrl('42'), expect.anything());
    await waitFor(() => expect(screen.getByText('Acetone')).toBeOnTheScreen());
  });
});

describe('handleBarCodeScanned', () => {
  it('loads the scanned container into the popup', async () => {
    await openPopup();

    expect(screen.getByText('CAS: 67-64-1')).toBeOnTheScreen();
    expect(screen.getByText('Room 101')).toBeOnTheScreen();
    expect(screen.getByText('500 mL')).toBeOnTheScreen();
  });

  it('puts the scanned ID in the Kemyze ID field', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ error: 'Not found' }, 404));
    await render(<ScannerBypass />);

    await scan('42');

    expect(screen.getByDisplayValue('42')).toBeOnTheScreen();
  });

  it('ignores repeat scans of the same code', async () => {
    fetchMock().mockResolvedValue(jsonResponse({ error: 'Not found' }, 404));
    await render(<ScannerBypass />);
    const onBarcodeScanned = screen.getByTestId('camera-view').props.onBarcodeScanned;

    await act(async () => {
      onBarcodeScanned({ data: '42' });
      onBarcodeScanned({ data: '42' });
      onBarcodeScanned({ data: '42' });
      jest.advanceTimersByTime(500);
    });

    expect(fetchMock()).toHaveBeenCalledTimes(1);
  });

  it('pauses the camera until Ok is pressed', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ error: 'Not found' }, 404));
    await render(<ScannerBypass />);

    await scan('42');
    expect(screen.getByTestId('camera-view').props.onBarcodeScanned).toBeUndefined();

    await pressAlertButton('QR Code Scanned, retrieving containerID', 'Ok');
    expect(screen.getByTestId('camera-view').props.onBarcodeScanned).toEqual(expect.any(Function));
  });
});

describe('fetchContainerData', () => {
  it('opens the scan popup on success', async () => {
    await openPopup();

    expect(screen.getByText('View SDS')).toBeOnTheScreen();
  });

  it('closes the popup with Done', async () => {
    await openPopup();

    await fireEvent.press(screen.getByText('Done'));

    expect(screen.queryByText('Acetone')).toBeNull();
  });

  it('searches the typed Kemyze ID when Search is pressed', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse(CONTAINER));
    await render(<ScannerBypass />);

    await fireEvent.changeText(screen.getByDisplayValue(''), '42');
    await fireEvent.press(screen.getByText('Search'));

    expect(fetchMock()).toHaveBeenCalledWith(containerUrl('42'), expect.anything());
    await waitFor(() => expect(screen.getByText('Acetone')).toBeOnTheScreen());
  });

  it.each([404, 400])('shows "not found" when the server answers %i', async (status) => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ error: 'Not found' }, status));
    await render(<ScannerBypass />);
    await fireEvent.changeText(screen.getByDisplayValue(''), '999');

    await fireEvent.press(screen.getByText('Search'));

    expect(alertSpy).toHaveBeenCalledWith(...NOT_FOUND);
    expect(screen.queryByText('View SDS')).toBeNull();
  });

  it('shows a server error when the server answers 500', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse('Internal Server Error', 500));
    await render(<ScannerBypass />);
    await fireEvent.changeText(screen.getByDisplayValue(''), '42');

    await fireEvent.press(screen.getByText('Search'));

    expect(alertSpy).toHaveBeenCalledWith(...NOT_FOUND);
  });

  it('shows a network error when the server cannot be reached', async () => {
    fetchMock().mockRejectedValueOnce(new TypeError('Network request failed'));
    await render(<ScannerBypass />);
    await fireEvent.changeText(screen.getByDisplayValue(''), '42');

    await fireEvent.press(screen.getByText('Search'));

    expect(alertSpy).toHaveBeenCalledWith('Network error', 'Unable to reach server.');
  });

  it('reports a timeout when the request is aborted', async () => {
    fetchMock().mockRejectedValueOnce(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
    await render(<ScannerBypass />);
    await fireEvent.changeText(screen.getByDisplayValue(''), '42');

    await fireEvent.press(screen.getByText('Search'));

    expect(alertSpy).toHaveBeenCalledWith('Request timed out', 'The server took too long to respond.');
  });

  it('reports malformed data from the server', async () => {
    fetchMock().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });
    await render(<ScannerBypass />);
    await fireEvent.changeText(screen.getByDisplayValue(''), '42');

    await fireEvent.press(screen.getByText('Search'));

    expect(alertSpy).toHaveBeenCalledWith('Invalid response', 'The server returned malfomed data.');
  });

  it('shows the message for an incomplete container response', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ container_id: '42' }));
    await render(<ScannerBypass />);
    await fireEvent.changeText(screen.getByDisplayValue(''), '42');

    await fireEvent.press(screen.getByText('Search'));

    expect(alertSpy).toHaveBeenCalledWith('Invalid Information', 'Invalid container response format.');
  });

  it('opens the SDS directly when only the SDS is returned', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ sds_sheet: 'JVBERi0xLjQ=' }));
    await render(<ScannerBypass />);
    await fireEvent.changeText(screen.getByDisplayValue(''), '42');

    await fireEvent.press(screen.getByText('Search'));

    expect(openBase64Pdf).toHaveBeenCalledWith('JVBERi0xLjQ=');
    expect(screen.queryByText('View SDS')).toBeNull();
  });

  it('asks the server for "null" when Search is pressed with an empty Kemyze ID', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ error: 'Missing kemID' }, 400));
    await render(<ScannerBypass />);

    await fireEvent.press(screen.getByText('Search'));

    expect(fetchMock()).toHaveBeenCalledWith(containerUrl('null'), expect.anything());
    expect(alertSpy).toHaveBeenCalledWith(...NOT_FOUND);
  });
});

describe('no edit action for guests', () => {
  it('never shows Edit Information in the popup', async () => {
    await openPopup();

    expect(screen.queryByText('Edit Information')).toBeNull();
  });

  it('never opens Edit Container', async () => {
    await openPopup();

    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});

describe('handleViewSDS', () => {
  it('opens the SDS for the scanned container', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await openPopup();

    await fireEvent.press(screen.getByText('View SDS'));

    expect(openURL).toHaveBeenCalledWith(`${BASE_URL}containers/getSDS?kemID=42`);
  });

  it('shows an error when the SDS cannot be opened', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('No app can open this link'));
    await openPopup();

    await fireEvent.press(screen.getByText('View SDS'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Error', 'Unable to open the SDS.'));
  });

  it('shows an error when the container has no ID for its SDS', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    fetchMock().mockResolvedValueOnce(jsonResponse({ ...CONTAINER, container_id: '' }));
    await render(<ScannerBypass />);
    await scan('42');
    await waitFor(() => expect(screen.getByText('Acetone')).toBeOnTheScreen());

    await fireEvent.press(screen.getByText('View SDS'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'No container ID is available for this SDS.');
    expect(openURL).not.toHaveBeenCalled();
  });
});
