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

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import NavBar from '../components/NavBar';
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

type SelectorType =
  | 'location'
  | 'role'
  | null;

type PhoneSelectorType =
  | 'phoneArea'
  | 'phonePrefix'
  | 'phoneLine'
  | null;

type HistoryType =
  | 'Edit'
  | 'Location'
  | 'Role'
  | null;

type ReviewChange = {
  field: string;
  oldValue: string;
  newValue: string;
};

type ProfileValues = {
  Name: string;
  'User ID': string;
  Location: string;
  'Phone Number': string;
  Email: string;
  Role: string;
  Password: string;
};

type ChangeLogEntry = {
  Date: string;
  Time: string;
  KemyzeID: string;
  User: string;
  Change: Exclude<HistoryType, null>;
  Old: string;
  New: string;
};

// Constants

const LOCATION_OPTIONS = [
  'Sacramento Lab',
  'Davis Lab',
  'Folsom Lab',
  'Elk Grove Lab',
];

const ROLE_OPTIONS = [
  'Primary',
  'Secondary',
  'Tertiary',
];

const PHONE_DIGITS = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
];

const HISTORY_FILTERS = [
  'Edit',
  'Location',
  'Role',
];

const EMPTY_PROFILE: ProfileValues = {
  Name: '',
  'User ID': '',
  Location: 'Location Name',
  'Phone Number': 'XXX - XXX - XXXX',
  Email: '',
  Role: 'Role',
  Password: '',
};

const PANEL_GRADIENT: [string, string] = [
  'rgba(1, 8, 37, 0.74)',
  'rgba(1, 8, 37, 0.74)',
];

// Layout

const NAV_BAR_HEIGHT = 76;

// Screen

