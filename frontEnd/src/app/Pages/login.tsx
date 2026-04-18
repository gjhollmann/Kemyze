import React, { useState } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert
} from "react-native";
import { handleLogin } from './handleLogin'; // Login function from KM-131

// Interface of login + dbstatus
interface LoginProps {
  dbStatus?: string;
}

// Login Credentials
const Login: React.FC<LoginProps> = ({ dbStatus }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for validation error messages shown under each input
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // --- onPressLogin ---
  // Called when the user presses "Log In".
  // Passes email and password to handleLogin, then handles the result.
  const onPressLogin = async () => {
    // Clear previous errors before each attempt
    setEmailError('');
    setPasswordError('');

    const result = await handleLogin(email, password);

    if (!result.success) {
      // Show the error under the correct input field
      if (result.message.toLowerCase().includes('email')) {
        setEmailError(result.message);
      } else if (result.message.toLowerCase().includes('password')) {
        setPasswordError(result.message);
      } else {
        // General error (wrong credentials, server error) shown as an alert
        Alert.alert('Login Failed', result.message);
      }
    } else {
      // Login successful — result.data contains { userID, accessLevel }
      // TODO: Navigate to the main app screen and pass userID/accessLevel as needed
      Alert.alert('Success', `Welcome! Access level: ${result.data?.accessLevel}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Logo goes here? */}
      <View></View>

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
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(''); // Clear error as user types
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>
          {/* Show email validation error if present */}
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input} 
              secureTextEntry 
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(''); // Clear error as user types
              }}
            />
          </View>
          {/* Show password validation error if present */}
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        {/* Log In button — triggers the login function */}
        <TouchableOpacity 
          style={styles.loginBtn}
          onPress={onPressLogin}
        >
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>

        {/* Forgot Password button */}
        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.buttonText}>Forgot Password</Text>
        </TouchableOpacity>
      </View>

      {/* QR Scanner Bypass button */}
      <TouchableOpacity style={styles.bypassBtn}>
        <Text style={styles.bypassText}>QR Scanner Bypass</Text>
      </TouchableOpacity>

      {/* dbStatus text shows connection established */}
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
    fontFamily: 'monospace',
    marginTop: 6,
    marginLeft: 5,
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
