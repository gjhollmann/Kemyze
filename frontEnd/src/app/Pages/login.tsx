import React, { useState } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from "react-native";
import { useRouter } from 'expo-router';

//Login and Database Establishment
interface LoginProps {
  onLogin?: (email: string, pass: string) => void;
  dbStatus?: string;
}

//Login Credentials
const Login: React.FC<LoginProps> = ({ onLogin, dbStatus }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Put Logo Here? */}
      <View>

      </View>

      {/* Header Card */} 
      <View style={styles.header}>
        <Text style={styles.brandName}>Kemyze</Text>
        <Text style={styles.subTitle}>Chemical Inventory and Safety Management</Text>
      </View>

      {/* Login Card */}
      <View style={styles.loginCard}>
        
        {/* Email input field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email address</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input} 
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>
        </View>

        {/* Password input field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input} 
              secureTextEntry 
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={styles.loginBtn}
          onPress={() => onLogin?.(email, password)}
        >
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>

        {/* Forgot Password Button */}
        <TouchableOpacity 
          style={styles.forgotBtn}
          //Redirects to recovery page
          onPress={() => router.push('/Pages/recovery')} 
        >
          <Text style={styles.buttonText}>Forgot Password</Text>
        </TouchableOpacity>
      </View>

      {/* QR Scanner */}
      <TouchableOpacity style={styles.bypassBtn}>
        <Text style={styles.bypassText}>QR Scanner Bypass</Text>
      </TouchableOpacity>

      {/* Database Established text on bottom */}
      {dbStatus && (
        <Text style={styles.dbText}>Server: {dbStatus}</Text>
      )}
    </SafeAreaView>
  );
};

//Styles for page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  subTitle: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 5,
  },
  loginCard: {
    width: '100%',
    maxWidth: 380,
    padding: 25,
    borderRadius: 35,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', 
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.2)', 
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 8,
    marginLeft: 5,
  },
  inputWrapper: {
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  input: {
    color: 'white',
    fontSize: 16,
    height: '100%',
  },
  loginBtn: {
    height: 55,
    backgroundColor: '#3b82f6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 8,
  },
  forgotBtn: {
    height: 55,
    backgroundColor: '#2563eb',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  bypassBtn: {
    marginTop: 40,
    width: '80%',
    height: 50,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bypassText: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 16,
    letterSpacing: 1,
  },
  dbText: {
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 10,
  }
});

export default Login;