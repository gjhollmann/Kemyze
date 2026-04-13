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

//Main function for recovery page
export default function Recovery() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'none' | 'success' | 'empty' | 'error'>('none');

  //Forgot Password logic WIP
  const handleForgotPass = async () => {
    //Resets field
    setStatus('none');

    //If email input field is empty
    if (!email.trim()) {
      setStatus('empty');
      return;
    }
    
    setLoading(true);

    try {
      //PLACEHOLDER NAME FOR NOW
      const response = await fetch('https://kemyze.vercel.app/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (response.ok) {
        //Sends password recovery to email
        setStatus('success');
      } else {
        //Error occurs if password doesn't exist and will establish it as a server error
        setStatus('error');
      }
    } catch (error) {
      //Connection error
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Logo goes here */}
      <View>

      </View>

      {/* Header Card */}
      <View style={styles.header}>
        <Text style={styles.brandName}>Kemyze</Text>
        <Text style={styles.subTitle}>Account Recovery</Text>
      </View>

        {/* Login Card */}
      <View style={styles.loginCard}>
        <View style={styles.inputGroup}>
          
          {/* Email Address field */}
          <Text style={styles.label}>Email address</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input} 
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Separate Case Instances and Their Respective Messages */}
        <View style={styles.messageContainer}>
          {status === 'empty' && (
            <Text style={styles.errorText}>*Please Enter An Email Address*</Text>
          )}
    
          {status === 'success' && (
            <Text style={styles.successText}>*Password Has Been Sent To Input Email*</Text>
          )}

          {status === 'error' && (
            <Text style={styles.errorText}>*Connection Error: Could Not Reach Server*</Text>
          )}
        </View>
        
        {/* Button on click */}
        <TouchableOpacity 
          style={[styles.recoverBtn, loading && { opacity: 0.6 }]} 
          onPress={handleForgotPass}
          disabled={loading}
        >
          {/* PLACEHOLDER TEXT */}
          <Text style={styles.buttonText}>
            {loading ? "Processing..." : "Recover Password"}
          </Text>
        </TouchableOpacity>


        {/* Redirects to login.tsx */}
        <TouchableOpacity 
          style={styles.backLink} 
          onPress={() => router.replace('/')} 
        >
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

//Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#020617', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  brandName: { 
    color: 'white', 
    fontSize: 48, 
    fontWeight: 'bold', 
    fontFamily: 'monospace' 
  },
  subTitle: { 
    color: 'white', 
    fontSize: 12, 
    fontFamily: 'monospace', 
    textAlign: 'center' 
  },
  loginCard: { 
    width: '100%', 
    maxWidth: 380, 
    padding: 25, 
    borderRadius: 35, 
    backgroundColor: 'rgba(15, 23, 42, 0.5)', 
    borderWidth: 1.5, 
    borderColor: 'rgba(59, 130, 246, 0.2)' 
  },
  inputGroup: { 
    marginBottom: 20 
  },
  label: { 
    color: 'white', 
    fontSize: 16, 
    fontFamily: 'monospace', 
    marginBottom: 8 
  },
  inputWrapper: { 
    height: 50, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: '#334155', 
    paddingHorizontal: 20, 
    justifyContent: 'center' 
  },
  input: { 
    color: 'white', 
    fontSize: 16, 
    height: '100%' 
  },
  recoverBtn: { 
    height: 55, 
    backgroundColor: '#3b82f6', 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '600', 
    fontFamily: 'monospace' 
  },
  messageContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: 10,
  },
  successText: { 
    color: '#ef4444', 
    fontStyle: 'italic', 
    textAlign: 'center', 
    fontFamily: 'monospace', 
    marginBottom: 20, 
    fontSize: 14 
  },
  errorText: {
    color: '#ef4444',
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  backLink: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  backText: { 
    color: 'rgba(255,255,255,0.6)', 
    fontFamily: 'monospace', 
    textDecorationLine: 'underline' 
  }
});