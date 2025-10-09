import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Colors } from '../theme';
import { LoadingSpinnerProps } from '../types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  color = Colors.primary, 
  style,
  overlay = false,
  text
}) => {
  if (overlay) {
    return (
      <View style={[styles.overlay, style]}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size={size} color={color} />
          {text && <Text style={styles.overlayText}>{text}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  spinnerContainer: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  overlayText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});

export default React.memo(LoadingSpinner);