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

//Interface of login + dbstatus
interface LoginProps {
  onLogin?: (email: string, pass: string) => void;
  dbStatus?: string;
}

//Login Credentials
const Login: React.FC<LoginProps> = ({ onLogin, dbStatus }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandName}>Kemyze</Text>
        <Text style={styles.subTitle}>Chemical Inventory and Safety Management</Text>
      </View>

      {/* Login/Email */}
      <View style={styles.loginCard}>
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

        {/* Password */}
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

        {/* Makes sure that buttons react on press */}
        <TouchableOpacity 
          style={styles.loginBtn}
          onPress={() => onLogin?.(email, password)}
        >
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>

        {/* Reaction of button for Forgot Password */}
        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.buttonText}>Forgot Password</Text>
        </TouchableOpacity>
      </View>

      {/* QR Scanner */}
      <TouchableOpacity style={styles.bypassBtn}>
        <Text style={styles.bypassText}>QR Scanner Bypass</Text>
      </TouchableOpacity>

      {dbStatus && (
        <Text style={styles.dbText}>Server: {dbStatus}</Text>
      )}
    </SafeAreaView>
  );
};

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
  logoPlaceholder: {
    marginBottom: 10,
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
  errorText: {
    color: '#f87171',
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 20,
    fontSize: 13,
  },
  loginBtn: {
    height: 55,
    backgroundColor: '#3b82f6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  forgotBtn: {
    height: 55,
    backgroundColor: '#2563eb',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
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