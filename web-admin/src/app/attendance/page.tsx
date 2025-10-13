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
import { useAuth } from '@/context/AuthContext'
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
    // Default to today's date only (admin dashboard should show today's attendance by default)
    startDate: dayjs(),
    endDate: dayjs(),
    userId: '',
    type: '',
  })

  // Photo dialog
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string>('')
  // Approve confirmation dialog
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null)
  const [approveTargetApproved, setApproveTargetApproved] = useState<boolean | null>(null)
  
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
      setSurveyors(data)
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

  const { user } = useAuth()

  const handleApprove = async (id: string) => {
    try {
      setLoading(true)
      await attendanceService.approve(id)
      // Refetch updated list
      await fetchAttendance()
    } catch (error: any) {
      console.error('Approve failed:', error)
      setError(error.message || 'Approve failed')
    } finally {
      setLoading(false)
    }
  }

  // Open approve dialog with current approved state
  const openApproveDialog = (id: string, currentlyApproved: boolean) => {
    setApproveTargetId(id)
    setApproveTargetApproved(currentlyApproved)
    setApproveDialogOpen(true)
  }

  const handleLocationClick = (record: Attendance) => {
    setSelectedAttendance(record)
    setMapTitle(`${record.user.name} - ${record.type === 'MORNING' ? 'Check In' : 'Check Out'}`)
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
    // Backend returns 'MORNING' or 'EVENING'
    return type === 'MORNING' ? 'success' : 'warning'
  }

  // Counts should reflect the current attendanceData (which is filtered by selected dates)
  const todayAttendance = attendanceData.filter(item => 
    dayjs(item.capturedAt).isSame(dayjs(), 'day')
  ).length

  const checkIns = attendanceData.filter(item => item.type === 'MORNING').length
  const checkOuts = attendanceData.filter(item => item.type === 'EVENING').length

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Map />}
              onClick={handleViewAllLocations}
              disabled={attendanceData.length === 0}
            >
              View All Locations
            </Button>
            {/* Exports moved to Reports page */}
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Track and manage attendance records submitted by surveyors.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards (flex layout) */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ flex: '1 1 300px' }}>
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

          <Box sx={{ flex: '1 1 300px' }}>
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
                      Check Ins
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px' }}>
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
                      Check Outs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              Filters
            </Typography>
            
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(newValue) => handleFilterChange('startDate', newValue)}
              format="DD/MM/YYYY"
            />
            
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(newValue) => handleFilterChange('endDate', newValue)}
              format="DD/MM/YYYY"
            />
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Surveyor</InputLabel>
              <Select
                value={filters.userId}
                label="Surveyor"
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              >
                <MenuItem value="">
                  <em>All Surveyors</em>
                </MenuItem>
                {surveyors.map((surveyor) => (
                  <MenuItem key={surveyor.id} value={surveyor.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" />
                      {surveyor.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                <MenuItem value="MORNING">Check In</MenuItem>
                <MenuItem value="EVENING">Check Out</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Box>
        </Paper>

        {/* Attendance Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Surveyor</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Photo</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="medium">
                          {record.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({record.user.mobileNumber})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        {new Date(record.capturedAt).toLocaleString()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.type === 'MORNING' ? 'Check In' : 'Check Out'}
                        color={getAttendanceTypeColor(record.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {record.photoPath && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handlePhotoClick(record.photoPath)}
                        >
                          View Photo
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleLocationClick(record)}
                        disabled={!record.latitude || !record.longitude}
                      >
                        <LocationOn 
                          color={record.latitude && record.longitude ? 'primary' : 'disabled'} 
                        />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {user?.role === 'ADMIN' && (
                          <Button
                            size="small"
                            variant={record.approved ? 'contained' : 'outlined'}
                            color={record.approved ? 'success' : 'primary'}
                            onClick={() => openApproveDialog(record.id, !!record.approved)}
                          >
                            {record.approved ? 'Approved' : 'Approve'}
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Photo Dialog */}
        <Dialog
          open={openPhotoDialog}
          onClose={() => setOpenPhotoDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Attendance Photo
            <IconButton
              onClick={() => setOpenPhotoDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <img 
                src={selectedPhoto} 
                alt="Attendance" 
                style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
              />
            </Box>
          </DialogContent>
        </Dialog>

        {/* Approve Confirmation Dialog */}
        <Dialog
          open={approveDialogOpen}
          onClose={() => { setApproveDialogOpen(false); setApproveTargetId(null); setApproveTargetApproved(null); }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>{approveTargetApproved ? 'Confirm Disapproval' : 'Confirm Approval'}</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2 }}>
              <Typography>
                {approveTargetApproved
                  ? 'Are you sure you want to disapprove this attendance record?'
                  : 'Are you sure you want to approve this attendance record?'
                }
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button onClick={() => { setApproveDialogOpen(false); setApproveTargetId(null); setApproveTargetApproved(null); }}>Cancel</Button>
                <Button variant="contained" onClick={async () => {
                  if (!approveTargetId) return;
                  setApproveDialogOpen(false);
                  await handleApprove(approveTargetId);
                  setApproveTargetId(null);
                  setApproveTargetApproved(null);
                }}>Confirm</Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Map Dialog: use AttendanceMap's own dialog props */}
        <AttendanceMap
          open={openMapDialog}
          onClose={() => setOpenMapDialog(false)}
          attendance={Array.isArray(selectedAttendance) ? selectedAttendance : [selectedAttendance]}
          title={mapTitle}
        />
      </Box>
    </LocalizationProvider>
  )
}