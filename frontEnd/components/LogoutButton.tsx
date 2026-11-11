import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserState } from '../src/app/contexts/UserState';

type LogoutButtonProps = {
  label?: string;
  style?: ViewStyle;
  onPress?: () => void;
};

// When pressed clears the active user and replaces the route with the login screen,
// so the back button can't return to a logged-in page.
export default function LogoutButton({ label = 'Logout', style, onPress }: LogoutButtonProps) {
  const router = useRouter();
  const { setActiveUser } = useUserState();

  const logout = () => {
    setActiveUser(null);
    router.replace('/');
  };

  return (
    <Pressable
      onPress={onPress ?? logout}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <Ionicons name="chevron-back" size={13} color={COLOR} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const COLOR = '#3B82F6';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    color: COLOR,
    fontFamily:'JetBrains Mono',
    fontSize: 14,
    marginLeft: 2,
  },
});
