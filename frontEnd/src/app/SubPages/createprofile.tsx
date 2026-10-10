import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserState } from '../../app/contexts/UserState'; // Shared-state import for user state.


import NavBar from '../components/NavBar';
import GradientButton from '../../../components/GradientButton';

const BASE_URL = "http://127.0.0.1:8000/";
const USER_TEST = 49035; // replace with active user ID (KM#85)
const USER_ACCESS = 1;
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
    const { activeUser } = useUserState(); // Insert active user.
    
    // Invoke useEffect to prevent active user state from flooding console.
    useEffect(() => {
      console.log("Active user:", activeUser); // Additional console check for active user.
    }, [activeUser]);

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
  const [newLocationVisible, setNewLocationVisible] = useState(false);
  const [newLocationLoading, setNewLocationLoading] = useState(false);
  const [newLocationError, setNewLocationError] = useState(false);
  const [newLocationSuccess, setNewLocationSuccess] = useState(true);

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

  const [isNewLocationVisible, setIsNewLocationVisible] = useState(false);
  const [newLocation, setNewLocation] = useState('');
    
    const [locationOptionsVisible, setLocationOptionsVisible] = useState(false);

  // Password State
  const [passIsSecure, setPassIsSecure] = useState(true);
    
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



  // State Variables for Options that are dynamic

      const [locationOptions, setLocationOptions] = useState([
          'X',
          'X',
          'X',
          'X',
          'X',
          'X',
          'X',
        ]);


  const getOptions = () => {
    if (selectorType === 'location') return locationOptions;
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

    // Required Notifier States
    const [nameRequired, setNameRequired] = useState(false);
    const [locationRequired, setLocationRequired] = useState(false);
    const [emailRequired, setEmailRequired] = useState(false);
    const [authRequired, setAuthRequired] = useState(false);
    const [passRequired, setPassRequired] = useState (false);
    const [isSavingUser, setIsSavingUser] = useState(false);
    const [savingUserLoading, setSavingUserLoading] = useState(true);
    const [saveUserError, setSaveUserError] = useState(false);
    const [saveUserSuccess, setSaveUserSuccess] = useState(false);
    const [readyToSave, setReadyToSave] = useState(false);
    
    useEffect(() => {
        if (nameRequired || emailRequired || locationRequired || authRequired || passRequired){
            setReadyToSave(false);
        } else {
            setReadyToSave(true);
        }
    }, [nameRequired, locationRequired, emailRequired, authRequired, passRequired]);
    
    useEffect(() => {
        if (!name.trim()) {
            setNameRequired(true);
        } else {
            setNameRequired(false);
        }
    },[name]);
    useEffect(() => {
        if (!location.trim()) {
            setLocationRequired(true);
        } else {
            setNameRequired(false);
        }
    },[location]);
    useEffect(() => {
        if (!email.trim()) {
            setEmailRequired(true);
        } else {
            setEmailRequired(false);
        }
    },[email]);
    useEffect(() => {
        if (!authorization.trim()) {
            setAuthRequired(true);
        } else {
            setAuthRequired(false);
        }
    },[authorization]);
    useEffect(() => {
        if (!password.trim()) {
            setPassRequired(true);
        } else {
            setPassRequired(false);
        }
    },[password]);
    // Save Modal Handlers
    
    
    const closeSaveModal = () => {
        haptic();
        setIsSavingUser(false);
        setSavingUserLoading(true);
        setSaveUserError(false);
        setSaveUserSuccess(false);
      };
    
    const closeNewUser = () => {
        router.dismissTo('/Pages/tertiaryprofilemanagement');
    }
    
  const handleCreateProfile = () => {
      if (isSavingUser) {
        return;
      }
      setSavingUserLoading(true);
      if (!readyToSave){
        setIsSavingUser(false);
          setErrorMessage("*missing requirements above*");
          return;
      } else {
          sendAddUser()
          .then(() => {
              console.log("Save User complete");
          })
      }
    successHaptic();
  };
    const sendAddUser = async () => {
        setIsSavingUser(true);
        setErrorMessage("");
        let data = {
            user_id: activeUser?.userID,
            name: name,
            location: location,
            email: email,
            authorization: authorization,
            password: password,
            phone: phoneArea.join('')+phonePrefix.join('')+phoneLine.join('')
        };
        
        try {
          const addURL = BASE_URL + "login/addUser"
          let now = new Date();
          let formattedTime = now.toLocaleTimeString();
          console.log("${formattedTime} Sending add User URL: " + addURL);
          const response = await fetch(addURL, {
              method: 'POST',
              headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
              });

          if (!response.ok){
              now = new Date();
              formattedTime = now.toLocaleTimeString();
              console.log("${formattedTime} We are having issues");
              const errorText = await response.text();
              throw new Error("BAD TIME STATUS: " + response.status + "\nError Reason: " + errorText);
              }
          } catch (error) {
              console.error('Error sending data:', error);
              setErrorMsg(error?.message ?? "Unknown error");
              setSaveUserError(true);
          } finally {
              setSaveUserSuccess(true);
              setSavingUserLoading(false);
          }
    }
  // Add Location modal handlers
    

  const showAddNewLocation = () => {
        haptic();
        closeSelector();
        setNewLocationVisible(true);
  };

    const closeNewLocation = () => {
        haptic();
        setNewLocationVisible(false);
        openSelector(
          'location'
        )
      };

      useEffect(() => {
          if(newLocationVisible == false){
              setNewLocationLoading(false);
              setNewLocationError(false);
              setNewLocationSuccess(false);
          }
      }, [newLocationVisible]);

  const addNewLocation = async () => {
        setNewLocationLoading(true);
        let data = {
                        user_id: activeUser?.userID,
                        new_location: newLocation,
        };
        try {
          const editURL = BASE_URL + "containers/addLocation"
          let now = new Date();
          let formattedTime = now.toLocaleTimeString();
          console.log("${formattedTime} Sending add location URL: " + editURL);
          const response = await fetch(editURL, {
              method: 'POST',
              headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
              });

          if (!response.ok){
              now = new Date();
              formattedTime = now.toLocaleTimeString();
              console.log("${formattedTime} We are having issues");
              const errorText = await response.text();
              throw new Error("BAD TIME STATUS: " + response.status + "\nError Reason: " + errorText);
              }
          } catch (error) {
              console.error('Error sending data:', error);
              setErrorMsg(error?.message ?? "Unknown error");
              setNewLocationError(true);
          } finally {
              setNewLocationLoading(false);
              setNewLocationSuccess(true);
              loadLocationOptions();
          }
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

// Load inital data
      const [isLoading, setIsLoading] = useState(true);
      const [loadError, setLoadError] = useState(false);
      const [errorMsg, setErrorMsg] = useState("Test Error Message");

  //Initial fetch
      useEffect(() => {
          checkUser();
      }, []);

      const checkUser = async() => {
          if(activeUser?.accessLevel <= 1){
              setIsNewLocationVisible(true);
          }
          if(activeUser?.accessLevel <= 2){
              setLocationOptionsVisible(true);
          }
          }

  //Load location data
  useEffect(() => {
          if (location !== null){
              loadLocationOptions();
          }
      }, [location]);

      const loadLocationOptions = async () => {
          const parameters = '';
          const data = await loadVarLocationOptions(parameters);
          setLocationOptions(data.map(item => item.name));
      }


      const loadVarLocationOptions = async (parameters) => {
          const getLocationChildrenURL = BASE_URL + "containers/getLocationChildren?"+parameters;
          try{
              const response = await fetch(getLocationChildrenURL,{method: "GET",});
              if (!response.ok){
                  console.log("We are having issues");
                  const errorText = await response.text();
                  throw new Error("BAD TIME STATUS: " + response.status + "\nError Reason: " + errorText);
              }
              let data = await response.json();
              if (data && Object.keys(data).length === 0){
                  console.log("Possible Error, location data was empty.\nURL: "+getLocationChildrenURL+"\nData: "+data+"\nSetting data to empty state");
                  data = [{
                      name: "No locations found",
                  }];
              }
              return data;
          } catch (error: any) {
              console.log(error.message);
              setErrorMsg(error.message);
              setLoadError(true);
          }
      }



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
          {locationOptionsVisible ? (<Pressable
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
                                     </Pressable>) : (<View
                                                      style={
                                         styles.locationDefault
                                     }
                                                      >
                                                      <Text
                                                      numberOfLines={1}
                                                      style={
                                         styles.selectText
                                     }
                                                      >
                                                      {location}
                                                      </Text>
                                                      
                                                      </View>)
          
          }
          <View style={{padding:5}}></View>
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
                  <View style={isLandscape ? styles.fieldRow : styles.fieldRow}>
                    <View
                      style={[styles.field, isLandscape && styles.fieldHalf]}
                    >
          
                      <Text style={styles.label}>Set Password</Text>
          <View style = {styles.passRow} >
          <View style={{width : '90%'}}>
                      <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="#C9CFE9"
                        secureTextEntry={passIsSecure}
                        autoCapitalize="none"
                        maxLength={255}
                      />
          </View>
          <Pressable
                  style={styles.iconContainer}
                  onPress={() => setPassIsSecure(!passIsSecure)} // Toggles state
                >
                  <MaterialCommunityIcons
                    name={passIsSecure ? 'eye-off' : 'eye'}
                    size={22}
                    color="#666"
                  />
                </Pressable>
          </View>
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

        {
                    isNewLocationVisible && selectorType == 'location' && (
                            <Pressable
                                          onPress={showAddNewLocation}
                                          accessibilityRole="button"
                                          accessibilityLabel="Create New Location"
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
                                            Add New Location
                                          </Text>
                                        </Pressable>
                        )
                    }

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




      {/* New Location */}

            <Modal
              visible={newLocationVisible}
              transparent
              animationType="fade"
              onRequestClose={
                closeNewLocation
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

                {newLocationError && (
                    <View style={styles.confirmCard}>
                    <Text style={styles.confirmTitle}>
                        Error creating new location.
                    </Text>
                    <View style={{padding:10}}></View>
                    <Text style ={styles.errorText}>
                    {errorMsg}
                    </Text>
                    <View style={{padding:10}}></View>
                    <Pressable
                        onPress={closeNewLocation}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel Add Location"
                        style={({ pressed }) => [
                            styles.confirmButton,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                    <LinearGradient
                        colors={['#0026E4', '#00C8FF', '#0026E4', '#00C8FF', '#0026E4']}
                        locations={[0, 0.35, 0.56, 0.89, 1]}
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
                        Go Back
                        </Text>
                    </Pressable>
                    </View>
                )}

                { newLocationSuccess && !newLocationError && (
                    <View style={styles.confirmCard}>
                        <Text style={styles.confirmTitle}>
                                                New Location Successfully Added
                                            </Text>
                                            <View style={{padding:5}}></View>
                        <Pressable
                            onPress={closeNewLocation}
                            accessibilityRole="button"
                            accessibilityLabel="Button to leave new Location"
                            style={({ pressed }) => [
                                styles.confirmButton,
                                pressed &&
                                styles.buttonPressed,
                            ]}
                            >
                                                              <LinearGradient
                                                                      colors={['#0026E4', '#00C8FF', '#0026E4', '#00C8FF', '#0026E4']}
                                                                      locations={[0, 0.35, 0.56, 0.89, 1]}
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
                                                                Go Back
                                                              </Text>
                                                            </Pressable>
                    </View>
                    )

                }
                {newLocationLoading && !newLocationError && (
                    <View style={styles.confirmCard}>
                        <View style={styles.loadingIndicator}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                        <Pressable
                            onPress={closeNewLocation}
                            accessibilityRole="button"
                            accessibilityLabel="Cancel Add Location in load"
                            style={({ pressed }) => [
                                styles.confirmButton,
                                pressed &&
                                styles.buttonPressed,
                            ]}
                            >
                                                              <LinearGradient
                                                                      colors={['#0026E4', '#00C8FF', '#0026E4', '#00C8FF', '#0026E4']}
                                                                      locations={[0, 0.35, 0.56, 0.89, 1]}
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
                                                                Cancel
                                                              </Text>
                                                            </Pressable>
                    </View>
                    )}

                {!newLocationError && !newLocationLoading && !newLocationSuccess &&(
                    <View style={styles.confirmCard}>
                    <Text style={styles.confirmTitle}>
                        Type in location name:
                    </Text>
                    <View style={{padding:5}}></View>
                    <TextInput
                        style={styles.input}
                        placeholder="New Location"
                        placeholderTextColor="#C9CFE9"
                        accessibilityLabel="New Location Input"
                        value = {newLocation}
                        onChangeText = {setNewLocation}
                        maxLength={255}
                    />
                    <View style={{padding:10}}></View>
                    <Pressable
                        onPress={addNewLocation}
                        accessibilityRole="button"
                        accessibilityLabel="Add New Location"
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
                      Add Location
                    </Text>
                  </Pressable>
                  <View style={{padding:2}}></View>
                  <Pressable
                                      onPress={
                                        closeNewLocation
                                      }
                                      accessibilityRole="button"
                                      accessibilityLabel="Cancel Add Location"
                                      style={({ pressed }) => [
                                        styles.confirmButton,
                                        pressed &&
                                          styles.buttonPressed,
                                      ]}
                                    >
                                      <LinearGradient
                                              colors={['#0026E4', '#00C8FF', '#0026E4', '#00C8FF', '#0026E4']}
                                              locations={[0, 0.35, 0.56, 0.89, 1]}
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
                                        Cancel
                                      </Text>
                                    </Pressable>
                                    </View>
                                    )}
              </View>
            </Modal>
          
          {/* Save User Modal */}

                <Modal
                  visible={isSavingUser}
                  transparent
                  animationType="fade"
                  onRequestClose={
                    closeSaveModal
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

                    {saveUserError && (
                        <View style={styles.confirmCard}>
                        <Text style={styles.confirmTitle}>
                            Error creating new User
                        </Text>
                        <View style={{padding:10}}></View>
                        <Text style ={styles.errorText}>
                        {errorMsg}
                        </Text>
                        <View style={{padding:10}}></View>
                        <Pressable
                            onPress={closeSaveModal}
                            accessibilityRole="button"
                            accessibilityLabel="Close Save Error"
                            style={({ pressed }) => [
                                styles.confirmButton,
                                pressed && styles.buttonPressed,
                            ]}
                        >
                        <LinearGradient
                            colors={['#0026E4', '#00C8FF', '#0026E4', '#00C8FF', '#0026E4']}
                            locations={[0, 0.35, 0.56, 0.89, 1]}
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
                            Go Back
                            </Text>
                        </Pressable>
                        </View>
                    )}

                    { saveUserSuccess && !saveUserError && (
                        <View style={styles.confirmCard}>
                            <Text style={styles.confirmTitle}>
                                                                  New User Successfully Added
                                                </Text>
                                                <View style={{padding:5}}></View>
                            <Pressable
                                onPress={closeNewUser}
                                accessibilityRole="button"
                                accessibilityLabel="Button to leave User Success"
                                style={({ pressed }) => [
                                    styles.confirmButton,
                                    pressed &&
                                    styles.buttonPressed,
                                ]}
                                >
                                                                  <LinearGradient
                                                                          colors={['#0026E4', '#00C8FF', '#0026E4', '#00C8FF', '#0026E4']}
                                                                          locations={[0, 0.35, 0.56, 0.89, 1]}
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
                                                                    Go Back
                                                                  </Text>
                                                                </Pressable>
                        </View>
                        )

                    }
                    {isSavingUser && !saveUserError && !saveUserSuccess && (
                        <View style={styles.confirmCard}>
                            <View style={styles.loadingIndicator}>
                            <ActivityIndicator size="large" color="#0000ff" />
                            </View>
                                                        <View style={{padding:5}}></View>
                                                        <Text style={styles.confirmTitle}>
                                                                                              Adding New User
                                                                            </Text>
                                                                            
                        </View>
                        )}
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
    passRow: {
      flexDirection: 'row',
      alignItems: 'center',
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
confirmBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
    
      locationDefault: {
        width: '100%',
        minHeight: 44,
        borderWidth: 1,
        borderColor: '#223044',
        borderRadius: 9,
        backgroundColor: '#02021C',
        justifyContent: 'center',
        paddingHorizontal: 8,
      },
    iconContainer: {
        padding: 5,
      },
});
