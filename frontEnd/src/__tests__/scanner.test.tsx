/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock factories run before imports, so they must use require(). */
// Unit tests for the logged-in QR Scanner, src/app/Pages/scanner.tsx (KM-153).
// Kept outside src/app because Expo Router treats every file there as a route.
import { Alert, Linking } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Scanner from '../app/Pages/scanner';
import { BASE_URL } from '../../constants/api';
import { openBase64Pdf } from '../../utils/PDFUtils';
import { fetchMock, jsonResponse, mockRouter, mockUserState } from '../../test-utils';

// Opening an SDS PDF needs the device file system, so it is replaced with a mock.
jest.mock('../../utils/PDFUtils', () => ({ openBase64Pdf: jest.fn() }));

// The QR label popup draws an SVG QR code and is not part of these tests.
jest.mock('../../components/QRLabelPopup', () => ({ QRLabelPopup: () => null }));

// Simple stand-in for the scan popup: shows what the scanner passes to it
// and its buttons, so these tests check the scanner and not the popup layout.
type PopupProps = {
  visible: boolean;
  scanResult: { chemicalName: string; cas: string; location: string; quantity: string } | null;
  editPrivilege: boolean;
  onClose: () => void;
  onViewSds: () => void;
  onQrLabel: () => void;
  onEdit: () => void;
};

jest.mock('../../components/ScanPopup', () => {
  const { Text, View } = require('react-native');
  return {
    ScanPopup: ({ visible, scanResult, editPrivilege, onClose, onViewSds, onQrLabel, onEdit }: PopupProps) =>
      visible ? (
        <View>
          <Text>{scanResult?.chemicalName}</Text>
          <Text>CAS: {scanResult?.cas}</Text>
          <Text>{scanResult?.location}</Text>
          <Text>{scanResult?.quantity}</Text>
          <Text onPress={onClose}>Done</Text>
          <Text onPress={onViewSds}>View SDS</Text>
          <Text onPress={onQrLabel}>Download QR Label</Text>
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

const containerUrl = (kemId: string) => `${BASE_URL}containers/getContainer?kemID=${kemId}&accessLevel=1`;

let alertSpy: jest.SpyInstance;

beforeEach(() => {
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockUserState.activeUser = { userID: 7, accessLevel: '1' };
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Simulates the camera reading a QR code.
async function scan(data: string) {
  const camera = screen.getByTestId('camera-view');
  await act(async () => {
    await camera.props.onBarcodeScanned({ data });
  });
}

// Shows the container popup by scanning a code the server knows.
async function openPopup() {
  fetchMock().mockResolvedValueOnce(jsonResponse(CONTAINER));
  await render(<Scanner />);
  await scan('42');
  await waitFor(() => expect(screen.getByText('Acetone')).toBeOnTheScreen());
}

describe('scanner screen renders', () => {
  it('shows the title, camera view, Kemyze ID field and Search button', async () => {
    await render(<Scanner />);

    expect(screen.getByText('Quick Scan')).toBeOnTheScreen();
    expect(screen.getByTestId('camera-view')).toBeOnTheScreen();
    expect(screen.getByText('Scan a QR label to view the Safety Data Sheet (SDS)')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('')).toBeOnTheScreen();
    expect(screen.getByText('Search')).toBeOnTheScreen();
  });

  it('only reads QR codes', async () => {
    await render(<Scanner />);

    expect(screen.getByTestId('camera-view').props.barcodeScannerSettings).toEqual({ barcodeTypes: ['qr'] });
  });
});

describe('validateQRCode', () => {
  it('searches for a valid Kemyze QR code', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse(CONTAINER));
    await render(<Scanner />);

    await scan('42');

    expect(fetchMock()).toHaveBeenCalledWith(containerUrl('42'), expect.objectContaining({ method: 'GET' }));
  });

  it('searches for a code in the wrong format and shows the server error', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ error: 'Not found' }, 404));
    await render(<Scanner />);

    await scan('not-a-kemyze-id');

    expect(fetchMock()).toHaveBeenCalledWith(containerUrl('not-a-kemyze-id'), expect.anything());
    expect(alertSpy).toHaveBeenCalledWith('Error', 'The container does not exist or the request was invalid.');
  });

  it.each(['', '   '])('rejects the empty value "%s" without a request', async (data) => {
    await render(<Scanner />);

    await scan(data);

    expect(fetchMock()).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Invalid QR Code', 'The QR code could not be read. Please try again.');
  });
});

describe('handleInvalidQRCode', () => {
  it('shows an error message', async () => {
    await render(<Scanner />);

    await scan(' ');

    expect(alertSpy).toHaveBeenCalledWith('Invalid QR Code', 'The QR code could not be read. Please try again.');
  });

  it('lets scanning resume with the next code', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse(CONTAINER));
    await render(<Scanner />);

    await scan(' ');
    await scan('42');

    expect(fetchMock()).toHaveBeenCalledTimes(1);
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
    await render(<Scanner />);

    await scan('42');

    expect(screen.getByDisplayValue('42')).toBeOnTheScreen();
  });

  it('ignores repeat scans of the same code', async () => {
    fetchMock().mockResolvedValue(jsonResponse({ error: 'Not found' }, 404));
    await render(<Scanner />);

    await scan('42');
    await scan('42');
    await scan('42');

    expect(fetchMock()).toHaveBeenCalledTimes(1);
  });

  it('still reads a different code right away', async () => {
    fetchMock().mockResolvedValue(jsonResponse({ error: 'Not found' }, 404));
    await render(<Scanner />);

    await scan('42');
    await scan('43');

    expect(fetchMock()).toHaveBeenCalledTimes(2);
    expect(fetchMock()).toHaveBeenLastCalledWith(containerUrl('43'), expect.anything());
  });

  it('stops reading codes while the popup is open', async () => {
    await openPopup();

    expect(screen.getByTestId('camera-view').props.onBarcodeScanned).toBeUndefined();
  });
});

