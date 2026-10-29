// Unit tests for the container popup, components/ScanPopup.tsx (KM-191).
// Kept outside src/app because Expo Router treats every file there as a route.
import { render, screen } from '@testing-library/react-native';
import { ScanPopup } from '../../components/ScanPopup';

const scanResult = {
  chemicalName: 'Acetone',
  cas: '67-64-1',
  id: '42',
  purchaseDate: '2026-01-01',
  expDate: '2027-01-01',
  location: 'Lab 101',
  quantity: '1 L',
};

const noop = () => {};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ScanPopup', () => {
  test('renders the container info without the "Text strings" error', async () => {
    const errorSpy = jest.spyOn(console, 'error');

    await render(
      <ScanPopup
        visible
        onClose={noop}
        scanResult={scanResult}
        editPrivilege={false}
        onViewSds={noop}
        onQrLabel={noop}
        onEdit={noop}
      />
    );

    expect(screen.getByText('Acetone')).toBeTruthy();
    expect(screen.getByText('CAS: 67-64-1')).toBeTruthy();
    expect(screen.getByText('1 L')).toBeTruthy();
    expect(errorSpy.mock.calls.flat().join(' ')).not.toMatch(/Text strings must be rendered/);
  });

  test('renders when the container has no ID', async () => {
    await render(
      <ScanPopup
        visible
        onClose={noop}
        scanResult={{ ...scanResult, id: '' }}
        editPrivilege={false}
        onViewSds={noop}
        onQrLabel={noop}
        onEdit={noop}
      />
    );

    expect(screen.getByText('Acetone')).toBeTruthy();
  });

  test('shows Edit Information only for users who can edit', async () => {
    const { rerender } = await render(
      <ScanPopup
        visible
        onClose={noop}
        scanResult={scanResult}
        editPrivilege={false}
        onViewSds={noop}
        onQrLabel={noop}
        onEdit={noop}
      />
    );
    expect(screen.queryByText('Edit Information')).toBeNull();

    await rerender(
      <ScanPopup
        visible
        onClose={noop}
        scanResult={scanResult}
        editPrivilege
        onViewSds={noop}
        onQrLabel={noop}
        onEdit={noop}
      />
    );
    expect(screen.getByText('Edit Information')).toBeTruthy();
  });
});
