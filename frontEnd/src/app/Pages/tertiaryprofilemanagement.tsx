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

import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  sectionTitle: 16,
  body: 14,
  label: 12,
  button: 14,
  secondary: 13,
  metadata: 11,
  largeValue: 18,
  close: 20,
  arrow: 17,
} as const);

// Types

type User = {
  id: string;
  name: string;
  location: string;
  privilege: string;
  active: boolean;
};

// Constants

// Sample accounts
const SAMPLE_USERS: User[] = [
  {
    id: '1',
    name: 'John Smith',
    location: 'Sacramento Lab',
    privilege: 'Tertiary',
    active: true,
  },
  {
    id: '2',
    name: 'Maria Delgado',
    location: 'Sacramento Lab',
    privilege: 'Secondary',
    active: true,
  },
  {
    id: '3',
    name: 'Andre Whitfield',
    location: 'Davis Lab',
    privilege: 'Tertiary',
    active: false,
  },
  {
    id: '4',
    name: 'Priya Raman',
    location: 'Folsom Lab',
    privilege: 'Primary',
    active: true,
  },
  {
    id: '5',
    name: 'Chen Wei',
    location: 'Davis Lab',
    privilege: 'Tertiary',
    active: true,
  },
  {
    id: '6',
    name: 'Rosa Alvarez',
    location: 'Elk Grove Lab',
    privilege: 'Secondary',
    active: false,
  },
  {
    id: '7',
    name: 'Daniel Okafor',
    location: 'Sacramento Lab',
    privilege: 'Tertiary',
    active: true,
  },
];

// Button sizes

const ACTION_BUTTON_WIDTH = 110;

const BUTTON_HEIGHT = 44;

const CARD_BUTTON_WIDTH = 84;
const CARD_BUTTON_HEIGHT = 32;

// Delete button colors

const DELETE_BACKGROUND = ['#FF4D4D', '#D91C1C'];
const DELETE_BORDER = ['#8B0000', '#FF6B6B', '#8B0000', '#FF6B6B', '#8B0000'];

// List spacing

const ROW_SPACING = 9;
const COLUMN_GAP = 14;

const NAV_BAR_HEIGHT = 76;

const LIST_PADDING = 10;

// Row sizing

const BASE_ROW_HEIGHT = 88;

const DETAIL_TEXT_WIDTH = 205;

const BASE_ROW_SCALED_WIDTH = 114;

const MAX_ROW_SCALE = 1.4;

// Screen size breakpoints

const TABLET_MIN_SIDE = 700;

const TWO_COLUMN_WIDTH = 600;

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

