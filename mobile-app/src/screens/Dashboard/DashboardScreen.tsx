import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
// @ts-ignore
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Card, LoadingSpinner } from '../../components';
import { Colors, Typography } from '../../theme';
import { getTodayAttendanceStatus } from '../../store/attendanceSlice';
import { getTodayBikeMeterStatus } from '../../store/bikeMeterSlice';
import { logoutUser, getUserProfile } from '../../store/authSlice';
import { RootState, DashboardStackParamList } from '../../types';

type DashboardScreenNavigationProp = StackNavigationProp<DashboardStackParamList, 'DashboardMain'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    todayAttendance: attendanceStatus, 
    loading: attendanceLoading 
  } = useSelector((state: RootState) => state.attendance);
  const { 
    todayReadings: bikeMeterStatus, 
    loading: bikeMeterLoading 
  } = useSelector((state: RootState) => state.bikeMeter);

  const [refreshing, setRefreshing] = React.useState(false);

  // Load today's status when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTodayStatus();
    }, [])
  );

  const loadTodayStatus = async () => {
    try {
      // If hasBike is undefined on the stored user, try fetching profile once to populate it.
      if (user && (user as any).hasBike === undefined) {
        try {
          await dispatch(getUserProfile()).unwrap();
        } catch (e) {
          // ignore profile fetch failure and continue
        }
      }

      await Promise.all([
        dispatch(getTodayAttendanceStatus()),
        dispatch(getTodayBikeMeterStatus()),
      ]);
    } catch (error) {
      console.error('Error loading today status:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTodayStatus();
    setRefreshing(false);
  }, []);

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

  const getAttendanceCardColor = (type: 'morning' | 'evening'): string => {
    if (type === 'morning') {
      return attendanceStatus?.morning ? Colors.success : Colors.gray;
    }
    return attendanceStatus?.evening ? Colors.warning : Colors.gray;
  };

  const getBikeMeterCardColor = (type: 'morning' | 'evening'): string => {
    if (!user || !Boolean((user as any).hasBike)) return Colors.gray;
    if (type === 'morning') {
      return bikeMeterStatus?.morning ? Colors.success : Colors.gray;
    }
    return bikeMeterStatus?.evening ? Colors.warning : Colors.gray;
  };

  const getAttendanceStatus = (type: 'morning' | 'evening'): string => {
    const minutes = getISTMinutes();
    if (type === 'morning') {
      if (attendanceStatus?.morning) return 'Completed';
      // If morning window closed
      if (minutes > 12 * 60) return 'Not Available after 12 PM';
      return 'Pending';
    }
    if (attendanceStatus?.evening) return 'Completed';
    // evening is available throughout the day (no 3:00 PM gating)
    return 'Pending';
  };

  const getBikeMeterStatus = (type: 'morning' | 'evening'): string => {
    const minutes = getISTMinutes();
    if (type === 'morning') {
      if (bikeMeterStatus?.morning) return 'Uploaded';
      if (minutes > 12 * 60) return 'Not Available after 12 PM';
      return 'Pending';
    }
    if (bikeMeterStatus?.evening) return 'Uploaded';
    // evening bike meter available (no 3:00 PM gating)
    return 'Pending';
  };

  const canMarkAttendance = (type: 'morning' | 'evening'): boolean => {
    const minutes = getISTMinutes();
    if (type === 'morning') {
      // Only allow if not marked and within morning window (<= 12:00 PM IST)
      return !attendanceStatus?.morning && minutes <= 12 * 60;
    }
    // evening: allow anytime as long as not already marked
    return !attendanceStatus?.evening;
  };

  const canUploadBikeMeter = (type: 'morning' | 'evening'): boolean => {
    const minutes = getISTMinutes();
    if (type === 'morning') {
      return !bikeMeterStatus?.morning && minutes <= 12 * 60;
    }
    return !bikeMeterStatus?.evening;
  };

  // Helper: compute current IST minutes since midnight robustly
  const getISTMinutes = (): number => {
    const now = new Date();
    // Convert local time to UTC ms, then add IST offset (UTC+5:30)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
    return ist.getHours() * 60 + ist.getMinutes();
  };

  const navigateToAttendance = (type: 'morning' | 'evening') => {
    (async () => {
      try {
        // If we don't have today's data, fetch it first to avoid stale state
        if (!attendanceStatus) {
          await dispatch(getTodayAttendanceStatus()).unwrap();
        }
      } catch (_) {}

      // Time-based restrictions (IST)
      const minutes = getISTMinutes();

      // Morning check-in allowed only until 12:00 PM (inclusive)
      if (type === 'morning') {
        if (minutes > 12 * 60) {
          // Time-window closed; silently block navigation. No toast/alert per requested change.
          console.debug('Morning check-in blocked: after 12:00 PM IST');
          return;
        }
      }

      // Evening check-out allowed only after 3:00 PM
      // evening is allowed anytime (no 3:00 PM gating)

      if (canMarkAttendance(type)) {
        navigation.navigate('Attendance', { type: type.toUpperCase() });
      } else {
        Alert.alert(
          'Already Marked',
          `You have already marked your ${type} attendance for today.`,
          [{ text: 'OK' }]
        );
      }
    })();
  };

  const navigateToBikeMeter = (type: 'morning' | 'evening') => {
    // If user doesn't have a bike, prevent navigation
    if (!user || !Boolean((user as any).hasBike)) {
      Alert.alert('Unavailable', 'Bike meter feature is unavailable for you. Please contact admin to enable.', [{ text: 'OK' }]);
      return;
    }

    (async () => {
      try {
        if (!bikeMeterStatus) {
          await dispatch(getTodayBikeMeterStatus()).unwrap();
        }
      } catch (_) {}

      // Time-based restrictions (IST)
      const minutes = getISTMinutes();

      if (type === 'morning') {
        if (minutes > 12 * 60) {
          // Time-window closed; silently block navigation.
          console.debug('Morning bike meter upload blocked: after 12:00 PM IST');
          return;
        }
      }

      // evening bike meter is allowed anytime (no 3:00 PM gating)

      if (canUploadBikeMeter(type)) {
        navigation.navigate('BikeMeter', { type: type.toUpperCase() });
      } else {
        Alert.alert(
          'Already Uploaded',
          `You have already uploaded your ${type} bike meter reading for today.`,
          [{ text: 'OK' }]
        );
      }
    })();
  };

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentDate = (): string => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (attendanceLoading || bikeMeterLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Surveyor'}</Text>
            <Text style={styles.date}>{getCurrentDate()}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Project</Text>
            <Text style={styles.statValue}>{user?.project || 'N/A'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Location</Text>
            <Text style={styles.statValue}>{user?.location || 'N/A'}</Text>
          </View>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          
          {/* Attendance Cards */}
          <Text style={styles.cardsSectionTitle}>Attendance</Text>
          <View style={styles.cardRow}>
            <Card
              style={[styles.actionCard, { backgroundColor: getAttendanceCardColor('morning') }]}
              onPress={() => navigateToAttendance('morning')}
              // Keep the card pressable when the time-window is closed so the toast/alert can be shown.
              // Only disable when the morning attendance is already marked.
              disabled={Boolean(attendanceStatus?.morning)}
            >
              <View style={styles.cardContent}>
                <Ionicons 
                  name="sunny" 
                  size={32} 
                  color={Colors.white} 
                  style={styles.cardIcon}
                />
                <Text style={styles.cardTitle}>Morning{'\n'}Attendance</Text>
                <Text style={styles.cardStatus}>{getAttendanceStatus('morning')}</Text>
                {attendanceStatus?.morning && (
                  <Text style={styles.cardTime}>
                    {formatTime(attendanceStatus.morning.capturedAt)}
                  </Text>
                )}
              </View>
            </Card>

            <Card
              style={[styles.actionCard, { backgroundColor: getAttendanceCardColor('evening') }]}
              onPress={() => navigateToAttendance('evening')}
              // Only disable when evening attendance is already marked; keep pressable otherwise so user sees time-window messages.
              disabled={Boolean(attendanceStatus?.evening)}
            >
              <View style={styles.cardContent}>
                <Ionicons 
                  name="moon" 
                  size={32} 
                  color={Colors.white} 
                  style={styles.cardIcon}
                />
                <Text style={styles.cardTitle}>Evening{'\n'}Attendance</Text>
                <Text style={styles.cardStatus}>{getAttendanceStatus('evening')}</Text>
                {attendanceStatus?.evening && (
                  <Text style={styles.cardTime}>
                    {formatTime(attendanceStatus.evening.capturedAt)}
                  </Text>
                )}
              </View>
            </Card>
          </View>

          {/* Bike Meter Cards (visible only if user.hasBike === true); otherwise show placeholder */}
          {user && Boolean((user as any).hasBike) ? (
            <>
              <Text style={styles.cardsSectionTitle}>Bike Meter Reading</Text>
              <View style={styles.cardRow}>
              <Card
                style={[styles.actionCard, { backgroundColor: getBikeMeterCardColor('morning') }]}
                onPress={() => navigateToBikeMeter('morning')}
                // Only disable when morning bike meter is already uploaded; keep pressable to show time-window messages.
                disabled={Boolean(bikeMeterStatus?.morning)}
              >
                <View style={styles.cardContent}>
                  <MaterialCommunityIcons
                    name="motorbike"
                    size={32}
                    color={Colors.white}
                    style={styles.cardIcon}
                  />
                  <Text style={styles.cardTitle}>Morning{'\n'}Bike Meter</Text>
                  <Text style={styles.cardStatus}>{getBikeMeterStatus('morning')}</Text>
                  {bikeMeterStatus?.morning && (
                    <Text style={styles.cardTime}>
                      {formatTime(bikeMeterStatus.morning.capturedAt)}
                    </Text>
                  )}
                </View>
              </Card>

              <Card
                style={[styles.actionCard, { backgroundColor: getBikeMeterCardColor('evening') }]}
                onPress={() => navigateToBikeMeter('evening')}
                // Only disable when evening bike meter is already uploaded; keep pressable to show time-window messages.
                disabled={Boolean(bikeMeterStatus?.evening)}
              >
                <View style={styles.cardContent}>
                  <MaterialCommunityIcons
                    name="motorbike"
                    size={32}
                    color={Colors.white}
                    style={styles.cardIcon}
                  />
                  <Text style={styles.cardTitle}>Evening{'\n'}Bike Meter</Text>
                  <Text style={styles.cardStatus}>{getBikeMeterStatus('evening')}</Text>
                  {bikeMeterStatus?.evening && (
                    <Text style={styles.cardTime}>
                      {formatTime(bikeMeterStatus.evening.capturedAt)}
                    </Text>
                  )}
                </View>
              </Card>
              </View>
            </>
          ) : null}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  actionsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minHeight: 120,
    marginVertical: 0,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardStatus: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  cardTime: {
    fontSize: 10,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 2,
  },
  cardsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginVertical: 8,
  },
  
});

export default DashboardScreen;