import { Alert, Platform } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { fetchMock, jsonResponse, mockRouter, mockUserState } from '../../test-utils';
import CreateProfile from '../app/SubPages/createprofile';
/*import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';*/
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));


// Helper for rendering profile creation page. 
/*const renderCreateProfile = () => {
    return render(
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <CreateProfile />
        </SafeAreaProvider>
    );
} // const renderCreateProfile*/

// Helper for rendering profile creation page. 
const renderCreateProfile = () => {
    return render(<CreateProfile />);
} // const renderCreateProfile

describe('Create Profile Screen', () => {
    // Clear previous mock call history, simulate user. 
    beforeEach(() => {
        jest.clearAllMocks();
        //fetchMock().mockReset();

        mockUserState.activeUser = {
        userID: 49035,
        accessLevel: "1",
        };
    });

    // Test whether profile creation screen renders.
    it("renders the profile creation screen", async () => {
        fetchMock().mockResolvedValueOnce(
            jsonResponse(
                [
                    { name: 'Chemistry Lab' },
                    { name: 'Storage Room'},
                ],
                200
            )
        );

        // Render profile creation screen.
        const result = await renderCreateProfile();
        expect(result.getByText("Create Profile")).toBeTruthy();
    }); // it("renders the profile creation screen" ...

    // Full testing of function sendAddUser.
    it('tests sendAddUser', async () => {
        fetchMock().mockImplementation((url: string) => {
            if (url.includes('containers/getLocationChildren')) {
                return Promise.resolve(
                    jsonResponse([{ name: 'School' }]),
                );
            }
            
            if (url.includes('login/addUser')) {
                return Promise.resolve(
                    jsonResponse({ success: true }, 200)
                );
            }

            return Promise.reject(new Error(`Unexpected Url: ${url}`));
        });

        // Check rendering.
        await renderCreateProfile();

        // Required fields for profile creation (e.g., password, location, phone number).
        await fireEvent.changeText(screen.getByPlaceholderText('Profile Name'), 'Test User');
        
        await fireEvent.press(screen.getByText('Location Name'));
        await fireEvent.press(await screen.findByText('School'));

        //fireEvent.press(screen.getByText('Phone Number'));

        await fireEvent.changeText(screen.getByPlaceholderText('Email Address'), 'test@example.com');
        await fireEvent.press(screen.getAllByText('Authorization')[1]);
        await fireEvent.press(screen.getByText('Secondary'));

        await fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Password123');
        await fireEvent.press(screen.getByText('Create')); // Button to confirm changes.

        // Verify POST request.
        await waitFor(() => {
            expect(fetchMock()).toHaveBeenCalledWith(
                expect.stringContaining('login/addUser'),
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });

        // Verify request made to 'addUser.'
        const addUserCall = fetchMock().mock.calls.find(
            ([url]) => String(url).includes('login/addUser')
        );

        expect(addUserCall).toBeDefined();
        const dataSubmitted = JSON.parse(addUserCall![1].body);
        
        // Expected user ID.
        expect(dataSubmitted.user_id).toBe(49035);
        
        // Name, location, and phone number.
        expect(dataSubmitted.name).toBe('Test User');
        expect(dataSubmitted.location).toBe('School');
        expect(dataSubmitted.email).toBe('test@example.com');
        
        // Phone number, access level, and password.
        expect(dataSubmitted.authorization).toBe("Secondary");
        expect(dataSubmitted.password).toBe('Password123');
        expect(dataSubmitted.phone).toBe('XXXXXXXXXX');
    });

    /*it('tests handleCreateProfile', () => {


    })*/


});

