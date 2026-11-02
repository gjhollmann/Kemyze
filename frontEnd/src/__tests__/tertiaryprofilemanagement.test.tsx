/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock factories run before imports, so they must use require(). */
// Unit tests for the Managed Accounts screen, src/app/Pages/tertiaryprofilemanagement.tsx (KM-158, KM-159, KM-160).
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import ManagedAccounts from '../app/Pages/tertiaryprofilemanagement';
import { BASE_URL } from '../../constants/api';
import { fetchMock, jsonResponse, mockRouter, mockUserState } from '../../test-utils';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// Reanimated needs native code that does not exist under Jest, so both packages use their own mocks.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

const SEARCH_URL = `${BASE_URL}login/users/search/`;
const DELETE_URL = `${BASE_URL}login/users/delete/`;

const JOHN = { id: 1, name: 'John Smith', location: 'Sacramento Lab', access_level: 3 };
const MARIA = { id: 2, name: 'Maria Delgado', location: 'Davis Lab', access_level: 2 };
const CHEN = { id: 3, name: 'Chen Wei', location: 'Folsom Lab', access_level: 4 };

// Build a successful response from the search endpoint.
function accountsPage(results: object[], nextOffset: number | null = null) {
  return jsonResponse({
    success: true,
    results,
    has_more: nextOffset !== null,
    next_offset: nextOffset,
  });
}

