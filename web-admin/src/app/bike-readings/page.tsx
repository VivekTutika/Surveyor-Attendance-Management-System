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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  ImageList,
  ImageListItem,
  Chip,
} from '@mui/material'
import {
  DirectionsBike,
  Speed,
  TrendingUp,
  FilterList,
  Download,
  Close,
  CalendarToday,
  Person,
  ZoomIn,
  GridView,
  TableRows,
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
    startDate: dayjs().subtract(7, 'day'),
    endDate: dayjs(),
    userId: '',
  })

  // Photo dialog
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string>('')
  const [selectedReading, setSelectedReading] = useState<BikeMeterReading | null>(null)

  useEffect(() => {
    fetchSurveyors()
  }, [])

  useEffect(() => {
    fetchReadings()
  }, [page, rowsPerPage, filters])

  const fetchSurveyors = async () => {
    try {
      const data = await surveyorService.getAll()
      setSurveyors(data.surveyors)
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
      startDate: dayjs().subtract(7, 'day'),
      endDate: dayjs(),
      userId: '',
    })
    setPage(0)
  }

  const handlePhotoClick = (reading: BikeMeterReading) => {
    setSelectedPhoto(reading.photoPath)
    setSelectedReading(reading)
    setOpenPhotoDialog(true)
  }

  const handleExportCSV = () => {
    exportBikeReadingsToCSV(readings)
  }

  const handleExportPDF = () => {
    exportBikeReadingsToPDF(readings)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const totalReadings = readings.length
  const avgReading = readings.length > 0 
    ? readings.reduce((sum, r) => sum + r.reading, 0) / readings.length 
    : 0
  const maxReading = readings.length > 0 
    ? Math.max(...readings.map(r => r.reading)) 
    : 0

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Bike Meter Readings
          </Typography>
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
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Track and analyze bike odometer readings submitted by surveyors.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
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
                    <Typography color="text.secondary">
                      Total Readings
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <Speed />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="div">
                      {avgReading.toFixed(1)} KM
                    </Typography>
                    <Typography color="text.secondary">
                      Average Reading
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="div">
                      {maxReading.toFixed(1)} KM
                    </Typography>
                    <Typography color="text.secondary">
                      Highest Reading
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(value) => handleFilterChange('startDate', value)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(value) => handleFilterChange('endDate', value)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  size="small"
                  fullWidth
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  size="small"
                  fullWidth
                  onClick={handleExportCSV}
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Content based on view mode */}
        {viewMode === 'table' ? (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Photo</TableCell>
                    <TableCell>Surveyor</TableCell>
                    <TableCell>Reading (KM)</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {readings.map((reading) => (
                    <TableRow key={reading.id} hover>
                      <TableCell>
                        <Avatar
                          src={reading.photoPath}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 }
                          }}
                          onClick={() => handlePhotoClick(reading)}
                        >
                          <DirectionsBike />
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {reading.user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {reading.user.mobileNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${reading.reading} KM`}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" color="action" />
                          {dayjs(reading.capturedAt).format('MMM DD, YYYY')}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {dayjs(reading.capturedAt).format('hh:mm A')}
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
        ) : (
          <Paper sx={{ p: 2 }}>
            <ImageList variant="masonry" cols={4} gap={8}>
              {readings.map((reading) => (
                <ImageListItem key={reading.id}>
                  <img
                    src={reading.photoPath}
                    alt={`Reading by ${reading.user.name}`}
                    loading="lazy"
                    style={{
                      cursor: 'pointer',
                      borderRadius: 8,
                      transition: 'transform 0.2s',
                    }}
                    onClick={() => handlePhotoClick(reading)}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      color: 'white',
                      p: 1,
                      borderRadius: '0 0 8px 8px',
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {reading.user.name}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {reading.reading} KM • {dayjs(reading.capturedAt).format('MMM DD, YYYY')}
                    </Typography>
                  </Box>
                </ImageListItem>
              ))}
            </ImageList>
            {loading && (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <TablePagination
                rowsPerPageOptions={[12, 24, 48]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Paper>
        )}

        {/* Photo Dialog */}
        <Dialog
          open={openPhotoDialog}
          onClose={() => setOpenPhotoDialog(false)}
          maxWidth="md"
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">Bike Meter Reading</Typography>
                {selectedReading && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedReading.user.name} • {selectedReading.reading} KM • {dayjs(selectedReading.capturedAt).format('MMM DD, YYYY hh:mm A')}
                  </Typography>
                )}
              </Box>
              <IconButton onClick={() => setOpenPhotoDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={selectedPhoto}
                alt="Bike meter reading"
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