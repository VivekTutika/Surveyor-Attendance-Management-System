import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, TouchableOpacityProps } from 'react-native';
import { Colors, Typography } from '../theme';
import { ButtonProps } from '../types';

const Button: React.FC<ButtonProps & TouchableOpacityProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle: any[] = [styles.button, styles[size]];
    
    if (variant === 'primary') {
      baseStyle.push(styles.primary);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondary);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outline);
    } else if (variant === 'danger') {
      baseStyle.push(styles.danger);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle: any[] = [styles.text, styles[`${size}Text`]];
    
    if (variant === 'primary') {
      baseTextStyle.push(styles.primaryText);
    } else if (variant === 'secondary') {
      baseTextStyle.push(styles.secondaryText);
    } else if (variant === 'outline') {
      baseTextStyle.push(styles.outlineText);
    } else if (variant === 'danger') {
      baseTextStyle.push(styles.dangerText);
    }
    
    if (disabled) {
      baseTextStyle.push(styles.disabledText);
    }
    
    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variant === 'outline' ? Colors.primary : Colors.white}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  
  // Text sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  primaryText: {
    color: Colors.textOnPrimary,
  },
  
  secondary: {
    backgroundColor: Colors.secondary,
  },
  secondaryText: {
    color: Colors.textOnSecondary,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  outlineText: {
    color: Colors.primary,
  },
  
  danger: {
    backgroundColor: Colors.error,
  },
  dangerText: {
    color: Colors.white,
  },
  
  disabled: {
    backgroundColor: Colors.lightGray,
    borderColor: Colors.lightGray,
  },
  disabledText: {
    color: Colors.textDisabled,
  },
});

export default React.memo(Button);