import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import from react-native-safe-area-context
// @ts-ignore
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { Card, Button, LoadingSpinner } from '../../components';
import { Colors, Typography } from '../../theme';
import { RootState } from '../../types';
import { logoutUser, getUserProfile } from '../../store/authSlice';
import { getTodayBikeMeterStatus } from '../../store/bikeMeterSlice';

interface Props {
  navigation: any;
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

  // Get the first letter of the user's name for avatar
  const getUserInitial = (): string => {
    if (!user?.name) return '?';
    return user.name.charAt(0).toUpperCase();
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
        {/* Profile Header - Custom card without internal padding */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{getUserInitial()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'Unknown User'}</Text>
              <Text style={styles.userRole}>{user?.role || 'Surveyor'}</Text>
              <Text style={[styles.infoValue, { marginTop: 1 }]}> 
                <Text style={{ fontWeight: 'bold' }}>Employee ID</Text>
                <Text>{' - '}{user?.employeeId ?? 'NA'}</Text>
              </Text>
              <Text style={[styles.infoValue, { marginTop: 1 }]}> 
                <Text style={{ fontWeight: 'bold' }}>Aadhar Number</Text>
                <Text>{' - '}{user?.aadharNumber ?? 'NA'}</Text>
              </Text>
              <View style={styles.statusContainer}>
                <View 
                  style={[styles.statusDot, { backgroundColor: getStatusColor(user?.isActive) }]} 
                />
                <Text style={styles.statusText}>
                  {getStatusText(user?.isActive)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <Card style={styles.infoCard}>
          {{
            ...React.createElement(View, { style: { padding: 0, margin: 0, marginTop: 0 } },
              React.createElement(Text, { style: styles.cardTitle }, 'Contact Information'),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(View, { style: styles.infoIcon },
                  React.createElement(Ionicons, { name: "call", size: 20, color: Colors.primary })
                ),
                React.createElement(View, { style: styles.infoContent },
                  React.createElement(Text, { style: styles.infoLabel }, 'Mobile Number'),
                  React.createElement(Text, { style: styles.infoValue }, user?.mobileNumber || 'N/A')
                )
              )
            )
          }}
        </Card>

        {/* Work Information */}
        <Card style={styles.infoCard}>
          {{
            ...React.createElement(View, { style: { padding: 0, margin: 0, marginTop: 0 } },
              React.createElement(Text, { style: styles.cardTitle }, 'Work Information'),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(View, { style: styles.infoIcon },
                  React.createElement(Ionicons, { name: "briefcase", size: 20, color: Colors.primary })
                ),
                React.createElement(View, { style: styles.infoContent },
                  React.createElement(Text, { style: styles.infoLabel }, 'Project'),
                  React.createElement(Text, { style: styles.infoValue },
                    typeof user?.project === 'object'
                      ? ((user?.project as any)?.name || 'Not Assigned')
                      : (user?.project || 'Not Assigned')
                  )
                )
              ),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(View, { style: styles.infoIcon },
                  React.createElement(Ionicons, { name: "location", size: 20, color: Colors.primary })
                ),
                React.createElement(View, { style: styles.infoContent },
                  React.createElement(Text, { style: styles.infoLabel }, 'Location'),
                  React.createElement(Text, { style: styles.infoValue },
                    typeof user?.location === 'object'
                      ? ((user?.location as any)?.name || 'Not Assigned')
                      : (user?.location || 'Not Assigned')
                  )
                )
              ),
              // Bike Status (Option B)
              React.createElement(View, { style: styles.infoRow },
                React.createElement(View, { style: styles.infoIcon },
                  React.createElement(MaterialCommunityIcons, { name: "motorbike", size: 20, color: Colors.primary })
                ),
                React.createElement(View, { style: styles.infoContent },
                  React.createElement(Text, { style: styles.infoLabel }, 'Bike'),
                  React.createElement(Text, { style: styles.infoValue },
                    typeof user?.hasBike === 'boolean'
                      ? (user?.hasBike ? 'Yes' : 'No')
                      : 'Not set'
                  ),
                  typeof user?.hasBike !== 'boolean' && 
                    React.createElement(Text, { style: styles.helperText }, 'If this shows "Not set", tap Refresh Profile after your admin updates your bike status.')
                )
              )
            )
          }}
        </Card>

        {/* Account Information */}
        <Card style={styles.infoCard}>
          {{
            ...React.createElement(View, { style: { padding: 0, margin: 0, marginTop: 0 } },
              React.createElement(Text, { style: styles.cardTitle }, 'Account Information'),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(View, { style: styles.infoIcon },
                  React.createElement(Ionicons, { name: "calendar", size: 20, color: Colors.primary })
                ),
                React.createElement(View, { style: styles.infoContent },
                  React.createElement(Text, { style: styles.infoLabel }, 'Account Created'),
                  React.createElement(Text, { style: styles.infoValue }, formatDate(user?.createdAt))
                )
              ),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(View, { style: styles.infoIcon },
                  React.createElement(Ionicons, { name: "time", size: 20, color: Colors.primary })
                ),
                React.createElement(View, { style: styles.infoContent },
                  React.createElement(Text, { style: styles.infoLabel }, 'Last Updated'),
                  React.createElement(Text, { style: styles.infoValue }, formatDate(user?.updatedAt))
                )
              )
            )
          }}
        </Card>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <View style={styles.buttonRow}>
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
    padding: 4, // Remove all padding
    paddingTop: 8,
  },
  profileCard: {
    marginBottom: 16,
    padding: 12,
    marginTop: 16, // Add top margin to create space from navigation bar
    marginVertical: 0,
    marginHorizontal: 16,
    overflow: 'visible',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: Colors.surface,
    borderRadius: 12,
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
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
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
    marginHorizontal: 16,
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
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default ProfileScreen;