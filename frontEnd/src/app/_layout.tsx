import { Stack } from "expo-router";
import { useFonts } from 'expo-font';

// The root layout that wraps the entire app.
// Stack here means screens slide over each other (like normal mobile navigation).
export default function RootLayout() {
   const [fontsLoaded] = useFonts({
      'JetBrains Mono': require('../../assets/fonts/JetBrainsMono-Regular.ttf'),
      'JetBrains Mono Bold': require('../../assets/fonts/JetBrainsMono-Bold.ttf'),
      'JetBrains Mono Italic': require('../../assets/fonts/JetBrainsMono-Italic.ttf'),
   }); 

   if (!fontsLoaded) {
      return null;
   }

   return (
      <Stack>
         <Stack.Screen name="index" options={{ headerShown: false }} />
       
       {/* The Pages folder containing login, scanner, inventory, and profile */}
      <Stack.Screen name="Pages" options={{ headerShown: false }} />
      </Stack>
   );
}
