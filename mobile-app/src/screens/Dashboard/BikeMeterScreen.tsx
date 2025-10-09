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
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';

import { Button, LoadingSpinner, InputField } from '../../components';
import { Colors, Typography } from '../../theme';
import { uploadBikeMeterReading } from '../../store/bikeMeterSlice';
import { RootState, DashboardStackParamList } from '../../types';

type BikeMeterScreenNavigationProp = StackNavigationProp<DashboardStackParamList, 'BikeMeter'>;
type BikeMeterScreenRouteProp = RouteProp<DashboardStackParamList, 'BikeMeter'>;

interface Props {
  navigation: BikeMeterScreenNavigationProp;
  route: BikeMeterScreenRouteProp;
}

const BikeMeterScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<any>();
  const { submittingReading, error } = useSelector((state: RootState) => state.bikeMeter);
  
  const readingType = route.params?.type || 'MORNING';
  
  const [capturedImage, setCapturedImage] = useState<any>(null);
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
        aspect: [4, 3] as [number, number],
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
        aspect: [4, 3] as [number, number],
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

  const validateKmReading = (value: string) => {
    setKmReading(value);
    
    if (value && (isNaN(Number(value)) || parseFloat(value) <= 0)) {
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
        type: readingType as 'Morning' | 'Evening',
        photoUri: capturedImage.uri,
        reading: kmReading ? parseFloat(kmReading) : undefined,
        timestamp: new Date().toISOString(),
      })).unwrap();

      Alert.alert(
        'Success',
        `${readingType.toLowerCase()} bike meter reading uploaded successfully!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
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

        {/* Submit Button */}
        <View style={styles.actionSection}>
          <Button
            title="Upload Reading"
            onPress={submitReading}
            loading={submittingReading}
            disabled={submittingReading || !capturedImage}
            style={styles.submitButton}
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  actionSection: {
    marginTop: 20,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default BikeMeterScreen;