import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Button,
} from 'react-native';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import NavBar from '../components/NavBar';
import GradientButton from '../../../components/GradientButton';

//const BASE_URL = "https://kemyze.vercel.app/";
const BASE_URL = "http://127.0.0.1:8000/";
const USER_TEST = 49235;

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

type HistoryType =
  | 'Edit'
  | 'Location'
  | 'Quantity'
  | 'SDS'
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
  ' ',
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

export default function Edit_Container() {
  const { container_id } = useLocalSearchParams();
  const router = useRouter();

  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isSmallScreen = width < 430;

  // Modal state

  const [selectorVisible, setSelectorVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [casSelectorVisible, setCasSelectorVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [fieldHistoryVisible, setFieldHistoryVisible] = useState(false);
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

  const [historyFilter, setHistoryFilter] =
    useState('Edit');

  const [fieldHistoryType, setFieldHistoryType] =
    useState<HistoryType>(null);

  // Field state

  const [chemical_name, setChemicalName] =
    useState('Chemical Name');

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

  // Old Field States

  const [old_chemical_name, setOldChemicalName] =
    useState('Chemical Name');

  const [oldQuantity, setOldQuantity] =
    useState('Select Status');

  const [oldAcquisitionDate, setOldAcquisitionDate] =
    useState('YYYY/MM/DD');

  const [oldExpirationDate, setOldExpirationDate] =
    useState('YYYY/MM/DD');

  const [oldLocation, setOldLocation] =
    useState('Location Name');

  const [oldRoom, setOldRoom] =
    useState('XXXX');

  const [oldCabinet, setOldCabinet] =
    useState('XXXX');

  const [oldShelf, setOldShelf] =
    useState('XXXX');

  const [sdsOldLocation, setOldSdsLocation] =
    useState('');


  // CAS state

  const [casFirst, setCasFirst] = useState([
    'X',
    'X',
    'X',
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

  // OLD CAS state


  const [oldCasFirst, setOldCasFirst] = useState([
    'X',
    'X',
    'X',
    'X',
    'X',
    'X',
    'X',
  ]);

  const [oldCasSecond, setOldCasSecond] = useState([
    'Y',
    'Y',
  ]);

  const [oldCasThird, setOldCasThird] = useState([
    'Z',
  ]);

  // Calendar state

  const currentDate = new Date();

  const [calendarMonth, setCalendarMonth] =
    useState(currentDate.getMonth());

  const [calendarYear, setCalendarYear] =
    useState(currentDate.getFullYear());

  // Placeholder data

  const changeLog = [
    {
      Date: '',
      Time: '',
      ContainerID: String(container_id ?? ''),
      User: '',
      Change: 'Edit',
      Old: '',
      New: '',
    },
    {
      Date: '',
      Time: '',
      ContainerID: String(container_id ?? ''),
      User: '',
      Change: 'Location',
      Old: '',
      New: '',
    },
    {
      Date: '',
      Time: '',
      ContainerID: String(container_id ?? ''),
      User: '',
      Change: 'Quantity',
      Old: '',
      New: '',
    },
    {
      Date: '',
      Time: '',
      ContainerID: String(container_id ?? ''),
      User: '',
      Change: 'SDS',
      Old: '',
      New: '',
    },
  ];

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
        'low',
        'medium',
        'high',
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
      return 7;
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

  // History

  const openHistory = () => {
    haptic();
    setHistoryFilter('Edit');
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
      return 'Container Edit History';
    }

    if (fieldHistoryType === 'Location') {
      return 'Location History';
    }

    if (fieldHistoryType === 'Quantity') {
      return 'Quantity History';
    }

    if (fieldHistoryType === 'SDS') {
      return 'SDS History';
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

    if (fieldHistoryType === 'Quantity') {
      return '___ mL';
    }

    if (fieldHistoryType === 'SDS') {
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
    setReviewVisible(false);
      sendEditContainer()
      .then(() => {
          console.log("Save complete");
          setSavedVisible(true);
      })
  };
    
    const sendEditContainer = async () => {
        let data = {
                user_id: USER_TEST,
                container_id: container_id,
            };

        // go through all state variables and add any changes
        if (chemical_name != old_chemical_name) {
            data = {...data, chemical_name: chemical_name}
            }

        if (casFirst!=oldCasFirst | casSecond != oldCasSecond | casThird!= oldCasThird){
            data = {...data, cas_number: casFirst.join('')+"-"+casSecond.join('')+"-"+casThird.join('')}
            }
        
        if (expirationDate != oldExpirationDate){
            data = {...data, expr_date: expirationDate.replaceAll("/","-")}
        }
        
        if (acquisitionDate != oldAcquisitionDate){
            data = {...data, acqn_date: acquisitionDate.replaceAll("/","-")}
        }
        
        if (location!=oldLocation|room!=oldRoom|cabinet!=oldCabinet|shelf!=oldShelf){
            data = {...data,
                location: location,
                room: room,
                cabinet: cabinet,
                shelf: shelf
            }
        }


        try {
            const editURL = BASE_URL + "containers/editContainer"
            console.log("Sending edit URL: " + editURL);
            const response = await fetch(editURL, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok){
              console.log("We are having issues");
              const errorText = await response.text();
              throw new Error("BAD TIME STATUS: " + response.status + "\nError Reason: " + errorText);
            }
            
        } catch (error) {
            console.error('Error sending data:', error);
        }
    }

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

    // Load inital data
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("Test Error Message");
    
    //Initial fetch
    useEffect(() => {
        const getContainer = async () => {
            const getContainerURL = "https://kemyze.vercel.app/containers/getContainer?kemID="+container_id+"&accessLevel=1";
            try {
                console.log(getContainerURL);
                const containerResponse = await fetch(getContainerURL,
                                                      {
                    method: "GET",
                })
                
                if (!containerResponse.ok){
                  console.log("We are having issues");
                  const errorText = await containerResponse.text();
                  throw new Error("BAD TIME STATUS: " + containerResponse.status + "\nError Reason: " + errorText);
                }
                
                const data = await containerResponse.json();
                // Handle data and set all variables
                
                // Field States
                setChemicalName(data.chemical_name);
                setOldChemicalName(data.chemical_name);
                setQuantity(data.quantity);
                setOldQuantity(data.quantity);
                setAcquisitionDate(data.acqn_date.replaceAll("-","/"));
                setOldAcquisitionDate(data.acqn_date.replaceAll("-","/"));
                setExpirationDate(data.expr_date.replaceAll("-","/"));
                setOldExpirationDate(data.expr_date.replaceAll("-","/"));

                
                // Location
                const fullLocation = data.location.split(",");
                if (fullLocation.length < 4) {
                    setLocation(fullLocation[0]);
                    setOldLocation(fullLocation[0]);
                    setRoom(fullLocation[1]);
                    setOldRoom(fullLocation[1]);
                    setCabinet(fullLocation[2]);
                    setOldCabinet(fullLocation[2]);
                    setShelf(fullLocation[3]);
                    setOldShelf(fullLocation[3]);
                } else {
                    let index = fullLocation.length - 1;
                    let locationInput = "";
                    do {
                        locationInput = locationInput + fullLocation[index--];
                    } while (index > 4);
                    setLocation(locationInput);
                    setOldLocation(locationInput);
                    setRoom(fullLocation[index]);
                    setOldRoom(fullLocation[index]);
                    setCabinet(fullLocation[index-1]);
                    setOldCabinet(fullLocation[index-1]);
                    setShelf(fullLocation[index-2]);
                    setOldShelf(fullLocation[index-2]);
                }
                
                // CAS state
                //const casTokens = data.cas_number.split("-");
                const casTokens = "65425-25-4".split("-");
                let casTokenFirst = casTokens[0].split("");
                do {
                    casTokenFirst = ["", ...casTokenFirst];
                } while (casTokenFirst.length<7);
                setCasFirst(casTokenFirst);
                setOldCasFirst(casTokenFirst);
                setCasSecond(casTokens[1].split(""));
                setOldCasSecond(casTokens[1].split(""));
                setCasThird(casTokens[2].split(""));
                setOldCasThird(casTokens[2].split(""));
            } catch (error: any) {
                console.log(error.message);
                setErrorMsg(error.message);
                setLoadError(true);
            } finally {
                setIsLoading(false);
            }
        };
        getContainer();
    }, []);
    
    // Load Location data
    

    // Render Loading Screen
    
    if (isLoading) {
        return(
        <View style={styles.screen}>
          <Stack.Screen
            options={{
              headerShown: false,
            }}
          />
               <View style ={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
               </View>
        </View>
        )
    }
    
    // Rneder Error Screen
    
    if (loadError) {
        return(
        <View style={styles.screen}>
          <Stack.Screen
            options={{
              headerShown: false,
            }}
          />
               <View style = {styles.center}>
               <Text style = {styles.errorText}> Error: {errorMsg} </Text>
               <Button title = "Go Back"
               onPress={() => router.back()}
               />
               </View>
        </View>
        )
    }
    
    
    
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
            Edit Container
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
                  value = {chemical_name}
                  onChangeText = {setChemicalName}
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

          {/* Change Log */}
          <Pressable
            onPress={openHistory}
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
              ContainerID: {String(container_id ?? '__________')}
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

          {/* Container Insights */}
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
            style={
              styles.containerInsights
            }
          >
            <Text
              style={
                styles.containerInsightsTitle
              }
            >
              Container Insights
            </Text>

            <View
              style={
                styles.containerInsightsKpiRow
              }
            >
              {[
                'KPI 1',
                'KPI 2',
                'KPI 3',
                'KPI 4',
              ].map(
                (label) => (
                  <View
                    key={label}
                    style={
                      styles.kpiCard
                    }
                  >
                    <Text
                      style={
                        styles.kpiLabel
                      }
                    >
                      {label}
                    </Text>

                    <Text
                      style={
                        styles.kpiValue
                      }
                    >
                      XX
                    </Text>
                  </View>
                )
              )}
            </View>
          </LinearGradient>
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

      {/* Container history */}

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
                Container History
              </Text>

              <Pressable
                onPress={closeHistory}
                accessibilityRole="button"
                accessibilityLabel="Close Container History"
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
              {[
                'Edit',
                'Location',
                'Quantity',
                'SDS',
              ].map(
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
                          ? 'Container edited'
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
                            : item.Change ===
                                'Quantity'
                              ? '___ mL → ___ mL'
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
                accessibilityLabel="Return to Container History"
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
              Container changes were saved successfully.
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
              No container changes were saved.
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

  importButton: {
    minHeight: 44,
    minWidth: 74,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#3B82F6',
    borderWidth: 1,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  importText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.button,
    lineHeight: 20,
  },

  saveButton: {
    width: '100%',
    height: 50,
    marginTop: 8,
  },

  saveButtonPressed: {
    opacity: 0.86,
    transform: [
      {
        scale: 0.995,
      },
    ],
  },

  saveText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.button,
    lineHeight: 20,
    zIndex: 2,
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

  containerInsights: {
    width: '100%',
    marginTop: 6,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(33, 142, 255, 0.5)',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 9,
    overflow: 'hidden',
    backgroundColor: 'rgba(1, 8, 37, 0.74)',
  },

  containerInsightsTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.sectionTitle,
    lineHeight: 22,
    marginBottom: 6,
  },

  containerInsightsKpiRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 6,
  },

  kpiCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 7,
    paddingVertical: 5,
    justifyContent: 'center',
  },

  kpiLabel: {
    color: '#C9CFE9',
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.metadata,
    lineHeight: 15,
  },

  kpiValue: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.largeValue,
    lineHeight: 23,
    marginTop: 1,
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
    minWidth: 32,
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
    
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  errorText: {
    color: 'red',
    fontSize: 16
  },
});