export default function ManagedAccounts() {
  const router = useRouter();

  const { width, height } = useWindowDimensions();

  // Safe area

  const insets = useSafeAreaInsets();

  const isLandscape = width > height;
  const isSmallScreen = width < 430;

  const pagePadding =
    isSmallScreen
      ? 14
      : isLandscape
        ? 24
        : 22;

  const isTablet = Math.min(width, height) >= TABLET_MIN_SIDE;

  const compactHeader = isLandscape && !isTablet;

  const pageMaxWidth =
    isLandscape
      ? 980
      : isTablet
        ? 900
        : 520;

  const paddingLeft = Math.max(pagePadding, insets.left + 8);
  const paddingRight = Math.max(pagePadding, insets.right + 8);

  const contentWidth = Math.min(width - paddingLeft - paddingRight, pageMaxWidth);

  const listPanelInset = (isSmallScreen ? 10 : 13) * 2 + 2;

  const paddingTop =
    insets.top +
    (isLandscape
      ? 8
      : 12);

  // NavBar spacing

  const paddingBottom = NAV_BAR_HEIGHT + (insets.bottom || 14) + 10;

  // List height

  const [headerHeight, setHeaderHeight] = useState(0);

  const listHeight = height - paddingTop - headerHeight - 8 - paddingBottom - 10;

  // Account state

  const [accounts, setAccounts] = useState(SAMPLE_USERS);

  // Columns and row scale

  const rowScaleFor = (columnCount: number) => {
    const columnWidth =
      (contentWidth - listPanelInset - COLUMN_GAP * (columnCount - 1)) / columnCount;

    const rowCount = Math.max(1, Math.ceil(accounts.length / columnCount));

    const rowSpace =
      (listHeight - LIST_PADDING * 2 - (rowCount - 1) * (ROW_SPACING * 2 + 1)) / rowCount;

    return Math.min(
      rowSpace / BASE_ROW_HEIGHT,
      (columnWidth - DETAIL_TEXT_WIDTH) / BASE_ROW_SCALED_WIDTH,
    );
  };

  const columns =
    contentWidth >= TWO_COLUMN_WIDTH && rowScaleFor(1) < 1
      ? 2
      : 1;

  const rowScale =
    isTablet && headerHeight > 0
      ? Math.min(Math.max(rowScaleFor(columns), 1), MAX_ROW_SCALE)
      : 1;

  const scaled = (value: number) => Math.round(value * rowScale);

  // Search state

  const [search, setSearch] = useState('');

  const [query, setQuery] = useState('');

  // View state

  const [view, setView] = useState('All');

  const [viewSelectorVisible, setViewSelectorVisible] =
    useState(false);

  // Filtering

  const normalizedQuery = query.toLowerCase();

  const visibleAccounts = accounts.filter((account) => {
    const matchesView =
      view === 'All' ||
      (view === 'Active') === account.active;

    const matchesSearch =
      normalizedQuery === '' ||
      [account.name, account.location, account.privilege]
        .some((field) => field.toLowerCase().includes(normalizedQuery));

    return matchesView && matchesSearch;
  });

  // Account lines

  const accountLines: User[][] = [];

  for (let i = 0; i < visibleAccounts.length; i += columns) {
    accountLines.push(visibleAccounts.slice(i, i + columns));
  }

  // Haptics

  const haptic = () => {
    Haptics.selectionAsync();
  };

  // Search

  const changeSearch = (text: string) => {
    setSearch(text);

    if (text.trim() === '') {
      setQuery('');
    }
  };

  const runSearch = () => {
    haptic();
    setQuery(search.trim());
  };

  // Accounts

  const editAccount = (id: string) => {
    haptic();
    router.push(`/SubPages/editprofile?user_id=${id}`);
  };

  const deleteAccount = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAccounts((current) => current.filter((account) => account.id !== id));
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
          <View
            onLayout={(event) =>
              setHeaderHeight(event.nativeEvent.layout.height)
            }
          >
            {/* Back and Title */}
            <View
              style={
                isLandscape
                  ? styles.headerRow
                  : undefined
              }
            >
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

              <Text
                style={[
                  styles.title,
                  isLandscape && styles.titleInRow,
                ]}
              >
                Managed Accounts
              </Text>

              {/* Title spacer */}
              {isLandscape && (
                <View style={styles.backSpacer} />
              )}
            </View>

            {/* Search and Filters */}
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
                <View
                  style={
                    compactHeader
                      ? styles.compactPanel
                      : undefined
                  }
                >
                  <View
                    style={[
                      styles.searchRow,
                      compactHeader && styles.compactRow,
                    ]}
                  >
                    <TextInput
                      style={styles.searchInput}
                      value={search}
                      onChangeText={changeSearch}
                      onSubmitEditing={runSearch}
                      returnKeyType="search"
                      placeholder="Search accounts..."
                      placeholderTextColor="#8A93B5"
                      accessibilityLabel="Search managed accounts"
                    />

                    <GradientButton
                      title="Search"
                      onPress={runSearch}
                      width={ACTION_BUTTON_WIDTH}
                      height={BUTTON_HEIGHT}
                      borderRadius={10}
                    />
                  </View>

                  {/* View + Add New */}
                  <View
                    style={[
                      styles.filterRow,
                      compactHeader && styles.compactRow,
                    ]}
                  >
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
                      onPress={() => {
                      haptic();
                      router.push('/SubPages/createprofile');
                    }}
                    width={ACTION_BUTTON_WIDTH}
                    height={BUTTON_HEIGHT}
                    borderRadius={10}
                    />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Managed Accounts */}
          <View
            style={[
              styles.listGlow,
              styles.listShrink,
            ]}
          >
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
                styles.listBox,
                styles.listShrink,
                {
                  paddingHorizontal:
                    isSmallScreen
                      ? 10
                      : 13,
                },
              ]}
            >
              <ScrollView
                contentContainerStyle={styles.list}
                keyboardShouldPersistTaps="handled"
              >
                {accountLines.map((line, lineIndex) => (
                  <View
                    key={line[0].id}
                    style={[
                      styles.accountLine,
                      lineIndex > 0 && styles.rowDivider,
                    ]}
                  >
                    {line.map((account, position) => (
                      <Animated.View
                        key={account.id}
                        entering={FadeInDown.delay((lineIndex * columns + position) * 50).duration(320)}
                        exiting={FadeOut.duration(180)}
                        layout={LinearTransition.duration(260)}
                        style={styles.accountRow}
                      >
                        {/* Account details */}
                        <View
                          style={[
                            styles.accountInfo,
                            {
                              gap: scaled(10),
                              paddingLeft: scaled(12),
                              paddingRight: scaled(8),
                              paddingVertical: scaled(8),
                            },
                          ]}
                        >
                          <View style={styles.accountDetails}>
                            <Text
                              numberOfLines={1}
                              style={styles.userName}
                            >
                              {account.name}
                            </Text>

                            <Text
                              numberOfLines={1}
                              style={styles.userText}
                            >
                              {account.location}
                            </Text>

                            <Text
                              numberOfLines={2}
                              style={styles.userText}
                            >
                              Privilege Level: {account.privilege}
                            </Text>
                          </View>

                          {/* Edit + Delete */}
                          <View
                            style={{
                              gap: scaled(6),
                            }}
                          >
                            <GradientButton
                              title="Edit"
                              onPress={() => editAccount(account.id)}
                              width={scaled(CARD_BUTTON_WIDTH)}
                              height={scaled(CARD_BUTTON_HEIGHT)}
                              borderRadius={8}
                            />

                            <GradientButton
                              title="Delete"
                              onPress={() => deleteAccount(account.id)}
                              width={scaled(CARD_BUTTON_WIDTH)}
                              height={scaled(CARD_BUTTON_HEIGHT)}
                              backgroundColors={DELETE_BACKGROUND}
                              borderColors={DELETE_BORDER}
                              borderRadius={8}
                            />
                          </View>
                        </View>
                      </Animated.View>
                    ))}

                    {/* Empty column */}
                    {line.length < columns && (
                      <View style={styles.accountRow} />
                    )}
                  </View>
                ))}

                {visibleAccounts.length === 0 && (
                  <Animated.View
                    entering={FadeIn.duration(220)}
                    style={styles.emptyState}
                  >
                    <Text style={styles.emptyText}>
                      No accounts match this search.
                    </Text>
                  </Animated.View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </View>

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

          <View
            style={[
              styles.selectorSheet,
              {
                paddingBottom: 14 + insets.bottom,
              },
            ]}
          >
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

// Styles

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

  backButton: {
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  backSpacer: {
    width: 60,
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

  titleInRow: {
    flex: 1,
    marginTop: 0,
    marginBottom: 0,
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
    paddingHorizontal: 12,
    backgroundColor: '#09091C',
  },

  compactPanel: {
    flexDirection: 'row',
    gap: 7,
  },

  compactRow: {
    flex: 1,
    width: 'auto',
    marginBottom: 0,
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
    height: BUTTON_HEIGHT,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 9,
    backgroundColor: '#09091C',
    justifyContent: 'center',
    paddingHorizontal: 12,
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
    right: 10,
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.arrow,
    lineHeight: 22,
  },

  selectPressed: {
    borderColor: '#3B82F6',
    backgroundColor: '#131338',
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.98,
      },
    ],
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

  listShrink: {
    flexShrink: 1,
  },

  listBox: {
    paddingTop: 0,
    paddingBottom: 0,
  },

  list: {
    gap: ROW_SPACING,
    paddingVertical: LIST_PADDING,
  },

  accountLine: {
    flexDirection: 'row',
    gap: COLUMN_GAP,
  },

  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.14)',
    paddingTop: ROW_SPACING,
  },

  accountRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
  },

  accountInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 9,
    backgroundColor: '#09091C',
  },

  accountDetails: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  userName: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sectionTitle,
    lineHeight: 22,
  },

  userText: {
    color: '#AEB7D3',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 18,
  },

  emptyState: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#09091C',
    paddingVertical: 22,
    alignItems: 'center',
  },

  emptyText: {
    color: '#AEB7D3',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
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
    height: BUTTON_HEIGHT,
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
    height: BUTTON_HEIGHT,
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