// A response the test finishes by hand, to check the screen while a request is in flight.
function deferredResponse() {
  let resolve: (response: unknown) => void = () => {};
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

// The JSON body sent with the nth fetch call.
const sentBody = (call = 0) => JSON.parse(fetchMock().mock.calls[call][1].body);

// Fire the list's scroll handler. The list is 400 tall inside 1000 of content,
// so it reaches the end at an offset of 600.
async function scrollList(offsetY = 600) {
  await fireEvent(screen.getByTestId('accounts-list'), 'momentumScrollEnd', {
    nativeEvent: {
      contentSize: { height: 1000 },
      layoutMeasurement: { height: 400 },
      contentOffset: { y: offsetY },
    },
  });
}

async function renderWithAccounts(response = accountsPage([JOHN, MARIA])) {
  fetchMock().mockResolvedValueOnce(response);
  await render(<ManagedAccounts />);
  await screen.findByText('John Smith');
}

beforeEach(() => {
  mockUserState.activeUser = { userID: 7, accessLevel: 'Tertiary' };
});

describe('loadAccounts', () => {
  describe('first page', () => {
    it('requests the first page for the logged-in user on open', async () => {
      await renderWithAccounts();

      expect(fetchMock()).toHaveBeenCalledTimes(1);
      expect(fetchMock().mock.calls[0][0]).toBe(SEARCH_URL);
      expect(fetchMock().mock.calls[0][1].method).toBe('POST');
      expect(sentBody()).toEqual({
        user_id: 7,
        search: '',
        offset: 0,
        recently_active: false,
        recently_inactive: false,
      });
    });

    it('lists the accounts from the first page', async () => {
      await renderWithAccounts();

      expect(screen.getByText('John Smith')).toBeOnTheScreen();
      expect(screen.getByText('Maria Delgado')).toBeOnTheScreen();
    });

    it('shows a loading message until the first page arrives', async () => {
      const first = deferredResponse();
      fetchMock().mockReturnValueOnce(first.promise);
      await render(<ManagedAccounts />);

      expect(screen.getByText('Loading managed accounts...')).toBeOnTheScreen();

      first.resolve(accountsPage([JOHN]));

      await screen.findByText('John Smith');
      expect(screen.queryByText('Loading managed accounts...')).toBeNull();
    });

    it('shows the empty message when no accounts come back', async () => {
      fetchMock().mockResolvedValueOnce(accountsPage([]));
      await render(<ManagedAccounts />);

      expect(await screen.findByText('No accounts match this search.')).toBeOnTheScreen();
      expect(screen.queryByText('No more accounts to load.')).toBeNull();
    });
  });

  describe('search', () => {
    it('sends the trimmed search text from the first offset and replaces the list', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(accountsPage([CHEN]));

      await fireEvent.changeText(screen.getByLabelText('Search managed accounts'), '  Chen  ');
      await fireEvent.press(screen.getByText('Search'));

      expect(await screen.findByText('Chen Wei')).toBeOnTheScreen();
      expect(sentBody(1)).toEqual(expect.objectContaining({ search: 'Chen', offset: 0 }));
      expect(screen.queryByText('John Smith')).toBeNull();
    });

    it('searches when the keyboard search key is pressed', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(accountsPage([CHEN]));
      const input = screen.getByLabelText('Search managed accounts');

      await fireEvent.changeText(input, 'Chen');
      await fireEvent(input, 'submitEditing');

      expect(await screen.findByText('Chen Wei')).toBeOnTheScreen();
      expect(sentBody(1).search).toBe('Chen');
    });

    it('does not search while the text is only being typed', async () => {
      await renderWithAccounts();

      await fireEvent.changeText(screen.getByLabelText('Search managed accounts'), 'Chen');

      expect(fetchMock()).toHaveBeenCalledTimes(1);
    });

    it('reloads the full list when the search box is cleared', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(accountsPage([CHEN]));
      const input = screen.getByLabelText('Search managed accounts');
      await fireEvent.changeText(input, 'Chen');
      await fireEvent.press(screen.getByText('Search'));
      await screen.findByText('Chen Wei');
      fetchMock().mockResolvedValueOnce(accountsPage([JOHN, MARIA]));

      await fireEvent.changeText(input, '');

      expect(await screen.findByText('John Smith')).toBeOnTheScreen();
      expect(sentBody(2).search).toBe('');
    });

    it('runs the same search again when Search is pressed twice', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(accountsPage([JOHN, MARIA]));

      await fireEvent.press(screen.getByText('Search'));

      await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
      expect(await screen.findByText('John Smith')).toBeOnTheScreen();
      expect(sentBody(1).search).toBe('');
    });

    it('ignores an older search that answers after a newer one', async () => {
      await renderWithAccounts();
      const older = deferredResponse();
      const newer = deferredResponse();
      fetchMock().mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
      const input = screen.getByLabelText('Search managed accounts');

      await fireEvent.changeText(input, 'Maria');
      await fireEvent.press(screen.getByText('Search'));
      await fireEvent.changeText(input, 'Chen');
      await fireEvent.press(screen.getByText('Search'));

      newer.resolve(accountsPage([CHEN]));
      await screen.findByText('Chen Wei');
      // Nothing on screen changes when the older answer is ignored, so wait for it to be handled.
      await act(async () => {
        older.resolve(accountsPage([MARIA]));
        await new Promise((done) => setTimeout(done, 0));
      });

      expect(screen.getByText('Chen Wei')).toBeOnTheScreen();
      expect(screen.queryByText('Maria Delgado')).toBeNull();
    });
  });

  describe('filters', () => {
    it('sends recently_active when Recently Active is selected', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(accountsPage([JOHN]));

      await fireEvent.press(screen.getByText('Recently Active'));

      expect(await screen.findByText('✓ Recently Active')).toBeOnTheScreen();
      await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
      expect(sentBody(1)).toEqual(
        expect.objectContaining({ recently_active: true, recently_inactive: false }),
      );
      await screen.findByText('John Smith');
    });

    it('turns Recently Active off when Recently Inactive is selected', async () => {
      await renderWithAccounts();
      fetchMock()
        .mockResolvedValueOnce(accountsPage([JOHN]))
        .mockResolvedValueOnce(accountsPage([JOHN]));

      await fireEvent.press(screen.getByText('Recently Active'));
      await screen.findByText('John Smith');
      await fireEvent.press(screen.getByText('Recently Inactive'));

      expect(await screen.findByText('✓ Recently Inactive')).toBeOnTheScreen();
      expect(screen.getByText('Recently Active')).toBeOnTheScreen();
      await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(3));
      expect(sentBody(2)).toEqual(
        expect.objectContaining({ recently_active: false, recently_inactive: true }),
      );
      await screen.findByText('John Smith');
    });
  });

  describe('scrolling to the end', () => {
    it('requests the next page from next_offset and adds it to the list', async () => {
      await renderWithAccounts(accountsPage([JOHN, MARIA], 2));
      fetchMock().mockResolvedValueOnce(accountsPage([CHEN]));

      await scrollList();

      expect(await screen.findByText('Chen Wei')).toBeOnTheScreen();
      expect(sentBody(1)).toEqual(expect.objectContaining({ search: '', offset: 2 }));
      expect(screen.getByText('John Smith')).toBeOnTheScreen();
      expect(screen.getByText('Maria Delgado')).toBeOnTheScreen();
    });

    it('does not repeat an account that is on both pages', async () => {
      await renderWithAccounts(accountsPage([JOHN, MARIA], 2));
      fetchMock().mockResolvedValueOnce(accountsPage([MARIA, CHEN]));

      await scrollList();

      await screen.findByText('Chen Wei');
      expect(screen.getAllByText('Maria Delgado')).toHaveLength(1);
      expect(screen.getAllByText('John Smith')).toHaveLength(1);
    });

    it('keeps the search text when loading the next page', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(accountsPage([JOHN], 1));
      await fireEvent.changeText(screen.getByLabelText('Search managed accounts'), 'Smith');
      await fireEvent.press(screen.getByText('Search'));
      await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
      await screen.findByText('John Smith');
      fetchMock().mockResolvedValueOnce(accountsPage([CHEN]));

      await scrollList();

      await screen.findByText('Chen Wei');
      expect(sentBody(2)).toEqual(expect.objectContaining({ search: 'Smith', offset: 1 }));
    });

    it('does not load a page when the list stops short of the end', async () => {
      await renderWithAccounts(accountsPage([JOHN, MARIA], 2));

      await scrollList(100);

      expect(fetchMock()).toHaveBeenCalledTimes(1);
    });

    it('loads a page when the list stops within 24 of the end', async () => {
      await renderWithAccounts(accountsPage([JOHN, MARIA], 2));
      fetchMock().mockResolvedValueOnce(accountsPage([CHEN]));

      await scrollList(576);

      expect(await screen.findByText('Chen Wei')).toBeOnTheScreen();
    });

    it('shows a loading message and sends one request while a page is loading', async () => {
      await renderWithAccounts(accountsPage([JOHN, MARIA], 2));
      const nextPage = deferredResponse();
      fetchMock().mockReturnValueOnce(nextPage.promise);

      await scrollList();
      await scrollList();

      expect(screen.getByText('Loading more accounts...')).toBeOnTheScreen();
      expect(fetchMock()).toHaveBeenCalledTimes(2);

      nextPage.resolve(accountsPage([CHEN]));

      await screen.findByText('Chen Wei');
      expect(screen.queryByText('Loading more accounts...')).toBeNull();
    });
  });

  describe('no more accounts', () => {
    it('shows the end message after the last page', async () => {
      await renderWithAccounts();

      expect(screen.getByText('No more accounts to load.')).toBeOnTheScreen();
    });

    it('hides the end message while more pages are available', async () => {
      await renderWithAccounts(accountsPage([JOHN, MARIA], 2));

      expect(screen.queryByText('No more accounts to load.')).toBeNull();
    });

    it('shows the end message once the next page turns out to be the last', async () => {
      await renderWithAccounts(accountsPage([JOHN, MARIA], 2));
      fetchMock().mockResolvedValueOnce(accountsPage([CHEN]));

      await scrollList();

      expect(await screen.findByText('No more accounts to load.')).toBeOnTheScreen();
    });

    it('does not request another page after the last one', async () => {
      await renderWithAccounts();

      await scrollList();

      expect(fetchMock()).toHaveBeenCalledTimes(1);
    });

    it.each([
      { name: 'has_more is false', has_more: false, next_offset: 2 },
      { name: 'next_offset is missing', has_more: true, next_offset: null },
    ])('does not request another page when $name', async ({ has_more, next_offset }) => {
      await renderWithAccounts(jsonResponse({ success: true, results: [JOHN, MARIA], has_more, next_offset }));

      await scrollList();

      expect(fetchMock()).toHaveBeenCalledTimes(1);
    });
  });

  describe('no logged-in user', () => {
    beforeEach(() => {
      mockUserState.activeUser = null;
    });

    it('shows the login message without calling the server', async () => {
      await render(<ManagedAccounts />);

      expect(screen.getByText('You must be logged in to view managed accounts.')).toBeOnTheScreen();
      expect(fetchMock()).not.toHaveBeenCalled();
    });

    it('does not call the server when Search is pressed', async () => {
      await render(<ManagedAccounts />);

      await fireEvent.press(screen.getByText('Search'));

      expect(fetchMock()).not.toHaveBeenCalled();
    });
  });

  describe('server errors', () => {
    it.each([
      {
        name: 'the JSON error message',
        response: jsonResponse({ success: false, message: 'Requesting user does not exist.' }, 404),
        message: 'Requesting user does not exist.',
      },
      {
        name: 'a plain text error',
        response: jsonResponse('User does not have permission to search managed accounts.', 403),
        message: 'User does not have permission to search managed accounts.',
      },
      {
        name: 'the message when a 200 response has success false',
        response: jsonResponse({ success: false, message: 'Search failed.' }),
        message: 'Search failed.',
      },
      {
        name: 'the default message when the error has no text',
        response: jsonResponse('', 500),
        message: 'Managed accounts could not be loaded.',
      },
    ])('shows $name', async ({ response, message }) => {
      fetchMock().mockResolvedValueOnce(response);
      await render(<ManagedAccounts />);

      expect(await screen.findByText(message)).toBeOnTheScreen();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
      expect(screen.queryByText('No accounts match this search.')).toBeNull();
      expect(screen.queryByText('Loading managed accounts...')).toBeNull();
    });

    it('shows the error when the network request fails', async () => {
      fetchMock().mockRejectedValueOnce(new Error('Network request failed'));
      await render(<ManagedAccounts />);

      expect(await screen.findByText('Network request failed')).toBeOnTheScreen();
    });

    it('clears the error when a later search works', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse({ success: false, message: 'Search failed.' }, 500));
      await render(<ManagedAccounts />);
      await screen.findByText('Search failed.');
      fetchMock().mockResolvedValueOnce(accountsPage([JOHN]));

      await fireEvent.press(screen.getByText('Search'));

      expect(await screen.findByText('John Smith')).toBeOnTheScreen();
      expect(screen.queryByText('Search failed.')).toBeNull();
    });

    it('shows the error when the next page fails to load', async () => {
      await renderWithAccounts(accountsPage([JOHN, MARIA], 2));
      fetchMock().mockResolvedValueOnce(jsonResponse({ success: false, message: 'Search failed.' }, 500));

      await scrollList();

      expect(await screen.findByText('Search failed.')).toBeOnTheScreen();
      expect(screen.queryByText('Loading more accounts...')).toBeNull();
    });
  });
});

