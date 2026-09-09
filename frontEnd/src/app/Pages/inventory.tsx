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
  RefreshControl
} from "react-native";

interface Chemical {
  id: string;
  name: string;
  cas: string;
  location: string;
  status: 'GOOD' | 'Near Expiry' | 'LOW' | 'BAD';
  hasWarning?: boolean;
}

const BASE_URL = "https://kemyze.vercel.app/";

const Inventory: React.FC = () => {
  const [search, setSearch] = useState('');

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
        console.log("User scrolled to end")
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
            console.log(data)
            if (data !== undefined){
                setCurrentIndex(currentIndex+10);
                setInventoryData(inventoryData.concat(data));
            }
        } catch (error) {
            console.log(error.message);
        } // try ...
    };
    
    // function that detects if given is close to the bottom
    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
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
    
  const [inventoryData, setInventoryData] = useState(inventoryDataDefault)
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
        } catch (error) {
            console.log(error.message);
        } // try ...
    } // const onFilterPress

    // Handler for "Recently Changed" inventory button press.
    const onRecentlyChangedPress = async () => {
      const getRecentSearchURL = BASE_URL + "input/getSearchRecent?" + count + "&input=" + search;
      console.log(getRecentSearchURL);

      try {
        const recentSearchResponse = await fetch(getRecentSearchURL, {method: "GET", });
        console.log(recentSearchResponse)
        
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
            console.error("Unexpected backend failure.");
            return null;
          
          }
        }
        /* 
        Update count by the number of recently changed containers returned 
        in JS array from backend.
        */
        const recentSearchData = await recentSearchResponse.json();
        setCount(count + recentSearchData.length); 
          
      } catch (error) {
        console.log(error.message);
      
      } // try/catch ...
    } // const onRecentlyChangedPress


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
           <View >
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
          }
          }
      >
          
        {inventoryData.map((item) => (
          <View key={item.container_id} style={styles.chemicalCard}>
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
                <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>EDIT INFO</Text></TouchableOpacity>
              </View>
            </View>

            <Text style={styles.locationText}>{item.location}</Text>
            <Text style={[
              styles.statusText, 
              { color: item.quantity === 'high' ? '#4ade80' : '#fbbf24' }
            ]}>
              {item.quantity}
            </Text>
          </View>
        ))}
      </ScrollView>

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
  }
});

export default Inventory;
