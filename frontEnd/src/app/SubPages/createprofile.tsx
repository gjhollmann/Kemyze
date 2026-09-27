import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
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
  error: 12,
} as const);

// Types
type SelectorType = 'location' | 'authorization' | null;
type PhoneSelectorType = 'phoneArea' | 'phonePrefix' | 'phoneLine' | null;

// Options
const LOCATION_OPTIONS = ['Placeholder School'];

const AUTHORIZATION_OPTIONS = [
  'Primary',
  'Secondary',
  'Tertiary',
  'Quaternary',
  'Quinary',
];

const PHONE_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const PANEL_GRADIENT: [string, string] = [
  'rgba(1, 8, 37, 0.74)',
  'rgba(1, 8, 37, 0.74)',
];

const NAV_BAR_HEIGHT = 76;

export default function CreateProfile() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isLandscape = width > height;
  const isSmallScreen = width < 430;

  const pagePadding = isSmallScreen ? 14 : isLandscape ? 24 : 22;
  const pageMaxWidth = isLandscape ? 980 : 520;

  const paddingLeft = Math.max(pagePadding, insets.left + 8);
  const paddingRight = Math.max(pagePadding, insets.right + 8);
  const paddingTop = insets.top + (isLandscape ? 8 : 12);
  const paddingBottom = NAV_BAR_HEIGHT + (insets.bottom || 14) + 10;

  // Modals state
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [phoneSelectorVisible, setPhoneSelectorVisible] = useState(false);

  // Field states
  const [selectorType, setSelectorType] = useState<SelectorType>(null);
  const [phoneSelectorType, setPhoneSelectorType] = useState<PhoneSelectorType>(
    null
  );

  const [name, setName] = useState('');
  const [location, setLocation] = useState('Location Name');
  const [email, setEmail] = useState('');
  const [authorization, setAuthorization] = useState('Authorization');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Phone state
  const [phoneArea, setPhoneArea] = useState(['X', 'X', 'X']);
  const [phonePrefix, setPhonePrefix] = useState(['X', 'X', 'X']);
  const [phoneLine, setPhoneLine] = useState(['X', 'X', 'X', 'X']);

  // Haptics
  const haptic = () => {
    Haptics.selectionAsync();
  };

  const successHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Dropdown Selectors
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
    if (selectorType === 'location') return 'Select Location';
    if (selectorType === 'authorization') return 'Select Authorization';
    return 'Select Option';
  };

  const getOptions = () => {
    if (selectorType === 'location') return LOCATION_OPTIONS;
    if (selectorType === 'authorization') return AUTHORIZATION_OPTIONS;
    return [];
  };

  const selectOption = (value: string) => {
    haptic();
    if (selectorType === 'location') setLocation(value);
    if (selectorType === 'authorization') setAuthorization(value);
    setSelectorVisible(false);
    setSelectorType(null);
  };

  // Phone Selectors
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

  const getPhoneValue = () => {
    if (phoneSelectorType === 'phoneArea') return phoneArea;
    if (phoneSelectorType === 'phonePrefix') return phonePrefix;
    return phoneLine;
  };

  const selectPhoneDigit = (columnIndex: number, value: string) => {
    haptic();
    if (phoneSelectorType === 'phoneArea') {
      const updated = [...phoneArea];
      updated[columnIndex] = value;
      setPhoneArea(updated);
    } else if (phoneSelectorType === 'phonePrefix') {
      const updated = [...phonePrefix];
      updated[columnIndex] = value;
      setPhonePrefix(updated);
    } else if (phoneSelectorType === 'phoneLine') {
      const updated = [...phoneLine];
      updated[columnIndex] = value;
      setPhoneLine(updated);
    }
  };

  const handleCreateProfile = () => {
    if (!name.trim() || !email.trim()) {
      haptic();
      setErrorMessage('*error when saving message*');
      return;
    }
    successHaptic();
    setErrorMessage('');
    router.dismissTo('/Pages/tertiaryprofilemanagement');
  };

  // Bottom Navigation Config
  const navState = {
    index: 2,
    routes: [
      { key: 'scanner', name: 'scanner' },
      { key: 'inventory', name: 'inventory' },
      { key: 'tertiaryprofilemanagement', name: 'tertiaryprofilemanagement' },
    ],
  } as any;

  const navDescriptors = {
    scanner: {
      options: { title: 'QR Scanner', tabBarAccessibilityLabel: 'QR Scanner' },
    },
    inventory: {
      options: { title: 'Inventory', tabBarAccessibilityLabel: 'Inventory' },
    },
    tertiaryprofilemanagement: {
      options: { title: 'Accounts', tabBarAccessibilityLabel: 'Accounts' },
    },
  } as any;

  const navNavigation = {
    emit: () => ({ defaultPrevented: false }),
    navigate: (name: string) => {
      haptic();
      if (name === 'scanner') router.push('/Pages/scanner');
      if (name === 'inventory') router.replace('/Pages/inventory');
      if (name === 'tertiaryprofilemanagement') {
        router.push('/Pages/tertiaryprofilemanagement');
      }
    },
  } as any;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.page,
            { paddingLeft, paddingRight, paddingTop, paddingBottom },
          ]}
        >
          <View style={[styles.pageWidth, { maxWidth: pageMaxWidth }]}>
            {/* Header */}
            <View style={isLandscape ? styles.headerRow : undefined}>
              <Pressable
                onPress={() => {
                  haptic();
                router.dismissTo('/Pages/tertiaryprofilemanagement');                }}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.backText}>‹ Back</Text>
              </Pressable>

              <Text style={[styles.title, isLandscape && styles.titleInRow]}>
                Create Profile
              </Text>

              {isLandscape && <View style={styles.backSpacer} />}
            </View>

            <ScrollView
              style={styles.pageScroll}
              contentContainerStyle={styles.pageContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.boxGlow}>
                <LinearGradient
                  colors={PANEL_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.box,
                    { paddingHorizontal: isSmallScreen ? 10 : 13 },
                  ]}
                >
                  {/* Name */}
                  <View style={styles.field}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Profile Name"
                      placeholderTextColor="#C9CFE9"
                      maxLength={255}
                    />
                  </View>

                  {/* Location & Phone Number */}
                  <View style={isLandscape ? styles.fieldRow : undefined}>
                    <View
                      style={[styles.field, isLandscape && styles.fieldHalf]}
                    >
                      <Text style={styles.label}>Location</Text>
                      <Pressable
                        onPress={() => openSelector('location')}
                        style={({ pressed }) => [
                          styles.selectInput,
                          pressed && styles.selectPressed,
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.selectText,
                            location === 'Location Name' &&
                              styles.placeholderText,
                          ]}
                        >
                          {location}
                        </Text>
                        <Text style={styles.selectArrow}>⌄</Text>
                      </Pressable>
                    </View>

                    <View
                      style={[styles.field, isLandscape && styles.fieldHalf]}
                    >
                      <Text style={styles.label}>Phone Number</Text>
                      <View style={styles.phoneRow}>
                        <Pressable
                          onPress={() => openPhoneSelector('phoneArea')}
                          style={({ pressed }) => [
                            styles.phoneButton,
                            styles.phoneArea,
                            pressed && styles.selectPressed,
                          ]}
                        >
                          <Text style={styles.phoneButtonText}>
                            {phoneArea.join('')}
                          </Text>
                        </Pressable>
                        <Text style={styles.dash}>-</Text>
                        <Pressable
                          onPress={() => openPhoneSelector('phonePrefix')}
                          style={({ pressed }) => [
                            styles.phoneButton,
                            styles.phonePrefix,
                            pressed && styles.selectPressed,
                          ]}
                        >
                          <Text style={styles.phoneButtonText}>
                            {phonePrefix.join('')}
                          </Text>
                        </Pressable>
                        <Text style={styles.dash}>-</Text>
                        <Pressable
                          onPress={() => openPhoneSelector('phoneLine')}
                          style={({ pressed }) => [
                            styles.phoneButton,
                            styles.phoneLine,
                            pressed && styles.selectPressed,
                          ]}
                        >
                          <Text style={styles.phoneButtonText}>
                            {phoneLine.join('')}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {/* Email & Authorization */}
                  <View style={isLandscape ? styles.fieldRow : undefined}>
                    <View
                      style={[styles.field, isLandscape && styles.fieldHalf]}
                    >
                      <Text style={styles.label}>Email Address</Text>
                      <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email Address"
                        placeholderTextColor="#C9CFE9"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        maxLength={255}
                      />
                    </View>

                    <View
                      style={[styles.field, isLandscape && styles.fieldHalf]}
                    >
                      <Text style={styles.label}>Authorization</Text>
                      <Pressable
                        onPress={() => openSelector('authorization')}
                        style={({ pressed }) => [
                          styles.selectInput,
                          pressed && styles.selectPressed,
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.selectText,
                            authorization === 'Authorization' &&
                              styles.placeholderText,
                          ]}
                        >
                          {authorization}
                        </Text>
                        <Text style={styles.selectArrow}>⌄</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Set Password */}
                  <View style={isLandscape ? styles.fieldRow : undefined}>
                    <View
                      style={[styles.field, isLandscape && styles.fieldHalf]}
                    >
                      <Text style={styles.label}>Set Password</Text>
                      <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="#C9CFE9"
                        secureTextEntry
                        autoCapitalize="none"
                        maxLength={255}
                      />
                    </View>
                    {isLandscape && <View style={styles.fieldHalf} />}
                  </View>

                  {Boolean(errorMessage) && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  )}
                </LinearGradient>
              </View>

              {/* Action Button */}
              <View style={styles.saveButton}>
                <GradientButton
                  title="Create"
                  onPress={handleCreateProfile}
                  width="100%"
                  height={50}
                  borderRadius={10}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Persistent Bottom NavBar */}
      <NavBar
        state={navState}
        descriptors={navDescriptors}
        navigation={navNavigation}
        insets={{ top: 0, right: 0, bottom: 0, left: 0 }}
      />

      {/* Custom Selector Sheet Modal */}
      <Modal
        visible={selectorVisible}
        transparent
        animationType="slide"
        onRequestClose={closeSelector}
      >
        <View style={styles.modalBackground}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable style={styles.modalDismiss} onPress={closeSelector} />

          <View
            style={[
              styles.selectorSheet,
              { paddingBottom: 14 + insets.bottom },
            ]}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.selectorTitle}>{getSelectorTitle()}</Text>

            {getOptions().map((option, index) => (
              <Pressable
                key={`${selectorType}-${index}`}
                onPress={() => selectOption(option)}
                style={({ pressed }) => [
                  styles.optionButton,
                  pressed && styles.selectPressed,
                ]}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}

            <Pressable
              onPress={closeSelector}
              style={({ pressed }) => [
                styles.doneButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={['#4263EB', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.doneGradient}
              >
                <Text style={styles.doneText}>Cancel</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Exact Proportional Design Matching Image */}
      <Modal
        visible={phoneSelectorVisible}
        transparent
        animationType="slide"
        onRequestClose={closePhoneSelector}
      >
        <View style={styles.modalBackground}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable style={styles.modalDismiss} onPress={closePhoneSelector} />

          <View
            style={[
              styles.phoneSelectorSheet,
              { paddingBottom: 18 + insets.bottom },
            ]}
          >
            <Text style={styles.phoneSelectorTitle}>Select Phone Number</Text>

            <View style={styles.phonePickerGrid}>
              {getPhoneValue().map((currentVal, colIndex) => (
                <View key={colIndex} style={styles.phoneBoxColumn}>
                  {/* Top Display Value */}
                  <View style={styles.phoneBoxTop}>
                    <Text style={styles.phoneBoxTopText}>{currentVal}</Text>
                  </View>

                  {/* Blue Divider Line */}
                  <View style={styles.phoneBoxDivider} />

                  {/* Scrollable Digit Items */}
                  <ScrollView
                    style={styles.phoneBoxScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {PHONE_DIGITS.map((digit) => {
                      const isSelected = currentVal === digit;
                      return (
                        <Pressable
                          key={digit}
                          onPress={() => selectPhoneDigit(colIndex, digit)}
                          style={styles.phoneDigitRow}
                        >
                          <Text
                            style={[
                              styles.phoneDigitValueText,
                              isSelected && styles.phoneDigitValueSelected,
                            ]}
                          >
                            {digit}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ))}
            </View>

            <Pressable
              onPress={closePhoneSelector}
              style={({ pressed }) => [
                styles.doneButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.doneGradient}
              >
                <Text style={styles.doneText}>Done</Text>
              </LinearGradient>
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
  page: {
    flex: 1,
    alignItems: 'center',
  },
  pageWidth: {
    flex: 1,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    color: '#3B82F6',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
  },
  backSpacer: {
    width: 60,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.pageTitle,
    textAlign: 'center',
    marginVertical: 8,
  },
  titleInRow: {
    marginVertical: 0,
  },
  pageScroll: {
    flex: 1,
  },
  pageContent: {
    paddingBottom: 24,
    gap: 16,
  },
  boxGlow: {
    width: '100%',
    borderRadius: 20,
    shadowColor: '#06184A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
  },
  box: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 20,
    paddingVertical: 18,
    gap: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldHalf: {
    flex: 1,
  },
  field: {
    width: '100%',
    gap: 6,
  },
  label: {
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.label,
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    backgroundColor: '#09091C',
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
    paddingHorizontal: 12,
  },
  selectInput: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    backgroundColor: '#09091C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  selectText: {
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
  },
  placeholderText: {
    color: '#C9CFE9',
  },
  selectArrow: {
    color: '#C9CFE9',
    fontSize: FONT_SIZE.arrow,
  },
  selectPressed: {
    opacity: 0.7,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    backgroundColor: '#09091C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneArea: {
    flex: 3,
  },
  phonePrefix: {
    flex: 3,
  },
  phoneLine: {
    flex: 4,
  },
  phoneButtonText: {
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
  },
  dash: {
    color: '#C9CFE9',
    fontSize: FONT_SIZE.body,
  },
  errorText: {
    color: '#FF4D4D',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.error,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  saveButton: {
    width: '100%',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  selectorSheet: {
    backgroundColor: '#020617',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    padding: 16,
    gap: 12,
  },
  phoneSelectorSheet: {
    backgroundColor: '#030712',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  selectorTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sheetTitle,
    textAlign: 'center',
    marginBottom: 6,
  },
  phoneSelectorTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 20,
    textAlign: 'left',
    marginBottom: 16,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1C2541',
    alignItems: 'center',
  },
  optionText: {
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.body,
  },
  doneButton: {
    height: 42,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 16,
  },
  doneGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  phonePickerGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  phoneBoxColumn: {
    flex: 1,
    height: 180,
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    backgroundColor: '#050B1E',
    overflow: 'hidden',
  },
  phoneBoxTop: {
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050B1E',
  },
  phoneBoxTopText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  phoneBoxDivider: {
    height: 1,
    backgroundColor: '#3B82F6',
    width: '100%',
  },
  phoneBoxScroll: {
    flex: 1,
  },
  phoneDigitRow: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneDigitValueText: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: 13,
  },
  phoneDigitValueSelected: {
    color: '#3B82F6',
    fontFamily: FONT.bold,
  },
});