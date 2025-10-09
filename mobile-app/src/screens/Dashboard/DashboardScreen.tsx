import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';

import { Card, LoadingSpinner } from '../../components';
import { Colors, Typography } from '../../theme';
import { getTodayAttendanceStatus } from '../../store/attendanceSlice';
import { getTodayBikeMeterStatus } from '../../store/bikeMeterSlice';
import { logoutUser } from '../../store/authSlice';
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
    if (type === 'morning') {
      return bikeMeterStatus?.morning ? Colors.info : Colors.gray;
    }
    return bikeMeterStatus?.evening ? Colors.secondary : Colors.gray;
  };

  const getAttendanceStatus = (type: 'morning' | 'evening'): string => {
    if (type === 'morning') {
      return attendanceStatus?.morning ? 'Completed' : 'Pending';
    }
    return attendanceStatus?.evening ? 'Completed' : 'Pending';
  };

  const getBikeMeterStatus = (type: 'morning' | 'evening'): string => {
    if (type === 'morning') {
      return bikeMeterStatus?.morning ? 'Uploaded' : 'Pending';
    }
    return bikeMeterStatus?.evening ? 'Uploaded' : 'Pending';
  };

  const canMarkAttendance = (type: 'morning' | 'evening'): boolean => {
    if (type === 'morning') {
      return !attendanceStatus?.morning;
    }
    return !attendanceStatus?.evening;
  };

  const canUploadBikeMeter = (type: 'morning' | 'evening'): boolean => {
    if (type === 'morning') {
      return !bikeMeterStatus?.morning;
    }
    return !bikeMeterStatus?.evening;
  };

  const navigateToAttendance = (type: 'morning' | 'evening') => {
    if (canMarkAttendance(type)) {
      navigation.navigate('Attendance', { type: type.toUpperCase() });
    } else {
      Alert.alert(
        'Already Marked',
        `You have already marked your ${type} attendance for today.`,
        [{ text: 'OK' }]
      );
    }
  };

  const navigateToBikeMeter = (type: 'morning' | 'evening') => {
    if (canUploadBikeMeter(type)) {
      navigation.navigate('BikeMeter', { type: type.toUpperCase() });
    } else {
      Alert.alert(
        'Already Uploaded',
        `You have already uploaded your ${type} bike meter reading for today.`,
        [{ text: 'OK' }]
      );
    }
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
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
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
          <View style={styles.cardRow}>
            <Card
              style={[styles.actionCard, { backgroundColor: getAttendanceCardColor('morning') }]}
              onPress={() => navigateToAttendance('morning')}
              disabled={!canMarkAttendance('morning')}
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
              disabled={!canMarkAttendance('evening')}
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

          {/* Bike Meter Cards */}
          <View style={styles.cardRow}>
            <Card
              style={[styles.actionCard, { backgroundColor: getBikeMeterCardColor('morning') }]}
              onPress={() => navigateToBikeMeter('morning')}
              disabled={!canUploadBikeMeter('morning')}
            >
              <View style={styles.cardContent}>
                <Ionicons 
                  name="bicycle" 
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
              disabled={!canUploadBikeMeter('evening')}
            >
              <View style={styles.cardContent}>
                <Ionicons 
                  name="bicycle" 
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
});

export default DashboardScreen;