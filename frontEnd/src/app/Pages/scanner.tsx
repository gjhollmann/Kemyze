import { View, Text } from 'react-native';

// Placeholder screen for the QR Scanner tab.
// This will be replaced with the real scanner in KM-122.
export default function Scanner() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#080e1f' }}>
      <Text style={{ color: 'white' }}>QR Scanner Page</Text>
    </View>
  );
}