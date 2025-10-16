import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
// @ts-ignore
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Button, LoadingSpinner, Card } from '../../components';
import { Colors, Typography } from '../../theme';
import { getUserProfile, logoutUser } from '../../store/authSlice';
import { getTodayBikeMeterStatus } from '../../store/bikeMeterSlice';
import { RootState, ProfileStackParamList } from '../../types';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<any>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Refresh profile data when screen comes into focus
    dispatch(getUserProfile());
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => dispatch(logoutUser())
        },
      ]
    );
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (isActive?: boolean): string => {
    return isActive ? Colors.success : Colors.error;
  };

  const getStatusText = (isActive?: boolean): string => {
    return isActive ? 'Active' : 'Inactive';
  };

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color={Colors.white} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'Unknown User'}</Text>
              <Text style={styles.userRole}>{user?.role || 'Surveyor'}</Text>
              <Text style={[styles.infoValue, { marginTop: 1 }]}> 
                <Text style={{ fontWeight: 'bold' }}>Employee ID</Text>
                <Text>{' - '}{user?.employeeId ?? 'NA'}</Text>
              </Text>
              <View style={styles.statusContainer}>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor(true) }
                  ]} 
                />
                <Text style={styles.statusText}>
                  {getStatusText(true)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Contact Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="call" size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>{user?.mobileNumber || 'N/A'}</Text>
            </View>
          </View>
        </Card>

        {/* Work Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Work Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="briefcase" size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Project</Text>
              <Text style={styles.infoValue}>{
                typeof user?.project === 'object'
                  ? ((user?.project as any)?.name || 'Not Assigned')
                  : (user?.project || 'Not Assigned')
              }</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location" size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{
                typeof user?.location === 'object'
                  ? ((user?.location as any)?.name || 'Not Assigned')
                  : (user?.location || 'Not Assigned')
              }</Text>
            </View>
          </View>
        
          {/* Bike Status (Option B) */}
          <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="motorbike" size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Bike</Text>
              <Text style={styles.infoValue}>{
                typeof user?.hasBike === 'boolean'
                  ? (user?.hasBike ? 'Yes' : 'No')
                  : 'Not set'
              }</Text>
              {typeof user?.hasBike !== 'boolean' && (
                <Text style={styles.helperText}>If this shows "Not set", tap Refresh Profile after your admin updates your bike status.</Text>
              )}
            </View>
          </View>
        </Card>

        {/* Account Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Account Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Account Created</Text>
              <Text style={styles.infoValue}>{formatDate(user?.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>{formatDate(user?.updatedAt)}</Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Refresh Profile"
            variant="outline"
            onPress={async () => {
              try {
                await dispatch(getUserProfile()).unwrap();
                // After profile refresh, refresh today's bike meter status so UI updates immediately
                await dispatch(getTodayBikeMeterStatus()).unwrap();
                Alert.alert('Refreshed', 'Profile and today status refreshed.');
              } catch (err: any) {
                Alert.alert('Error', err?.message || 'Failed to refresh profile');
              }
            }}
            loading={loading}
            style={styles.actionButton}
            icon={<Ionicons name="refresh" size={16} color={Colors.primary} />}
          />
          
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            style={styles.actionButton}
            icon={<Ionicons name="log-out" size={16} color={Colors.white} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    padding: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default ProfileScreen;