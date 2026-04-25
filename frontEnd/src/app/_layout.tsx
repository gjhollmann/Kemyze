import { Stack } from "expo-router";

// The root layout that wraps the entire app.
// Stack here means screens slide over each other (like normal mobile navigation).
export default function RootLayout() {
  return (
    <Stack>
      {/* The entry point — redirects straight to login, no header needed */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* The Pages folder containing login, scanner, inventory, and profile */}
      <Stack.Screen name="Pages" options={{ headerShown: false }} />
    </Stack>
  );
}