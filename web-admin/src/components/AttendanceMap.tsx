'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton,
  Box,
  Typography,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { Close, LocationOn, Person } from '@mui/icons-material'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon, LatLngBounds } from 'leaflet'
import dayjs from 'dayjs'
import { Attendance } from '@/services/api'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

interface AttendanceMapProps {
  open: boolean
  onClose: () => void
  attendance: Attendance | Attendance[]
  title?: string
}

// Custom marker icons
const createCustomIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}"/>
    </svg>
  `)}`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
})

const checkInIcon = createCustomIcon('#4caf50')
const checkOutIcon = createCustomIcon('#ff9800')

export default function AttendanceMap({ open, onClose, attendance, title = 'Attendance Location' }: AttendanceMapProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [mapKey, setMapKey] = useState(0)

  // Normalize attendance to array
  const attendanceArray = Array.isArray(attendance) ? attendance : [attendance]

  // Calculate bounds for multiple markers
  const bounds = (() => {
    if (attendanceArray.length === 0) return undefined
    
    if (attendanceArray.length === 1) {
      const record = attendanceArray[0]
      return new LatLngBounds(
        [record.latitude - 0.01, record.longitude - 0.01],
        [record.latitude + 0.01, record.longitude + 0.01]
      )
    }

    const latitudes = attendanceArray.map(r => r.latitude)
    const longitudes = attendanceArray.map(r => r.longitude)
    
    return new LatLngBounds(
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)]
    )
  })()

  // Re-render map when dialog opens to fix sizing issues
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setMapKey(prev => prev + 1), 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  if (!open || attendanceArray.length === 0) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: { height: fullScreen ? '100%' : '80vh' }
      }}
    >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="primary" />
                <Typography variant="h6">{title}</Typography>
                {attendanceArray.length === 1 && (attendanceArray[0].user as any)?.location?.name && (
                  <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 1 }}>
                    {`(${(attendanceArray[0].user as any).location.name})`}
                  </Typography>
                )}
                {attendanceArray.length > 1 && (
                  <Chip 
                    label={`${attendanceArray.length} locations`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                )}
              </Box>
              <IconButton onClick={onClose} edge="end">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
      
      <DialogContent sx={{ p: 0, height: '100%' }}>
        <Box sx={{ height: '100%', width: '100%' }}>
          <MapContainer
            key={mapKey}
            bounds={bounds}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {attendanceArray.map((record) => (
              <Marker
                key={record.id}
                position={[record.latitude, record.longitude]}
                icon={record.type === 'MORNING' ? checkInIcon : checkOutIcon}
              >
                <Popup>
                  <Box sx={{ p: 1, minWidth: 200 }}>
                    {/* User Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar 
                        src={record.photoPath} 
                        sx={{ width: 40, height: 40 }}
                      >
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {record.user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {record.user.mobileNumber}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Attendance Details */}
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={record.type === 'MORNING' ? 'Check In' : 'Check Out'}
                        color={record.type === 'MORNING' ? 'success' : 'warning'}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    {/* Date & Time */}
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Date:</strong> {dayjs(record.capturedAt).format('MMM DD, YYYY')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Time:</strong> {dayjs(record.capturedAt).format('hh:mm A')}
                    </Typography>

                    {/* Coordinates */}
                    <Typography variant="body2" color="text.secondary">
                      <strong>Coordinates:</strong><br />
                      {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                    </Typography>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      </DialogContent>
    </Dialog>
  )
}