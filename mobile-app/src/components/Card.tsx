import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Colors, Typography } from '../theme';
import { CardProps } from '../types';

const Card: React.FC<CardProps & { 
  title?: string;
  subtitle?: string;
  titleStyle?: any;
  subtitleStyle?: any;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}> = ({
  title,
  subtitle,
  children,
  onPress,
  style,
  titleStyle,
  subtitleStyle,
  icon,
  rightElement,
  disabled = false,
  ...props
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.card,
        disabled && styles.cardDisabled,
        style
      ]}
      onPress={!disabled ? onPress : undefined}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={disabled}
      {...props}
    >
      {(title || subtitle || icon || rightElement) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <View style={styles.titleContainer}>
              {title && (
                <Text style={[styles.title, titleStyle]}>{title}</Text>
              )}
              {subtitle && (
                <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
              )}
            </View>
          </View>
          {rightElement && (
            <View style={styles.rightElement}>{rightElement}</View>
          )}
        </View>
      )}
      
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardDisabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rightElement: {
    marginLeft: 12,
  },
  content: {
    marginTop: 12,
  },
});

export default Card;