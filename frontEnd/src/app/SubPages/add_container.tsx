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

import { Stack, useRouter } from 'expo-router';
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
  | 'quantity'
  | 'location'
  | 'room'
  | 'cabinet'
  | 'shelf'
  | null;

type DateSelectorType =
  | 'acquisitionDate'
  | 'expirationDate'
  | null;

type CasSelectorType =
  | 'casFirst'
  | 'casSecond'
  | 'casThird'
  | null;


type ReviewChange = {
  field: string;
  oldValue: string;
  newValue: string;
};

// Constants

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

const CAS_CHARACTERS = [
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

const PANEL_GRADIENT: [string, string] = [
  'rgba(1, 8, 37, 0.74)',
  'rgba(1, 8, 37, 0.74)',
];


// Screen

export default function Add_Container() {
  const router = useRouter();

  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isSmallScreen = width < 430;

  // Modal state

  const [selectorVisible, setSelectorVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [casSelectorVisible, setCasSelectorVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [savedVisible, setSavedVisible] = useState(false);
  const [canceledVisible, setCanceledVisible] = useState(false);

  // Selection state

  const [selectorType, setSelectorType] =
    useState<SelectorType>(null);

  const [dateSelectorType, setDateSelectorType] =
    useState<DateSelectorType>(null);

  const [casSelectorType, setCasSelectorType] =
    useState<CasSelectorType>(null);



  // Field state

  const [quantity, setQuantity] =
    useState('Select Status');

  const [acquisitionDate, setAcquisitionDate] =
    useState('YYYY/MM/DD');

  const [expirationDate, setExpirationDate] =
    useState('YYYY/MM/DD');

  const [location, setLocation] =
    useState('Location Name');

  const [room, setRoom] =
    useState('XXXX');

  const [cabinet, setCabinet] =
    useState('XXXX');

  const [shelf, setShelf] =
    useState('XXXX');

  const [sdsLocation, setSdsLocation] =
    useState('');

  // CAS state

  const [casFirst, setCasFirst] = useState([
    'X',
    'X',
    'X',
    'X',
  ]);

  const [casSecond, setCasSecond] = useState([
    'Y',
    'Y',
  ]);

  const [casThird, setCasThird] = useState([
    'Z',
  ]);

  // Calendar state

  const currentDate = new Date();

  const [calendarMonth, setCalendarMonth] =
    useState(currentDate.getMonth());

  const [calendarYear, setCalendarYear] =
    useState(currentDate.getFullYear());

  // Placeholder data

  const reviewChanges: ReviewChange[] = [
    {
      field: 'Quantity',
      oldValue: '___ mL',
      newValue: '___ mL',
    },
    {
      field: 'Location',
      oldValue: '____________',
      newValue: '____________',
    },
    {
      field: 'Cabinet',
      oldValue: '____',
      newValue: '____',
    },
  ];

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
    if (selectorType === 'quantity') {
      return 'Select Quantity';
    }

    if (selectorType === 'location') {
      return 'Select Location';
    }

    if (selectorType === 'room') {
      return 'Select Room';
    }

    if (selectorType === 'cabinet') {
      return 'Select Cabinet';
    }

    if (selectorType === 'shelf') {
      return 'Select Shelf';
    }

    return 'Select Option';
  };

  const getOptions = () => {
    if (selectorType === 'quantity') {
      return [
        'Example 1',
        'Example 2',
        'Example 3',
      ];
    }

    if (selectorType === 'location') {
      return [
        'Example 1',
        'Example 2',
        'Example 3',
      ];
    }

    if (selectorType === 'room') {
      return [
        'XXXX',
        'XXXX XXXX',
        'XXXX XXXX XXXX',
      ];
    }

    if (selectorType === 'cabinet') {
      return [
        'XXXX',
        'XXXX XXXX',
        'XXXX XXXX XXXX',
      ];
    }

    if (selectorType === 'shelf') {
      return [
        'XXXX',
        'XXXX XXXX',
        'XXXX XXXX XXXX',
      ];
    }

    return [];
  };

  const selectOption = (value: string) => {
    haptic();

    if (selectorType === 'quantity') {
      setQuantity(value);
    }

    if (selectorType === 'location') {
      setLocation(value);
    }

    if (selectorType === 'room') {
      setRoom(value);
    }

    if (selectorType === 'cabinet') {
      setCabinet(value);
    }

    if (selectorType === 'shelf') {
      setShelf(value);
    }

    setSelectorVisible(false);
    setSelectorType(null);
  };

  // CAS selector

  const openCasSelector = (type: CasSelectorType) => {
    haptic();
    setCasSelectorType(type);
    setCasSelectorVisible(true);
  };

  const closeCasSelector = () => {
    haptic();
    setCasSelectorVisible(false);
    setCasSelectorType(null);
  };

  const getCasLength = () => {
    if (casSelectorType === 'casFirst') {
      return 4;
    }

    if (casSelectorType === 'casSecond') {
      return 2;
    }

    return 1;
  };

  const getCasValue = () => {
    if (casSelectorType === 'casFirst') {
      return casFirst;
    }

    if (casSelectorType === 'casSecond') {
      return casSecond;
    }

    return casThird;
  };

  const selectCasCharacter = (
    columnIndex: number,
    value: string
  ) => {
    haptic();

    if (casSelectorType === 'casFirst') {
      const updated = [...casFirst];
      updated[columnIndex] = value;
      setCasFirst(updated);
    }

    if (casSelectorType === 'casSecond') {
      const updated = [...casSecond];
      updated[columnIndex] = value;
      setCasSecond(updated);
    }

    if (casSelectorType === 'casThird') {
      setCasThird([value]);
    }
  };

  // Calendar

  const openCalendar = (type: DateSelectorType) => {
    haptic();
    setDateSelectorType(type);
    setCalendarVisible(true);
  };

  const closeCalendar = () => {
    haptic();
    setCalendarVisible(false);
    setDateSelectorType(null);
  };

  const previousMonth = () => {
    haptic();

    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(
        (year) => year - 1
      );
      return;
    }

    setCalendarMonth(
      (month) => month - 1
    );
  };

  const nextMonth = () => {
    haptic();

    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(
        (year) => year + 1
      );
      return;
    }

    setCalendarMonth(
      (month) => month + 1
    );
  };

  const getCalendarDays = () => {
    const firstDay =
      new Date(
        calendarYear,
        calendarMonth,
        1
      ).getDay();

    const numberOfDays =
      new Date(
        calendarYear,
        calendarMonth + 1,
        0
      ).getDate();

    const days: Array<number | null> = [];

    for (
      let index = 0;
      index < firstDay;
      index += 1
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= numberOfDays;
      day += 1
    ) {
      days.push(day);
    }

    while (
      days.length % 7 !== 0
    ) {
      days.push(null);
    }

    return days;
  };

  const selectDate = (day: number) => {
    haptic();

    const month = String(
      calendarMonth + 1
    ).padStart(2, '0');

    const date = String(day).padStart(
      2,
      '0'
    );

    const value =
      `${calendarYear}/${month}/${date}`;

    if (
      dateSelectorType ===
      'acquisitionDate'
    ) {
      setAcquisitionDate(value);
    }

    if (
      dateSelectorType ===
      'expirationDate'
    ) {
      setExpirationDate(value);
    }

    setCalendarVisible(false);
    setDateSelectorType(null);
  };

  // Save flow

  const openReviewChanges = () => {
    mediumHaptic();
    setReviewVisible(true);
  };

  const saveReviewedChanges = () => {
    successHaptic();
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
    index: 1,

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
        key: 'profile',
        name: 'profile',
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

    profile: {
      options: {
        title: 'Profile',
        tabBarAccessibilityLabel:
          'Profile',
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

      if (name === 'profile') {
        router.push(
          '/Pages/profile'
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
            Add Container
          </Text>

          {/* Container Information */}
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
              {/* Name */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Name
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Chemical Name"
                  placeholderTextColor="#C9CFE9"
                  accessibilityLabel="Chemical Name"
                  maxLength={255}
                />
              </View>

              {/* CAS + Quantity */}
              <View style={styles.row}>
                <View style={styles.casSection}>
                  <Text style={styles.label}>
                    CAS Number
                  </Text>

                  <View style={styles.casRow}>
                    <Pressable
                      onPress={() =>
                        openCasSelector(
                          'casFirst'
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Select CAS Number first section"
                      style={({ pressed }) => [
                        styles.casButton,
                        styles.casLarge,
                        pressed &&
                          styles.selectPressed,
                      ]}
                    >
                      <Text
                        style={
                          styles.casButtonText
                        }
                      >
                        {casFirst.join('')}
                      </Text>
                    </Pressable>

                    <Text style={styles.dash}>
                      -
                    </Text>

                    <Pressable
                      onPress={() =>
                        openCasSelector(
                          'casSecond'
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Select CAS Number second section"
                      style={({ pressed }) => [
                        styles.casButton,
                        styles.casSmall,
                        pressed &&
                          styles.selectPressed,
                      ]}
                    >
                      <Text
                        style={
                          styles.casButtonText
                        }
                      >
                        {casSecond.join('')}
                      </Text>
                    </Pressable>

                    <Text style={styles.dash}>
                      -
                    </Text>

                    <Pressable
                      onPress={() =>
                        openCasSelector(
                          'casThird'
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Select CAS Number third section"
                      style={({ pressed }) => [
                        styles.casButton,
                        styles.casLast,
                        pressed &&
                          styles.selectPressed,
                      ]}
                    >
                      <Text
                        style={
                          styles.casButtonText
                        }
                      >
                        {casThird.join('')}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View
                  style={
                    styles.quantitySection
                  }
                >
                  <Text style={styles.label}>
                    Quantity
                  </Text>

                  <Pressable
                    onPress={() =>
                      openSelector(
                        'quantity'
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Select quantity"
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
                        quantity ===
                          'Select Status' &&
                          styles.placeholderText,
                      ]}
                    >
                      {quantity}
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

              {/* Dates */}
              <View style={styles.row}>
                <View
                  style={
                    styles.halfSection
                  }
                >
                  <Text style={styles.label}>
                    Acquisition Date
                  </Text>

                  <Pressable
                    onPress={() =>
                      openCalendar(
                        'acquisitionDate'
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Select acquisition date"
                    style={({ pressed }) => [
                      styles.selectInput,
                      pressed &&
                        styles.selectPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectText,
                        acquisitionDate ===
                          'YYYY/MM/DD' &&
                          styles.placeholderText,
                      ]}
                    >
                      {acquisitionDate}
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

                <View
                  style={
                    styles.halfSection
                  }
                >
                  <Text style={styles.label}>
                    Expiration Date
                  </Text>

                  <Pressable
                    onPress={() =>
                      openCalendar(
                        'expirationDate'
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Select expiration date"
                    style={({ pressed }) => [
                      styles.selectInput,
                      pressed &&
                        styles.selectPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectText,
                        expirationDate ===
                          'YYYY/MM/DD' &&
                          styles.placeholderText,
                      ]}
                    >
                      {expirationDate}
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

              {/* Location - Full Width */}
              <View style={styles.field}>
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

              {/* Room / Cabinet / Shelf */}
              <View
                style={
                  styles.roomCabinetShelfRow
                }
              >
                <View
                  style={
                    styles.roomCabinetShelfSection
                  }
                >
                  <Text style={styles.label}>
                    Room
                  </Text>

                  <Pressable
                    onPress={() =>
                      openSelector(
                        'room'
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Select room"
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
                        room === 'XXXX' &&
                          styles.placeholderText,
                      ]}
                    >
                      {room}
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

                <View
                  style={
                    styles.roomCabinetShelfSection
                  }
                >
                  <Text style={styles.label}>
                    Cabinet
                  </Text>

                  <Pressable
                    onPress={() =>
                      openSelector(
                        'cabinet'
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Select cabinet"
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
                        cabinet === 'XXXX' &&
                          styles.placeholderText,
                      ]}
                    >
                      {cabinet}
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

                <View
                  style={
                    styles.roomCabinetShelfSection
                  }
                >
                  <Text style={styles.label}>
                    Shelf
                  </Text>

                  <Pressable
                    onPress={() =>
                      openSelector(
                        'shelf'
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Select shelf"
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
                        shelf === 'XXXX' &&
                          styles.placeholderText,
                      ]}
                    >
                      {shelf}
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

              {/* SDS */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  SDS Sheet
                </Text>

                <View style={styles.sdsRow}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.sdsInput,
                    ]}
                    placeholder="File Location"
                    placeholderTextColor="#C9CFE9"
                    accessibilityLabel="SDS File Location"
                    value={sdsLocation}
                    onChangeText={setSdsLocation}
                  />

                  <GradientButton
                      title="Import"
                      onPress={haptic}
                      width={84}
                      height={44}
                      borderRadius={10}
                    />
                </View>
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

          {/* New container information */}
          <View style={styles.addInfoCard}>
            <Text style={styles.addInfoText}>
              A new container record will be created with the information provided above.
            </Text>
          </View>
        </View>
      </ScrollView>

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
            style={
              styles.selectorSheet
            }
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

      {/* CAS modal */}

      <Modal
        visible={casSelectorVisible}
        transparent
        animationType="slide"
        onRequestClose={
          closeCasSelector
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
              closeCasSelector
            }
          />

          <View
            style={
              styles.casSelectorSheet
            }
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
              Select CAS Number
            </Text>

            <View
              style={
                styles.casWheelRow
              }
            >
              {Array.from({
                length:
                  getCasLength(),
              }).map(
                (
                  _,
                  columnIndex
                ) => (
                  <View
                    key={`cas-column-${columnIndex}`}
                    style={
                      styles.casWheelColumn
                    }
                  >
                    <View
                      style={
                        styles.casSelectedValue
                      }
                    >
                      <Text
                        style={
                          styles.casSelectedText
                        }
                      >
                        {
                          getCasValue()[
                            columnIndex
                          ]
                        }
                      </Text>
                    </View>

                    <ScrollView
                      style={
                        styles.casWheelScroll
                      }
                      showsVerticalScrollIndicator={
                        false
                      }
                      contentContainerStyle={
                        styles.casWheelContent
                      }
                    >
                      {CAS_CHARACTERS.map(
                        (
                          character
                        ) => (
                          <Pressable
                            key={`${columnIndex}-${character}`}
                            onPress={() =>
                              selectCasCharacter(
                                columnIndex,
                                character
                              )
                            }
                            accessibilityRole="button"
                            accessibilityLabel={`Select ${character}`}
                            style={[
                              styles.casWheelOption,
                              getCasValue()[
                                columnIndex
                              ] ===
                                character &&
                                styles.casWheelOptionActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.casWheelText,
                                getCasValue()[
                                  columnIndex
                                ] ===
                                  character &&
                                  styles.casWheelTextActive,
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
                closeCasSelector
              }
              accessibilityRole="button"
              accessibilityLabel="Done selecting CAS Number"
              style={({ pressed }) => [
                styles.casDoneButton,
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
                  styles.casDoneText
                }
              >
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Calendar modal */}

      <Modal
        visible={calendarVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCalendar}
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
            onPress={closeCalendar}
          />

          <View
            style={
              styles.calendarSheet
            }
          >
            <View
              style={
                styles.sheetHandle
              }
            />

            <View
              style={
                styles.calendarHeader
              }
            >
              <Pressable
                onPress={previousMonth}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                style={
                  styles.calendarArrowButton
                }
              >
                <Text
                  style={
                    styles.calendarArrow
                  }
                >
                  ‹
                </Text>
              </Pressable>

              <View
                style={
                  styles.calendarTitleArea
                }
              >
                <Text
                  style={
                    styles.calendarTitle
                  }
                >
                  {
                    MONTH_NAMES[
                      calendarMonth
                    ]
                  }
                </Text>

                <Text
                  style={
                    styles.calendarYear
                  }
                >
                  {calendarYear}
                </Text>
              </View>

              <Pressable
                onPress={nextMonth}
                accessibilityRole="button"
                accessibilityLabel="Next month"
                style={
                  styles.calendarArrowButton
                }
              >
                <Text
                  style={
                    styles.calendarArrow
                  }
                >
                  ›
                </Text>
              </Pressable>
            </View>

            <View
              style={
                styles.calendarWeek
              }
            >
              {DAY_NAMES.map(
                (dayName) => (
                  <View
                    key={dayName}
                    style={
                      styles.calendarCell
                    }
                  >
                    <Text
                      style={
                        styles.calendarWeekText
                      }
                    >
                      {dayName}
                    </Text>
                  </View>
                )
              )}
            </View>

            <View
              style={
                styles.calendarGrid
              }
            >
              {getCalendarDays().map(
                (day, index) => (
                  <View
                    key={`day-${index}`}
                    style={
                      styles.calendarCell
                    }
                  >
                    {day !== null && (
                      <Pressable
                        onPress={() =>
                          selectDate(
                            day
                          )
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`${
                          MONTH_NAMES[
                            calendarMonth
                          ]
                        } ${day}, ${calendarYear}`}
                        style={({ pressed }) => [
                          styles.calendarDateButton,
                          pressed &&
                            styles.calendarDatePressed,
                        ]}
                      >
                        <Text
                          style={
                            styles.calendarDateText
                          }
                        >
                          {day}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )
              )}
            </View>

            <Pressable
              onPress={closeCalendar}
              accessibilityRole="button"
              accessibilityLabel="Cancel date selection"
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
                  Add Container Review
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
              Container Added
            </Text>

            <Text
              style={
                styles.confirmMessage
              }
            >
              New container was added successfully.
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
              Add Container Canceled
            </Text>

            <Text
              style={
                styles.confirmMessage
              }
            >
              No new container was added.
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

  row: {
    flexDirection: 'row',
    width: '100%',
    gap: 7,
    marginBottom: 7,
    alignItems: 'flex-start',
  },

  casSection: {
    flex: 1.42,
    minWidth: 0,
  },

  quantitySection: {
    flex: 1,
    minWidth: 0,
  },

  casRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  casButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 9,
    backgroundColor: '#09091C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  casButtonText: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    textAlign: 'center',
  },

  casLarge: {
    flex: 1,
    minWidth: 0,
  },

  casSmall: {
    width: 52,
  },

  casLast: {
    width: 44,
  },

  dash: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    marginHorizontal: 3,
  },

  halfSection: {
    flex: 1,
    minWidth: 0,
  },

  roomCabinetShelfRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 7,
    marginBottom: 7,
    alignItems: 'flex-start',
  },

  roomCabinetShelfSection: {
    flex: 1,
    minWidth: 0,
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

  sdsRow: {
    flexDirection: 'row',
    gap: 7,
    width: '100%',
    alignItems: 'center',
  },

  sdsInput: {
    flex: 1,
    minWidth: 0,
  },

  saveButton: {
    width: '100%',
    height: 50,
    marginTop: 8,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.98,
      },
    ],
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

  casSelectorSheet: {
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

  casWheelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },

  casWheelColumn: {
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

  casSelectedValue: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#3B82F6',
    backgroundColor: '#131338',
    justifyContent: 'center',
    alignItems: 'center',
  },

  casSelectedText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sectionTitle,
    lineHeight: 22,
  },

  casWheelScroll: {
    flex: 1,
  },

  casWheelContent: {
    paddingVertical: 4,
  },

  casWheelOption: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  casWheelOptionActive: {
    backgroundColor: '#3B82F6',
  },

  casWheelText: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    textAlign: 'center',
  },

  casWheelTextActive: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
  },

  casDoneButton: {
    minHeight: 46,
    borderRadius: 10,
        borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  casDoneText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.button,
    lineHeight: 20,
  },

  calendarSheet: {
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

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  calendarTitleArea: {
    flex: 1,
    alignItems: 'center',
  },

  calendarTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sheetTitle,
    lineHeight: 27,
  },

  calendarYear: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 19,
    marginTop: 2,
  },

  calendarArrowButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  calendarArrow: {
    color: '#3B82F6',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.arrow,
    lineHeight: 22,
  },

  calendarWeek: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 4,
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 8,
  },

  calendarCell: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarWeekText: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.metadata,
    lineHeight: 15,
  },

  calendarDateButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },

  calendarDatePressed: {
    backgroundColor: '#2983ff',
  },

  calendarDateText: {
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
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

  errorMessage: {
    width: '100%',
    color: '#FF3B30',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 2,
  },

  addInfoCard: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(33, 142, 255, 0.5)',
    borderRadius: 10,
    backgroundColor: 'rgba(1, 8, 37, 0.74)',
  },

  addInfoText: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.secondary,
    lineHeight: 18,
  },
});