export default function Edit_Profile() {
  const { user_id } = useLocalSearchParams();
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

  const pageMaxWidth =
    isLandscape
      ? 980
      : 520;

  const paddingLeft = Math.max(pagePadding, insets.left + 8);
  const paddingRight = Math.max(pagePadding, insets.right + 8);

  const paddingTop =
    insets.top +
    (isLandscape
      ? 8
      : 12);

  // NavBar spacing

  const paddingBottom = NAV_BAR_HEIGHT + (insets.bottom || 14) + 10;

  // Modal state

  const [selectorVisible, setSelectorVisible] = useState(false);
  const [phoneSelectorVisible, setPhoneSelectorVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [fieldHistoryVisible, setFieldHistoryVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [savedVisible, setSavedVisible] = useState(false);
  const [canceledVisible, setCanceledVisible] = useState(false);

  // Selection state

  const [selectorType, setSelectorType] =
    useState<SelectorType>(null);

  const [phoneSelectorType, setPhoneSelectorType] =
    useState<PhoneSelectorType>(null);

  const [historyFilter, setHistoryFilter] =
    useState('Edit');

  const [fieldHistoryType, setFieldHistoryType] =
    useState<HistoryType>(null);

  // Field state

  const [name, setName] =
    useState('');

  const [userId, setUserId] =
    useState('');

  const [location, setLocation] =
    useState('Location Name');

  const [email, setEmail] =
    useState('');

  const [role, setRole] =
    useState('Role');

  const [password, setPassword] =
    useState('');

  // Saved state

  const [savedProfile, setSavedProfile] =
    useState<ProfileValues>(EMPTY_PROFILE);

  // Phone state

  const [phoneArea, setPhoneArea] = useState([
    'X',
    'X',
    'X',
  ]);

  const [phonePrefix, setPhonePrefix] = useState([
    'X',
    'X',
    'X',
  ]);

  const [phoneLine, setPhoneLine] = useState([
    'X',
    'X',
    'X',
    'X',
  ]);

  // Placeholder data

  const changeLog: ChangeLogEntry[] = [
    {
      Date: '',
      Time: '',
      KemyzeID: String(user_id ?? ''),
      User: '',
      Change: 'Edit',
      Old: '',
      New: '',
    },
    {
      Date: '',
      Time: '',
      KemyzeID: String(user_id ?? ''),
      User: '',
      Change: 'Location',
      Old: '',
      New: '',
    },
    {
      Date: '',
      Time: '',
      KemyzeID: String(user_id ?? ''),
      User: '',
      Change: 'Role',
      Old: '',
      New: '',
    },
  ];

  // Review changes

  const phoneNumber =
    `${phoneArea.join('')} - ${phonePrefix.join('')} - ${phoneLine.join('')}`;

  const currentProfile: ProfileValues = {
    Name: name.trim(),
    'User ID': userId.trim(),
    Location: location,
    'Phone Number': phoneNumber,
    Email: email.trim(),
    Role: role,
    Password: password,
  };

  const getReviewValue = (
    field: keyof ProfileValues,
    value: string
  ) => {
    if (value === EMPTY_PROFILE[field]) {
      return '________';
    }

    if (field === 'Password') {
      return '••••••••';
    }

    return value;
  };

  const reviewChanges: ReviewChange[] =
    (Object.keys(currentProfile) as (keyof ProfileValues)[])
      .filter(
        (field) =>
          currentProfile[field] !==
          savedProfile[field]
      )
      .map((field) => ({
        field,
        oldValue: getReviewValue(
          field,
          savedProfile[field]
        ),
        newValue: getReviewValue(
          field,
          currentProfile[field]
        ),
      }));

  // Haptics

  const haptic = () => {
    Haptics.selectionAsync();
  };

  const mediumHaptic = () => {
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Medium
    );
  };

  const successHaptic = () => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
  };

  // General selectors

  const openSelector = (type: SelectorType) => {
    haptic();
    setSelectorType(type);
    setSelectorVisible(true);
  };

  const closeSelector = () => {
    haptic();
    setSelectorVisible(false);
    setSelectorType(null);
  };

  const getSelectorTitle = () => {
    if (selectorType === 'location') {
      return 'Select Location';
    }

    if (selectorType === 'role') {
      return 'Select Role';
    }

    return 'Select Option';
  };

  const getOptions = () => {
    if (selectorType === 'location') {
      return LOCATION_OPTIONS;
    }

    if (selectorType === 'role') {
      return ROLE_OPTIONS;
    }

    return [];
  };

  const selectOption = (value: string) => {
    haptic();

    if (selectorType === 'location') {
      setLocation(value);
    }

    if (selectorType === 'role') {
      setRole(value);
    }

    setSelectorVisible(false);
    setSelectorType(null);
  };

  // Phone number selector

  const openPhoneSelector = (type: PhoneSelectorType) => {
    haptic();
    setPhoneSelectorType(type);
    setPhoneSelectorVisible(true);
  };

  const closePhoneSelector = () => {
    haptic();
    setPhoneSelectorVisible(false);
    setPhoneSelectorType(null);
  };

  const getPhoneLength = () => {
    if (phoneSelectorType === 'phoneLine') {
      return 4;
    }

    return 3;
  };

  const getPhoneValue = () => {
    if (phoneSelectorType === 'phoneArea') {
      return phoneArea;
    }

    if (phoneSelectorType === 'phonePrefix') {
      return phonePrefix;
    }

    return phoneLine;
  };

  const selectPhoneDigit = (
    columnIndex: number,
    value: string
  ) => {
    haptic();

    if (phoneSelectorType === 'phoneArea') {
      const updated = [...phoneArea];
      updated[columnIndex] = value;
      setPhoneArea(updated);
    }

    if (phoneSelectorType === 'phonePrefix') {
      const updated = [...phonePrefix];
      updated[columnIndex] = value;
      setPhonePrefix(updated);
    }

    if (phoneSelectorType === 'phoneLine') {
      const updated = [...phoneLine];
      updated[columnIndex] = value;
      setPhoneLine(updated);
    }
  };

  // History

  const openHistory = (
    filter: string = 'Edit'
  ) => {
    haptic();
    setHistoryFilter(filter);
    setHistoryVisible(true);
  };

  const closeHistory = () => {
    haptic();
    setHistoryVisible(false);
  };

  const openFieldHistory = (
    type: HistoryType
  ) => {
    haptic();
    setFieldHistoryType(type);
    setHistoryVisible(false);
    setFieldHistoryVisible(true);
  };

  const closeFieldHistory = () => {
    haptic();
    setFieldHistoryVisible(false);
    setFieldHistoryType(null);
  };

  const returnToHistory = () => {
    haptic();
    setFieldHistoryVisible(false);
    setFieldHistoryType(null);
    setHistoryVisible(true);
  };

  const getFieldHistoryTitle = () => {
    if (fieldHistoryType === 'Edit') {
      return 'Profile Edit History';
    }

    if (fieldHistoryType === 'Location') {
      return 'Location History';
    }

    if (fieldHistoryType === 'Role') {
      return 'Role History';
    }

    return 'History';
  };

  const getFieldHistoryValue = (
    index: number
  ) => {
    if (fieldHistoryType === 'Edit') {
      return `Example ${index + 1}`;
    }

    if (fieldHistoryType === 'Location') {
      return `Example ${index + 1}`;
    }

    if (fieldHistoryType === 'Role') {
      return `Example ${index + 1}`;
    }

    return '________';
  };

  const selectHistoryFilter = (
    filter: string
  ) => {
    haptic();
    setHistoryFilter(filter);
  };

  const filteredChangeLog =
    changeLog.filter(
      (item) =>
        item.Change ===
        historyFilter
    );

  // Save flow

  const openReviewChanges = () => {
    mediumHaptic();
    setReviewVisible(true);
  };

  const saveReviewedChanges = () => {
    successHaptic();
    setSavedProfile(currentProfile);
    setReviewVisible(false);
    setSavedVisible(true);
  };

  const cancelReviewedChanges = () => {
    haptic();
    setReviewVisible(false);
    setCanceledVisible(true);
  };

  const closeSavedConfirmation = () => {
    haptic();
    setSavedVisible(false);
  };

  const closeCanceledConfirmation = () => {
    haptic();
    setCanceledVisible(false);
  };

  // Navigation

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
        tabBarAccessibilityLabel:
          'QR Scanner',
      },
    },

    inventory: {
      options: {
        title: 'Inventory',
        tabBarAccessibilityLabel:
          'Inventory',
      },
    },

    tertiaryprofilemanagement: {
      options: {
        title: 'Accounts',
        tabBarAccessibilityLabel:
          'Accounts',
      },
    },
  } as any;

  const navNavigation = {
    emit: () => ({
      defaultPrevented: false,
    }),

    navigate: (name: string) => {
      haptic();

      if (name === 'scanner') {
        router.push(
          '/Pages/scanner'
        );
      }

      if (name === 'inventory') {
        router.replace(
          '/Pages/inventory'
        );
      }

      if (name === 'tertiaryprofilemanagement') {
        router.push(
          '/Pages/tertiaryprofilemanagement'
        );
      }
    },
  } as any;

  // Render

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
              Edit Profile
            </Text>

            {/* Title spacer */}
            {isLandscape && (
              <View style={styles.backSpacer} />
            )}
          </View>

          <ScrollView
            style={styles.pageScroll}
            contentContainerStyle={
              styles.pageContent
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Profile Information */}
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
                {/* Name + User ID */}
                <View
                  style={
                    isLandscape
                      ? styles.fieldRow
                      : undefined
                  }
                >
                  {/* Name */}
                  <View
                    style={[
                      styles.field,
                      isLandscape && styles.fieldHalf,
                    ]}
                  >
                    <Text style={styles.label}>
                      Name
                    </Text>

                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Profile Name"
                      placeholderTextColor="#C9CFE9"
                      accessibilityLabel="Profile Name"
                      maxLength={255}
                    />
                  </View>

                  {/* User ID */}
                  <View
                    style={[
                      styles.field,
                      isLandscape && styles.fieldHalf,
                    ]}
                  >
                    <Text style={styles.label}>
                      User ID
                    </Text>

                    <TextInput
                      style={styles.input}
                      value={userId}
                      onChangeText={setUserId}
                      placeholder="User ID"
                      placeholderTextColor="#C9CFE9"
                      accessibilityLabel="User ID"
                      maxLength={255}
                    />
                  </View>
                </View>

                {/* Location + Phone Number */}
                <View
                  style={
                    isLandscape
                      ? styles.fieldRow
                      : undefined
                  }
                >
                  {/* Location */}
                  <View
                    style={[
                      styles.field,
                      isLandscape && styles.fieldHalf,
                    ]}
                  >
                    <Text style={styles.label}>
                      Location
                    </Text>

                    <Pressable
                      onPress={() =>
                        openSelector(
                          'location'
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Select location"
                      style={({ pressed }) => [
                        styles.selectInput,
                        pressed &&
                          styles.selectPressed,
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.selectText,
                          location ===
                            'Location Name' &&
                            styles.placeholderText,
                        ]}
                      >
                        {location}
                      </Text>

                      <Text
                        style={
                          styles.selectArrow
                        }
                      >
                        ⌄
                      </Text>
                    </Pressable>
                  </View>

                  {/* Phone Number */}
                  <View
                    style={[
                      styles.field,
                      isLandscape && styles.fieldHalf,
                    ]}
                  >
                    <Text style={styles.label}>
                      Phone Number
                    </Text>

                    <View style={styles.phoneRow}>
                      <Pressable
                        onPress={() =>
                          openPhoneSelector(
                            'phoneArea'
                          )
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Select phone number area code"
                        style={({ pressed }) => [
                          styles.phoneButton,
                          styles.phoneArea,
                          pressed &&
                            styles.selectPressed,
                        ]}
                      >
                        <Text
                          style={
                            styles.phoneButtonText
                          }
                        >
                          {phoneArea.join('')}
                        </Text>
                      </Pressable>

                      <Text style={styles.dash}>
                        -
                      </Text>

                      <Pressable
                        onPress={() =>
                          openPhoneSelector(
                            'phonePrefix'
                          )
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Select phone number prefix"
                        style={({ pressed }) => [
                          styles.phoneButton,
                          styles.phonePrefix,
                          pressed &&
                            styles.selectPressed,
                        ]}
                      >
                        <Text
                          style={
                            styles.phoneButtonText
                          }
                        >
                          {phonePrefix.join('')}
                        </Text>
                      </Pressable>

                      <Text style={styles.dash}>
                        -
                      </Text>

                      <Pressable
                        onPress={() =>
                          openPhoneSelector(
                            'phoneLine'
                          )
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Select phone number line number"
                        style={({ pressed }) => [
                          styles.phoneButton,
                          styles.phoneLine,
                          pressed &&
                            styles.selectPressed,
                        ]}
                      >
                        <Text
                          style={
                            styles.phoneButtonText
                          }
                        >
                          {phoneLine.join('')}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Email + Role */}
                <View
                  style={
                    isLandscape
                      ? styles.fieldRow
                      : undefined
                  }
                >
                  {/* Email */}
                  <View
                    style={[
                      styles.field,
                      isLandscape && styles.fieldHalf,
                    ]}
                  >
                    <Text style={styles.label}>
                      Email
                    </Text>

                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email"
                      placeholderTextColor="#C9CFE9"
                      accessibilityLabel="Email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      maxLength={255}
                    />
                  </View>

                  {/* Role */}
                  <View
                    style={[
                      styles.field,
                      isLandscape && styles.fieldHalf,
                    ]}
                  >
                    <Text style={styles.label}>
                      Role
                    </Text>

                    <Pressable
                      onPress={() =>
                        openSelector(
                          'role'
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Select role"
                      style={({ pressed }) => [
                        styles.selectInput,
                        pressed &&
                          styles.selectPressed,
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.selectText,
                          role ===
                            'Role' &&
                            styles.placeholderText,
                        ]}
                      >
                        {role}
                      </Text>

                      <Text
                        style={
                          styles.selectArrow
                        }
                      >
                        ⌄
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Password + Spacer */}
                <View
                  style={
                    isLandscape
                      ? styles.fieldRow
                      : undefined
                  }
                >
                  {/* Password */}
                  <View
                    style={[
                      styles.field,
                      isLandscape && styles.fieldHalf,
                    ]}
                  >
                    <Text style={styles.label}>
                      Password
                    </Text>

                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      placeholderTextColor="#C9CFE9"
                      accessibilityLabel="Password"
                      secureTextEntry
                      autoCapitalize="none"
                      maxLength={255}
                    />
                  </View>

                  {isLandscape && (
                    <View style={styles.fieldHalf} />
                  )}
                </View>
              </LinearGradient>
            </View>

            {/* Save */}
            <View style={styles.saveButton}>
              <GradientButton
                title="Save"
                onPress={openReviewChanges}
                width="100%"
                height={50}
                borderRadius={10}
              />
            </View>

            {/* Change Log */}
            <Pressable
              onPress={() => openHistory()}
              accessibilityRole="button"
              accessibilityLabel="Open Change Log"
              style={({ pressed }) => [
                styles.changeLogCard,
                pressed &&
                  styles.cardPressed,
              ]}
            >
              <View
                style={
                  styles.changeLogHeader
                }
              >
                <Text
                  style={
                    styles.changeLogTitle
                  }
                >
                  Change Log
                </Text>

                <Text
                  style={
                    styles.changeLogArrow
                  }
                >
                  ›
                </Text>
              </View>

              <View
                style={
                  styles.changeLogRow
                }
              >
                <Text
                  style={
                    styles.changeLogText
                  }
                >
                  Date: __________
                </Text>

                <Text
                  style={
                    styles.changeLogText
                  }
                >
                  Time: __________
                </Text>
              </View>

              <Text
                style={
                  styles.changeLogText
                }
              >
                Kemyze ID: {String(user_id ?? '__________')}
              </Text>

              <Text
                style={
                  styles.changeLogText
                }
              >
                User: __________
              </Text>

              <Text
                style={
                  styles.changeLogText
                }
              >
                Change: __________
              </Text>

              <View
                style={
                  styles.changeLogRow
                }
              >
                <Text
                  style={
                    styles.changeLogText
                  }
                >
                  Old: __________
                </Text>

                <Text
                  style={
                    styles.changeLogText
                  }
                >
                  New: __________
                </Text>
              </View>
            </Pressable>
          </ScrollView>
        </View>
      </View>

      {/* Existing NavBar */}
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

      {/* Selector modal */}

      <Modal
        visible={selectorVisible}
        transparent
        animationType="slide"
        onRequestClose={closeSelector}
      >
        <View
          style={
            styles.modalBackground
          }
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={
              StyleSheet.absoluteFillObject
            }
          />

          <Pressable
            style={
              styles.modalDismiss
            }
            onPress={closeSelector}
          />

          <View
            style={[
              styles.selectorSheet,
              {
                paddingBottom:
                  14 + insets.bottom,
              },
            ]}
          >
            <View
              style={
                styles.sheetHandle
              }
            />

            <Text
              style={
                styles.selectorTitle
              }
            >
              {getSelectorTitle()}
            </Text>

            {getOptions().map(
              (option, index) => (
                <Pressable
                  key={`${selectorType}-${index}`}
                  onPress={() =>
                    selectOption(
                      option
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={
                    option
                  }
                  style={({ pressed }) => [
                    styles.optionButton,
                    pressed &&
                      styles.selectPressed,
                  ]}
                >
                  <Text
                    style={
                      styles.optionText
                    }
                  >
                    {option}
                  </Text>
                </Pressable>
              )
            )}

            <Pressable
              onPress={closeSelector}
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
              <Text
                style={
                  styles.cancelText
                }
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Phone number modal */}

      <Modal
        visible={phoneSelectorVisible}
        transparent
        animationType="slide"
        onRequestClose={
          closePhoneSelector
        }
      >
        <View
          style={
            styles.modalBackground
          }
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={
              StyleSheet.absoluteFillObject
            }
          />

          <Pressable
            style={
              styles.modalDismiss
            }
            onPress={
              closePhoneSelector
            }
          />

          <View
            style={[
              styles.phoneSelectorSheet,
              {
                paddingBottom:
                  14 + insets.bottom,
              },
            ]}
          >
            <View
              style={
                styles.sheetHandle
              }
            />

            <Text
              style={
                styles.selectorTitle
              }
            >
              Select Phone Number
            </Text>

            <View
              style={
                styles.phoneWheelRow
              }
            >
              {Array.from({
                length:
                  getPhoneLength(),
              }).map(
                (
                  _,
                  columnIndex
                ) => (
                  <View
                    key={`phone-column-${columnIndex}`}
                    style={
                      styles.phoneWheelColumn
                    }
                  >
                    <View
                      style={
                        styles.phoneSelectedValue
                      }
                    >
                      <Text
                        style={
                          styles.phoneSelectedText
                        }
                      >
                        {
                          getPhoneValue()[
                            columnIndex
                          ]
                        }
                      </Text>
                    </View>

                    <ScrollView
                      style={
                        styles.phoneWheelScroll
                      }
                      showsVerticalScrollIndicator={
                        false
                      }
                      contentContainerStyle={
                        styles.phoneWheelContent
                      }
                    >
                      {PHONE_DIGITS.map(
                        (
                          character
                        ) => (
                          <Pressable
                            key={`${columnIndex}-${character}`}
                            onPress={() =>
                              selectPhoneDigit(
                                columnIndex,
                                character
                              )
                            }
                            accessibilityRole="button"
                            accessibilityLabel={`Select ${character}`}
                            style={[
                              styles.phoneWheelOption,
                              getPhoneValue()[
                                columnIndex
                              ] ===
                                character &&
                                styles.phoneWheelOptionActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.phoneWheelText,
                                getPhoneValue()[
                                  columnIndex
                                ] ===
                                  character &&
                                  styles.phoneWheelTextActive,
                              ]}
                            >
                              {character}
                            </Text>
                          </Pressable>
                        )
                      )}
                    </ScrollView>
                  </View>
                )
              )}
            </View>

            <Pressable
              onPress={
                closePhoneSelector
              }
              accessibilityRole="button"
              accessibilityLabel="Done selecting phone number"
              style={({ pressed }) => [
                styles.phoneDoneButton,
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
              <Text
                style={
                  styles.phoneDoneText
                }
              >
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Profile history */}

      <Modal
        visible={historyVisible}
        transparent
        animationType="slide"
        onRequestClose={closeHistory}
      >
        <View
          style={
            styles.modalBackground
          }
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={
              StyleSheet.absoluteFillObject
            }
          />

          <Pressable
            style={
              styles.modalDismiss
            }
            onPress={closeHistory}
          />

          <View
            style={[
              styles.historySheet,
              {
                maxHeight:
                  height * 0.82,
                paddingBottom:
                  13 + insets.bottom,
              },
            ]}
          >
            <View
              style={
                styles.sheetHandle
              }
            />

            <View
              style={
                styles.sheetHeader
              }
            >
              <Text
                style={
                  styles.sheetTitle
                }
              >
                Profile History
              </Text>

              <Pressable
                onPress={closeHistory}
                accessibilityRole="button"
                accessibilityLabel="Close Profile History"
                style={
                  styles.closeButton
                }
              >
                <Text
                  style={
                    styles.closeText
                  }
                >
                  ×
                </Text>
              </Pressable>
            </View>

            <View
              style={
                styles.filterRow
              }
            >
              {HISTORY_FILTERS.map(
                (filter) => (
                  <Pressable
                    key={filter}
                    onPress={() =>
                      selectHistoryFilter(
                        filter
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Show ${filter} history`}
                    accessibilityState={{
                      selected:
                        historyFilter ===
                        filter,
                    }}
                    style={[
                      styles.filterChip,
                      historyFilter ===
                        filter &&
                        styles.filterChipActive,
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
                          borderRadius: 20,
                        }}
                      />
                    </LinearGradient>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.filterText,
                        historyFilter ===
                          filter &&
                          styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                )
              )}
            </View>

            <ScrollView
              style={
                styles.historyScroll
              }
              contentContainerStyle={
                styles.historyContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {filteredChangeLog.map(
                (item, index) => (
                  <Pressable
                    key={`${item.Change}-${index}`}
                    onPress={() =>
                      openFieldHistory(
                        item.Change as HistoryType
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${item.Change} history`}
                    style={({ pressed }) => [
                      styles.historyCard,
                      pressed &&
                        styles.cardPressed,
                    ]}
                  >
                    <View
                      style={
                        styles.historyCardRow
                      }
                    >
                      <Text
                        style={
                          styles.historyName
                        }
                      >
                        {item.Change ===
                        'Edit'
                          ? 'Profile edited'
                          : `${item.Change} changed`}
                      </Text>

                      <View
                        style={
                          styles.historyRight
                        }
                      >
                        <Text
                          style={
                            styles.historyValue
                          }
                        >
                          {item.Change ===
                          'Edit'
                            ? '________ → ________ → ________'
                            : '________ → ________'}
                        </Text>

                        <Text
                          style={
                            styles.historyArrow
                          }
                        >
                          ›
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Field history */}

      <Modal
        visible={fieldHistoryVisible}
        transparent
        animationType="slide"
        onRequestClose={
          closeFieldHistory
        }
      >
        <View
          style={
            styles.modalBackground
          }
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={
              StyleSheet.absoluteFillObject
            }
          />

          <Pressable
            style={
              styles.modalDismiss
            }
            onPress={
              closeFieldHistory
            }
          />

          <View
            style={[
              styles.fieldHistorySheet,
              {
                maxHeight:
                  height * 0.82,
                paddingBottom:
                  13 + insets.bottom,
              },
            ]}
          >
            <View
              style={
                styles.sheetHandle
              }
            />

            <View
              style={
                styles.sheetHeader
              }
            >
              <Pressable
                onPress={returnToHistory}
                accessibilityRole="button"
                accessibilityLabel="Return to Profile History"
                style={
                  styles.sheetBackButton
                }
              >
                <Text
                  style={
                    styles.sheetBackText
                  }
                >
                  ‹ History
                </Text>
              </Pressable>

              <Pressable
                onPress={
                  closeFieldHistory
                }
                accessibilityRole="button"
                accessibilityLabel="Close History"
                style={
                  styles.closeButton
                }
              >
                <Text
                  style={
                    styles.closeText
                  }
                >
                  ×
                </Text>
              </Pressable>
            </View>

            <Text
              style={
                styles.fieldHistoryTitle
              }
            >
              {getFieldHistoryTitle()}
            </Text>

            <ScrollView
              style={
                styles.fieldHistoryScroll
              }
              contentContainerStyle={
                styles.fieldHistoryContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {[1, 2, 3, 4].map(
                (item, index) => (
                  <View
                    key={item}
                    style={
                      styles.timelineItem
                    }
                  >
                    <View
                      style={
                        styles.timelineColumn
                      }
                    >
                      <View
                        style={
                          index === 0
                            ? styles.timelineDotActive
                            : styles.timelineDot
                        }
                      />

                      {index < 3 && (
                        <View
                          style={
                            styles.timelineLine
                          }
                        />
                      )}
                    </View>

                    <View
                      style={
                        styles.timelineDetails
                      }
                    >
                      <Text
                        style={
                          styles.timelineValue
                        }
                      >
                        {getFieldHistoryValue(
                          index
                        )}
                      </Text>

                      <Text
                        style={
                          styles.timelinePlaceholder
                        }
                      >
                        User: __________
                      </Text>

                      <Text
                        style={
                          styles.timelinePlaceholder
                        }
                      >
                        Date: __________
                      </Text>

                      <Text
                        style={
                          styles.timelinePlaceholder
                        }
                      >
                        Time: __________
                      </Text>
                    </View>
                  </View>
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Review changes */}

      <Modal
        visible={reviewVisible}
        transparent
        animationType="slide"
        onRequestClose={
          cancelReviewedChanges
        }
      >
        <View
          style={
            styles.modalBackground
          }
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={
              StyleSheet.absoluteFillObject
            }
          />

          <Pressable
            style={
              styles.modalDismiss
            }
            onPress={
              cancelReviewedChanges
            }
          />

          <View
            style={[
              styles.reviewSheet,
              {
                maxHeight:
                  height * 0.82,
                paddingBottom:
                  14 + insets.bottom,
              },
            ]}
          >
            <View
              style={
                styles.sheetHandle
              }
            />

            <View
              style={
                styles.sheetHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sheetTitle
                  }
                >
                  Review Changes
                </Text>

                <Text
                  style={
                    styles.sheetSubtitle
                  }
                >
                  Confirm before saving
                </Text>
              </View>

              <Pressable
                onPress={
                  cancelReviewedChanges
                }
                accessibilityRole="button"
                accessibilityLabel="Cancel changes"
                style={
                  styles.closeButton
                }
              >
                <Text
                  style={
                    styles.closeText
                  }
                >
                  ×
                </Text>
              </Pressable>
            </View>

            <ScrollView
              style={
                styles.reviewScroll
              }
              contentContainerStyle={
                styles.reviewContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {reviewChanges.map(
                (change) => (
                  <View
                    key={change.field}
                    style={
                      styles.reviewCard
                    }
                  >
                    <Text
                      style={
                        styles.reviewField
                      }
                    >
                      {change.field}
                    </Text>

                    <View
                      style={
                        styles.reviewValues
                      }
                    >
                      <View
                        style={
                          styles.reviewValueSection
                        }
                      >
                        <Text
                          style={
                            styles.reviewValueLabel
                          }
                        >
                          Current
                        </Text>

                        <Text
                          style={
                            styles.reviewValue
                          }
                        >
                          {change.oldValue}
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.reviewArrow
                        }
                      >
                        →
                      </Text>

                      <View
                        style={
                          styles.reviewValueSection
                        }
                      >
                        <Text
                          style={
                            styles.reviewValueLabel
                          }
                        >
                          New
                        </Text>

                        <Text
                          style={
                            styles.reviewValue
                          }
                        >
                          {change.newValue}
                        </Text>
                      </View>
                    </View>
                  </View>
                )
              )}

              {reviewChanges.length === 0 && (
                <View
                  style={
                    styles.reviewCard
                  }
                >
                  <Text
                    style={
                      styles.reviewEmpty
                    }
                  >
                    No changes to review.
                  </Text>
                </View>
              )}
            </ScrollView>

            <Pressable
              onPress={
                saveReviewedChanges
              }
              accessibilityRole="button"
              accessibilityLabel="Save reviewed changes"
              style={({ pressed }) => [
                styles.reviewSaveButton,
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
              <Text
                style={
                  styles.reviewSaveText
                }
              >
                Save Changes
              </Text>
            </Pressable>

            <Pressable
              onPress={
                cancelReviewedChanges
              }
              accessibilityRole="button"
              accessibilityLabel="Cancel changes"
              style={({ pressed }) => [
                styles.reviewCancelButton,
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
              <Text
                style={
                  styles.reviewCancelText
                }
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Saved confirmation */}

      <Modal
        visible={savedVisible}
        transparent
        animationType="fade"
        onRequestClose={
          closeSavedConfirmation
        }
      >
        <View
          style={
            styles.confirmBackground
          }
        >
          <BlurView
            intensity={50}
            tint="dark"
            style={
              StyleSheet.absoluteFillObject
            }
          />

          <View
            style={
              styles.confirmCard
            }
          >
            <View
              style={
                styles.confirmCircle
              }
            >
              <Text
                style={
                  styles.confirmCheck
                }
              >
                ✓
              </Text>
            </View>

            <Text
              style={
                styles.confirmTitle
              }
            >
              Changes Saved
            </Text>

            <Text
              style={
                styles.confirmMessage
              }
            >
              Profile changes were saved successfully.
            </Text>

            <Pressable
              onPress={
                closeSavedConfirmation
              }
              accessibilityRole="button"
              accessibilityLabel="Done"
              style={({ pressed }) => [
                styles.confirmButton,
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
              <Text
                style={
                  styles.confirmButtonText
                }
              >
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Canceled confirmation */}

      <Modal
        visible={canceledVisible}
        transparent
        animationType="fade"
        onRequestClose={
          closeCanceledConfirmation
        }
      >
        <View
          style={
            styles.confirmBackground
          }
        >
          <BlurView
            intensity={50}
            tint="dark"
            style={
              StyleSheet.absoluteFillObject
            }
          />

          <View
            style={
              styles.confirmCard
            }
          >
            <View
              style={
                styles.cancelCircle
              }
            >
              <Text
                style={
                  styles.cancelMark
                }
              >
                ×
              </Text>
            </View>

            <Text
              style={
                styles.confirmTitle
              }
            >
              Changes Canceled
            </Text>

            <Text
              style={
                styles.confirmMessage
              }
            >
              No profile changes were saved.
            </Text>

            <Pressable
              onPress={
                closeCanceledConfirmation
              }
              accessibilityRole="button"
              accessibilityLabel="Done"
              style={({ pressed }) => [
                styles.confirmButton,
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
              <Text
                style={
                  styles.confirmButtonText
                }
              >
                Done
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

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  backSpacer: {
    width: 60,
  },

  titleInRow: {
    flex: 1,
    marginTop: 0,
    marginBottom: 0,
  },

  pageScroll: {
    flex: 1,
    width: '100%',
  },

  pageContent: {
    paddingBottom: 4,
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

  box: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 10,
    overflow: 'hidden',
  },

  field: {
    width: '100%',
    marginBottom: 7,
  },

  fieldRow: {
    flexDirection: 'row',
    gap: 7,
  },

  fieldHalf: {
    flex: 1,
    width: 'auto',
    minWidth: 0,
  },

  label: {
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.label,
    lineHeight: 16,
    marginBottom: 3,
  },

  input: {
    width: '100%',
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

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  phoneButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 9,
    backgroundColor: '#09091C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  phoneButtonText: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    textAlign: 'center',
  },

  phoneArea: {
    flex: 3,
    minWidth: 0,
  },

  phonePrefix: {
    flex: 3,
    minWidth: 0,
  },

  phoneLine: {
    flex: 4,
    minWidth: 0,
  },

  dash: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    marginHorizontal: 3,
  },

  selectInput: {
    width: '100%',
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

  placeholderText: {
    color: '#C9CFE9',
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
    backgroundColor: '#131338',
  },

  changeLogCard: {
    width: '100%',
    marginTop: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(33, 142, 255, 0.5)',
    backgroundColor: 'rgba(1, 8, 37, 0.74)',
    paddingVertical: 9,
    paddingHorizontal: 12,
  },

  saveButton: {
    width: '100%',
    height: 50,
    marginTop: 8,
  },

  changeLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  changeLogTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sectionTitle,
    lineHeight: 22,
  },

  changeLogArrow: {
    color: '#3B82F6',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.arrow,
    lineHeight: 22,
  },

  changeLogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  changeLogText: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 19,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  cardPressed: {
    opacity: 0.86,
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalDismiss: {
    flex: 1,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 10,
  },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sheetTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sheetTitle,
    lineHeight: 27,
  },

  sheetSubtitle: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 19,
    marginTop: 2,
  },

  closeButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.close,
    lineHeight: 26,
  },

  sheetBackButton: {
    minHeight: 44,
    justifyContent: 'center',
  },

  sheetBackText: {
    color: '#3B82F6',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
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

  phoneSelectorSheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: 'rgba(1, 8, 37, 0.74)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(33, 142, 255, 0.5)',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
  },

  phoneWheelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },

  phoneWheelColumn: {
    flex: 1,
    maxWidth: 82,
    minWidth: 54,
    height: 250,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#131338',
    overflow: 'hidden',
  },

  phoneSelectedValue: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#3B82F6',
    backgroundColor: '#131338',
    justifyContent: 'center',
    alignItems: 'center',
  },

  phoneSelectedText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sectionTitle,
    lineHeight: 22,
  },

  phoneWheelScroll: {
    flex: 1,
  },

  phoneWheelContent: {
    paddingVertical: 4,
  },

  phoneWheelOption: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  phoneWheelOptionActive: {
    backgroundColor: '#3B82F6',
  },

  phoneWheelText: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    textAlign: 'center',
  },

  phoneWheelTextActive: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
  },

  phoneDoneButton: {
    minHeight: 46,
    borderRadius: 10,
        borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  phoneDoneText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.button,
    lineHeight: 20,
  },

  historySheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: 'rgba(1, 8, 37, 0.74)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(33, 142, 255, 0.5)',
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 13,
  },

  filterRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 5,
    paddingVertical: 8,
  },

  filterChip: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },

  filterChipActive: {
    overflow: 'hidden',
  },

  filterText: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 19,
    textAlign: 'center',
  },

  filterTextActive: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.secondary,
  },

  historyScroll: {
    flexGrow: 0,
  },

  historyContent: {
    paddingBottom: 1,
  },

  historyCard: {
    width: '100%',
    minHeight: 60,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 7,
    justifyContent: 'center',
  },

  historyCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  historyName: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
  },

  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    maxWidth: '68%',
  },

  historyValue: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 19,
    textAlign: 'right',
    marginRight: 10,
  },

  historyArrow: {
    width: 20,
    color: '#3B82F6',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.arrow,
    lineHeight: 22,
    textAlign: 'center',
  },

  fieldHistorySheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: 'rgba(1, 8, 37, 0.74)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(33, 142, 255, 0.5)',
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 13,
  },

  fieldHistoryTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sheetTitle,
    lineHeight: 27,
    marginTop: 2,
    marginBottom: 10,
  },

  fieldHistoryScroll: {
    flexGrow: 0,
  },

  fieldHistoryContent: {
    paddingBottom: 3,
  },

  timelineItem: {
    flexDirection: 'row',
    minHeight: 92,
  },

  timelineColumn: {
    width: 22,
    alignItems: 'center',
  },

  timelineDotActive: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    marginTop: 4,
  },

  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: '#09091C',
    marginTop: 4,
  },

  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#334155',
    marginTop: 3,
  },

  timelineDetails: {
    flex: 1,
    paddingBottom: 12,
  },

  timelineValue: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sectionTitle,
    lineHeight: 22,
  },

  timelinePlaceholder: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 19,
    marginTop: 3,
  },

  reviewSheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: 'rgba(1, 8, 37, 0.74)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(33, 142, 255, 0.5)',
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 14,
  },

  reviewScroll: {
    flexGrow: 0,
    marginTop: 8,
  },

  reviewContent: {
    paddingBottom: 2,
  },

  reviewCard: {
    width: '100%',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    marginBottom: 6,
  },

  reviewEmpty: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    textAlign: 'center',
  },

  reviewField: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sectionTitle,
    lineHeight: 22,
    marginBottom: 7,
  },

  reviewValues: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  reviewValueSection: {
    flex: 1,
    minWidth: 0,
  },

  reviewValueLabel: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.metadata,
    lineHeight: 15,
    marginBottom: 3,
  },

  reviewValue: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 19,
  },

  reviewArrow: {
    color: '#3B82F6',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.arrow,
    lineHeight: 22,
    marginHorizontal: 8,
  },

  reviewSaveButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 10,
        borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    overflow: 'hidden',
  },

  reviewSaveText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.button,
    lineHeight: 20,
  },

  reviewCancelButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    overflow: 'hidden',
  },

  reviewCancelText: {
    color: '#C9CFE9',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.button,
    lineHeight: 20,
  },

  confirmBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  confirmCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(33, 142, 255, 0.5)',
    backgroundColor: 'rgba(1, 8, 37, 0.74)',
    padding: 20,
    alignItems: 'center',
  },

  confirmCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: '#131338',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  confirmCheck: {
    color: '#3B82F6',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.close,
    lineHeight: 26,
  },

  cancelCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#C9CFE9',
    backgroundColor: '#09091C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  cancelMark: {
    color: '#C9CFE9',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.close,
    lineHeight: 26,
  },

  confirmTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sheetTitle,
    lineHeight: 27,
    textAlign: 'center',
  },

  confirmMessage: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 15,
  },

  confirmButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 10,
        borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.button,
    lineHeight: 20,
  },
});
