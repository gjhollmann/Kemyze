import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Placeholder screen for the edit_container screen.
// This will be replaced with the real edit_container screen in a future sprint.
export default function Edit_Container() {
    const { container_id } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#080e1f' }}>
          <Text style={{ color: 'white' }}>"Edit_Container Screen for container " {container_id}</Text>
    </View>
  );
}
