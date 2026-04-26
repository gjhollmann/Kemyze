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
} from "react-native";
import { useState } from "react";
import GradientButton from "../../components/GradientButton";
import { handleLogin } from "./Pages/handleLogin";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch("https://kemyze.vercel.app/login/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
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

    const result = await handleLogin(email, password);

    if (!result.success) {
      Alert.alert("Login Failed", result.message);
    } else {
      Alert.alert("Success", `Welcome! Access level: ${result.data?.accessLevel}`);
    }
  };

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
                />
              </View>
            </View>

            <View style={styles.loginBtn}>
              <GradientButton title="Log In" onPress={onPressLogin} width="100%" />
            </View>

            <View style={styles.forgotBtn}>
              <GradientButton title="Forgot Password" onPress={handleForgotPassword} width="100%" />
            </View>
          </View>

          <View style={styles.bypassBtn}>
            <GradientButton title="QR Scanner Bypass" onPress={handleForgotPassword} width="100%" />
          </View>
        </ScrollView>
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
});
