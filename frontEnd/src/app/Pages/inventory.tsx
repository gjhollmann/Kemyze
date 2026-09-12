import React, { useCallback, useEffect, useState } from 'react';
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
  Linking
} from "react-native";

// This matches the JSON shape the Django backend actually sends back
// (see containers/views.py -> getContainer / getSearch)
interface Chemical {
  container_id: number;
  chemical_name: string;
  cas_number: string | null;
  expr_date: string | null;
  acqn_date: string;
  location: string;
  quantity: string;
  hasWarning?: boolean; // not sent by the backend yet, kept optional for later use
}

const BASE_URL = "https://kemyze.vercel.app/";

const Inventory: React.FC = () => {
  const [search, setSearch] = useState('');
  // True while we're waiting on the very first/full inventory load (KM-106)
  const [loading, setLoading] = useState(true);


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
    
  const [inventoryData, setInventoryData] = useState<Chemical[]>([])

  // Fetches every chemical in the inventory (KM-106).
  // Reuses the existing search endpoint with an empty search term, since the
  // backend treats an empty "input" as "match everything" (see getSearch).
  const fetchAllContainers = async () => {
    setLoading(true);
    setLastUsedSearch(true);
    setCurrentIndex(10);
    const getAllURL = BASE_URL + "containers/getSearch?input=&count=0";
    console.log(getAllURL);
    try {
      const response = await fetch(getAllURL, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error("BAD TIME STATUS: " + response.status);
      }
      const data = await response.json();
      setInventoryData(data);
    } catch (error: any) {
      console.log(error.message);
      showPopup("Couldn't load inventory", "Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Opens a container's Safety Data Sheet PDF (KM-107).
  // The backend route returns the PDF directly, so we just open it as a link.
  const handleViewSDS = async (containerId: number) => {
    const sdsURL = BASE_URL + "containers/getSDS?kemID=" + containerId;
    try {
      await Linking.openURL(sdsURL);
    } catch (error: any) {
      showPopup("Error opening SDS", error.message);
    }
  };

  // Load the full chemical list as soon as the screen opens (KM-106)
  useEffect(() => {
    fetchAllContainers();
  }, []);

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
            <TouchableOpacity
              key={tab}
              style={styles.pillBtn}
              // Only "SHOW ALL" is wired up here (KM-106) — the other tabs
              // belong to other tickets and are left as-is.
              onPress={tab === 'SHOW ALL' ? () => { setSearch(''); fetchAllContainers(); } : undefined}
            >
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
          }
          }
      >
        {loading && (
          <Text style={styles.emptyText}>Loading your chemicals…</Text>
        )}
        {!loading && inventoryData.length === 0 && (
          <Text style={styles.emptyText}>No chemicals found.</Text>
        )}

        {inventoryData.map((item) => (
          <View key={item.container_id} style={styles.chemicalCard}>
            <View style={styles.cardMain}>
              <View style={styles.infoSide}>
                <Text style={styles.chemName}>{item.chemical_name}</Text>
                <Text style={styles.casText}>{item.cas_number || 'N/A'}</Text>
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
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleViewSDS(item.container_id)}>
                  <Text style={styles.actionText}>VIEW SDS</Text>
                </TouchableOpacity>
                {/* QR LABEL (KM-108) and EDIT INFO (KM-109) are other tickets — left unwired */}
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
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 30,
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
