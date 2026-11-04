// Unit tests for the Chemical Inventory screen, src/app/Pages/inventory.tsx (KM-142).
// Kept outside src/app because Expo Router treats every file there as a route.
// fetch, the router and the logged-in user are mocked in test-utils/setup.ts,
// so these tests never reach the live backend.
import { Alert, Linking } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Inventory from '../app/Pages/inventory';
import { fetchMock, jsonResponse, mockRouter, mockUserState } from '../../test-utils';

// The screen imports the document picker for its old built-in Add Container popup.
// Nothing reachable uses it, so an empty mock is enough.
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));

// The first test also pays a one-time cost of loading every module the screen
// uses, which can take over Jest's 5-second default on a cold run (Windows,
// first run after npm install). Give each test in this file up to 15 seconds.
jest.setTimeout(15000);

const API = 'https://kemyze.vercel.app/containers/';

// Builds `count` fake containers shaped like the getSearch response,
// with IDs starting at `firstId` (Chemical 1, Chemical 2, ...).
function makeContainers(firstId: number, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    container_id: firstId + i,
    chemical_name: `Chemical ${firstId + i}`,
    cas_number: '7647-14-5',
    expr_date: null,
    location: 'Room 101',
    quantity: 'Full',
  }));
}

// The URL of the nth fetch call (0 = the first one).
const urlOfCall = (n: number) => fetchMock().mock.calls[n][0] as string;

let alertSpy: jest.SpyInstance;

beforeEach(() => {
  mockUserState.activeUser = { userID: 7, accessLevel: '1' };
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  // The screen logs every request; keep the test output readable.
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// KM-155
describe('fetchAllContainers', () => {
  it('loads the first page for the logged-in user when the screen opens', async () => {
    // Hold the server's answer so the loading message can be checked first.
    let answer!: () => void;
    fetchMock().mockImplementationOnce(
      () => new Promise((resolve) => { answer = () => resolve(jsonResponse(makeContainers(1, 10))); }),
    );

    await render(<Inventory />);

    expect(screen.getByText('Loading your chemicals…')).toBeOnTheScreen();
    answer();
    expect(await screen.findByText('Chemical 1')).toBeOnTheScreen();
    expect(screen.getByText('Chemical 10')).toBeOnTheScreen();
    expect(screen.queryByText('Loading your chemicals…')).toBeNull();
    expect(fetchMock()).toHaveBeenCalledTimes(1);
    expect(urlOfCall(0)).toBe(`${API}getSearch?input=&count=0&userID=7`);
  });

  it('leaves the userID off when no one is logged in', async () => {
    mockUserState.activeUser = null;
    fetchMock().mockResolvedValueOnce(jsonResponse(makeContainers(1, 3)));

    await render(<Inventory />);

    await screen.findByText('Chemical 1');
    expect(urlOfCall(0)).toBe(`${API}getSearch?input=&count=0`);
  });

  it('shows "No chemicals found." for an empty inventory', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse([]));

    await render(<Inventory />);

    expect(await screen.findByText('No chemicals found.')).toBeOnTheScreen();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['the server answers with an error', () => Promise.resolve(jsonResponse({ error: 'down' }, 500))],
    ['the request cannot reach the server', () => Promise.reject(new Error('Network request failed'))],
  ])('shows an error popup when %s', async (_case, response) => {
    fetchMock().mockImplementationOnce(response);

    await render(<Inventory />);

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "Couldn't load inventory",
        'Please check your connection and try again.',
      ),
    );
    expect(screen.getByText('No chemicals found.')).toBeOnTheScreen();
  });

  it('reloads the first page when Show All is pressed', async () => {
    fetchMock()
      .mockResolvedValueOnce(jsonResponse(makeContainers(1, 10)))
      .mockResolvedValueOnce(jsonResponse(makeContainers(50, 2)));
    await render(<Inventory />);
    await screen.findByText('Chemical 1');

    await fireEvent.press(screen.getByText('Show All'));

    expect(await screen.findByText('Chemical 50')).toBeOnTheScreen();
    expect(screen.queryByText('Chemical 1')).toBeNull();
    expect(urlOfCall(1)).toBe(`${API}getSearch?input=&count=0&userID=7`);
  });
});