// Unit tests for the edit container screen, src/app/SubPages/edit_container.tsx.
// Kept outside src/app because Expo Router treats every file there as a route.
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';
import EditContainer from '../app/SubPages/edit_container';
import {
  fetchMock,
  jsonResponse,
  mockLocalSearchParams,
  mockUserState,
} from '../../test-utils';

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success' },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, null, children);
  },
}));

jest.mock('expo-blur', () => ({
  BlurView: ({ children }: { children: React.ReactNode }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, null, children);
  },
}));

jest.mock('../app/components/NavBar', () => () => null);

jest.mock('../../components/GradientButton', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');

  return ({
    title,
    onPress,
    disabled,
  }: {
    title: string;
    onPress?: () => void;
    disabled?: boolean;
  }) => React.createElement(
    TouchableOpacity,
    {
      accessibilityRole: 'button',
      accessibilityLabel: title,
      disabled,
      onPress,
    },
    React.createElement(Text, null, title),
  );
});

const BASE_URL = 'https://kemyze.vercel.app/containers/';
const CONTAINER_ID = '42';

const container = {
  chemical_name: 'Acetone',
  cas_number: '67-64-1',
  quantity: '2 L',
  acqn_date: '2025-01-01',
  expr_date: '2027-01-01',
  // The legacy parser reverses a four-segment response into
  // location, room, cabinet, shelf state for this screen.
  location: '1, A, 101, Science',
};

const locations = [{ name: 'Science' }];
const rooms = [{ name: '101' }];
const cabinets = [{ name: 'A' }];
const shelves = [{ name: '1' }];
const changeLog = [
  {
    Timestamp: '2026-01-02T15:04:00.000Z',
    User: 'Dr. Rivera',
    Type: 'Edit',
    Change: 'Chemical Name',
    Old: 'Acetone',
    New: 'Updated Acetone',
  },
];

type RequestResponses = {
  containerResponse: typeof container;
  changeLogResponse: ReturnType<typeof jsonResponse>;
  uploadSdsResponse?: ReturnType<typeof jsonResponse>;
  editContainerResponse?: ReturnType<typeof jsonResponse>;
  addLocationResponse?: ReturnType<typeof jsonResponse>;
  rootLocations: typeof locations;
};

function queueInitialRequests(overrides: Partial<RequestResponses> = {}) {
  const responses: RequestResponses = {
    containerResponse: container,
    changeLogResponse: jsonResponse(changeLog),
    rootLocations: locations,
    ...overrides,
  };

  fetchMock().mockImplementation((url: string) => {
    if (url === `${BASE_URL}getContainer?kemID=${CONTAINER_ID}&accessLevel=1`) {
      return Promise.resolve(jsonResponse(responses.containerResponse));
    }
    if (url === `${BASE_URL}getContainerChangeLog?container_id=${CONTAINER_ID}`) {
      return Promise.resolve(responses.changeLogResponse);
    }
    if (url === `${BASE_URL}getLocationChildren?`) {
      return Promise.resolve(jsonResponse(responses.rootLocations));
    }
    if (url === `${BASE_URL}uploadSDS` && responses.uploadSdsResponse) {
      return Promise.resolve(responses.uploadSdsResponse);
    }
    if (url === `${BASE_URL}editContainer` && responses.editContainerResponse) {
      return Promise.resolve(responses.editContainerResponse);
    }
    if (url === `${BASE_URL}addLocation` && responses.addLocationResponse) {
      return Promise.resolve(responses.addLocationResponse);
    }
    if (url.startsWith(`${BASE_URL}getLocationChildren?location=Science&room=101&cabinet=A`)) {
      return Promise.resolve(jsonResponse(shelves));
    }
    if (url.startsWith(`${BASE_URL}getLocationChildren?location=Science&room=101`)) {
      return Promise.resolve(jsonResponse(cabinets));
    }
    if (url.startsWith(`${BASE_URL}getLocationChildren?location=Science`)) {
      return Promise.resolve(jsonResponse(rooms));
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });

  return responses;
}

async function renderLoadedScreen() {
  mockLocalSearchParams.container_id = CONTAINER_ID;
  mockUserState.activeUser = { userID: 7, accessLevel: '1' };
  const responses = queueInitialRequests();

  const view = await render(<EditContainer />);

  await waitFor(() => expect(view.getByDisplayValue('Acetone')).toBeOnTheScreen());
  return { responses, view };
}

async function addRootLocation() {
  const { responses, view } = await renderLoadedScreen();

  await fireEvent.press(view.getByRole('button', { name: 'Select location' }));
  await fireEvent.press(await view.findByRole('button', { name: 'Create New Location' }));
  await fireEvent.changeText(await view.findByLabelText('New Location Input'), 'Chemistry Annex');

  responses.addLocationResponse = jsonResponse({ success: true });
  responses.rootLocations = [...locations, { name: 'Chemistry Annex' }];

  await fireEvent.press(view.getByRole('button', { name: 'Add New Location' }));

  await waitFor(() => {
    expect(fetchMock()).toHaveBeenCalledWith(
      `${BASE_URL}addLocation`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ user_id: 7, new_location: 'Chemistry Annex' }),
      }),
    );
  });
  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Button to leave new Location' })).toBeOnTheScreen(),
  );
}

