// Unit tests for the edit profile screen, src/app/SubPages/editprofile.tsx.
// Kept outside src/app because Expo Router treats every file there as a route.
import { Alert, Text, TouchableOpacity } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import EditProfile from '../app/SubPages/editprofile';
import {
  fetchMock,
  jsonResponse,
  mockLocalSearchParams,
  mockUserState,
} from '../../test-utils';

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

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
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

const BASE_URL = 'https://kemyze.vercel.app/';
const USER_ID = '42';
const user = {
  user_id: 42,
  first_name: 'Ada',
  last_name: 'Lovelace',
  location: 'Sacramento Lab',
  phone: '9165551234',
  email: 'ada@csus.edu',
  access_level: 3,
};
const locations = [{ name: 'Sacramento Lab' }, { name: 'Davis Lab' }];
const changeLog = [{
  Timestamp: '2026-10-27T12:00:00.000Z',
  User: 'Ada Lovelace',
  Type: 'Edit',
  Change: 'Name',
  Old: 'Ada Byron',
  New: 'Ada Lovelace',
}];

type RequestResponses = {
  userResponse: typeof user;
  locations: { name: string }[];
  editUserResponse?: ReturnType<typeof jsonResponse>;
  addLocationResponse?: ReturnType<typeof jsonResponse>;
};

function queueRequests(overrides: Partial<RequestResponses> = {}) {
  const responses: RequestResponses = {
    userResponse: user,
    locations,
    ...overrides,
  };

  fetchMock().mockImplementation((url: string) => {
    if (url === `${BASE_URL}login/getUser?active_user_id=7&user_id=${USER_ID}`) {
      return Promise.resolve(jsonResponse(responses.userResponse));
    }
    if (url === `${BASE_URL}containers/getLocationChildren?`) {
      return Promise.resolve(jsonResponse(responses.locations));
    }
    if (url === `${BASE_URL}containers/getContainerChangeLog?user_id=${USER_ID}`) {
      return Promise.resolve(jsonResponse(changeLog));
    }
    if (url === `${BASE_URL}login/editUser` && responses.editUserResponse) {
      return Promise.resolve(responses.editUserResponse);
    }
    if (url === `${BASE_URL}containers/addLocation` && responses.addLocationResponse) {
      return Promise.resolve(responses.addLocationResponse);
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });

  return responses;
}

async function renderLoadedScreen() {
  mockLocalSearchParams.user_id = USER_ID;
  mockUserState.activeUser = { userID: 7, accessLevel: '1' };
  const responses = queueRequests();
  const view = await render(<EditProfile />);

  await waitFor(() => expect(view.getByDisplayValue('Ada Lovelace')).toBeOnTheScreen());
  return { responses, view };
}

describe('Edit Profile screen', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the loaded profile form and primary controls', async () => {
    const { view } = await renderLoadedScreen();

    expect(view.getByText('Edit Profile')).toBeOnTheScreen();
    expect(view.getByDisplayValue('Ada Lovelace')).toBeOnTheScreen();
    expect(view.getByDisplayValue('ada@csus.edu')).toBeOnTheScreen();
    expect(view.getByRole('button', { name: 'Select location' })).toBeEnabled();
    expect(view.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    expect(view.getByRole('button', { name: 'Open Change Log' })).toBeEnabled();
  });

  it('saves reviewed profile changes for the selected user', async () => {
    const { responses, view } = await renderLoadedScreen();

    await fireEvent.changeText(view.getByDisplayValue('Ada Lovelace'), 'Grace Hopper');
    await fireEvent.press(view.getByRole('button', { name: 'Save Changes' }));

    responses.editUserResponse = jsonResponse({ success: true });
    await fireEvent.press(await view.findByRole('button', { name: 'Save reviewed changes' }));

    await waitFor(() => {
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}login/editUser`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            active_user_id: 7,
            user_id: USER_ID,
            first_name: 'Grace',
            last_name: 'Hopper',
          }),
        }),
      );
    });
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('does not send a save request when the reviewed name is empty', async () => {
    const { view } = await renderLoadedScreen();

    await fireEvent.changeText(view.getByDisplayValue('Ada Lovelace'), '');
    await fireEvent.press(view.getByRole('button', { name: 'Save Changes' }));
    await fireEvent.press(await view.findByRole('button', { name: 'Save reviewed changes' }));

    expect(fetchMock()).not.toHaveBeenCalledWith(
      `${BASE_URL}login/editUser`,
      expect.anything(),
    );
    expect(alertSpy).toHaveBeenCalledWith('Invalid Name', 'Name cannot be empty.');
  });

  it('adds a new root location and refreshes location options', async () => {
    const { responses, view } = await renderLoadedScreen();

    await fireEvent.press(view.getByRole('button', { name: 'Select location' }));
    await fireEvent.press(await view.findByRole('button', { name: 'Create New Location' }));
    await fireEvent.changeText(await view.findByLabelText('New Location Input'), 'Folsom Lab');

    responses.addLocationResponse = jsonResponse({ success: true });
    responses.locations = [...locations, { name: 'Folsom Lab' }];

    await fireEvent.press(view.getByRole('button', { name: 'Add New Location' }));

    await waitFor(() => {
      expect(fetchMock()).toHaveBeenCalledWith(
        `${BASE_URL}containers/addLocation`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ user_id: 7, new_location: 'Folsom Lab' }),
        }),
      );
    });
    expect(await view.findByRole('button', { name: 'Button to leave new Location' })).toBeOnTheScreen();
  });
});