describe('fetchContainerData', () => {
  it('opens the scan popup on success', async () => {
    await openPopup();

    expect(screen.getByText('View SDS')).toBeOnTheScreen();
    expect(screen.getByText('Download QR Label')).toBeOnTheScreen();
  });

  it('searches the typed Kemyze ID when Search is pressed', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse(CONTAINER));
    await render(<Scanner />);

    await fireEvent.changeText(screen.getByDisplayValue(''), '42');
    await fireEvent.press(screen.getByText('Search'));

    expect(fetchMock()).toHaveBeenCalledWith(containerUrl('42'), expect.anything());
    await waitFor(() => expect(screen.getByText('Acetone')).toBeOnTheScreen());
  });

  it.each([404, 400])('shows "not found" when the server answers %i', async (status) => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ error: 'Not found' }, status));
    await render(<Scanner />);

    await scan('999');

    expect(alertSpy).toHaveBeenCalledWith('Error', 'The container does not exist or the request was invalid.');
    expect(screen.queryByText('View SDS')).toBeNull();
  });

  it('shows a server error when the server answers 500', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse('Internal Server Error', 500));
    await render(<Scanner />);

    await scan('42');

    expect(alertSpy).toHaveBeenCalledWith('Error', 'The container does not exist or the request was invalid.');
  });

  it('shows a network error when the server cannot be reached', async () => {
    fetchMock().mockRejectedValueOnce(new TypeError('Network request failed'));
    await render(<Scanner />);

    await scan('42');

    expect(alertSpy).toHaveBeenCalledWith('Network error', 'Unable to reach server.');
  });

  it('reports a timeout when the request is aborted', async () => {
    fetchMock().mockRejectedValueOnce(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
    await render(<Scanner />);

    await scan('42');

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
    await render(<Scanner />);

    await scan('42');

    expect(alertSpy).toHaveBeenCalledWith('Invalid response', 'The server returned malfomed data.');
  });

  it('shows the message for an incomplete container response', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ container_id: '42' }));
    await render(<Scanner />);

    await scan('42');

    expect(alertSpy).toHaveBeenCalledWith('Invalid Information', 'Invalid container response format.');
  });

  it('opens the SDS directly when only the SDS is returned', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ sds_sheet: 'JVBERi0xLjQ=' }));
    await render(<Scanner />);

    await scan('42');

    expect(openBase64Pdf).toHaveBeenCalledWith('JVBERi0xLjQ=');
    expect(screen.queryByText('View SDS')).toBeNull();
  });

  it('asks the server for "null" when Search is pressed with an empty Kemyze ID', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ error: 'Missing kemID' }, 400));
    await render(<Scanner />);

    await fireEvent.press(screen.getByText('Search'));

    expect(fetchMock()).toHaveBeenCalledWith(containerUrl('null'), expect.anything());
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Error', 'The container does not exist or the request was invalid.'),
    );
  });

  it('sends only one request while a search is already running', async () => {
    let finish: (value: unknown) => void = () => {};
    fetchMock().mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    await render(<Scanner />);

    // The first search is left waiting on the server while Search is pressed.
    let firstSearch: Promise<void> = Promise.resolve();
    await act(async () => {
      firstSearch = screen.getByTestId('camera-view').props.onBarcodeScanned({ data: '42' });
    });
    await fireEvent.press(screen.getByText('Search'));

    expect(fetchMock()).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish(jsonResponse(CONTAINER));
      await firstSearch;
    });
  });
});

describe('handleEditContainer', () => {
  it.each(['1', '2', '3'])('shows Edit Information for access level %s', async (accessLevel) => {
    mockUserState.activeUser = { userID: 7, accessLevel };

    await openPopup();

    expect(screen.getByText('Edit Information')).toBeOnTheScreen();
  });

  it.each(['4', '5'])('hides Edit Information for access level %s', async (accessLevel) => {
    mockUserState.activeUser = { userID: 7, accessLevel };

    await openPopup();

    expect(screen.queryByText('Edit Information')).toBeNull();
  });

  it('goes to Edit Container with the container ID', async () => {
    await openPopup();

    await fireEvent.press(screen.getByText('Edit Information'));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/SubPages/edit_container',
      params: { container_id: '42' },
    });
    expect(screen.queryByText('View SDS')).toBeNull();
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
    await render(<Scanner />);
    await scan('42');
    await waitFor(() => expect(screen.getByText('Acetone')).toBeOnTheScreen());

    await fireEvent.press(screen.getByText('View SDS'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'No container ID is available for this SDS.');
    expect(openURL).not.toHaveBeenCalled();
  });
});
