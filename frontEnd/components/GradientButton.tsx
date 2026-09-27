import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;

  width?: number | string;
  height?: number;

  backgroundColors?: string[];
  borderColors?: string[];

  borderRadius?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function GradientButton({
  title,
  onPress,
  disabled = false,
  width = 200,
  height = 50,
  backgroundColors = ['#2983ff', '#1b3de9'],
  borderColors = ['#0026E4', '#00C8FF', '#0026E4', '#00C8FF', '#0026E4'],
  borderRadius = 10,
  style,
  textStyle,
}: GradientButtonProps) {
  return (
    <LinearGradient
      colors= {borderColors as [string, string, ...string[]]}
      locations = {[0, 0.27, 0.49, 0.75, 1]}
      start= {{ x: 0, y: 0 }}
      end= {{ x: 1, y: 1 }}
      style= {[
        styles.border,
        {
          width: width as any,
          height,
          borderRadius,
        },
        disabled && styles.disabledBorder,
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity = {0.85}
        onPress = {onPress}
        style = {{ flex: 1 }}
        disabled = {disabled}
      >
        <LinearGradient
          colors = {backgroundColors as [string, string, ...string[]]}
          start = {{ x: 0, y: 0 }}
          end = {{ x: 0, y: 1 }}
          style = {[
            styles.inner,
            {
              borderRadius: borderRadius - 4,
            },
              disabled && styles.disabledInner,
          ]}
        >
          <Text style={[styles.text, textStyle, disabled && styles.disabledText]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >{title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  border: {
    padding: 2, // Border width
  },

  disabledBorder: {
    opacity: 0.5,
  },

  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledInner: {
    opacity: 0.9,
  },

  text: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'JetBrains Mono Bold',
  },

  disabledText: {
    color: 'e6e6e6',
  },
});
