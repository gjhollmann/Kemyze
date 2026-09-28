import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// ── Icons ──────────────────────────────────────────────────────────────────

function ScannerIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Circle
        cx={12}
        cy={13}
        r={4}
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function InventoryIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={3}
        width={7}
        height={7}
        rx={1}
        stroke={color}
        strokeWidth={1.8}
      />

      <Rect
        x={14}
        y={3}
        width={7}
        height={7}
        rx={1}
        stroke={color}
        strokeWidth={1.8}
      />

      <Rect
        x={3}
        y={14}
        width={7}
        height={7}
        rx={1}
        stroke={color}
        strokeWidth={1.8}
      />

      <Rect
        x={14}
        y={14}
        width={7}
        height={7}
        rx={1}
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function AccountsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Circle
        cx={12}
        cy={7}
        r={4}
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

// ── Icons for visible tabs ─────────────────────────────────────────────────

const ICONS: Record<string, (color: string) => React.ReactNode> = {
  scanner: (color) => <ScannerIcon color={color} />,
  inventory: (color) => <InventoryIcon color={color} />,
  tertiaryprofilemanagement: (color) => (
    <AccountsIcon color={color} />
  ),
};

// ── Routes allowed in bottom navigation ────────────────────────────────────
//
// Only these three routes are allowed to appear in the NavBar.
// Pages such as quaternaryprofile and login can still exist,
// but they will NOT become additional navigation buttons.

const TAB_ROUTES = [
  'scanner',
  'inventory',
  'tertiaryprofilemanagement',
];

// ── Navigation Bar ─────────────────────────────────────────────────────────

export default function NavBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Only keep the three actual bottom-navigation routes.
  const visibleRoutes = state.routes.filter((route) =>
    TAB_ROUTES.includes(route.name)
  );

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: insets.bottom || 14,
        },
      ]}
    >
      <View style={styles.pill}>
        {visibleRoutes.map((route) => {
          // state.index is based on ALL routes, so we need
          // the route's original index before determining active state.
          const originalIndex = state.routes.findIndex(
            (item) => item.key === route.key
          );

          const { options } = descriptors[route.key];

          const label = options.title ?? route.name;

          const isActive = state.index === originalIndex;

          const iconColor = isActive
            ? '#ffffff'
            : 'rgba(255,255,255,0.3)';

          const renderIcon =
            ICONS[route.name.toLowerCase()];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[
                styles.tab,
                isActive && styles.tabActive,
              ]}
              accessibilityRole="button"
              accessibilityState={
                isActive
                  ? { selected: true }
                  : {}
              }
              accessibilityLabel={
                options.tabBarAccessibilityLabel
              }
            >
              {renderIcon
                ? renderIcon(iconColor)
                : null}

              <Text
                style={[
                  styles.label,
                  {
                    color: iconColor,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },

  pill: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#0d1b35',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 140, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    gap: 4,
  },

  tabActive: {
    backgroundColor: 'rgba(0, 100, 220, 0.28)',
  },

  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});