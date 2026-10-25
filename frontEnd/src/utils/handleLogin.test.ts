// Unit tests for handleLogin (KM-152).
import { handleLogin } from './handleLogin';
import { fetchMock, jsonResponse } from '../../test-utils';

describe('handleLogin', () => {
  // Blank or whitespace-only fields are rejected before any request is sent.
  it.each([
    { email: '', password: 'secret', message: 'Email is required.' },
    { email: '   ', password: 'secret', message: 'Email is required.' },
    { email: 'user@csus.edu', password: '', message: 'Password is required.' },
    { email: 'user@csus.edu', password: '   ', message: 'Password is required.' },
  ])('rejects email "$email" / password "$password" without calling the server', async ({ email, password, message }) => {
    await expect(handleLogin(email, password)).resolves.toEqual({ success: false, message });
    expect(fetchMock()).not.toHaveBeenCalled();
  });

  it('sends trimmed credentials and returns the user on 200', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ userID: 7, accessLevel: 'Primary' }));

    const result = await handleLogin(' user@csus.edu ', ' secret ');

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://kemyze.vercel.app/login/?User=user%40csus.edu&Password=secret',
      { method: 'GET' },
    );
    expect(result).toEqual({
      success: true,
      message: 'Login successful.',
      data: { userID: 7, accessLevel: 'Primary' },
    });
  });

  it('returns the server message on an error response', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse('Invalid credentials', 400));

    await expect(handleLogin('user@csus.edu', 'wrong')).resolves.toEqual({
      success: false,
      message: 'Invalid credentials',
    });
  });

  it('falls back to a default message when the error response is empty', async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse('', 400));

    await expect(handleLogin('user@csus.edu', 'wrong')).resolves.toEqual({
      success: false,
      message: 'Login failed.',
    });
  });

  it('reports when the server is unreachable', async () => {
    fetchMock().mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(handleLogin('user@csus.edu', 'secret')).resolves.toEqual({
      success: false,
      message: 'Could not connect to server. Please try again.',
    });
  });
});
