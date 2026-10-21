// Shared test helpers for the frontend unit tests (KM-151).
// The mocks below are wired up in test-utils/setup.ts and reset before every test.

type MockActiveUser = { userID: number; accessLevel: string } | null;

// Router returned by the mocked useRouter() from expo-router.
export const mockRouter = {
  navigate: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
};

// Value returned by the mocked useUserState(). Tests set activeUser to log a user in.
export const mockUserState: {
  activeUser: MockActiveUser;
  setActiveUser: jest.Mock;
} = {
  activeUser: null,
  setActiveUser: jest.fn(),
};

// Build a fake fetch Response.
export function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  };
}

// The global fetch mock. Every test must give it a response; unmocked calls fail.
export function fetchMock() {
  return global.fetch as jest.Mock;
}
