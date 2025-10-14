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
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Snackbar,
} from '@mui/material'
import {
  DirectionsBike,
  FilterList,
  Download,
  Close,
  CalendarToday,
  Person,
  TableRows,
  GridView,
  Image,
  Upload,
  CheckCircle,
  Cancel,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import { bikeMeterService, surveyorService, BikeMeterReading, User } from '@/services/api'
import { exportBikeReadingsToCSV, exportBikeReadingsToPDF } from '@/utils/exportUtils'

interface BikeFilters {
  startDate: Dayjs | null
  endDate: Dayjs | null
  userId: string
  type: string
}

export default function BikeReadingsPage() {
  const [readings, setReadings] = useState<BikeMeterReading[]>([])
  const [surveyors, setSurveyors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table')
  
  // Filter states
  const [filters, setFilters] = useState<BikeFilters>({
    // Default to today's readings (admin can change to view history)
    startDate: dayjs(),
    endDate: dayjs(),
    userId: '',
    type: '',
  })

  // Photo dialog
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string>('')
  const [selectedReading, setSelectedReading] = useState<BikeMeterReading | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [revertDialogOpen, setRevertDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  // Local editing values to avoid mutating the main readings state while typing
  const [editingValues, setEditingValues] = useState<Record<string, string>>({})
  // confirmMode: 'upload' | 'update' to change dialog title and button colors
  const [confirmMode, setConfirmMode] = useState<'upload' | 'update'>('upload')
  // Value used inside the confirm dialog (editable)
  const [confirmValue, setConfirmValue] = useState<string>('')
  // Snackbar for messages (center aligned)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMsg, setSnackbarMsg] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success')

  useEffect(() => {
    fetchSurveyors()
  }, [])

  useEffect(() => {
    fetchReadings()
  }, [page, rowsPerPage, filters])

  const fetchSurveyors = async () => {
    try {
      const data = await surveyorService.getAll()
      setSurveyors(data)
    } catch (error: any) {
      console.error('Failed to fetch surveyors:', error)
    }
  }

  const fetchReadings = async () => {
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

      const data = await bikeMeterService.getAll(params)
      setReadings(data.readings)
      setTotal(data.total)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch bike readings')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field: keyof BikeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const clearFilters = () => {
    setFilters({
      // reset to today's readings by default
      startDate: dayjs(),
      endDate: dayjs(),
      userId: '',
      type: '',
    })
    setPage(0)
  }

  const handlePhotoClick = (reading: BikeMeterReading) => {
    setSelectedPhoto(reading.photoPath)
    setSelectedReading(reading)
    setOpenPhotoDialog(true)
  }

  const handleExportCSV = () => {
    exportBikeReadingsToCSV(readings ?? [])
  }

  const handleExportPDF = () => {
    exportBikeReadingsToPDF(readings ?? [])
  }

  const handleConfirmUpload = async () => {
    if (!selectedReading) return
    const id = selectedReading.id
    const km = Number(confirmValue)
    if (!km || Number.isNaN(km)) {
      setError('Please enter a valid KM reading')
      return
    }
    try {
      setIsUploading(true)
      await bikeMeterService.updateKmReading(id, km)
      // After upload, reset to first page and refresh so the uploaded reading appears
      setPage(0)
      await fetchReadings()
      setConfirmDialogOpen(false)
      // clear editing value for this row
      setEditingValues(prev => ({ ...prev, [id]: '' }))
      // show snackbar
      setSnackbarMsg('KM reading uploaded successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (err: any) {
      console.error('Upload error:', err)
      const backendMessage = err?.response?.data?.message || err?.response?.data || err?.message
      setError(backendMessage || 'Failed to upload KM reading')
    } finally {
      setIsUploading(false)
    }
  }

  const handleConfirmRevert = async () => {
    if (!selectedReading) return
    const id = selectedReading.id
    try {
      setIsUploading(true)
      // Clear only the km reading (do not delete the row)
      await bikeMeterService.clearReading(id)
      // After revert, reset to first page and refresh
      setPage(0)
      await fetchReadings()
      setRevertDialogOpen(false)
      setSnackbarMsg('KM reading cleared successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (err: any) {
      console.error('Revert error:', err)
      const backendMessage = err?.response?.data?.message || err?.response?.data || err?.message
      setError(backendMessage || 'Failed to revert bike reading')
    } finally {
      setIsUploading(false)
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const totalReadings = readings?.length || 0
  // Compute check ins/outs similar to attendance
  const checkIns = readings?.filter(r => r.type === 'MORNING').length || 0
  const checkOuts = readings?.filter(r => r.type === 'EVENING').length || 0

  if (loading && page === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        {/* Centered Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              startIcon={<TableRows />}
              onClick={() => setViewMode('table')}
              size="small"
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'gallery' ? 'contained' : 'outlined'}
              startIcon={<GridView />}
              onClick={() => setViewMode('gallery')}
              size="small"
            >
              Gallery
            </Button>
          </Box>

          {/* Bike ownership summary cards next to view buttons */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}><DirectionsBike /></Avatar>
                  <Box>
                    <Typography variant="h6">{surveyors.filter(s => s.hasBike).length}</Typography>
                    <Typography color="text.secondary">With Bike</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'default' }}><DirectionsBike /></Avatar>
                  <Box>
                    <Typography variant="h6">{surveyors.filter(s => !s.hasBike).length}</Typography>
                    <Typography color="text.secondary">Without Bike</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards - show Check Ins and Check Outs like Attendance */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <DirectionsBike />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="div">
                      {totalReadings}
                    </Typography>
                    <Typography color="text.secondary">Total Readings</Typography>
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
                    <Typography color="text.secondary">Check Ins</Typography>
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
                    <Typography color="text.secondary">Check Outs</Typography>
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

        {viewMode === 'table' ? (
          /* Bike Readings Table */
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Surveyor</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Photo</TableCell>
                    <TableCell align="center">Reading (KM)</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(readings ?? [])
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((reading) => (
                    <TableRow key={reading.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="medium">
                            {reading.user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({reading.user.mobileNumber})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" color="action" />
                          {new Date(reading.capturedAt).toLocaleString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={reading.type === 'MORNING' ? 'Check In' : reading.type === 'EVENING' ? 'Check Out' : '—'}
                          size="small"
                          color={reading.type === 'MORNING' ? 'success' : reading.type === 'EVENING' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {reading.photoPath && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handlePhotoClick(reading)}
                          >
                            View Photo
                          </Button>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {/* If a reading exists, show it as text. If not, allow inline entry. */}
                        {reading.reading !== null && reading.reading !== undefined ? (
                          <Typography sx={{ minWidth: 80, textAlign: 'center' }}>{`${reading.reading} KM`}</Typography>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{ min: 0, step: 0.1 }}
                              value={editingValues[reading.id] ?? ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setEditingValues(prev => ({ ...prev, [reading.id]: val }))
                              }}
                              sx={{ width: 120 }}
                            />
                            <Button size="small" onClick={() => setEditingValues(prev => ({ ...prev, [reading.id]: '' }))}>Clear</Button>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color={reading.reading !== undefined && reading.reading !== null ? 'success' : 'primary'}
                            startIcon={<Upload />}
                            onClick={() => {
                              // Determine the mode based on whether the row already had a stored reading
                              const originalHadReading = reading.reading !== undefined && reading.reading !== null
                              setConfirmMode(originalHadReading ? 'update' : 'upload')

                              // Use editing value if present; otherwise prefill with existing reading (for update)
                              const rawVal = editingValues[reading.id]
                              const prefill = rawVal !== undefined && rawVal !== '' ? rawVal : (originalHadReading ? String(reading.reading) : '')

                              // set confirmValue and selectedReading, then open dialog
                              setConfirmValue(prefill)
                              setSelectedReading({ ...reading, reading: prefill !== '' ? Number(prefill) : undefined as any })
                              setConfirmDialogOpen(true)
                            }}
                            disabled={
                              !((editingValues[reading.id] !== undefined && editingValues[reading.id] !== '' && !Number.isNaN(Number(editingValues[reading.id]))) || (reading.reading !== undefined && reading.reading !== null))
                            }
                          >
                            {reading.reading !== undefined && reading.reading !== null ? 'Update' : 'Upload'}
                          </Button>

                          {/* Revert/Delete action - visible when a reading exists */}
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              setSelectedReading(reading)
                              setRevertDialogOpen(true)
                            }}
                            disabled={!reading.reading}
                          >
                            Revert
                          </Button>
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
        ) : (
          /* Gallery View */
          <Box>
              {(readings ?? []).length === 0 ? (
              <Alert severity="info">No bike readings found.</Alert>
            ) : (
              <>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {(readings ?? [])
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((reading) => (
                    <Box key={reading.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {reading.reading} KM
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {reading.user.name}
                              </Typography>
                            </Box>
                            <Chip
                              label={new Date(reading.capturedAt).toLocaleDateString()}
                              size="small"
                            />
                          </Box>
                          
                          {reading.photoPath && (
                            <Box 
                              sx={{ 
                                width: '100%', 
                                height: 200, 
                                borderRadius: 2, 
                                overflow: 'hidden',
                                mb: 2,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 }
                              }}
                              onClick={() => handlePhotoClick(reading)}
                            >
                              <img 
                                src={reading.photoPath} 
                                alt="Bike reading" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(reading.capturedAt).toLocaleTimeString()}
                            </Typography>
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => handlePhotoClick(reading)}
                              disabled={!reading.photoPath}
                            >
                              View Photo
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
                
                <TablePagination
                  rowsPerPageOptions={[6, 12, 24]}
                  component="div"
                  count={total}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </Box>
        )}

        {/* Photo Dialog */}
        <Dialog
          open={openPhotoDialog}
          onClose={() => setOpenPhotoDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Bike Reading Photo
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
                alt="Bike reading" 
                style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
              />
            </Box>
            {selectedReading && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  {selectedReading.reading} KM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedReading.user.name} • {new Date(selectedReading.capturedAt).toLocaleString()}
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
        {/* Confirm Upload Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>{confirmMode === 'update' ? 'Confirm KM Update' : 'Confirm KM Upload'}</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2 }}>
              <Typography sx={{ mb: 1 }}>
                {confirmMode === 'update' ? 'Enter the new KM reading for ' : 'Enter the KM reading for '}
                <strong>{selectedReading?.user.name}</strong>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, step: 0.1 }}
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button onClick={() => setConfirmDialogOpen(false)} disabled={isUploading}>Cancel</Button>
                <Button variant="contained" color={confirmMode === 'update' ? 'success' : 'primary'} onClick={handleConfirmUpload} disabled={isUploading}>
                  {isUploading ? (confirmMode === 'update' ? 'Updating...' : 'Uploading...') : (confirmMode === 'update' ? 'Confirm Update' : 'Confirm Upload')}
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
        {/* Revert (Clear Reading) Confirm Dialog */}
        <Dialog
          open={revertDialogOpen}
          onClose={() => setRevertDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirm Clear KM Reading</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2 }}>
              <Typography>
                This will clear only the KM reading value for{' '}
                <strong>{selectedReading?.user.name}</strong>. The photo and record will remain.
              </Typography>
              <Typography sx={{ mt: 1, mb: 2 }} color="text.secondary">
                Reading to clear: <strong>{selectedReading?.reading} KM</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button onClick={() => setRevertDialogOpen(false)} disabled={isUploading}>Cancel</Button>
                <Button variant="contained" color="error" onClick={handleConfirmRevert} disabled={isUploading}>
                  {isUploading ? 'Reverting...' : 'Confirm Revert'}
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}