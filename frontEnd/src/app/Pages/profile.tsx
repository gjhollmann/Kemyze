import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type User = {
  id: string;
  name: string;
  location: string;
  privilege: string;
};

const users: User[] = [
  {
    id: '1',
    name: 'John Smith',
    location: 'Sacramento Lab',
    privilege: 'Tertiary',
  },
];

export default function Profile() {
  const [search, setSearch] = useState('');

  const renderButton = (title: string, onPress?: () => void) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#38cfff', '#1767ff', '#003fea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userText}>
          Name: {item.name}
        </Text>

        <Text style={styles.userText}>
          Location: {item.location}
        </Text>

        <Text style={styles.userText}>
          Privilege Level: {item.privilege}
        </Text>
      </View>

      {renderButton('Edit Info')}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Managed Accounts</Text>

        {/* Search Section */}
        <View style={styles.searchPanel}>
          <View style={styles.searchRow}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder=""
              placeholderTextColor="#888"
              style={styles.searchInput}
            />

            {renderButton('Search')}
          </View>

          <View style={styles.filterRow}>
            {renderButton('Show All')}
            {renderButton('Recently Active')}
            {renderButton('Add New')}
          </View>
        </View>

        {/* Managed User List */}
        <View style={styles.listPanel}>
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050b1d',
  },

  container: {
    flex: 1,
    backgroundColor: '#050b1d',
    paddingHorizontal: 26,
    paddingTop: 20,

    // Gives space for the bottom navigation bar
    paddingBottom: 125,
  },

  title: {
    color: '#ffffff',
    fontSize: 42,
    fontFamily: 'JetBrains Mono Bold',
    marginBottom: 30,
  },

  searchPanel: {
    backgroundColor: '#0a1024',
    borderWidth: 1.5,
    borderColor: '#5a6075',
    borderRadius: 24,
    padding: 14,
    marginBottom: 26,

    shadowColor: '#008cff',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 5,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#7e8497',
    borderRadius: 24,
    backgroundColor: '#080e20',
    color: '#ffffff',
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: 'JetBrains Mono',
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  button: {
    minHeight: 48,
    minWidth: 92,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#00c8ff',
    shadowOpacity: 0.35,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 5,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'JetBrains Mono Bold',
    textAlign: 'center',
  },

  listPanel: {
    flex: 1,
    backgroundColor: '#090f21',
    borderWidth: 1.5,
    borderColor: '#5a6075',
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingVertical: 16,

    shadowColor: '#008cff',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 4,
  },

  listContent: {
    paddingBottom: 16,
  },

  userCard: {
    backgroundColor: '#0a1024',
    borderWidth: 1.5,
    borderColor: '#5a6075',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  userInfo: {
    flex: 1,
    marginRight: 12,
  },

  userText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'JetBrains Mono Bold',
    marginBottom: 5,
  },
});