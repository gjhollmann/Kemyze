import { useCallback, useEffect, useRef, useState } from 'react';

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
import { useUserState } from '../contexts/UserState';

import GradientButton from '../../../components/GradientButton';

const BASE_URL = 'https://kemyze.vercel.app';

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
};

type ManagedUserResponse = {
  success: boolean;
  message?: string;
  results?: Array<{
    id: number;
    name: string;
    location: string;
    access_level: number;
  }>;
  next_offset?: number | null;
  has_more?: boolean;
};

// Constants

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

const PANEL_GRADIENT: [string, string] = [
  'rgba(1, 8, 37, 0.74)',
  'rgba(1, 8, 37, 0.74)',
];

// Screen

export default function ManagedAccounts() {
  const router = useRouter();
  const { activeUser } = useUserState();

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

  const [accounts, setAccounts] = useState<User[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingMoreAccounts, setIsLoadingMoreAccounts] = useState(false);
  const [hasMoreAccounts, setHasMoreAccounts] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [accountLoadError, setAccountLoadError] = useState('');
  const searchRequestId = useRef(0);

  const [accountToDelete, setAccountToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deletionStatus, setDeletionStatus] = useState('');

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

  // Account lines

  const accountLines: User[][] = [];

  for (let i = 0; i < accounts.length; i += columns) {
    accountLines.push(accounts.slice(i, i + columns));
  }

  // Haptics

  const haptic = () => {
    Haptics.selectionAsync();
  };

  const accessLevelName = (accessLevel: number) => {
    const accessLevels: Record<number, string> = {
      1: 'Primary',
      2: 'Secondary',
      3: 'Tertiary',
      4: 'Quaternary',
      5: 'Quinary',
    };

    return accessLevels[accessLevel] ?? `Level ${accessLevel}`;
  };

  const loadAccounts = useCallback(
    async (searchTerm: string, offset: number, append: boolean) => {
      if (!activeUser) {
        setAccounts([]);
        setHasMoreAccounts(false);
        setNextOffset(null);
        setAccountLoadError('You must be logged in to view managed accounts.');
        return;
      }

      const requestId = append ? searchRequestId.current : searchRequestId.current + 1;

      if (!append) {
        searchRequestId.current = requestId;
        setIsLoadingAccounts(true);
        setAccounts([]);
        setHasMoreAccounts(false);
        setNextOffset(null);
        setAccountLoadError('');
      } else {
        setIsLoadingMoreAccounts(true);
      }

      try {
        const response = await fetch(`${BASE_URL}/login/users/search/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: activeUser.userID,
            search: searchTerm,
            offset,
          }),
        });

        const responseText = await response.text();
        let result: ManagedUserResponse = { success: false };

        try {
          result = JSON.parse(responseText) as ManagedUserResponse;
        } catch {
          result.message = responseText;
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Managed accounts could not be loaded.');
        }

        if (requestId !== searchRequestId.current) {
          return;
        }

        const loadedAccounts = (result.results ?? []).map((account) => ({
          id: String(account.id),
          name: account.name,
          location: account.location,
          privilege: accessLevelName(account.access_level),
        }));

        setAccounts((current) =>
          append
            ? [...current, ...loadedAccounts.filter((account) =>
                !current.some((currentAccount) => currentAccount.id === account.id)
              )]
            : loadedAccounts
        );
        setHasMoreAccounts(Boolean(result.has_more));
        setNextOffset(result.next_offset ?? null);
      } catch (error) {
        if (requestId !== searchRequestId.current) {
          return;
        }

        setAccounts([]);
        setHasMoreAccounts(false);
        setNextOffset(null);
        setAccountLoadError(
          error instanceof Error
            ? error.message
            : 'Managed accounts could not be loaded. Please try again.'
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        if (requestId === searchRequestId.current) {
          setIsLoadingAccounts(false);
          setIsLoadingMoreAccounts(false);
        }
      }
    },
    [activeUser]
  );

  useEffect(() => {
    loadAccounts(query, 0, false);
  }, [activeUser?.userID, loadAccounts, query]);

  // Search

  const changeSearch = (text: string) => {
    setSearch(text);

    if (text.trim() === '') {
      setQuery('');
    }
  };

  const runSearch = () => {
    haptic();
    const nextQuery = search.trim();

    if (nextQuery === query) {
      loadAccounts(nextQuery, 0, false);
      return;
    }

    setQuery(nextQuery);
  };

  const loadMoreAccounts = () => {
    if (
      isLoadingAccounts ||
      isLoadingMoreAccounts ||
      !hasMoreAccounts ||
      nextOffset === null
    ) {
      return;
    }

    loadAccounts(query, nextOffset, true);
  };

  // Accounts

  const editAccount = (id: string) => {
    haptic();
    router.push(`/SubPages/editprofile?user_id=${id}`);
  };

  const openDeleteConfirmation = (account: User) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDeleteError('');
    setAccountToDelete(account);
  };

  const cancelDelete = () => {
    if (isDeleting) {
      return;
    }

    haptic();
    setDeleteError('');
    setAccountToDelete(null);
  };

  const confirmDelete = async () => {
    if (!accountToDelete || isDeleting) {
      return;
    }

    if (!activeUser) {
      setDeleteError('You must be logged in to delete an account.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    setDeletionStatus('');

    try {
      const response = await fetch(`${BASE_URL}/login/users/delete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: activeUser.userID,
          target_user_id: Number(accountToDelete.id),
        }),
      });

      const responseText = await response.text();
      let responseMessage = '';

      try {
        const result = JSON.parse(responseText) as { message?: string };
        responseMessage = result.message ?? '';
      } catch {
        responseMessage = responseText;
      }

      if (!response.ok) {
        throw new Error(responseMessage || 'The account could not be deleted.');
      }

      setAccounts((current) =>
        current.filter((account) => account.id !== accountToDelete.id)
      );
      setDeletionStatus(responseMessage || `${accountToDelete.name} was deleted.`);
      setAccountToDelete(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'The account could not be deleted. Please try again.'
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsDeleting(false);
    }
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

                  {/* Add New */}
                  <View
                    style={[
                      styles.filterRow,
                      compactHeader && styles.compactRow,
                    ]}
                  >
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
                onMomentumScrollEnd={({ nativeEvent }) => {
                  const distanceFromBottom =
                    nativeEvent.contentSize.height -
                    nativeEvent.layoutMeasurement.height -
                    nativeEvent.contentOffset.y;

                  if (distanceFromBottom <= 24) {
                    loadMoreAccounts();
                  }
                }}
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
                              onPress={() => openDeleteConfirmation(account)}
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

                {isLoadingAccounts && (
                  <Animated.View
                    entering={FadeIn.duration(220)}
                    style={styles.emptyState}
                  >
                    <Text style={styles.emptyText}>Loading managed accounts...</Text>
                  </Animated.View>
                )}

                {Boolean(accountLoadError) && (
                  <Animated.View
                    entering={FadeIn.duration(220)}
                    style={styles.emptyState}
                  >
                    <Text style={styles.emptyText}>{accountLoadError}</Text>
                    <GradientButton
                      title="Back"
                      onPress={() => {
                        haptic();
                        router.back();
                      }}
                      width={ACTION_BUTTON_WIDTH}
                      height={BUTTON_HEIGHT}
                      borderRadius={10}
                    />
                  </Animated.View>
                )}

                {!isLoadingAccounts && !accountLoadError && accounts.length === 0 && (
                  <Animated.View
                    entering={FadeIn.duration(220)}
                    style={styles.emptyState}
                  >
                    <Text style={styles.emptyText}>
                      No accounts match this search.
                    </Text>
                  </Animated.View>
                )}

                {isLoadingMoreAccounts && (
                  <Text style={styles.loadingMoreText}>Loading more accounts...</Text>
                )}

                {!isLoadingAccounts && !isLoadingMoreAccounts && !hasMoreAccounts && accounts.length > 0 && (
                  <Text style={styles.loadingMoreText}>No more accounts to load.</Text>
                )}

                {Boolean(deletionStatus) && (
                  <Animated.View
                    entering={FadeIn.duration(180)}
                    style={styles.deletionStatus}
                  >
                    <Text style={styles.deletionStatusText}>{deletionStatus}</Text>
                  </Animated.View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Delete confirmation modal */}

      <Modal
        visible={accountToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalBackground}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />

          <Pressable
            style={styles.modalDismiss}
            onPress={cancelDelete}
            disabled={isDeleting}
            accessibilityRole="button"
            accessibilityLabel="Cancel deleting account"
          />

          <View
            style={[
              styles.deleteSheet,
              { paddingBottom: 14 + insets.bottom },
            ]}
          >
            <View style={styles.sheetHandle} />

            <Text style={styles.deleteTitle}>Delete Account?</Text>
            <Text style={styles.deleteDescription}>
              This action permanently removes the following user from the database.
            </Text>

            {accountToDelete && (
              <View style={styles.deleteUserInfo}>
                <Text style={styles.deleteUserName}>{accountToDelete.name}</Text>
                <Text style={styles.deleteUserText}>User ID: {accountToDelete.id}</Text>
                <Text style={styles.deleteUserText}>{accountToDelete.location}</Text>
                <Text style={styles.deleteUserText}>
                  Privilege Level: {accountToDelete.privilege}
                </Text>
              </View>
            )}

            {Boolean(deleteError) && (
              <Text style={styles.deleteError}>{deleteError}</Text>
            )}

            <View style={styles.deleteActions}>
              <GradientButton
                title="Cancel"
                onPress={cancelDelete}
                disabled={isDeleting}
                width="48%"
                height={BUTTON_HEIGHT}
                borderRadius={10}
              />
              <GradientButton
                title={isDeleting ? 'Deleting...' : 'Delete'}
                onPress={confirmDelete}
                disabled={isDeleting}
                width="48%"
                height={BUTTON_HEIGHT}
                backgroundColors={DELETE_BACKGROUND}
                borderColors={DELETE_BORDER}
                borderRadius={10}
              />
            </View>
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
    textAlign: 'center',
    marginBottom: 12,
  },

  loadingMoreText: {
    color: '#AEB7D3',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.label,
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: 4,
  },

  deletionStatus: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 10,
    backgroundColor: 'rgba(20, 83, 45, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  deletionStatusText: {
    color: '#BBF7D0',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    textAlign: 'center',
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

  deleteSheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: 'rgba(1, 8, 37, 0.96)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.7)',
    paddingHorizontal: 16,
    paddingTop: 8,
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

  deleteTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sheetTitle,
    lineHeight: 27,
    marginBottom: 6,
  },

  deleteDescription: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 19,
    marginBottom: 12,
  },

  deleteUserInfo: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    backgroundColor: '#09091C',
    padding: 12,
    gap: 3,
  },

  deleteUserName: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sectionTitle,
    lineHeight: 22,
    marginBottom: 3,
  },

  deleteUserText: {
    color: '#AEB7D3',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 18,
  },

  deleteError: {
    color: '#FCA5A5',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.label,
    lineHeight: 18,
    marginTop: 10,
    textAlign: 'center',
  },

  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
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