describe('Edit Container screen', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds a new root location and refreshes location options', addRootLocation);

  it('renders the edit form with the loaded container details', async () => {
    const { view } = await renderLoadedScreen();

    expect(view.getByText('Edit Container')).toBeOnTheScreen();
    expect(view.getByDisplayValue('Acetone')).toBeOnTheScreen();
    expect(view.getAllByText('Science').length).toBeGreaterThan(0);
    expect(view.getByText('101')).toBeOnTheScreen();
    expect(view.getByText('A')).toBeOnTheScreen();
    expect(view.getAllByText('1').length).toBeGreaterThan(0);
    expect(view.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(view.getByRole('button', { name: 'Open Change Log' })).toBeEnabled();
  });

  it('gets the container, every location level, and its change log on load', async () => {
    await renderLoadedScreen();

    await waitFor(() => {
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}getContainer?kemID=${CONTAINER_ID}&accessLevel=1`,
        { method: 'GET' },
      );
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}getContainerChangeLog?container_id=${CONTAINER_ID}`,
        { method: 'GET' },
      );
      expect(fetchMock()).toHaveBeenCalledWith(`${BASE_URL}getLocationChildren?`, { method: 'GET' });
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}getLocationChildren?location=Science`,
        { method: 'GET' },
      );
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}getLocationChildren?location=Science&room=101`,
        { method: 'GET' },
      );
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}getLocationChildren?location=Science&room=101&cabinet=A`,
        { method: 'GET' },
      );
    });
  });

  it('retries loadChangeLog after an initial failure', async () => {
    mockLocalSearchParams.container_id = CONTAINER_ID;
    mockUserState.activeUser = { userID: 7, accessLevel: '1' };
    const responses = queueInitialRequests({
      changeLogResponse: jsonResponse('Could not load history', 500),
    });
    const view = await render(<EditContainer />);

    const retryButton = await view.findByRole('button', { name: 'Retry loading Change Log' });
    responses.changeLogResponse = jsonResponse(changeLog);

    await fireEvent.press(retryButton);

    await waitFor(() =>
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}getContainerChangeLog?container_id=${CONTAINER_ID}`,
        { method: 'GET' },
      ),
    );
    expect(view.getByRole('button', { name: 'Open Change Log' })).toBeEnabled();
  });

  it('uploads a selected SDS PDF for the active user and current container', async () => {
    const { responses, view } = await renderLoadedScreen();
    const picker = DocumentPicker.getDocumentAsync as jest.Mock;
    picker.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///tmp/acetone-sds.pdf',
          name: 'acetone-sds.pdf',
          mimeType: 'application/pdf',
        },
      ],
    });

    await fireEvent.press(view.getByRole('button', { name: 'Locate SDS PDF file' }));
    await waitFor(() => expect(view.getByRole('button', { name: 'Import' })).toBeEnabled());

    responses.uploadSdsResponse = jsonResponse({ sds_base64: 'JVBERi0xLjQ=' });
    await fireEvent.press(view.getByRole('button', { name: 'Import' }));

    await waitFor(() => {
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}uploadSDS`,
        expect.objectContaining({ method: 'POST', body: expect.any(FormData) }),
      );
    });
    expect(alertSpy).not.toHaveBeenCalled();
    expect(view.getByRole('button', { name: 'Uploaded ✓' })).toBeDisabled();
  });

  it('sends changed container data after review confirmation', async () => {
    const { responses, view } = await renderLoadedScreen();

    await fireEvent.changeText(view.getByDisplayValue('Acetone'), 'Updated Acetone');
    await fireEvent.press(view.getByRole('button', { name: 'Save' }));

    const confirmButton = await view.findByRole('button', { name: 'Save reviewed changes' });
    responses.editContainerResponse = jsonResponse({ success: true });
    responses.containerResponse = { ...container, chemical_name: 'Updated Acetone' };

    await fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}editContainer`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: expect.stringContaining('Updated Acetone'),
        }),
      );
    });
    const editRequest = fetchMock().mock.calls.find(([url]) => url === `${BASE_URL}editContainer`);
    expect(JSON.parse(editRequest[1].body)).toMatchObject({
      user_id: 7,
      container_id: CONTAINER_ID,
      chemical_name: 'Updated Acetone',
    });
  });

});