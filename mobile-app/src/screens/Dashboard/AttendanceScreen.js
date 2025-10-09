import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import { Button, LoadingSpinner } from '../../components';
import { Colors, Typography } from '../../theme';
import { markAttendance } from '../../store/attendanceSlice';

const AttendanceScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { markingAttendance, error } = useSelector((state) => state.attendance);
  
  const attendanceType = route.params?.type || 'MORNING';
  
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request camera permission
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take attendance photo.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      // Request location permission
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (locationPermission.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to mark attendance.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      setHasPermission(true);
      getCurrentLocation();
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions.');
    }
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation.coords);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef || !location) {
      Alert.alert('Error', 'Camera or location not ready. Please wait.');
      return;
    }

    try {
      const photo = await cameraRef.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });
      setCapturedImage(photo);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const submitAttendance = async () => {
    if (!capturedImage || !location) {
      Alert.alert('Error', 'Photo and location are required.');
      return;
    }

    try {
      await dispatch(markAttendance({
        type: attendanceType,
        latitude: location.latitude,
        longitude: location.longitude,
        photoUri: capturedImage.uri,
      })).unwrap();

      Alert.alert(
        'Success',
        `${attendanceType.toLowerCase()} attendance marked successfully!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error || 'Failed to mark attendance.');
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Requesting permissions...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="camera-off" size={64} color={Colors.gray} />
          <Text style={styles.permissionText}>Camera permission is required</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {attendanceType.charAt(0) + attendanceType.slice(1).toLowerCase()} Attendance
        </Text>
        <Text style={styles.subtitle}>Take a selfie to mark your attendance</Text>
        
        {location ? (
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={16} color={Colors.success} />
            <Text style={styles.locationText}>
              Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
          </View>
        ) : (
          <View style={styles.locationInfo}>
            <LoadingSpinner size="small" />
            <Text style={styles.locationText}>Getting location...</Text>
          </View>
        )}
      </View>

      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
          
          <View style={styles.actionButtons}>
            <Button
              title="Retake"
              variant="outline"
              onPress={retakePicture}
              style={styles.actionButton}
            />
            <Button
              title="Submit"
              onPress={submitAttendance}
              loading={markingAttendance}
              disabled={markingAttendance || !location}
              style={styles.actionButton}
            />
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            type={Camera.Constants.Type.front}
            ref={(ref) => setCameraRef(ref)}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraFrame} />
            </View>
          </Camera>
          
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={!location || loadingLocation}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loadingLocation && <LoadingSpinner overlay />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: 'transparent',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  previewImage: {
    flex: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  button: {
    marginTop: 16,
  },
});

export default AttendanceScreen;