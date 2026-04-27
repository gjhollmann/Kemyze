// import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera'
// import { useEffect, useState } from 'react';
// import { View, Text, Alert, SafeAreaView, StyleSheet } from 'react-native';

// export default function Scanner() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [scanned, setScanned] = useState(false);
//   const [scannedData, setScannedData] = useState<string | null>(null);

//   useEffect(() => {
//     if (permission && permission.status === 'undetermined') {
//       requestPermission();
//     }
//   }, [permission]);

//   const validateQRCode = (qrData: string): boolean => {
//     // checking if data is non-empty for now as a placeholder
//     return qrData.trim().length > 0;
//   };

//   const handleValidQRCode = (qrData: string) => {
//     // should fetch containerID from here
//     console.log('Valid QR Code:', qrData);
//   };


//   const handleInvalidQRCode = () => {
//     // invalid qr code or container id not found
//     console.log('Container ID not found for QR Code');
//   };

//   const handleBarCodeScanned = ({ data }: { data: string }) => {
//     if (!scanned) {
//       setScanned(true);
//       setScannedData(data);

//       const isValid = validateQRCode(data);

//       if (isValid) {
//         handleValidQRCode(data);
        
//         Alert.alert(
//           'QR Code Scanned, retrieving containerID',
//           `Data: ${data}`,
//           [
//             {
//               text: 'Scan Another',
//               onPress: () => setScanned(false),
//             },
//           ]
//         );
//       } else {
//         handleInvalidQRCode();
//         Alert.alert(
//           'Invalid QR Code',
//           'The QR code could not be read. Please try again.',
//           [
//             {
//               text: 'Scan Again',
//               onPress: () => setScanned(false),
//             },
//           ]
//         );
//       }
//     }
//   };

//   if (!permission) {
//     // Permission is still loading
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.backgroundGradient}>
//           <Text style={{ color: 'white', textAlign: 'center' }}>Loading camera permission...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (permission.status == 'granted') {
//     // Permission denied
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.backgroundGradient}>
//           <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
//             Camera permission is required to scan QR codes. Please enable camera access in your device settings.
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.backgroundGradient}>
//         <Text style={styles.QRScannerTitle}>Quick Scan</Text>
//         <View style={styles.CameraBox}>
//           /*
//           <CameraView
//             style={{ flex: 1 }}
//             facing="back"
//             onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
//             barcodeScannerSettings={{
//               barcodeTypes: ['qr'],
//             }}
//           />
//            */
//         </View>
//         <Text style={styles.QRScannerInstructions}>
//           Scan a QR label to view the Safety Data Sheet (SDS)
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// }

//   const styles = StyleSheet.create({
//     safeArea: {
//       flex: 1,
//       backgroundColor: "#020617",
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     backgroundGradient: {
//       width: "100%",
//       height: "100%",
//       justifyContent: "center",
//       experimental_backgroundImage:
//         "linear-gradient(to left, #09091C 0%, #131338 33%, #131338 66%, #09091C 100%)",
//     },
//     CameraBox: {
//       width: 250,
//       height: 250,
//       backgroundColor: "black",
//       borderRadius: 10,
//       borderLeftWidth: 3,
//       borderLeftColor: "#63C8DF",
//       borderRightWidth: 3,
//       borderRightColor: "#63C8DF",
//       overflow: "hidden",
//       alignSelf: "center",
//       marginTop: 40,
//     },
//     QRScannerTitle: {
//       fontSize: 24,
//       color: "#FFFFFF",
//       fontFamily: "JetBrains Mono",
//       textAlign: "center",
//       marginBottom: 8,
//     },
//     QRScannerInstructions: {
//       color: "#FFFFFF",
//       fontFamily: "JetBrains Mono",
//       textAlign: "center",
//       marginTop: 40,
//     }
//   });