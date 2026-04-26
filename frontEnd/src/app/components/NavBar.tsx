import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// ── Icons ──────────────────────────────────────────────────────────────────
// Each icon is its own small component so they're easy to swap out later.
// The color prop lets us brighten the icon when its tab is selected.

function ScannerIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      />
      <Circle cx={12} cy={13} r={4} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function InventoryIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={1.8} />
      <Rect x={14} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={1.8} />
      <Rect x={3} y={14} width={7} height={7} rx={1} stroke={color} strokeWidth={1.8} />
      <Rect x={14} y={14} width={7} height={7} rx={1} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      />
      <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

// Maps each route name to its icon so we can look it up dynamically.
// The key must match the tab screen's file/folder name in lowercase.
const ICONS: Record<string, (color: string) => React.ReactNode> = {
  scanner:   (c) => <ScannerIcon color={c} />,
  inventory: (c) => <InventoryIcon color={c} />,
  profile:   (c) => <ProfileIcon color={c} />,
};

// ── Nav Bar ────────────────────────────────────────────────────────────────
// This replaces React Navigation's default tab bar with our custom Figma design.
// It receives the current navigation state so it knows which tab is active.

export default function NavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Safe area insets push the bar up so it doesn't hide behind the iPhone
  // home indicator or Android gesture bar at the bottom of the screen.
  const insets = useSafeAreaInsets();

  return (
    // Outer wrapper sits at the bottom of the screen and adds safe area padding
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || 14 }]}>

      {/* The dark pill shape that contains all the tab buttons */}
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isActive = state.index === index; // true if this is the current tab

          // Active tab is full white, inactive tabs are dimmed to show it's unselected
          const iconColor = isActive ? '#ffffff' : 'rgba(255,255,255,0.3)';

          // Look up the right icon for this tab by its route name
          const renderIcon = ICONS[route.name.toLowerCase()];

          // Tell React Navigation to switch screens when the user taps this tab
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            // Don't navigate if we're already on this tab
            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              // Active tab gets a blue highlight pill behind it
              style={[styles.tab, isActive && styles.tabActive]}
              accessibilityRole="button"
              accessibilityState={isActive ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
            >
              {renderIcon ? renderIcon(iconColor) : null}
              <Text style={[styles.label, { color: iconColor }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Pins the bar to the bottom of the screen, centered, with transparent
  // background so the page content is visible behind it
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },

  // The dark rounded pill — matches the Figma design
  pill: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#0d1b35',
    borderRadius: 999,                          // fully rounded ends
    borderWidth: 1,
    borderColor: 'rgba(0, 140, 255, 0.2)',      // subtle blue glow border
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  // Each tab takes up equal space inside the pill
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    gap: 4, // space between the icon and the label text
  },

  // Blue tint highlight behind the active tab
  tabActive: {
    backgroundColor: 'rgba(0, 100, 220, 0.28)',
  },

  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
