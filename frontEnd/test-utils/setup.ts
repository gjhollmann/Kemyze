/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock factories run before imports, so they must use require(). */
// Shared Jest setup for the frontend unit tests (KM-151).
// Mocks the network, router, camera and logged-in user so tests never need a
// device and never reach the live backend or database.
import { mockUserState } from '.';

jest.mock('expo-router', () => ({
  useRouter: () => require('.').mockRouter,
  useLocalSearchParams: () => ({}),
  useFocusEffect: jest.fn(),
  Link: ({ children }: { children: unknown }) => children,
}));

// CameraView renders a plain View so tests can trigger scans through its
// onBarcodeScanned prop (getByTestId('camera-view').props.onBarcodeScanned).
jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CameraView: (props: object) => React.createElement(View, { testID: 'camera-view', ...props }),
    Camera: {},
    useCameraPermissions: () => [{ granted: true }, jest.fn()],
  };
});

jest.mock('../src/app/contexts/UserState', () => ({
  useUserState: () => require('.').mockUserState,
  UserProvider: ({ children }: { children: unknown }) => children,
}));

beforeEach(() => {
  mockUserState.activeUser = null;

  // Any request a test did not mock fails loudly instead of hitting the server.
  global.fetch = jest.fn((url: unknown) =>
    Promise.reject(new Error(`Unmocked fetch: ${String(url)}`)),
  ) as jest.Mock;

  window.alert = jest.fn();
});
