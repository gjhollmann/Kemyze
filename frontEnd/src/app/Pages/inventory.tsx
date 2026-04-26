import React, { useState } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image
} from "react-native";

interface Chemical {
  id: string;
  name: string;
  cas: string;
  location: string;
  status: 'GOOD' | 'Near Expiry' | 'LOW' | 'BAD';
  hasWarning?: boolean;
}

const Inventory: React.FC = () => {
  const [search, setSearch] = useState('');

  // Mock data based on your screenshot
  const inventoryData: Chemical[] = [
    { 
      id: '', 
      name: '', 
      cas: '', 
      location: '', 
      status: 'GOOD',
      hasWarning: false 
    },
    { 
      id: '', 
      name: '', 
      cas: '', 
      location: '', 
      status: 'LOW',
      hasWarning: true

    },
  ];

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
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>FILTER</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Filter Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['SHOW ALL', 'RECENTLY CHANGED', 'EXPIRING SOON', 'SHOW LOW', 'ADD NEW'].map((tab) => (
            <TouchableOpacity key={tab} style={styles.pillBtn}>
              <Text style={styles.pillText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Inventory List */}
      <ScrollView style={styles.list}>
        {inventoryData.map((item) => (
          <View key={item.id} style={styles.chemicalCard}>
            <View style={styles.cardMain}>
              <View style={styles.infoSide}>
                <Text style={styles.chemName}>{item.name}</Text>
                <Text style={styles.casText}>{item.cas}</Text>
                <Text style={styles.idText}>{item.id}</Text>
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
              { color: item.status === 'GOOD' ? '#4ade80' : '#fbbf24' }
            ]}>
              {item.status}
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