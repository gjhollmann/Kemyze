import { StatusBar } from "expo-status-bar";
import {
  Image,
  SafeAreaView,
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

  const topSpacing = isTablet ? (isLandscape ? 28 : 46) : isLandscape ? 24 : 36;
  const logoToTitleSpacing = isTablet ? 12 : 10;
  const titleToSubtitleSpacing = 6;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.background}>
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
        </View>
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
});
