import { Stack } from "expo-router";
import { useFonts } from 'expo-font';

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
      </Stack>
   );
}
