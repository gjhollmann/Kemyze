import { Alert, Platform } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { fetchMock, jsonResponse, mockRouter, mockUserState } from '../../test-utils';
import QuaternaryProfile from '../app/Pages/quaternaryprofile';

// Helper for rendering quaternary profile view. 
const renderQuaternaryProfile = () => {
    return render(<QuaternaryProfile />);
} // const renderQuaternaryProfile

















