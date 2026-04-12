import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from 'expo-router';

//Login and Database Establishment
interface LoginProps {
  onLogin?: (email: string, pass: string) => void;
  dbStatus?: string;
}


export default function Index() {
  const [data, setData] = useState("if you see this, the fetch failed");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getDBTest = async () => {
    try {
      const response = await fetch("https://kemyze.vercel.app/dbtest");
      const text = await response.text();
      setData(text);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getDBTest();
  }, []);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setSuccessMessage("");
      setErrorMessage("Please enter your email.");
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const response = await fetch("https://kemyze.vercel.app/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
              email: email
          }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(response);
      const result = await response.json();
      

      if (response.ok) {
        setSuccessMessage("Password reset email has been sent.");
      } else {
        setErrorMessage(result.error || result.message || "Request failed.");
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        setErrorMessage("Request timed out. Please try again.");
      } else {
        setErrorMessage("Network error. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" />
            
    <View style={styles.backgroundGradient}>
          
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
              onPress={handleForgotPassword}
            >
              <Text style={styles.buttonText}>Forgot Password</Text>
            </TouchableOpacity>
          
          
          {successMessage !== "" && (
            <Text style={styles.successText}>{successMessage}</Text>
          )}

          {errorMessage !== "" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
          
          </View>


          {/* QR Scanner */}
          <TouchableOpacity style={styles.bypassBtn}>
            <Text style={styles.bypassText}>QR Scanner Bypass</Text>
          </TouchableOpacity>


    </View>
    </SafeAreaView>
  );
}

//Styles for page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    color: "white",
    marginBottom: 10,
  },
  backgroundGradient: {
    width: "100%",
    height: "100%",
    padding: 20,
    justifyContent: "center",
    experimental_backgroundImage:
      "linear-gradient(to left, #09091C 0%, #131338 33%, #131338 66%, #09091C 100%)",
  },
    input: {
      color: 'white',
      fontSize: 16,
      height: '100%',
    },
  button: {
    backgroundColor: "#4C6FFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  successText: {
    color: "#4CFF88",
    marginTop: 15,
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 15,
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
