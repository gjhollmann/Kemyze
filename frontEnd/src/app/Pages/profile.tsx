import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import GradientButton from '../../../components/GradientButton';

// Typography

const FONT = Object.freeze({
  regular: 'JetBrains Mono',
  bold: 'JetBrains Mono Bold',
} as const);

const FONT_SIZE = Object.freeze({
  pageTitle: 28,
  sectionTitle: 16,
  body: 14,
  secondary: 13,
} as const);

// Types

type User = {
  id: string;
  name: string;
  location: string;
  privilege: string;
};

// Constants

const users: User[] = [
  {
    id: '1',
    name: 'John Smith',
    location: 'Sacramento Lab',
    privilege: 'Tertiary',
  },
];

const PANEL_GRADIENT: [string, string] = [
  'rgba(1, 8, 37, 0.74)',
  'rgba(1, 8, 37, 0.74)',
];

// Each filter carries its own width so the labels are not cut off
const FILTERS = [
  {
    label: 'Show All',
    width: 110,
  },
  {
    label: 'Recently Active',
    width: 168,
  },
  {
    label: 'Add New',
    width: 110,
  },
];

// Screen

export default function Profile() {
  const [search, setSearch] = useState('');

  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isSmallScreen = width < 430;

  // Render

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={[
          styles.pageContent,
          {
            paddingHorizontal:
              isSmallScreen
                ? 14
                : isLandscape
                  ? 24
                  : 22,

            paddingTop:
              isLandscape
                ? 8
                : 12,

            paddingBottom:
              isLandscape
                ? 110
                : 135,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.pageWidth,
            {
              maxWidth:
                isLandscape
                  ? 980
                  : 520,
            },
          ]}
        >
          {/* Title */}
          <Text style={styles.title}>
            Managed Accounts
          </Text>

          {/* Search and filters */}
          <View style={styles.boxGlow}>
            <LinearGradient
              colors={PANEL_GRADIENT}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={[
                styles.box,
                {
                  paddingHorizontal:
                    isSmallScreen
                      ? 10
                      : 13,
                },
              ]}
            >
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search"
                  placeholderTextColor="#C9CFE9"
                  accessibilityLabel="Search managed accounts"
                />

                <GradientButton
                  title="Search"
                  width={96}
                  height={44}
                  borderRadius={10}
                />
              </View>

              {/* Horizontal scroll keeps the filters reachable on small screens */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {FILTERS.map((filter) => (
                  <GradientButton
                    key={filter.label}
                    title={filter.label}
                    width={filter.width}
                    height={44}
                    borderRadius={10}
                  />
                ))}
              </ScrollView>
            </LinearGradient>
          </View>

          {/* Managed user list */}
          <View style={styles.listGlow}>
            <LinearGradient
              colors={PANEL_GRADIENT}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={[
                styles.box,
                {
                  paddingHorizontal:
                    isSmallScreen
                      ? 10
                      : 13,
                },
              ]}
            >
              {users.map((item) => (
                <View
                  key={item.id}
                  style={styles.userCard}
                >
                  <View style={styles.userInfo}>
                    <Text style={styles.userText}>
                      Name: {item.name}
                    </Text>

                    <Text style={styles.userText}>
                      Location: {item.location}
                    </Text>

                    <Text style={styles.userText}>
                      Privilege Level: {item.privilege}
                    </Text>
                  </View>

                  <GradientButton
                    title="Edit Info"
                    width={108}
                    height={40}
                    borderRadius={10}
                    textStyle={styles.editText}
                  />
                </View>
              ))}
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617',
  },

  pageScroll: {
    flex: 1,
    width: '100%',
  },

  pageContent: {
    width: '100%',
    alignItems: 'center',
  },

  pageWidth: {
    width: '100%',
    alignSelf: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.pageTitle,
    lineHeight: 36,
    textAlign: 'center',
    marginTop: 1,
    marginBottom: 9,
  },

  boxGlow: {
    width: '100%',
    borderRadius: 20,
    shadowColor: '#06184A',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
  },

  listGlow: {
    width: '100%',
    marginTop: 8,
    borderRadius: 20,
    shadowColor: '#06184A',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
  },

  box: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 10,
    overflow: 'hidden',
  },

  searchRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 7,
    marginBottom: 7,
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 9,
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    paddingHorizontal: 9,
    backgroundColor: '#09091C',
  },

  // gap keeps the filters together no matter how wide the screen is
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(33, 142, 255, 0.5)',
    backgroundColor: 'rgba(1, 8, 37, 0.74)',
    paddingVertical: 9,
    paddingHorizontal: 12,
  },

  userInfo: {
    flex: 1,
    minWidth: 0,
  },

  userText: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 19,
  },

  editText: {
    fontSize: FONT_SIZE.body,
  },
});
