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
    </SafeAreaView>
  );
}

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
});
