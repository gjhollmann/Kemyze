import { StatusBar } from "expo-status-bar";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export default function Index() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 768;

  const logoWidth = isTablet
    ? isLandscape
      ? width * 0.18
      : width * 0.28
    : isLandscape
    ? width * 0.22
    : width * 0.42;

  const logoHeight = logoWidth * 0.52;
  const markWidth = logoWidth * 1.02;
  const markHeight = markWidth * 0.38;

  const topSpacing = isTablet ? (isLandscape ? 18 : 46) : isLandscape ? 12 : 36;
  const logoToTitleSpacing = isTablet ? 12 : 10;
  const titleToSubtitleSpacing = 6;
  const subtitleToContainerSpacing = isTablet ? (isLandscape ? 20 : 24) : isLandscape ? 18 : 22;

  const containerWidth = isTablet
    ? isLandscape
      ? Math.min(width * 0.5, 620)
      : Math.min(width * 0.66, 620)
    : isLandscape
    ? Math.min(width * 0.5, 500)
    : Math.min(width * 0.82, 420);

  const containerMinHeight = isTablet
    ? isLandscape
      ? Math.min(Math.max(height * 0.44, 220), 320)
      : Math.min(Math.max(height * 0.36, 280), 380)
    : isLandscape
    ? Math.min(Math.max(height * 0.38, 160), 220)
    : Math.min(Math.max(height * 0.3, 240), 320);

  const containerPaddingHorizontal = isTablet ? 26 : 18;
  const containerPaddingVertical = isTablet ? 24 : 16;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.background}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.content, { paddingTop: topSpacing }]}> 
            <View
              style={[
                styles.logoWrap,
                {
                  width: logoWidth,
                  height: logoHeight,
                  marginBottom: logoToTitleSpacing,
                },
              ]}
            >
              <Image
                source={require("../../assets/images/kemyze-logo.png")}
                style={[
                  styles.logoMark,
                  {
                    width: markWidth,
                    height: markHeight,
                  },
                ]}
                resizeMode="contain"
              />
            </View>

            <Text
              style={[
                styles.title,
                {
                  fontSize: isTablet ? (isLandscape ? 30 : 36) : isLandscape ? 26 : 32,
                  marginBottom: titleToSubtitleSpacing,
                },
              ]}
            >
              Kemyze
            </Text>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.subtitle,
                {
                  fontSize: isTablet ? 15 : 13,
                  maxWidth: isTablet ? 560 : 360,
                },
              ]}
            >
              Chemical Inventory and Safety Management
            </Text>

            <View
              style={[
                styles.loginContainer,
                {
                  width: containerWidth,
                  marginTop: subtitleToContainerSpacing,
                  paddingHorizontal: containerPaddingHorizontal,
                  paddingVertical: containerPaddingVertical,
                  minHeight: containerMinHeight,
                },
              ]}
            />
          </View>
        </ScrollView>
      </View>
import {
    Alert,
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
import GradientButton from '../../components/GradientButton'
import { handleLogin } from './Pages/handleLogin';


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
    
    // State for validation error messages shown under each input
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

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
            const response = await fetch("https://kemyze.vercel.app/login/forgot-password/", {
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

            //const result = await response.json();
            

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

    
    
    
    //Main View Portion
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

            {/* Login Button */}
          <View style={styles.loginBtn}>
          <GradientButton title="Log In" onPress = {onPressLogin} width="100%"/>
          </View>
          
          <View style = {styles.forgotBtn}>
          <GradientButton title="Forgot Password" onPress = {handleForgotPassword} width="100%"/>
          </View>
          
          {successMessage !== "" && (
            <Text style={styles.successText}>{successMessage}</Text>
          )}

          {errorMessage !== "" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
          
          
          </View>


          {/* QR Scanner */}
          <View style={styles.bypassBtn}>
          <GradientButton title="QR Scanner Bypass" onPress = {handleForgotPassword} width="100%"/>
          </View>


    </View>
    </SafeAreaView>
  );
}

//Styles for page
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: "#02061B",
    experimental_backgroundImage:
      "linear-gradient(to left, #09091C 0%, #131338 33%, #131338 66%, #09091C 100%)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logoWrap: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },
  logoMark: {
    zIndex: 1,
  },
  logo: {
    alignSelf: "center",
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.4,
  },
  subtitle: {
    color: "#C9CFE9",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 0,
  },
  loginContainer: {
    alignSelf: "center",
    borderRadius: 32,
    backgroundColor: "rgba(1, 8, 37, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(33, 142, 255, 0.5)",
    shadowColor: "#06184A",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    marginBottom: 20,
  },
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
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      elevation: 8,
    },
    forgotBtn: {
      height: 55,
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
