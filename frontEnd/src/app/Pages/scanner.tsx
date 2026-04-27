import {
  Image,
  ScrollView,
  Text,
  useWindowDimensions,
  Alert,
  View,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera'
import { useEffect, useState } from 'react';
import { ScanPopup } from "../../../components/ScanPopup";
import { handleContainerResponse } from "../../../utils/ScanResUtils";
import { openBase64Pdf } from "../../../utils/PDFUtils";
import { Linking } from "react-native";
import GradientButton from "../../../components/GradientButton";

export default function Scanner() {
    
    //Constanst for popup
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupData, setPopupData] = useState<any>(null);
    const [editPrivilege, setEditPrivilege] = useState(false);
    const [currentKemId, setCurrentKemId] = useState<string | null>(null);
    const [scannedKemID, setScannedKemId] = useState(0);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  useEffect(() => {
    if (permission && permission.status === 'undetermined') {
      requestPermission();
    }
  }, [permission]);

  const validateQRCode = (qrData: string): boolean => {
    // checking if data is non-empty for now as a placeholder
    return qrData.trim().length > 0;
  };

  const handleValidQRCode = (qrData: string) => {
    // should fetch containerID from here
    console.log('Valid QR Code:', qrData);
  };


  const handleInvalidQRCode = () => {
    // invalid qr code or container id not found
    console.log('Container ID not found for QR Code');
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      setScannedData(data);

      const isValid = validateQRCode(data);

      if (isValid) {
        handleValidQRCode(data);
        
        Alert.alert(
          'QR Code Scanned, retrieving containerID',
          `Data: ${data}`,
          [
            {
              text: 'Scan Another',
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
  };

  if (!permission) {
    // Permission is still loading
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.backgroundGradient}>
          <Text style={{ color: 'white', textAlign: 'center' }}>Loading camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (permission.status == 'granted') {
    // Permission denied
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.backgroundGradient}>
          <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
            Camera permission is required to scan QR codes. Please enable camera access in your device settings.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
    
    const showPopup = (title: string, message: string) => {
      if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`);
      } else {
        Alert.alert(title, message);
      }
    };

    // Helper to ensure users of access level <= 4 can edit info.
    const quaternaryUser = 4;
    
    const canEditFromAccessLevel = (accessLevel: number) => {
      return accessLevel <= quaternaryUser;
    };

    const fetchContainerData = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Test with access level matched to query.
      let quinaryUser = 5;
      let accessLevel = 5;
      let canEdit = canEditFromAccessLevel(accessLevel);
      const getContainerUrl = "https://kemyze.vercel.app/containers/getContainer?kemID="+currentKemId+"&accessLevel=1";
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
              setEditPrivilege(false);
              showPopup("Invalid Information", result.message);
          
          } else if (result.resType === "sds_only") {
              setEditPrivilege(false);
              await openBase64Pdf(result.pdfBase64);
          
          } else if (result.resType === "all_info") {
              setPopupData(result.popupData);
              setCurrentKemId(result.popupData.id);
              setEditPrivilege(canEdit);
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

      const sdsUrl = 'https://kemyze.vercel.app/containers/getSDS?kemID='+currentKemId; // Use current passed container ID.

      try {
        await Linking.openURL(sdsUrl);
      } catch {
        showPopup("Error", "Unable to open the SDS.");
      }
    };
    
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGradient}>
        <Text style={styles.QRScannerTitle}>Quick Scan</Text>
        <View style={styles.CameraBox}>
          /*
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
           */
        </View>
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
          <View style= {styles.buttonWrapper}>
            <GradientButton title="Search" onPress={fetchContainerData} width="100%"/>
          </View>
      </View>
          <ScanPopup
            visible={popupVisible}
            onClose={() => setPopupVisible(false)}
            scanResult={popupData}
            editPrivilege={editPrivilege}
            onViewSds={handleViewSds}
          />
    </SafeAreaView>
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
      marginTop: 40,
    },
    QRScannerTitle: {
      fontSize: 24,
      color: "#FFFFFF",
      fontFamily: "JetBrains Mono",
      textAlign: "center",
      marginBottom: 8,
    },
      inputWrapper: {
        height: 50,
        width: "75%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#334155",
        alignSelf: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
      },
      input: {
        color: "white",
        fontSize: 16,
        height: "100%",
      },
      inputGroup: {
        marginBottom: 20,
      },
    QRScannerInstructions: {
      color: "#FFFFFF",
      fontFamily: "JetBrains Mono",
      textAlign: "center",
      marginTop: 40,
    },
      buttonWrapper: {
          alignSelf: "center",
          justifyContent: "center",
          width: "100%"
      }
  });
