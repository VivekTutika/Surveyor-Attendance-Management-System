'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material'
import {
  Assignment,
  CheckCircle,
  Cancel,
  FilterList,
  Download,
  Close,
  LocationOn,
  CalendarToday,
  Person,
  Map,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import { attendanceService, surveyorService, Attendance, User } from '@/services/api'
import { exportAttendanceToCSV, exportAttendanceToPDF } from '@/utils/exportUtils'
import AttendanceMap from '@/components/AttendanceMap'
import '@/utils/leafletSetup'

interface AttendanceFilters {
  startDate: Dayjs | null
  endDate: Dayjs | null
  userId: string
  type: string
}

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([])
  const [surveyors, setSurveyors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  
  // Filter states
  const [filters, setFilters] = useState<AttendanceFilters>({
    startDate: dayjs().subtract(7, 'day'),
    endDate: dayjs(),
    userId: '',
    type: '',
  })

  // Photo dialog
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string>('')
  
  // Map dialog
  const [openMapDialog, setOpenMapDialog] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | Attendance[]>([])
  const [mapTitle, setMapTitle] = useState('')

  useEffect(() => {
    fetchSurveyors()
  }, [])

  useEffect(() => {
    fetchAttendance()
  }, [page, rowsPerPage, filters])

  const fetchSurveyors = async () => {
    try {
      const data = await surveyorService.getAll()
      setSurveyors(data.surveyors)
    } catch (error: any) {
      console.error('Failed to fetch surveyors:', error)
    }
  }

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
      }
      
      if (filters.startDate) {
        params.startDate = filters.startDate.format('YYYY-MM-DD')
      }
      if (filters.endDate) {
        params.endDate = filters.endDate.format('YYYY-MM-DD')
      }
      if (filters.userId) {
        params.userId = filters.userId
      }
      if (filters.type) {
        params.type = filters.type
      }

      const data = await attendanceService.getAll(params)
      setAttendanceData(data.attendance)
      setTotal(data.total)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field: keyof AttendanceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(0) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({
      startDate: dayjs().subtract(7, 'day'),
      endDate: dayjs(),
      userId: '',
      type: '',
    })
    setPage(0)
  }

  const handlePhotoClick = (photoPath: string) => {
    setSelectedPhoto(photoPath)
    setOpenPhotoDialog(true)
  }

  const handleLocationClick = (record: Attendance) => {
    setSelectedAttendance(record)
    setMapTitle(`${record.user.name} - ${record.type === 'CHECK_IN' ? 'Check In' : 'Check Out'}`)
    setOpenMapDialog(true)
  }

  const handleViewAllLocations = () => {
    setSelectedAttendance(attendanceData)
    setMapTitle('All Attendance Locations')
    setOpenMapDialog(true)
  }

  const handleExportCSV = () => {
    exportAttendanceToCSV(attendanceData)
  }

  const handleExportPDF = () => {
    exportAttendanceToPDF(attendanceData)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getAttendanceTypeColor = (type: string) => {
    return type === 'CHECK_IN' ? 'success' : 'warning'
  }

  const todayAttendance = attendanceData.filter(item => 
    dayjs(item.capturedAt).isSame(dayjs(), 'day')
  ).length

  const checkIns = attendanceData.filter(item => item.type === 'CHECK_IN').length
  const checkOuts = attendanceData.filter(item => item.type === 'CHECK_OUT').length

  if (loading && page === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Attendance Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          View and analyze surveyor attendance records with detailed filters and insights.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="div">
                      {total}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Records
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="div">
                      {checkIns}
                    </Typography>
                    <Typography color="text.secondary">
                      Check-ins
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Cancel />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="div">
                      {checkOuts}
                    </Typography>
                    <Typography color="text.secondary">
                      Check-outs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(value) => handleFilterChange('startDate', value)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Box>
            <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(value) => handleFilterChange('endDate', value)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Box>
            <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Surveyor</InputLabel>
                <Select
                  value={filters.userId}
                  label="Surveyor"
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                >
                  <MenuItem value="">All Surveyors</MenuItem>
                  {surveyors.map((surveyor) => (
                    <MenuItem key={surveyor.id} value={surveyor.id}>
                      {surveyor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Type"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="CHECK_IN">Check In</MenuItem>
                  <MenuItem value="CHECK_OUT">Check Out</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                size="small"
                sx={{ mr: 1 }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={<Map />}
                size="small"
                onClick={handleViewAllLocations}
                sx={{ mr: 1 }}
                disabled={attendanceData.length === 0}
              >
                View Map
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                size="small"
                onClick={handleExportCSV}
                sx={{ mr: 1 }}
              >
                CSV
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                size="small"
                onClick={handleExportPDF}
              >
                PDF
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Attendance Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Photo</TableCell>
                  <TableCell>Surveyor</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      <Avatar
                        src={record.photoPath}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 }
                        }}
                        onClick={() => handlePhotoClick(record.photoPath)}
                      >
                        <Person />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {record.user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {record.user.mobileNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.type === 'CHECK_IN' ? 'Check In' : 'Check Out'}
                        color={getAttendanceTypeColor(record.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        {dayjs(record.capturedAt).format('MMM DD, YYYY')}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {dayjs(record.capturedAt).format('hh:mm A')}
                    </TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderRadius: 1
                          },
                          p: 1,
                          borderRadius: 1
                        }}
                        onClick={() => handleLocationClick(record)}
                        title="Click to view on map"
                      >
                        <LocationOn fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="body2">
                            {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                          </Typography>
                          <Typography variant="caption" color="primary">
                            View on map
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {loading && (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          )}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Map Dialog */}
        <AttendanceMap
          open={openMapDialog}
          onClose={() => setOpenMapDialog(false)}
          attendance={selectedAttendance}
          title={mapTitle}
        />

        {/* Photo Dialog */}
        <Dialog
          open={openPhotoDialog}
          onClose={() => setOpenPhotoDialog(false)}
          maxWidth="md"
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Attendance Photo
              <IconButton onClick={() => setOpenPhotoDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={selectedPhoto}
                alt="Attendance photo"
                style={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}