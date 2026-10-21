// Unit tests for the login screen, src/app/index.tsx (KM-152).
// Kept outside src/app because Expo Router treats every file there as a route.
import { Alert, Platform } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Index from '../app/index';
import { fetchMock, jsonResponse, mockRouter, mockUserState } from '../../test-utils';

const FORGOT_PASSWORD_URL = 'https://kemyze.vercel.app/login/forgot-password/';

let alertSpy: jest.SpyInstance;

beforeEach(() => {
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Both inputs start empty and have no placeholder, so they are found in screen order.
async function fillIn(email: string, password = '') {
  const [emailInput, passwordInput] = screen.getAllByDisplayValue('');
  await fireEvent.changeText(emailInput, email);
  await fireEvent.changeText(passwordInput, password);
}

describe('login screen renders', () => {
  it('shows the title, both fields and all buttons', async () => {
    await render(<Index />);

    expect(screen.getByText('Kemyze')).toBeOnTheScreen();
    expect(screen.getByText('Chemical Inventory and Safety Management')).toBeOnTheScreen();
    expect(screen.getByText('Email address')).toBeOnTheScreen();
    expect(screen.getByText('Password')).toBeOnTheScreen();
    expect(screen.getAllByDisplayValue('')).toHaveLength(2);
    expect(screen.getByText('Log In')).toBeOnTheScreen();
    expect(screen.getByText('Forgot Password')).toBeOnTheScreen();
    expect(screen.getByText('QR Scanner Bypass')).toBeOnTheScreen();
  });

  it('opens the guest scanner from QR Scanner Bypass', async () => {
    await render(<Index />);

    await fireEvent.press(screen.getByText('QR Scanner Bypass'));

    expect(mockRouter.navigate).toHaveBeenCalledWith('/SubPages/scannerbypass');
  });
});

describe('onPressLogin', () => {
  it.each([
    { email: '', password: '', title: 'Missing email', message: 'Please enter your email.' },
    { email: '   ', password: 'secret', title: 'Missing email', message: 'Please enter your email.' },
    { email: 'user@csus.edu', password: '', title: 'Missing password', message: 'Please enter your password.' },
    { email: 'user@csus.edu', password: '   ', title: 'Missing password', message: 'Please enter your password.' },
  ])('shows "$title" for email "$email" / password "$password"', async ({ email, password, title, message }) => {
    await render(<Index />);
    await fillIn(email, password);

    await fireEvent.press(screen.getByText('Log In'));

    expect(alertSpy).toHaveBeenCalledWith(title, message);
    expect(fetchMock()).not.toHaveBeenCalled();
  });

  it('shows the server message when login fails', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse('Invalid credentials', 400));
    await render(<Index />);
    await fillIn('user@csus.edu', 'wrong');

    await fireEvent.press(screen.getByText('Log In'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Login Failed', 'Invalid credentials'));
    expect(mockUserState.setActiveUser).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('sets the active user and opens the scanner on success', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ userID: 7, accessLevel: 'Primary' }));
    await render(<Index />);
    await fillIn('user@csus.edu', 'secret');

    await fireEvent.press(screen.getByText('Log In'));

    await waitFor(() => expect(mockRouter.navigate).toHaveBeenCalledWith('/Pages/scanner'));
    expect(mockUserState.setActiveUser).toHaveBeenCalledWith({ userID: 7, accessLevel: 'Primary' });
    expect(alertSpy).toHaveBeenCalledWith('Success', 'Welcome! Access level: Primary');
  });
});

describe('handleForgotPassword', () => {
  // The screen starts a 10 s abort timer that is not cleared when the request
  // fails, so fake timers keep it from holding Jest open after the run.
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it.each([
    { email: '', message: 'Please enter your email.' },
    { email: '   ', message: 'Please enter your email.' },
    { email: 'not-an-email', message: 'Please enter a valid email address.' },
    { email: 'user@csus', message: 'Please enter a valid email address.' },
    { email: 'user @csus.edu', message: 'Please enter a valid email address.' },
  ])('rejects email "$email" without sending a request', async ({ email, message }) => {
    await render(<Index />);
    await fillIn(email);

    await fireEvent.press(screen.getByText('Forgot Password'));

    expect(alertSpy).toHaveBeenCalledWith('Error', message);
    expect(fetchMock()).not.toHaveBeenCalled();
  });

  it('sends the reset request and shows the success message', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ message: 'Check your inbox.' }));
    await render(<Index />);
    await fillIn('user@csus.edu');

    await fireEvent.press(screen.getByText('Forgot Password'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Success', 'Check your inbox.'));
    expect(fetchMock()).toHaveBeenCalledWith(
      FORGOT_PASSWORD_URL,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'user@csus.edu' }) }),
    );
  });

  it('shows the server error message', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ error: 'No account with that email.' }, 404));
    await render(<Index />);
    await fillIn('user@csus.edu');

    await fireEvent.press(screen.getByText('Forgot Password'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Error', 'No account with that email.'));
  });

  it('reports a timeout when the request is aborted', async () => {
    const abort = Object.assign(new Error('Aborted'), { name: 'AbortError' });
    fetchMock().mockRejectedValueOnce(abort);
    await render(<Index />);
    await fillIn('user@csus.edu');

    await fireEvent.press(screen.getByText('Forgot Password'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Request timed out. Please try again.'),
    );
  });

  it('reports a network error', async () => {
    fetchMock().mockRejectedValueOnce(new TypeError('Network request failed'));
    await render(<Index />);
    await fillIn('user@csus.edu');

    await fireEvent.press(screen.getByText('Forgot Password'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Network error. Please try again.'),
    );
  });
});

describe('showPopup', () => {
  it('uses Alert.alert on iOS', async () => {
    await render(<Index />);

    await fireEvent.press(screen.getByText('Forgot Password'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Please enter your email.');
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('uses window.alert on web', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    await render(<Index />);

    await fireEvent.press(screen.getByText('Forgot Password'));

    expect(window.alert).toHaveBeenCalledWith('Error\n\nPlease enter your email.');
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
