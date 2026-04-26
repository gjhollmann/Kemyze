import { Tabs } from 'expo-router';
import NavBar from '../components/NavBar';

// This is the layout for all the main app screens (scanner, inventory, profile).
// It tells Expo Router to use our custom NavBar instead of the default tab bar.
export default function TabLayout() {
  return (
    // tabBar prop replaces the default bottom bar with our custom NavBar component
    <Tabs tabBar={(props) => <NavBar {...props} />}>

      {/* These three screens show up as tabs in the nav bar */}
      <Tabs.Screen name="scanner"   options={{ title: 'QR Scanner', headerShown: false }} />
      <Tabs.Screen name="inventory" options={{ title: 'Inventory',  headerShown: false }} />
      <Tabs.Screen name="profile"   options={{ title: 'Profile',    headerShown: false }} />

      {/* Login is in this folder but should NOT appear as a tab in the nav bar */}
      <Tabs.Screen name="login" options={{ href: null }} />

    </Tabs>
  );
}