describe('confirmDelete', () => {
  // Press Delete on a card. Cards are listed in order, so index 1 is Maria.
  const openSheetFor = (cardIndex: number) => fireEvent.press(screen.getAllByText('Delete')[cardIndex]);

  // The sheet renders after the list, so its Delete button is the last one on screen.
  const pressConfirm = () => fireEvent.press(screen.getAllByText('Delete').at(-1)!);

  const deleteCalls = () => fetchMock().mock.calls.filter(([url]) => url === DELETE_URL);

  describe('confirmation sheet', () => {
    it('stays closed until Delete is pressed', async () => {
      await renderWithAccounts();

      expect(screen.queryByText('Delete Account?')).toBeNull();
    });

    it('shows the chosen account and does not delete it yet', async () => {
      await renderWithAccounts();

      await openSheetFor(1);

      expect(screen.getByText('Delete Account?')).toBeOnTheScreen();
      expect(screen.getByText('User ID: 2')).toBeOnTheScreen();
      expect(screen.getAllByText('Maria Delgado')).toHaveLength(2);
      expect(deleteCalls()).toHaveLength(0);
    });

    it.each([
      { name: 'Cancel', press: () => screen.getByText('Cancel') },
      { name: 'the area outside the sheet', press: () => screen.getByLabelText('Cancel deleting account') },
    ])('closes without deleting when $name is pressed', async ({ press }) => {
      await renderWithAccounts();
      await openSheetFor(1);

      await fireEvent.press(press());

      expect(screen.queryByText('Delete Account?')).toBeNull();
      expect(screen.getByText('Maria Delgado')).toBeOnTheScreen();
      expect(deleteCalls()).toHaveLength(0);
    });
  });

  describe('success', () => {
    it('sends the logged-in user and the chosen account to the delete endpoint', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(jsonResponse({ success: true, message: 'User deleted successfully.' }));

      await openSheetFor(1);
      await pressConfirm();

      await screen.findByText('User deleted successfully.');
      expect(deleteCalls()).toHaveLength(1);
      expect(deleteCalls()[0][1].method).toBe('POST');
      expect(sentBody(1)).toEqual({ user_id: 7, target_user_id: 2 });
    });

    it('removes only that account from the list and closes the sheet', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(jsonResponse({ success: true, message: 'User deleted successfully.' }));

      await openSheetFor(1);
      await pressConfirm();

      await screen.findByText('User deleted successfully.');
      expect(screen.queryByText('Maria Delgado')).toBeNull();
      expect(screen.getByText('John Smith')).toBeOnTheScreen();
      expect(screen.queryByText('Delete Account?')).toBeNull();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    });

    it('does not reload the list after deleting', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(jsonResponse({ success: true, message: 'User deleted successfully.' }));

      await openSheetFor(1);
      await pressConfirm();

      await screen.findByText('User deleted successfully.');
      expect(fetchMock()).toHaveBeenCalledTimes(2);
    });

    it('names the account when the server sends no message', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(jsonResponse({ success: true }));

      await openSheetFor(1);
      await pressConfirm();

      expect(await screen.findByText('Maria Delgado was deleted.')).toBeOnTheScreen();
    });

    it('shows Deleting... and sends one request while the delete is running', async () => {
      await renderWithAccounts();
      const deletion = deferredResponse();
      fetchMock().mockReturnValueOnce(deletion.promise);

      await openSheetFor(1);
      // The press only finishes when the delete does, so it is awaited after the response arrives.
      const confirming = pressConfirm();
      await fireEvent.press(await screen.findByText('Deleting...'));
      await fireEvent.press(screen.getByText('Cancel'));

      expect(screen.getByText('Delete Account?')).toBeOnTheScreen();
      expect(deleteCalls()).toHaveLength(1);

      await act(async () => {
        deletion.resolve(jsonResponse({ success: true, message: 'User deleted successfully.' }));
        await confirming;
      });

      await screen.findByText('User deleted successfully.');
      expect(screen.queryByText('Deleting...')).toBeNull();
    });
  });

  describe('server errors', () => {
    it.each([
      {
        name: 'the JSON error message',
        response: jsonResponse({ success: false, message: 'User to delete does not exist.' }, 404),
        message: 'User to delete does not exist.',
      },
      {
        name: 'a plain text error',
        response: jsonResponse('User does not have permission to delete accounts.', 403),
        message: 'User does not have permission to delete accounts.',
      },
      {
        name: 'the default message when the error has no text',
        response: jsonResponse('', 500),
        message: 'The account could not be deleted.',
      },
    ])('shows $name and keeps the account', async ({ response, message }) => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(response);

      await openSheetFor(1);
      await pressConfirm();

      expect(await screen.findByText(message)).toBeOnTheScreen();
      expect(screen.getByText('Delete Account?')).toBeOnTheScreen();
      expect(screen.getAllByText('Maria Delgado')).toHaveLength(2);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
    });

    it('keeps the account in the list after the sheet is closed', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(jsonResponse({ success: false, message: 'Delete failed.' }, 500));
      await openSheetFor(1);
      await pressConfirm();
      await screen.findByText('Delete failed.');

      await fireEvent.press(screen.getByText('Cancel'));

      expect(screen.getByText('Maria Delgado')).toBeOnTheScreen();
      expect(screen.queryByText('Delete failed.')).toBeNull();
    });

    it('shows the error when the network request fails', async () => {
      await renderWithAccounts();
      fetchMock().mockRejectedValueOnce(new Error('Network request failed'));

      await openSheetFor(1);
      await pressConfirm();

      expect(await screen.findByText('Network request failed')).toBeOnTheScreen();
      expect(screen.getAllByText('Maria Delgado')).toHaveLength(2);
    });

    it('clears the error and deletes when the retry works', async () => {
      await renderWithAccounts();
      fetchMock().mockResolvedValueOnce(jsonResponse({ success: false, message: 'Delete failed.' }, 500));
      await openSheetFor(1);
      await pressConfirm();
      await screen.findByText('Delete failed.');
      fetchMock().mockResolvedValueOnce(jsonResponse({ success: true, message: 'User deleted successfully.' }));

      await pressConfirm();

      await screen.findByText('User deleted successfully.');
      expect(screen.queryByText('Delete failed.')).toBeNull();
      expect(screen.queryByText('Maria Delgado')).toBeNull();
    });
  });

  describe('no logged-in user', () => {
    // Accounts only load for a logged-in user, so the user logs out with the sheet open.
    it('shows the login message without calling the delete endpoint', async () => {
      await renderWithAccounts();
      await openSheetFor(1);
      mockUserState.activeUser = null;
      await screen.rerender(<ManagedAccounts />);

      await pressConfirm();

      expect(await screen.findByText('You must be logged in to delete an account.')).toBeOnTheScreen();
      expect(screen.getByText('Delete Account?')).toBeOnTheScreen();
      expect(deleteCalls()).toHaveLength(0);
    });
  });
});