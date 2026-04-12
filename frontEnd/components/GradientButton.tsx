import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientButtonProps = {
  title: string;
  onPress?: () => void;

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
  width = 200,
  height = 50,
  borderRadius = 10,
  style,
  textStyle,
}: GradientButtonProps) {
  return (
    <LinearGradient
      colors= {['#0026E4', '#00C8FF', '#0026E4', '#00C8FF', '#0026E4']}
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
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity = {0.85}
        onPress = {onPress}
        style = {{ flex: 1 }}
      >
        <LinearGradient
          colors = {['#2983ff', '#1b3de9']}
          start = {{ x: 0, y: 0 }}
          end = {{ x: 0, y: 1 }}
          style = {[
            styles.inner,
            {
              borderRadius: borderRadius - 4,
            },
          ]}
        >
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  border: {
    padding: 2, // Border width
  },

  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'JetBrains Mono Bold',
  },
});