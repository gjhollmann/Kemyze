import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import GradientButton from '../../../components/GradientButton';

// Typography

const FONT = Object.freeze({
  regular: 'JetBrains Mono',
  bold: 'JetBrains Mono Bold',
} as const);

const FONT_SIZE = Object.freeze({
  pageTitle: 28,
  sheetTitle: 20,
  body: 14,
  button: 14,
  secondary: 13,
  arrow: 17,
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
  {
    id: '2',
    name: 'Maria Delgado',
    location: 'Sacramento Lab',
    privilege: 'Secondary',
  },
  {
    id: '3',
    name: 'Andre Whitfield',
    location: 'Davis Lab',
    privilege: 'Tertiary',
  },
  {
    id: '4',
    name: 'Priya Raman',
    location: 'Folsom Lab',
    privilege: 'Primary',
  },
  {
    id: '5',
    name: 'Chen Wei',
    location: 'Davis Lab',
    privilege: 'Tertiary',
  },
  {
    id: '6',
    name: 'Rosa Alvarez',
    location: 'Elk Grove Lab',
    privilege: 'Secondary',
  },
  {
    id: '7',
    name: 'Daniel Okafor',
    location: 'Sacramento Lab',
    privilege: 'Tertiary',
  },
];

// Search and Add New share one width so the two rows line up
const ACTION_BUTTON_WIDTH = 110;

const VIEW_OPTIONS = [
  'All',
  'Active',
  'Inactive',
];

const PANEL_GRADIENT: [string, string] = [
  'rgba(1, 8, 37, 0.74)',
  'rgba(1, 8, 37, 0.74)',
];

// Screen

export default function Profile() {
  const router = useRouter();

  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isSmallScreen = width < 430;

  const [search, setSearch] = useState('');

  const [view, setView] = useState('All');

  const [viewSelectorVisible, setViewSelectorVisible] =
    useState(false);

  // Haptics

  const haptic = () => {
    Haptics.selectionAsync();
  };

  // View selector

  const openViewSelector = () => {
    haptic();
    setViewSelectorVisible(true);
  };

  const closeViewSelector = () => {
    haptic();
    setViewSelectorVisible(false);
  };

  const selectView = (value: string) => {
    haptic();
    setView(value);
    setViewSelectorVisible(false);
  };

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
          {/* Back */}
          <Pressable
            onPress={() => {
              haptic();
              router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text style={styles.backText}>
              ‹ Back
            </Text>
          </Pressable>

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
                  width={ACTION_BUTTON_WIDTH}
                  height={44}
                  borderRadius={10}
                />
              </View>

              {/* The selector flexes so the row fits any screen width */}
              <View style={styles.filterRow}>
                <Pressable
                  onPress={openViewSelector}
                  accessibilityRole="button"
                  accessibilityLabel="Select which accounts to view"
                  style={({ pressed }) => [
                    styles.selectInput,
                    pressed &&
                      styles.selectPressed,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={styles.selectText}
                  >
                    View: {view}
                  </Text>

                  <Text style={styles.selectArrow}>
                    ⌄
                  </Text>
                </Pressable>

                <GradientButton
                  title="Add New"
                  width={ACTION_BUTTON_WIDTH}
                  height={44}
                  borderRadius={10}
                />
              </View>
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

      {/* View selector modal */}

      <Modal
        visible={viewSelectorVisible}
        transparent
        animationType="slide"
        onRequestClose={closeViewSelector}
      >
        <View style={styles.modalBackground}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />

          <Pressable
            style={styles.modalDismiss}
            onPress={closeViewSelector}
          />

          <View style={styles.selectorSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.selectorTitle}>
              Select View
            </Text>

            {VIEW_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => selectView(option)}
                accessibilityRole="button"
                accessibilityLabel={option}
                style={({ pressed }) => [
                  styles.optionButton,
                  pressed &&
                    styles.selectPressed,
                ]}
              >
                <Text style={styles.optionText}>
                  {option}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={closeViewSelector}
              accessibilityRole="button"
              accessibilityLabel="Cancel selection"
              style={({ pressed }) => [
                styles.cancelButton,
                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={['#0026E4', '#00C8FF', '#0026E4', '#00C8FF', '#0026E4']}
                locations={[0, 0.27, 0.49, 0.75, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              >
                <LinearGradient
                  colors={['#2983ff', '#1b3de9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    position: 'absolute',
                    top: 2,
                    bottom: 2,
                    left: 2,
                    right: 2,
                    borderRadius: 7,
                  }}
                />
              </LinearGradient>

              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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

  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
  },

  backText: {
    color: '#3B82F6',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
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

  filterRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 7,
    alignItems: 'center',
  },

  selectInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 9,
    backgroundColor: '#09091C',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  selectText: {
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    paddingRight: 14,
  },

  selectArrow: {
    position: 'absolute',
    right: 6,
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.arrow,
    lineHeight: 22,
  },

  selectPressed: {
    borderColor: '#3B82F6',
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    marginBottom: 7,
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

  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalDismiss: {
    flex: 1,
  },

  selectorSheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: 'rgba(1, 8, 37, 0.74)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(33, 142, 255, 0.5)',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 14,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 10,
  },

  selectorTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sheetTitle,
    lineHeight: 27,
    marginBottom: 10,
  },

  optionButton: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  optionText: {
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    textAlign: 'center',
  },

  cancelButton: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    overflow: 'hidden',
  },

  cancelText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.button,
    lineHeight: 20,
    textAlign: 'center',
  },
});
