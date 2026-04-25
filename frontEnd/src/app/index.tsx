import { Redirect } from 'expo-router';

// The app's entry point. Immediately redirects to the login page when the app loads.
export default function Index() {
  return <Redirect href="/Pages/login" />;
}