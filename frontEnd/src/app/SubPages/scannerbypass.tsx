import {
  Image,
  ScrollView,
  Text,
  useWindowDimensions,
  Alert,
  View,
  StyleSheet,
  TextInput,
  Platform,
  Pressable,
} from "react-native";
import { CameraView, useCameraPermissions} from 'expo-camera'
import { useEffect, useState, useRef } from 'react';
import { ScanPopup } from "../../../components/ScanPopup";
import { handleContainerResponse } from "../../../utils/ScanResUtils";
import { openBase64Pdf } from "../../../utils/PDFUtils";
import { Linking } from "react-native";
import GradientButton from "../../../components/GradientButton";
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScannerBypass() {
  const router = useRouter();
  // Read-only access level for bypassing scanner.
  const BYPASS_ACCESS_LEVEL = 5;
  //Constanst for popup
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);
  const [currentKemId, setCurrentKemId] = useState<string | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const lastScannedTimestampRef = useRef(0);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const isShort = isLandscape && height < 600;

  const paddingLeft = Math.max(isLandscape ? 24 : 22, insets.left + 8);
  const paddingRight = Math.max(isLandscape ? 24 : 22, insets.right + 8);
  const paddingTop = insets.top + (isLandscape ? 8 : 12);
  const paddingBottom = insets.bottom + 12;
  const cameraSize = isShort ? Math.min(250, height * 0.6) : 250;

  const haptic = () => {
    Haptics.selectionAsync();
  };

  const header = (
    <View style={isLandscape ? styles.headerRow : undefined}>
      <Pressable
        onPress={() => {
          haptic();
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
      >
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <Text style={[styles.QRScannerTitle, isLandscape && styles.titleInRow]}>
        Quick Scan
      </Text>

      {isLandscape && <View style={styles.backSpacer} />}
    </View>
  );

  function delay(time) {
    return new Promise(function (resolve, reject) {
      setTimeout(() => resolve(), time);
    });
  }

  useEffect(() => {
    if (permission && permission.status === 'undetermined') {
      requestPermission();
    }
  }, [permission]);

  const validateQRCode = (qrData: string): boolean => {
    // checking if data is non-empty for now as a placeholder
    return qrData.trim().length > 0;
  };

  const handleValidQRCode = async (qrData: string) => {
    // should fetch containerID from here
    await fetchContainerData(qrData);
    console.log('Valid QR Code:', qrData);
  };


  const handleInvalidQRCode = () => {
    // invalid qr code or container id not found
    console.log('Container ID not found for QR Code');
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    const timestamp = Date.now();
    if (scanned || (timestamp - lastScannedTimestampRef.current < 2000)) {
      return
    }
    lastScannedTimestampRef.current = timestamp;
    setTimeout(async () => {
      if (!scanned) {
        setScanned(true);
        setScannedData(data);
        const isValid = validateQRCode(data);

        if (isValid) {

          setCurrentKemId(data);
          handleValidQRCode(data);

          Alert.alert(
            'QR Code Scanned, retrieving containerID',
            `Data: ${data}`,
            [
              {
                text: 'Ok',
                onPress: () => setScanned(false),
              },
            ]
          );
        } else {
          handleInvalidQRCode();
          Alert.alert(
            'Invalid QR Code',
            'The QR code could not be read. Please try again.',
            [
              {
                text: 'Scan Again',
                onPress: () => setScanned(false),
              },
            ]
          );
        }
      }
    }, 500);
  };

  const permissionScreen = (message: string) => (
    <View style={styles.safeArea}>
      <View
        style={[
          styles.backgroundGradient,
          { paddingLeft, paddingRight, paddingTop, paddingBottom },
        ]}
      >
        <View style={[styles.pageWidth, { maxWidth: isLandscape ? 980 : 520 }]}>
          {header}

          <View style={styles.centerMessage}>
            <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
              {message}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )

  if (!permission) {
    // Permission is still loading
    return permissionScreen('Loading camera permission...');
  }

  if (permission.status !== 'granted') {
    // Permission denied
    return permissionScreen(
      'Camera permission is required to scan QR codes. Please enable camera access in your device settings.'
    );
  }

  const showPopup = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const fetchContainerData = async (kemID= currentKemId) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const getContainerUrl = "https://kemyze.vercel.app/containers/getContainer?kemID=" + kemID + "&accessLevel=" + BYPASS_ACCESS_LEVEL;
    try {
      console.log(getContainerUrl);
      const containerResponse = await fetch(getContainerUrl,
        {
          method: "GET",
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // Alert if kemID or kemID and accessLevel are missing.
      if (!containerResponse.ok) {
        showPopup("Error", "The container does not exist or the request was invalid.");
        return;
      }

      const data = await containerResponse.json();
      const result = handleContainerResponse(data);

      if (result.resType === "invalid") {
        showPopup("Invalid Information", result.message);

      } else if (result.resType === "sds_only") {
        await openBase64Pdf(result.pdfBase64);

      } else if (result.resType === "all_info") {
        setPopupData(result.popupData);
        setCurrentKemId(result.popupData.id);
        setPopupVisible(true);

      } else {
        showPopup("Error", "Unexpected response.");

      }

    } catch (error: any) {
      if (error.name === "AbortError") {
        showPopup("Request timed out", "The server took too long to respond.");

      } else if (error instanceof SyntaxError) {
        showPopup("Invalid response", "The server returned malfomed data.");

      } else {
        showPopup("Network error", "Unable to reach server.");

      }
    } // try ...
  }

  // Respond to press on 'View SDS.'
  const handleViewSds = async () => {
    if (!currentKemId) {
      showPopup("Error", "No container ID is available for this SDS.");
      return;
    }

    const sdsUrl = 'https://kemyze.vercel.app/containers/getSDS?kemID=' + currentKemId; // Use current passed container ID.

    try {
      await Linking.openURL(sdsUrl);
    } catch {
      showPopup("Error", "Unable to open the SDS.");
    }
  };

  return (
    <View style={styles.safeArea}>
      <View
        style={[
          styles.backgroundGradient,
          { paddingLeft, paddingRight, paddingTop, paddingBottom },
        ]}
      >
        <View style={[styles.pageWidth, { maxWidth: isLandscape ? 980 : 520 }]}>
          {header}

          <ScrollView
            contentContainerStyle={[styles.content, isShort && styles.contentLandscape]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={isShort ? styles.cameraColumn : undefined}>
              <View style={[styles.CameraBox, { width: cameraSize, height: cameraSize }]}>
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                />
              </View>
            </View>

            <View style={isShort ? styles.controlsColumn : undefined}>
              <Text style={styles.QRScannerInstructions}>
                Scan a QR label to view the Safety Data Sheet (SDS)
              </Text>

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={currentKemId}
                    onChangeText={setCurrentKemId}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
              </View>

              <View style={styles.buttonWrapper}>
                <GradientButton title="Search" onPress={() => fetchContainerData()} width="100%" />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <ScanPopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        scanResult={popupData}
        editPrivilege={false}
        onViewSds={handleViewSds}
      />
    </View>
  );
}

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#020617",
      justifyContent: "center",
      alignItems: "center",
    },
    backgroundGradient: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      experimental_backgroundImage:
        "linear-gradient(to left, #09091C 0%, #131338 33%, #131338 66%, #09091C 100%)",
    },
    CameraBox: {
      width: 250,
      height: 250,
      backgroundColor: "black",
      borderRadius: 10,
      borderLeftWidth: 3,
      borderLeftColor: "#63C8DF",
      borderRightWidth: 3,
      borderRightColor: "#63C8DF",
      overflow: "hidden",
      alignSelf: "center",
      marginTop: 0,
    },

    buttonPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },



    QRScannerTitle: {
      fontSize: 24,
      color: "#FFFFFF",
      fontFamily: "JetBrains Mono",
      textAlign: "center",
      marginBottom: 8,
    },

    input: {
      color: "white",
      fontSize: 16,
      height: "100%",
    },
    inputGroup: {
      marginBottom: 20,
    },

    pageWidth: {
      flex: 1,
      width: '100%',
      alignSelf: 'center'
    },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6
    },

    backSpacer: {
      width: 60
    },
    titleInRow: {
      flex: 1,
      marginBottom: 0
    },

    content: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 16
    },

    contentLandscape: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 24
    },

    cameraColumn: {
      alignItems: 'center'
    },

    controlsColumn: {
      flex: 1
    },

    backButton: {
      minHeight: 44,
      justifyContent: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 2
    },

    backText: { 
      color: '#3B82F6', 
      fontFamily: 'JetBrains Mono', 
      fontSize: 14, lineHeight: 20 
    },
      
    QRScannerInstructions: { color: '#FFFFFF', 
      fontFamily: 'JetBrains Mono', 
      textAlign: 'center', marginTop: 24, marginBottom: 20 
    },

    inputWrapper: { height: 50, 
      width: '100%', 
      maxWidth: 360, 
      alignSelf: 'center', 
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      borderRadius: 25, 
      borderWidth: 1, 
      borderColor: '#334155', 
      justifyContent: 'center', 
      paddingHorizontal: 20 },

    buttonWrapper: { 
      alignSelf: 'center', 
      justifyContent: 'center', 
      width: '100%', maxWidth: 360
    },

    centerMessage: {
      flex: 1,
      justifyContent: 'center',
    },

    });
