import React, { useCallback, useState } from 'react';
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
  Modal
} from "react-native";
import { useRouter } from 'expo-router';

interface Chemical {
  container_id?: string;
  chemical_name?: string;
  cas_number?: string;
  location?: string;
  quantity?: string;
  hasWarning?: boolean;
}

const BASE_URL = "https://kemyze.vercel.app/";
const router = useRouter();

const Inventory: React.FC = () => {
  const [search, setSearch] = useState('');

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

  // Mock data based on your screenshot
  const inventoryDataDefault: Chemical[] = [
    {
      container_id: '45645645',
      chemical_name: '',
      cas_number: '',
      location: '',
      quantity: 'GOOD',
      //hasWarning: false
    },
    { 
      container_id: '45645',
      chemical_name: '',
      cas_number: '',
      location: '',
      quantity: 'GOOD',
      //hasWarning: false
    },
  ];
    
  // function called when user scrolls to end of inventory
  const [lastUsedSearch, setLastUsedSearch] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(10);

  const onScrollAtEnd = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => {
      setLoadingMore(false);
    }, 2000);
    console.log("User scrolled to end");
    if (lastUsedSearch){
      addMoreSearchContainers();
    }
  });
    
  // function that adds more containers to list based on search
  const addMoreSearchContainers = async () => {
    console.log("Adding more containers based on search");
    const getSearchURL = BASE_URL+"containers/getSearch?input="+search+"&count="+currentIndex;
    console.log(getSearchURL);
    try {
      const searchResponse = await fetch(getSearchURL,
        {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!searchResponse.ok){
        console.log("We are having issues");
        throw new Error("BAD TIME STATUS: " + searchResponse.status);
      }
      const data = await searchResponse.json();
      console.log(data);
      if (data !== undefined){
        setCurrentIndex(currentIndex+10);
        setInventoryData(inventoryData.concat(data));
      }
    } catch (error: any) {
      console.log(error.message);
    } // try ...
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
    
  const [inventoryData, setInventoryData] = useState(inventoryDataDefault);
  const [count, setCount] = useState(0); // For pagination, initialize inventory count to 0 and update that value after each set of 10 records.
    
  // function to handle when the filter button is pressed
  const onFilterPress = async () => {
    const getSearchURL = BASE_URL+"containers/getSearch?input="+search;
    setLastUsedSearch(true);
    setCurrentIndex(10);
    console.log(getSearchURL);
    try {
      const searchResponse = await fetch(getSearchURL,
        {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!searchResponse.ok){
        console.log("We are having issues");
        throw new Error("BAD TIME STATUS: " + searchResponse.status);
      }
      console.log("\n\n\n\n\n\n\n\n\nnn\n\n\n\n\n\n");
      const data = await searchResponse.json();
      console.log(data);
      setInventoryData(data);
    } catch (error: any) {
      console.log(error.message);
    } // try ...
  }; // const onFilterPress

  // function to handle when edit button is pressed
  const onEditPress = (container_id: any) => {
    console.log("Routing to edit screen for: "+container_id);
    router.push({
      pathname: '../SubPages/edit_container',
      params: { container_id: container_id },
    });
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

    const formattedCas = `${casX}-${casY}-${casZ}`;
    const fullLocation = `${locationName}${room ? ` - Room ${room}` : ''}`;

    const newContainer: Chemical = {
      container_id: Math.floor(10000000 + Math.random() * 90000000).toString(),
      chemical_name: name.toUpperCase(),
      cas_number: formattedCas,
      location: fullLocation,
      quantity: containerQuantity || 'GOOD',
      hasWarning: false,
    };

    setInventoryData((prev) => [newContainer, ...prev]);
    handleCloseAddModal();
  };
    // Handler for "Recently Changed" inventory button press.
    const onRecentlyChangedPress = async () => {
      //const getRecentSearchURL = BASE_URL + "input/getSearchRecent?" + count + "&input=" + search;
      const getRecentSearchURL = BASE_URL + "containers/getSearchRecent";
      setLastUsedSearch(true);
      setCurrentIndex(10);
      console.log(getRecentSearchURL);

      try {
        const recentSearchResponse = await fetch(getRecentSearchURL, 
          {
            method: "GET", 
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        //console.log(recentSearchResponse)
        
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
        //setCount(count + recentSearchData.length); 
          
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
            <TouchableOpacity key={tab} style={styles.pillBtn}
              onPress={() => {
                if (tab === 'RECENTLY CHANGED') { 
                  onRecentlyChangedPress(); // Call handler for recently changed button press.
                } // Add more conditionals for other tabs here.
              }}><Text style={styles.pillText}>{tab}</Text>
            <TouchableOpacity
              key={tab} 
              style={styles.pillBtn}
              onPress={tab === 'ADD NEW' ? () => setIsAddModalVisible(true) : undefined}
            ></TouchableOpacity>
              <Text style={styles.pillText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Inventory List */}
      <ScrollView style={styles.list}
          //Function call when user scrolls to end of list
          //refreshControl = {<RefreshControl refreshing={loadingMore} onRefresh={onScrollAtEnd}/>}
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
                {/* Placeholder for Beaker Image */}
                <View style={styles.beakerPlaceholder} />
                {item.hasWarning && (
                  <View style={styles.warningBox}>
                    <Text style={{fontSize: 10}}>💀</Text>
                  </View>
                )}
              </View> 

              <View style={styles.buttonSide}>
                <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>VIEW SDS</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>QR LABEL</Text></TouchableOpacity>
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
                <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="File Location"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={sdsFileLocation}
                    onChangeText={setSdsFileLocation}
                  />
                </View>
                <TouchableOpacity style={styles.importBtn}>
                  <Text style={styles.importBtnText}>Import</Text>
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
              <Text style={styles.navText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navIcon}>📷</Text><Text style={styles.navText}>QR Scanner</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Text style={[styles.navIcon, styles.activeNav]}>📊</Text><Text style={[styles.navText, styles.activeNav]}>Inventory</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navIcon}>👤</Text><Text style={styles.navText}>Profile</Text></TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagonBorder: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 10,
    borderRadius: 10, 
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