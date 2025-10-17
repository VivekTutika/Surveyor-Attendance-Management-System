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
  Checkbox,
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
import { attendanceService, surveyorService, authService, Attendance, User } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { exportAttendanceToCSV, exportAttendanceToPDF } from '@/utils/exportUtils'
import AttendanceMap from '@/components/AttendanceMap'
import '@/utils/leafletSetup'

interface AttendanceFilters {
  startDate: Dayjs | null
  endDate: Dayjs | null
  userId: string
  type: string
  projectId?: string
  locationId?: string
}

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([])
  const [surveyors, setSurveyors] = useState<User[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(50)
  const [total, setTotal] = useState(0)
  const [adminProfile, setAdminProfile] = useState<any>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAllLoading, setSelectAllLoading] = useState(false)
  const [bulkApproveDialogOpen, setBulkApproveDialogOpen] = useState(false)
  const [bulkApproving, setBulkApproving] = useState(false)
  
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

  useEffect(() => { fetchProjectList(); fetchLocationList() }, [])
  const fetchProjectList = async () => {
    try { const p = await surveyorService.getProjects(); setProjects(p || []) } catch (e) { console.error('Failed to load projects', e) }
  }
  const fetchLocationList = async () => {
    try { const l = await surveyorService.getLocations(); setLocations(l || []) } catch (e) { console.error('Failed to load locations', e) }
  }

  useEffect(() => { fetchProfile() }, [])
  const fetchProfile = async () => {
    try { const p = await authService.getProfile(); setAdminProfile(p) } catch (e) { console.error(e) }
  }

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
      if (filters.projectId) {
        params.projectId = filters.projectId
      }
      if (filters.locationId) {
        params.locationId = filters.locationId
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
      startDate: dayjs(),
      endDate: dayjs(),
      userId: '',
      type: '',
      projectId: '',
      locationId: '',
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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const clearSelection = () => setSelectedIds([])

  const selectAllOnPage = (rows: Attendance[]) => {
    const ids = rows.map(r => r.id)
    const allSelected = ids.every(i => selectedIds.includes(i))
    if (allSelected) {
      // unselect all on page
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)))
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...ids])))
    }
  }

  const selectAllMatching = async () => {
    try {
      setSelectAllLoading(true)
      const params: any = {}
      if (filters.startDate) params.startDate = filters.startDate.format('YYYY-MM-DD')
      if (filters.endDate) params.endDate = filters.endDate.format('YYYY-MM-DD')
      if (filters.userId) params.userId = filters.userId
      if (filters.type) params.type = filters.type
      if (filters.projectId) params.projectId = filters.projectId
      if (filters.locationId) params.locationId = filters.locationId
      // fetch without pagination to get all matching ids
      const data = await attendanceService.getAll(params)
      const ids = (data.attendance || []).map((a: Attendance) => a.id)
      setSelectedIds(ids)
    } catch (err) {
      console.error('Select all matching failed', err)
      setError((err as any)?.message || 'Failed to select all')
    } finally {
      setSelectAllLoading(false)
    }
  }

  const openBulkApproveDialog = () => setBulkApproveDialogOpen(true)

  const handleBulkApproveConfirm = async () => {
    setBulkApproveDialogOpen(false)
    if (selectedIds.length === 0) return
    try {
      setBulkApproving(true)
      // Approve in parallel but allow individual failures
      await Promise.all(selectedIds.map(id => attendanceService.approve(id).catch(e => { console.error('bulk approve error', id, e); return null })))
      // Refresh data and clear selection
      await fetchAttendance()
      clearSelection()
    } catch (err) {
      console.error('Bulk approve failed', err)
      setError((err as any)?.message || 'Bulk approve failed')
    } finally {
      setBulkApproving(false)
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

  // Sort attendanceData to show latest first (capturedAt descending)
  const attendanceSorted = [...attendanceData].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())

  const handleViewAllLocations = () => {
    setSelectedAttendance(attendanceSorted)
    setMapTitle('All Attendance Locations')
    setOpenMapDialog(true)
  }

  const handleExportCSV = () => {
    const surveyorName = filters.userId ? (surveyors.find(s => String(s.id) === String(filters.userId))?.name ?? null) : null
    exportAttendanceToCSV(attendanceSorted, { surveyorName, startDate: filters.startDate?.format?.('YYYY-MM-DD') ?? null, endDate: filters.endDate?.format?.('YYYY-MM-DD') ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
  }

  const handleExportPDF = () => {
    const surveyorName = filters.userId ? (surveyors.find(s => String(s.id) === String(filters.userId))?.name ?? null) : null
    exportAttendanceToPDF(attendanceSorted, { surveyorName, startDate: filters.startDate?.format?.('YYYY-MM-DD') ?? null, endDate: filters.endDate?.format?.('YYYY-MM-DD') ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
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
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Map />}
              onClick={handleViewAllLocations}
              disabled={attendanceData.length === 0}
            >
              View All Locations
            </Button>
            {user?.role === 'ADMIN' && (
              <>
                <Button variant="contained" color="primary" onClick={openBulkApproveDialog} disabled={selectedIds.length === 0} sx={{ ml: 1 }}>
                  Approve All ({selectedIds.length})
                </Button>
                <Button variant="text" onClick={selectAllMatching} disabled={selectAllLoading || attendanceData.length === 0} sx={{ ml: 1 }}>
                  {selectAllLoading ? 'Selecting...' : 'Select All Matching'}
                </Button>
              </>
            )}
          </Box>
        </Box>
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
                  <MenuItem key={surveyor.id} value={surveyor.id}>{surveyor.name}</MenuItem>
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
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Project</InputLabel>
              <Select value={filters.projectId ?? ''} label="Project" onChange={(e) => handleFilterChange('projectId', e.target.value)}>
                <MenuItem value=""><em>All Projects</em></MenuItem>
                {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Location</InputLabel>
              <Select value={filters.locationId ?? ''} label="Location" onChange={(e) => handleFilterChange('locationId', e.target.value)}>
                <MenuItem value=""><em>All Locations</em></MenuItem>
                {locations.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedIds.length > 0 && selectedIds.length < Math.min(rowsPerPage, attendanceSorted.length)}
                      checked={selectedIds.length > 0 && selectedIds.length === Math.min(rowsPerPage, attendanceSorted.length)}
                      onChange={() => selectAllOnPage(attendanceSorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage))}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Employee ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Surveyor</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Photo</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceSorted
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((record) => (
                  <TableRow key={record.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedIds.includes(record.id)} onChange={() => toggleSelect(record.id)} />
                      </TableCell>
                      <TableCell align="center">{(record.user as any)?.employeeId ?? ''}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {record.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({record.user.mobileNumber})
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                        <CalendarToday fontSize="small" color="action" />
                        {new Date(record.capturedAt).toLocaleString()}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={record.type === 'MORNING' ? 'Check In' : 'Check Out'}
                        color={getAttendanceTypeColor(record.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
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
                    <TableCell align="center">
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
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
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
            rowsPerPageOptions={[10, 25, 50, 100]}
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

        {/* Bulk Approve Confirmation Dialog */}
        <Dialog
          open={bulkApproveDialogOpen}
          onClose={() => setBulkApproveDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirm Bulk Approve</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2 }}>
              <Typography>Are you sure you want to approve the selected attendance records ({selectedIds.length})?</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button onClick={() => setBulkApproveDialogOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleBulkApproveConfirm} disabled={bulkApproving}>{bulkApproving ? 'Approving...' : 'Confirm'}</Button>
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