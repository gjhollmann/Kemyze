import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NavBar from '../components/NavBar';

// ─────────────────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────────────────

const FONT = Object.freeze({
  regular: 'JetBrains Mono',
  bold: 'JetBrains Mono Bold',
} as const);

const NAV_BAR_HEIGHT = 76;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ProfileInfo = {
  name: string;
  location: string;
  kemyzeId: string;
};

type ChangeLogEntry = {
  id: string;
  chemical: string;
  containerId: string;
  change: string;
  dateChanged: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sample data
// Replace these values with backend/API data later.
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_PROFILE: ProfileInfo = {
  name: 'John Smith',
  location: 'Sacramento Lab',
  kemyzeId: 'KMY-001',
};

const SAMPLE_CHANGE_LOG: ChangeLogEntry[] = [
  {
    id: '1',
    chemical: 'Acetone',
    containerId: 'C-1024',
    change: 'Location = Storage Room B',
    dateChanged: '09/27/2026',
  },
  {
    id: '2',
    chemical: 'Ethanol',
    containerId: 'C-2048',
    change: 'Location = Chemical Cabinet 2',
    dateChanged: '09/26/2026',
  },
  {
    id: '3',
    chemical: 'Methanol',
    containerId: 'C-3091',
    change: 'Location = Storage Room A',
    dateChanged: '09/25/2026',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function QuaternaryProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isSmallScreen = width < 430;

  const pagePadding = isSmallScreen ? 14 : isLandscape ? 24 : 22;
  const pageMaxWidth = isLandscape ? 980 : 520;

  const paddingLeft = Math.max(pagePadding, insets.left + 8);
  const paddingRight = Math.max(pagePadding, insets.right + 8);
  const paddingTop = insets.top + (isLandscape ? 8 : 16);
  const paddingBottom = NAV_BAR_HEIGHT + (insets.bottom || 14) + 18;

  // Existing NavBar configuration.
  // Index 2 keeps the Profile tab highlighted.
  const navState = {
    index: 2,
    routes: [
      {
        key: 'scanner',
        name: 'scanner',
      },
      {
        key: 'inventory',
        name: 'inventory',
      },
      {
        key: 'tertiaryprofilemanagement',
        name: 'tertiaryprofilemanagement',
      },
    ],
  } as any;

  const navDescriptors = {
    scanner: {
      options: {
        title: 'QR Scanner',
        tabBarAccessibilityLabel: 'QR Scanner',
      },
    },

    inventory: {
      options: {
        title: 'Inventory',
        tabBarAccessibilityLabel: 'Inventory',
      },
    },

    tertiaryprofilemanagement: {
      options: {
        // Quaternary users see this tab as Profile.
        title: 'Profile',
        tabBarAccessibilityLabel: 'Profile',
      },
    },
  } as any;

  const navNavigation = {
    emit: () => ({
      defaultPrevented: false,
    }),

    navigate: (name: string) => {
      if (name === 'scanner') {
        router.push('/Pages/scanner');
      }

      if (name === 'inventory') {
        router.push('/Pages/inventory');
      }

      if (name === 'tertiaryprofilemanagement') {
        // Stay on the Quaternary Profile page when Profile is selected.
        router.replace('/Pages/quaternaryprofile');
      }
    },
  } as any;

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View
        style={[
          styles.page,
          {
            paddingLeft,
            paddingRight,
            paddingTop,
            paddingBottom,
          },
        ]}
      >
        <View
          style={[
            styles.pageWidth,
            {
              maxWidth: pageMaxWidth,
            },
          ]}
        >
          {/* Page title */}
          <Text style={styles.title}>Your profile</Text>

          {/* Profile Information */}
          <View style={styles.profileBox}>
            <View style={styles.profileField}>
              <Text style={styles.profileLabel}>Name:</Text>
              <Text style={styles.profileValue}>
                {SAMPLE_PROFILE.name}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.profileField}>
              <Text style={styles.profileLabel}>
                Site/Location:
              </Text>
              <Text style={styles.profileValue}>
                {SAMPLE_PROFILE.location}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.profileField}>
              <Text style={styles.profileLabel}>Kemyze ID:</Text>
              <Text style={styles.profileValue}>
                {SAMPLE_PROFILE.kemyzeId}
              </Text>
            </View>
          </View>

          {/* Change Log title */}
          <Text style={styles.sectionTitle}>
            Recently made changes
          </Text>

          {/* Scrollable Change Log */}
          <View style={styles.changeLogBox}>
            <ScrollView
              style={styles.changeLogScroll}
              contentContainerStyle={styles.changeLogContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled
            >
              {SAMPLE_CHANGE_LOG.map((item) => (
                <View key={item.id} style={styles.changeCard}>
                  <View style={styles.changeTopRow}>
                    <Text style={styles.changeText}>
                      Chemical: {item.chemical}
                    </Text>

                    <Text style={styles.changeText}>
                      ContainerID: {item.containerId}
                    </Text>
                  </View>

                  <Text style={styles.changeText}>
                    Change: {item.change}
                  </Text>

                  <Text style={styles.changeText}>
                    Date changed: {item.dateChanged}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Existing bottom navigation */}
      <NavBar
        state={navState}
        descriptors={navDescriptors}
        navigation={navNavigation}
        insets={{
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617',
  },

  page: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },

  pageWidth: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 34,
    lineHeight: 42,
    marginBottom: 18,
  },

  // Profile information box
  profileBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#38A9E0',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  profileField: {
    minHeight: 82,
    justifyContent: 'center',
  },

  profileLabel: {
    color: '#09091C',
    fontFamily: FONT.regular,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },

  profileValue: {
    color: '#09091C',
    fontFamily: FONT.bold,
    fontSize: 15,
    lineHeight: 21,
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#111827',
    opacity: 0.7,
  },

  // Change log
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 24,
    lineHeight: 32,
    marginTop: 20,
    marginBottom: 12,
  },

  changeLogBox: {
    flex: 1,
    minHeight: 180,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#38A9E0',
    borderRadius: 24,
    overflow: 'hidden',
  },

  changeLogScroll: {
    flex: 1,
  },

  changeLogContent: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 14,
  },

  changeCard: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#111111',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },

  changeTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 16,
    rowGap: 3,
  },

  changeText: {
    color: '#111111',
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 19,
  },
});