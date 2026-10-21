import {
  Image,
  ScrollView,
  Text,
  useWindowDimensions,
  Alert,
  View,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRef, useState } from "react";
import GradientButton from "../../components/GradientButton";
import { handleLogin } from "../utils/handleLogin";
import { useRouter } from 'expo-router';
import { useUserState } from '../app/contexts/UserState';
import { BASE_URL } from '../../constants/api';



export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] = useState(false);
  const loginRequestInFlightRef = useRef(false);
  const forgotPasswordRequestInFlightRef = useRef(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 768;
  const router = useRouter();
  const { activeUser, setActiveUser } = useUserState();

  const logoWidth = isTablet
    ? isLandscape
      ? width * 0.38
      : width * 0.48
    : isLandscape
    ? width * 0.42
    : width * 1.00;

  const logoHeight = logoWidth * 0.32;
  const markWidth = logoWidth * 1.02;
  const markHeight = markWidth * 0.38;

  const logoToTitleSpacing = isTablet ? 12 : 10;
  const titleToSubtitleSpacing = 6;
  const subtitleToContainerSpacing = isTablet
    ? isLandscape
      ? 20
      : 24
    : isLandscape
    ? 18
    : 22;

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

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showPopup("Error", "Please enter your email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showPopup("Error", "Please enter a valid email address.");
      return;
    }

    // Refs update synchronously, preventing duplicate requests before React re-renders.
    if (forgotPasswordRequestInFlightRef.current) {
      return;
    }

    forgotPasswordRequestInFlightRef.current = true;
    setIsRequestingPasswordReset(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(BASE_URL + "login/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      const result = await response.json();

      if (response.ok && result.success !== false && !result.error && !result.detail) {
        showPopup("Success", result.message || "Password reset email has been sent.");
      } else {
        showPopup("Error", result.error || result.detail || result.message || "Request failed.");
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        showPopup("Error", "Request timed out. Please try again.");
      } else {
        showPopup("Error", "Network error. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      forgotPasswordRequestInFlightRef.current = false;
      setIsRequestingPasswordReset(false);
    }
  };

  const showPopup = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const onPressLogin = async () => {
    if (!email.trim()) {
      showPopup("Missing email", "Please enter your email.");
      return;
    }

    if (!password.trim()) {
      showPopup("Missing password", "Please enter your password.");
      return;
    }

    // Refs update synchronously, preventing duplicate requests before React re-renders.
    if (loginRequestInFlightRef.current) {
      return;
    }

    loginRequestInFlightRef.current = true;
    setIsLoggingIn(true);

    try {
      const result = await handleLogin(email, password);

      if (!result.success || !result.data) {
        Alert.alert("Login Failed", result.message);
        return;
      }

      setActiveUser({
        userID: result.data.userID,
        accessLevel: result.data.accessLevel,
      });

      Alert.alert("Success", `Welcome! Access level: ${result.data.accessLevel}`);
      router.navigate('/Pages/scanner');
    } finally {
      loginRequestInFlightRef.current = false;
      setIsLoggingIn(false);
    }
  };

  const isLoading = isLoggingIn || isRequestingPasswordReset;
  const loadingLabel = isLoggingIn ? "Logging in" : "Sending password reset email";

  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.backgroundGradient}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
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
              style={[styles.logoMark, { width: markWidth, height: markHeight }]}
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
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.loginBtn}>
              <GradientButton
                title={isLoggingIn ? "Logging In..." : "Log In"}
                onPress={onPressLogin}
                disabled={isLoading}
                width="100%"
              />
            </View>

            <View style={styles.forgotBtn}>
              <GradientButton
                title={isRequestingPasswordReset ? "Sending Reset Email..." : "Forgot Password"}
                onPress={handleForgotPassword}
                disabled={isLoading}
                width="100%"
              />
            </View>
          </View>

          <View style={styles.bypassBtn}>
            <GradientButton
            title="QR Scanner Bypass"
            onPress={() => router.navigate('/SubPages/scannerbypass')}
            width="100%"
            />
          </View>
        </ScrollView>

        <Modal
          transparent
          visible={isLoading}
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.loadingOverlay}>
            <View
              style={styles.loadingCard}
              accessibilityRole="progressbar"
              accessibilityLabel={loadingLabel}
              accessibilityState={{ busy: true }}
            >
              <ActivityIndicator size="large" color="#00C8FF" />
              <Text style={styles.loadingText}>{loadingLabel}...</Text>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
    alignItems: "center",
  },
  logoWrap: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
    marginTop: 36,
  },
  logoMark: {
    zIndex: 1,
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
  backgroundGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    experimental_backgroundImage:
      "linear-gradient(to left, #09091C 0%, #131338 33%, #131338 66%, #09091C 100%)",
  },
  input: {
    color: "white",
    fontSize: 16,
    height: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    fontFamily: "monospace",
    marginBottom: 8,
    marginLeft: 5,
  },
  inputWrapper: {
    height: 50,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  loginBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 8,
  },
  forgotBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  bypassBtn: {
    marginTop: 40,
    width: "80%",
    height: 50,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  loadingCard: {
    minWidth: 220,
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 200, 255, 0.7)",
    backgroundColor: "#131338",
    paddingHorizontal: 32,
    paddingVertical: 28,
  },
  loadingText: {
    marginTop: 16,
    color: "#FFFFFF",
    fontFamily: "JetBrains Mono Bold",
    fontSize: 16,
  },
});
