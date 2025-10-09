import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { Button, LoadingSpinner, InputField } from '../../components';
import { Colors, Typography } from '../../theme';
import { uploadBikeMeterReading } from '../../store/bikeMeterSlice';

const BikeMeterScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { uploadingReading, error } = useSelector((state) => state.bikeMeter);
  
  const readingType = route.params?.type || 'MORNING';
  
  const [capturedImage, setCapturedImage] = useState(null);
  const [kmReading, setKmReading] = useState('');
  const [kmError, setKmError] = useState('');

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to capture bike meter photo.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to capture the bike meter reading',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removeImage = () => {
    setCapturedImage(null);
  };

  const validateKmReading = (value) => {
    setKmReading(value);
    
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      setKmError('Please enter a valid KM reading');
    } else {
      setKmError('');
    }
  };

  const submitReading = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'Please capture a photo of the bike meter.');
      return;
    }

    if (kmReading && kmError) {
      Alert.alert('Error', 'Please enter a valid KM reading.');
      return;
    }

    try {
      await dispatch(uploadBikeMeterReading({
        type: readingType,
        photoUri: capturedImage.uri,
        kmReading: kmReading ? parseFloat(kmReading) : null,
      })).unwrap();

      Alert.alert(
        'Success',
        `${readingType.toLowerCase()} bike meter reading uploaded successfully!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error || 'Failed to upload bike meter reading.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {readingType.charAt(0) + readingType.slice(1).toLowerCase()} Bike Meter
          </Text>
          <Text style={styles.subtitle}>
            Capture a clear photo of your bike's odometer reading
          </Text>
        </View>

        {/* Image Section */}
        {capturedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage.uri }} style={styles.capturedImage} />
            <View style={styles.imageActions}>
              <Button
                title="Change Photo"
                variant="outline"
                size="small"
                onPress={showImageOptions}
                style={styles.imageActionButton}
              />
              <Button
                title="Remove"
                variant="danger"
                size="small"
                onPress={removeImage}
                style={styles.imageActionButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <TouchableOpacity
              style={styles.imageUploadButton}
              onPress={showImageOptions}
            >
              <Ionicons name="camera" size={48} color={Colors.primary} />
              <Text style={styles.imageUploadText}>Tap to capture bike meter photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* KM Reading Input */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Manual KM Reading (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            You can enter the KM reading manually for better accuracy
          </Text>
          
          <InputField
            label="KM Reading"
            placeholder="Enter current KM reading"
            value={kmReading}
            onChangeText={validateKmReading}
            keyboardType="numeric"
            error={kmError}
            leftIcon={
              <Ionicons name="speedometer-outline" size={20} color={Colors.gray} />
            }
          />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Instructions:</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.instructionText}>
              Ensure the odometer display is clearly visible
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.instructionText}>
              Take the photo in good lighting conditions
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.instructionText}>
              Avoid blurry or tilted photos
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.instructionText}>
              Manual KM entry helps with report accuracy
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <Button
          title="Upload Reading"
          onPress={submitReading}
          loading={uploadingReading}
          disabled={uploadingReading || !capturedImage}
          style={styles.submitButton}
          icon={<Ionicons name="cloud-upload" size={20} color={Colors.white} />}
        />
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
    marginBottom: 24,
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
  },
  imageContainer: {
    marginBottom: 24,
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageActionButton: {
    flex: 1,
  },
  imagePlaceholder: {
    marginBottom: 24,
  },
  imageUploadButton: {
    height: 200,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  imageUploadText: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  instructionsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  submitButton: {
    marginBottom: 32,
  },
});

export default BikeMeterScreen;