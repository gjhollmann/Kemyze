import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { fetchMock, jsonResponse, mockUserState } from '../../test-utils';
import QuaternaryProfile from '../app/Pages/quaternaryprofile';

// Insert safe-area mock.
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

// Helper for rendering quaternary profile view. 
const renderQuaternaryProfile = () => {
    return render(<QuaternaryProfile />);
} // const renderQuaternaryProfile


// Grouped tests for quatarnary profile view.
describe('Quaternary Profile View', () => {
    // Clear previous mock call history, simulate user. 
    beforeEach(() => {
        jest.clearAllMocks();

        // Simulate quaternary user.
        mockUserState.activeUser = {
            userID: 526,
            accessLevel: '4',
        };
    });

    // Acceptance: test for loadProfile.
    it('tests loadProfile', async () => {
        fetchMock().mockImplementation((url: string) => {
            if (url.includes('login/getUser')) {
                return Promise.resolve(
                    jsonResponse({ 
                        user_id: 526,
                        first_name: 'Johnny',
                        last_name: 'Appleseed',
                        email: 'johnny@example.com',
                        phone: '5551234567',
                        access_level: 4,
                        location: 'School' 
                    }, 200)
                );
            }
            
            // Check whether URL contains correct endpoint; simulate asynchronous response.
            if (url.includes('containers/getUserChangeLog')) {
                return Promise.resolve(
                    jsonResponse([], 200)
                );
            }

            return Promise.reject(new Error(`Unexpected Url: ${url}`));
        });
        
        // Check rendering. 
        await renderQuaternaryProfile();

        // Confirm correct API request for quaternary profile.
        await waitFor(() => {
            expect(fetchMock()).toHaveBeenCalledWith(
                expect.stringContaining(
                    'login/getUser?active_user_id=526&user_id=526'
                )
            );
        });

        // Confirm all information associated with the quaternary profile displayed.
        expect(await screen.findByText('Johnny Appleseed')).toBeTruthy();
        expect(screen.getByText('School')).toBeTruthy();
        expect(screen.getByText('526')).toBeTruthy();
    }); // it('tests loadProfile' ...

    
    // Acceptance: test for loadChangeLog. 
    it('tests loadChangeLog', async () => {
        fetchMock().mockImplementation((url: string) => {
            if (url.includes('login/getUser')) {
                return Promise.resolve(
                    jsonResponse({ 
                        user_id: 526,
                        first_name: 'Johnny',
                        last_name: 'Appleseed',
                        email: 'johnny@example.com',
                        phone: '5551234567',
                        access_level: 4,
                        location: 'School' 
                    }, 200)
                );
            }
            
            // Simulated asynchronous response, verified correct endpoint.
            if (url.includes('containers/getUserChangeLog')) {
                return Promise.resolve(
                    jsonResponse([
                        {
                            Date: '2026-10-22',
                            Time: '12:00:00',
                            ContainerID: 102,
                            Change: 'Location',
                            Old: 'School',
                            New: 'Practice Test',
                        },
                    ], 200)
                );
            }

            return Promise.reject(new Error(`Unexpected Url: ${url}`));
        });
        
        // Render quaternary view.
        await renderQuaternaryProfile();

        // Confirm change log API request.
        await waitFor(() => {
            expect(fetchMock()).toHaveBeenCalledWith(
                expect.stringContaining(
                    'containers/getUserChangeLog?user_id=526'
                )
            );
        });

        // Check whether all change history appears as expected.
        expect(await screen.findByText('Container ID: 102')).toBeTruthy();
        expect(screen.getByText('Change: Location')).toBeTruthy();
        expect(screen.getByText('Old: School')).toBeTruthy();
        expect(screen.getByText('New: Practice Test')).toBeTruthy();
        expect(screen.getByText('Date changed: 2026-10-22')).toBeTruthy();
        expect(screen.getByText('Time: 12:00:00')).toBeTruthy();
    }); // it('tests loadChangeLog' ...


    it('returns a profile API error', async () => {
        


    }) // it('returns a profile API error'
}); // describe('Quaternary Profile View' ...


