import React, { useCallback, useState, useEffect } from 'react';
import {
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Platform,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator
} from "react-native";
import { useRouter } from 'expo-router';
import { QRLabelPopup } from '../../../components/QRLabelPopup';
import * as DocumentPicker from 'expo-document-picker';

interface Chemical {
  container_id?: string;
  chemical_name?: string;
  cas_number?: string;
  location?: string;
  quantity?: string;
  hasWarning?: boolean;
  sds_document?: string;
}

const BASE_URL = "https://kemyze.vercel.app/";

// const USER_TEST = 49035; // replace with actual user ID (KM#85)

const Inventory: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showLow, setShowLow] = useState(false);

  // Modal display toggle state
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // Add Container Form States
  const [name, setName] = useState('');
  const [casX, setCasX] = useState('');
  const [casY, setCasY] = useState('');
  const [casZ, setCasZ] = useState('');
  const [containerQuantity, setContainerQuantity] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const [room, setRoom] = useState('');
  const [cabinet, setCabinet] = useState('');
  const [shelf, setShelf] = useState('');
  const [sdsFileLocation, setSdsFileLocation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // SDS upload states
  const [sdsFile, setsdsFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [sdsBase64, setSdsBase64] = useState('');
  const [sdsUploaded, setSdsUploaded] = useState(false);
  const [isSDSUploading, setIsSDSUploading] = useState(false);

  // Mock data based on your screenshot
  const inventoryDataDefault: Chemical[] = [
    {
      container_id: '45645645',
      chemical_name: '',
      cas_number: '',
      location: '',
      quantity: 'GOOD',
    },
    { 
      container_id: '45645',
      chemical_name: '',
      cas_number: '',
      location: '',
      quantity: 'GOOD',
    },
  ];
    
  // Tracker for query states & pagination
  const [lastUsedSearch, setLastUsedSearch] = useState(false);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(10);
  const [inventoryData, setInventoryData] = useState(inventoryDataDefault);
  const [noMoreData, setNoMoreData] = useState(false);

  // function called when user scrolls to end of inventory
  const onScrollAtEnd = useCallback(() => {
      if (!noMoreData){
          setLoadingMore(true);
          setTimeout(() => {
              setLoadingMore(false);
          }, 2000);
          console.log("User scrolled to end");
          if (lastUsedSearch || isExpiringSoon){
              addMoreContainers();
          }
      }
  });
    
  // function that adds more containers to list based on search
  const addMoreContainers = async () => {
    console.log("Adding more containers based on search");
    const queryUrl = BASE_URL+"containers/getSearch?input="+search+"&count="+currentIndex+(showLow ? "&show_low=true" : "");
    console.log(queryUrl);
    try {
      const response = await fetch(queryUrl, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok){
        console.log("We are having issues");
        throw new Error("BAD TIME STATUS: " + response.status);
      }
      const data = await response.json();
      console.log(data);
      if (data !== undefined && data.length > 0){
        setCurrentIndex(currentIndex + 10);
        setInventoryData(inventoryData.concat(data));
      }
        if (data.length <= 0){
            setNoMoreData(true);
        }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  // function to handle when expiring soon button is pressed
  const onExpiringSoonPress = async () => {
    setIsExpiringSoon(true);
    setLastUsedSearch(true);
    setCurrentIndex(10);

    const getSearchURL = `${BASE_URL}containers/getSearch?input=${search}&expiringSoon=true&count=0&limit=10`;
    console.log(getSearchURL);
    try {
      const searchResponse = await fetch(getSearchURL, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!searchResponse.ok){
        console.log("We are having issues");
        throw new Error("BAD TIME STATUS: " + response.status);
      }
      const data = await response.json();
      console.log(data);
      setInventoryData(data);
    } catch (error: any) {
      console.log(error.message);
    }
  };
    
  // function to handle when the filter button is pressed
  const onFilterPress = async () => {
    const getSearchURL = BASE_URL+"containers/getSearch?input="+search+"&expiringSoon=false"+(showLow ? "&show_low=true" : "");
    setIsExpiringSoon(false);
    setLastUsedSearch(true);
      setNoMoreData(false);
    setCurrentIndex(10);
    console.log(getSearchURL);
    try {
      const searchResponse = await fetch(getSearchURL, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!searchResponse.ok){
        console.log("We are having issues");
        throw new Error("BAD TIME STATUS: " + searchResponse.status);
      }
      const data = await searchResponse.json();
      console.log(data);
      setInventoryData(data);
        if (data.length <= 0 ){
            setNoMoreData(true);
        }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  // function that detects if given is close to the bottom
  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: any) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
    
  // function to show popup for error alerts
  const showPopup = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // whenever showLow changes, re-runs the filter function to update the inventory list
  useEffect(() => {
    onFilterPress();
  }, [showLow]);

  // function to handle when edit button is pressed
  const onEditPress = (container_id: any) => {
    console.log("Routing to edit screen for: "+container_id);
    router.push({
      pathname: '../SubPages/edit_container',
      params: { container_id: container_id },
    });
  };

  // React state for container QR label visibility.
  const [isQrLabelVisible, setIsQrLabelVisible] = useState(false);
  const [currentContainerId, setCurrentContainerId] = useState(""); // ID, name state considered strings.
  const [currentChemicalName, setCurrentChemicalName] = useState("");
  
  // Handle 'QR Label' button press. 
  const onQRLabelPress = async (container_id: string, chemical_name: string) => {
    // Safety check for passed container_id.
    if (!container_id) {
      showPopup("Error", "No container ID; QR label not retrieved.");
      return;
    }
    
    setCurrentContainerId(container_id); // Store passed string values.
    setCurrentChemicalName(chemical_name);
    setIsQrLabelVisible(true); // Confirm QR visibility.
  }; // const onQRLabelPress

  // function to open the device's file picker and stage a PDF for SDS upload
  const pickSdsFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });
 
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
 
      const asset = result.assets[0];
 
      // Client-side PDF check
      const looksLikePdf =
        (asset.mimeType && asset.mimeType === 'application/pdf') ||
        asset.name?.toLowerCase().endsWith('.pdf');
 
      if (!looksLikePdf) {
        showPopup('Invalid File', 'Please select a PDF file for the SDS.');
        return;
      }
 
      setsdsFile(asset);
      setSdsFileLocation(asset.name ?? asset.uri);
      // A newly picked file hasn't been sent to the backend yet.
      setSdsUploaded(false);
      setSdsBase64('');
    } catch (error: any) {
      console.log(error.message);
      showPopup('Error', 'Could not open the file picker.');
    }
  };

  // function to handle SDS file upload (sends PDF file to backend for validation and conversion to base64)
  const uploadSdsFile = async () => {
    if (!sdsFile) {
      showPopup('No File Selected', 'Please locate an SDS PDF before importing.');
      return;
    }
 
    setIsSDSUploading(true);
 
    try {
      const formData = new FormData();
      formData.append('user_id', String(USER_TEST)); // replace with actual user ID (KM#85)
      // No container_id yet - this container doesn't exist in the
      // database until Save actually creates it (see handleSaveContainer).
 
      if (Platform.OS === 'web') {
        // On web, DocumentPicker gives us a File/Blob directly under `file`.
        const response = await fetch(sdsFile.uri);
        const blob = await response.blob();
        formData.append('sds_file', blob, sdsFile.name ?? 'sds.pdf');
      } else {
        formData.append('sds_file', {
          uri: sdsFile.uri,
          name: sdsFile.name ?? 'sds.pdf',
          type: sdsFile.mimeType ?? 'application/pdf',
        } as any);
      }
 
      const uploadURL = BASE_URL + "containers/uploadSDS";
      const uploadResponse = await fetch(uploadURL, {
        method: 'POST',
        body: formData,
      });
 
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        if (uploadResponse.status === 403) {
          showPopup('Access Denied', "You don't have permission to upload SDS documents.");
        } else if (uploadResponse.status === 415) {
          showPopup('Invalid File', 'That file is not a valid PDF.');
        } else {
          showPopup('Upload Failed', 'The SDS could not be uploaded. Please try again.');
        }
        throw new Error("BAD TIME STATUS: " + uploadResponse.status + "\nError Reason: " + errorText);
      }
 
      const data = await uploadResponse.json();
      // Backend returns the base64 blob 
      setSdsBase64(data.sds_base64 ?? '');
      setSdsUploaded(true);
    } 
    catch (error: any) {
      console.log(error.message);
    } 
    finally {
      setIsSDSUploading(false);
    }
  };

  // Helper functions to handle popup modal close & reset
  const handleCloseAddModal = () => {
    setName('');
    setCasX('');
    setCasY('');
    setCasZ('');
    setContainerQuantity('');
    setAcquisitionDate('');
    setExpirationDate('');
    setLocationName('');
    setRoom('');
    setCabinet('');
    setShelf('');
    setSdsFileLocation('');
    setsdsFile(null);
    setSdsBase64('');
    setSdsUploaded(false);
    setErrorMessage('');
    setIsAddModalVisible(false);

  };

  const handleSaveContainer = () => {
    if (!name.trim()) {
      setErrorMessage('*Please enter a chemical name*');
      return;
    }
    if (!locationName.trim()) {
      setErrorMessage('*Location Name is required*');
      return;
    }
    if (!sdsUploaded) {
        setErrorMessage('*Please import a valid SDS before adding this container*');
        return;
    }

    const formattedCas = `${casX}-${casY}-${casZ}`;
    const fullLocation = `${locationName}${room ? ` - Room ${room}` : ''}`;

    const newContainer: Chemical = {
      container_id: Math.floor(10000000 + Math.random() * 90000000).toString(),
      chemical_name: name.toUpperCase(),
      cas_number: formattedCas,
      location: fullLocation,
      quantity: containerQuantity || 'GOOD',
      hasWarning: false,
      sds_document: sdsBase64, 
    };

    setInventoryData((prev) => [newContainer, ...prev]);
    handleCloseAddModal();
  };
    // Handler for "Recently Changed" inventory button press.
    const onRecentlyChangedPress = async () => {
      //const getRecentSearchURL = BASE_URL + "input/getSearchRecent?" + count + "&input=" + search;
      const getRecentSearchURL = `${BASE_URL}containers/getSearchRecent?search=${encodeURIComponent(search)}&count=0`;
      setLastUsedSearch(true);
      setCurrentIndex(10);
      console.log(getRecentSearchURL);

      try {
        const recentSearchResponse = await fetch(getRecentSearchURL, 
          {
            method: "GET", 
          }
        );
        
        // Handle assortment of unsuccessful HTTP status codes.
        if (!recentSearchResponse.ok) {
          if (recentSearchResponse.status === 400) {
            console.error("Invalid query parameters (e.g., count).");
            return null;
          
          } else if (recentSearchResponse.status === 405) {
            console.error("Method not allowed. Method expected: GET");
            return null;

          } else if (recentSearchResponse.status === 401) {
            console.error("Unauthorized; user not authenticated.");
            return null;

          } else if (recentSearchResponse.status === 404) {
            console.error("404 Not Found; endpoint incorrect or unavailable.");
            return null;
          
          } else if (recentSearchResponse.status === 403) {
            console.error("Forbidden; user does not have permission to access.");
            return null;

          } else { // Fall through; separate backend issue.
            console.log("We are having issues");
            return null;
          
          }
        }
        /* 
        Update count by the number of recently changed containers returned 
        in JS array from backend.
        */
        const recentSearchData = await recentSearchResponse.json();
        console.log(recentSearchData);
        setInventoryData(recentSearchData); 
          
      } catch (error: any) {
        console.log(error.message);
      
      } // try/catch ...
    }; // const onRecentlyChangedPress


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Text style={styles.backText}>{"< Back"}</Text>
        </TouchableOpacity>
        
        {/* Logo Placement */}
        <View style={styles.logoContainer}>
           <View>
              {/*Logo goes here*/}
           </View>
        </View>
        <Text style={styles.screenTitle}>CHEMICAL INVENTORY</Text>
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrapper}>
          <TextInput 
            style={styles.searchInput}
            placeholder="SEARCH INVENTORY"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress}>
          <Text style={styles.filterText}>FILTER</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Filter Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['SHOW ALL', 'RECENTLY CHANGED', 'EXPIRING SOON', 'SHOW LOW', 'ADD NEW'].map((tab) => (
            <TouchableOpacity
              key={tab} 
              style={[
                styles.pillBtn,
                tab === 'EXPIRING SOON' && isExpiringSoon ? { backgroundColor: '#3b82f6' } : null
              ]}
              onPress={() => {
                if (tab === 'EXPIRING SOON') onExpiringSoonPress();
                if (tab === 'ADD NEW') setIsAddModalVisible(true);
                if (tab === 'SHOW ALL') onFilterPress();
                if (tab === 'RECENTLY CHANGED') onRecentlyChangedPress();
                if (tab === 'SHOW LOW') setShowLow(!showLow);
              }}
            >
              <Text style={styles.pillText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Inventory List */}
      <ScrollView style={styles.list}
          onMomentumScrollEnd = {({nativeEvent}) => {
              if (isCloseToBottom(nativeEvent))
                  onScrollAtEnd();
          }}
      >
          
        {inventoryData.map((item, index) => (
          <View key={item.container_id || index.toString()} style={styles.chemicalCard}>
            <View style={styles.cardMain}>
              <View style={styles.infoSide}>
                <Text style={styles.chemName}>{item.chemical_name}</Text>
                <Text style={styles.casText}>{item.cas_number}</Text>
                <Text style={styles.idText}>{item.container_id}</Text>
              </View>

              <View style={styles.visualSide}>
                <View style={styles.beakerPlaceholder} />
                {item.hasWarning && (
                  <View style={styles.warningBox}>
                    <Text style={{fontSize: 10}}>💀</Text>
                  </View>
                )}
              </View> 

              <View style={styles.buttonSide}>
                <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>VIEW SDS</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} 
                  onPress={() => {
                    if (!item.container_id || !item.chemical_name) {
                      showPopup("Error", "Incomplete container information");
                      return;  
                    }
                    onQRLabelPress(item.container_id, item.chemical_name)}}>
                    <Text style={styles.actionText}>QR LABEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onEditPress(item.container_id)}>
                    <Text style={styles.actionText}>EDIT INFO</Text></TouchableOpacity>
              </View>
            </View>

            <Text style={styles.locationText}>{item.location}</Text>
            <Text style={[
              styles.statusText, 
              { color: item.quantity === 'high' || item.quantity === 'GOOD' ? '#4ade80' : '#fbbf24' }
            ]}>
              {item.quantity}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Add Container Screen Modal (Popup) */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseAddModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalBackBtn} onPress={handleCloseAddModal}>
              <Text style={styles.backText}>{"< Back"}</Text>
            </TouchableOpacity>
            <Text style={styles.modalScreenTitle}>Add Container</Text>
          </View>

          <ScrollView style={styles.modalScrollArea} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formLabel}>Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="Chemical Name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* CAS & Quantity Row */}
              <View style={styles.formRow}>
                <View style={{ flex: 1.5, marginRight: 10 }}>
                  <Text style={styles.formLabel}>CAS Number</Text>
                  <View style={styles.casRow}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                      <TextInput
                        style={[styles.modalTextInput, { textAlign: 'center' }]}
                        placeholder="XXXX"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={casX}
                        onChangeText={setCasX}
                      />
                    </View>
                    <Text style={styles.dashText}>-</Text>
                    <View style={[styles.inputWrapper, { flex: 0.7 }]}>
                      <TextInput
                        style={[styles.modalTextInput, { textAlign: 'center' }]}
                        placeholder="YY"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={casY}
                        onChangeText={setCasY}
                      />
                    </View>
                    <Text style={styles.dashText}>-</Text>
                    <View style={[styles.inputWrapper, { flex: 0.5 }]}>
                      <TextInput
                        style={[styles.modalTextInput, { textAlign: 'center' }]}
                        placeholder="Z"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={casZ}
                        onChangeText={setCasZ}
                      />
                    </View>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Quantity</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="Select Status"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={containerQuantity}
                      onChangeText={setContainerQuantity}
                    />
                  </View>
                </View>
              </View>

              {/* Acquisition & Expiration Date Row */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.formLabel}>Acquisition Date</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="YYYY/MM/DD"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={acquisitionDate}
                      onChangeText={setAcquisitionDate}
                    />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Expiration Date</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="YYYY/MM/DD"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={expirationDate}
                      onChangeText={setExpirationDate}
                    />
                  </View>
                </View>
              </View>

              {/* Location */}
              <Text style={styles.formLabel}>Location</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="Location Name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={locationName}
                  onChangeText={setLocationName}
                />
              </View>

              {/* Room / Cabinet / Shelf Row */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.formLabel}>Room</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.modalTextInput, { textAlign: 'center' }]}
                      placeholder="XXXX"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={room}
                      onChangeText={setRoom}
                    />
                  </View>
                </View>

                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.formLabel}>Cabinet</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.modalTextInput, { textAlign: 'center' }]}
                      placeholder="XXXX"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={cabinet}
                      onChangeText={setCabinet}
                    />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Shelf</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.modalTextInput, { textAlign: 'center' }]}
                      placeholder="XXXX"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={shelf}
                      onChangeText={setShelf}
                    />
                  </View>
                </View>
              </View>

              {/* SDS Sheet Import Row */}
              <Text style={styles.formLabel}>SDS Sheet</Text>
              <View style={styles.sdsRow}>
                <TouchableOpacity
                  style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}
                  onPress={pickSdsFile}
                  disabled={isSDSUploading}
                >
                  <Text
                    style={[
                      styles.modalTextInput,
                      !sdsFileLocation && { color: 'rgba(255,255,255,0.4)' },
                    ]}
                    numberOfLines={1}
                  >
                    {sdsFileLocation || 'Tap to locate PDF file'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.importBtn, isSDSUploading && { opacity: 0.6 }]}
                  onPress={uploadSdsFile}
                  disabled={isSDSUploading}
                >
                  {isSDSUploading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.importBtnText}>
                      {sdsUploaded ? 'Uploaded ✓' : 'Import'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveContainer}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Modal Bottom Nav */}
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem}>
              <Text style={styles.navIcon}>📷</Text>
              <Text style={styles.navText}>QR Scanner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Text style={[styles.navIcon, styles.activeNav]}>📊</Text>
              <Text style={[styles.navText, styles.activeNav]}>Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Text style={styles.navIcon}>👤</Text>
              <Text style={styles.navText}>Accounts</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navIcon}>📷</Text><Text style={styles.navText}>QR Scanner</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Text style={[styles.navIcon, styles.activeNav]}>📊</Text><Text style={[styles.navText, styles.activeNav]}>Inventory</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navIcon}>👤</Text><Text style={styles.navText}>Accounts</Text></TouchableOpacity>
      </View>

      {/*Popup window for QR label to be opened on 'View QR Label' button press.*/}
      <QRLabelPopup
        visible={isQrLabelVisible}
        onClose={() => setIsQrLabelVisible(false)}
        containerId={currentContainerId}
        chemicalName={currentChemicalName}
      />
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', 
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 0,
  },
  backText: {
    color: '#3b82f6',
    fontFamily: 'monospace',
  },
  logoContainer: {
    width: 70,
    height: 70,
    justify: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 18,
    marginTop: 10,
    letterSpacing: 1,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchWrapper: {
    flex: 1,
    height: 45,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  searchInput: {
    color: 'white',
    fontFamily: 'monospace',
  },
  filterBtn: {
    backgroundColor: '#60a5fa',
    paddingHorizontal: 20,
    marginLeft: 10,
    justifyContent: 'center',
    borderRadius: 15,
  },
  filterText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  tabContainer: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  pillBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  pillText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  list: {
    paddingHorizontal: 15,
  },
  chemicalCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoSide: {
    flex: 2,
  },
  chemName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  casText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'monospace',
  },
  idText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  visualSide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beakerPlaceholder: {
    width: 40,
    height: 60,
    backgroundColor: '#4ade80',
    borderRadius: 5,
  },
  warningBox: {
    position: 'absolute',
    right: -5,
    top: 5,
    backgroundColor: 'white',
    padding: 2,
    borderWidth: 1,
    borderColor: 'red',
  },
  buttonSide: {
    flex: 1.2,
  },
  actionBtn: {
    backgroundColor: '#60a5fa',
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 6,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
  },
  locationText: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 10,
  },
  statusText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderTopWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.4)',
  },
  navText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  activeNav: {
    color: '#3b82f6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#020617',
  },
  modalHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  modalBackBtn: {
    position: 'absolute',
    left: 20,
    top: 0,
  },
  modalScreenTitle: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 18,
    letterSpacing: 1,
  },
  modalScrollArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  formLabel: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 5,
    marginTop: 10,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
  },
  modalTextInput: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  casRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashText: {
    color: 'white',
    marginHorizontal: 4,
    fontFamily: 'monospace',
  },
  sdsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  importBtn: {
    backgroundColor: '#60a5fa',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  importBtnText: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ef4444',
    fontFamily: 'monospace',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Inventory;
