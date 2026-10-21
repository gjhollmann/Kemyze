// Smoke test for the shared Jest setup (KM-151).
import { Platform } from 'react-native';
import { fetchMock, mockRouter, mockUserState } from '.';

describe('shared test setup', () => {
  it('runs the tests as iOS', () => {
    expect(Platform.OS).toBe('ios');
  });

  it('fails any fetch the test did not mock', async () => {
    await expect(fetch('https://kemyze.vercel.app/login/')).rejects.toThrow('Unmocked fetch');
  });

  it('starts every test logged out with a fresh router', () => {
    expect(mockUserState.activeUser).toBeNull();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(fetchMock()).not.toHaveBeenCalled();
  });
});
