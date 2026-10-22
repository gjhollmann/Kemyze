import { Alert, Platform } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { fetchMock, jsonResponse, mockRouter, mockUserState } from '../../test-utils';
import CreateProfile from '../app/SubPages/createprofile';

describe('Create Profile Screen', () => {
    // Clear previous mock call history, simulate user. 
    beforeEach(() => {
        jest.clearAllMocks();

        mockUserState.activeUser = {
        userID: 49035,
        accessLevel: "1",
        };
    });

    // Test whether profile creation screen renders.
    it("renders the profile creation screen", () => {
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
        render(<CreateProfile />);
        expect(screen.getByText("Create Profile")).toBeTruthy();
    }); // it("renders the profile creation screen" ...
});
