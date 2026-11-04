// Unit tests for the add container screen, src/app/SubPages/add_container.tsx.
// Kept outside src/app because Expo Router treats every file there as a route.
import { Alert, Text, TouchableOpacity } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';
import AddContainer from '../app/SubPages/add_container';
import { fetchMock, jsonResponse, mockUserState } from '../../test-utils';

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

jest.mock('../../components/QRLabelPopup', () => ({
  QRLabelPopup: () => null,
}));

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
const rootLocations = [{ name: 'School' }, { name: 'Chemistry Annex' }];
const rooms = [{ name: 'Chemistry' }];
const cabinets = [{ name: '1' }];
const shelves = [{ name: '1' }];

type RequestResponses = {
  rootLocations: { name: string }[];
  uploadSdsResponse?: ReturnType<typeof jsonResponse>;
  createContainerResponse?: ReturnType<typeof jsonResponse>;
  addLocationResponse?: ReturnType<typeof jsonResponse>;
};

function queueRequests(overrides: Partial<RequestResponses> = {}) {
  const responses: RequestResponses = {
    rootLocations,
    ...overrides,
  };

  fetchMock().mockImplementation((url: string) => {
    if (url === `${BASE_URL}getLocationChildren?`) {
      return Promise.resolve(jsonResponse(responses.rootLocations));
    }
    if (url === `${BASE_URL}getLocationChildren?location=School`) {
      return Promise.resolve(jsonResponse(rooms));
    }
    if (url === `${BASE_URL}getLocationChildren?location=School&room=Chemistry`) {
      return Promise.resolve(jsonResponse(cabinets));
    }
    if (url === `${BASE_URL}getLocationChildren?location=School&room=Chemistry&cabinet=1`) {
      return Promise.resolve(jsonResponse(shelves));
    }
    if (url === `${BASE_URL}uploadSDS` && responses.uploadSdsResponse) {
      return Promise.resolve(responses.uploadSdsResponse);
    }
    if (url === `${BASE_URL}createContainer` && responses.createContainerResponse) {
      return Promise.resolve(responses.createContainerResponse);
    }
    if (url === `${BASE_URL}addLocation` && responses.addLocationResponse) {
      return Promise.resolve(responses.addLocationResponse);
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });

  return responses;
}

async function renderScreen() {
  mockUserState.activeUser = { userID: 7, accessLevel: '1' };
  const responses = queueRequests();
  const view = await render(<AddContainer />);

  await waitFor(() =>
    expect(fetchMock()).toHaveBeenCalledWith(`${BASE_URL}getLocationChildren?`, { method: 'GET' }),
  );

  return { responses, view };
}

async function uploadSds(view: Awaited<ReturnType<typeof render>>, responses: RequestResponses) {
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

  await waitFor(() => expect(view.getByRole('button', { name: 'Uploaded ✓' })).toBeDisabled());
}

describe('Add Container screen', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the add container form and primary controls', async () => {
    const { view } = await renderScreen();

    expect(view.getByText('Add Container')).toBeOnTheScreen();
    expect(view.getByLabelText('Chemical Name')).toBeOnTheScreen();
    expect(view.getByRole('button', { name: 'Select location' })).toBeOnTheScreen();
    expect(view.getByRole('button', { name: 'Locate SDS PDF file' })).toBeOnTheScreen();
    expect(view.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('loads root and dependent location options through loadVarLocationOptions', async () => {
    await renderScreen();

    await waitFor(() => {
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}getLocationChildren?location=School`,
        { method: 'GET' },
      );
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}getLocationChildren?location=School&room=Chemistry`,
        { method: 'GET' },
      );
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}getLocationChildren?location=School&room=Chemistry&cabinet=1`,
        { method: 'GET' },
      );
    });
  });

  it('uploads a selected SDS PDF for the active user', async () => {
    const { responses, view } = await renderScreen();

    await uploadSds(view, responses);

    expect(fetchMock()).toHaveBeenCalledWith(
      `${BASE_URL}uploadSDS`,
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) }),
    );
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('creates a new root location and refreshes the location list', async () => {
    const { responses, view } = await renderScreen();

    await fireEvent.press(view.getByRole('button', { name: 'Select location' }));
    await fireEvent.press(await view.findByRole('button', { name: 'Create New Location' }));
    await fireEvent.changeText(await view.findByLabelText('New Location Input'), 'Biology Annex');

    responses.addLocationResponse = jsonResponse({ success: true });
    responses.rootLocations = [...rootLocations, { name: 'Biology Annex' }];

    await fireEvent.press(view.getByRole('button', { name: 'Add New Location' }));

    await waitFor(() => {
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}addLocation`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ user_id: 7, new_location: 'Biology Annex' }),
        }),
      );
    });
    expect(await view.findByRole('button', { name: 'Button to leave new Location' })).toBeOnTheScreen();
  });

  it('saves reviewed changes with the uploaded SDS and active user', async () => {
    const { responses, view } = await renderScreen();

    await fireEvent.changeText(view.getByLabelText('Chemical Name'), 'Acetone');
    await uploadSds(view, responses);
    await waitFor(() => expect(view.getByRole('button', { name: 'Save' })).toBeEnabled());

    await fireEvent.press(view.getByRole('button', { name: 'Save' }));
    const confirmButton = await view.findByRole('button', { name: 'Save reviewed changes' });
    responses.createContainerResponse = jsonResponse({ container_id: 42 });

    await fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}createContainer`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        }),
      );
    });
    const createRequest = fetchMock().mock.calls.find(([url]) => url === `${BASE_URL}createContainer`);
    expect(JSON.parse(createRequest[1].body)).toMatchObject({
      user_id: 7,
      chemical_name: 'Acetone',
      location: 'School',
      room: 'Chemistry',
      cabinet: '1',
      shelf: '1',
      sds_base64: 'JVBERi0xLjQ=',
    });
    expect(alertSpy).not.toHaveBeenCalled();
  });
});