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
  Button,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  PersonOff,
  PersonAdd,
  Phone,
  Badge,
  CalendarToday,
} from '@mui/icons-material'
import { surveyorService, User } from '@/services/api'

interface SurveyorFormData {
  name: string
  mobileNumber: string
  password: string
  isActive: boolean
  hasBike?: boolean
}

export default function SurveyorsPage() {
  const [surveyors, setSurveyors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedSurveyor, setSelectedSurveyor] = useState<User | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)
  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [confirmContent, setConfirmContent] = useState('')
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null)
  
  // Form data
  const [formData, setFormData] = useState<SurveyorFormData>({
    name: '',
    mobileNumber: '',
    password: '',
    isActive: true,
    hasBike: false,
  })

  useEffect(() => {
    fetchSurveyors()
  }, [])

  const fetchSurveyors = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await surveyorService.getAll()
      setSurveyors(data)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch surveyors')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (mode: 'create' | 'edit', surveyor?: User) => {
    setDialogMode(mode)
    setSelectedSurveyor(surveyor || null)
    
    if (mode === 'edit' && surveyor) {
      setFormData({
        name: surveyor.name,
        mobileNumber: surveyor.mobileNumber,
        password: '', // Don't populate password for editing
        isActive: surveyor.isActive,
        hasBike: !!surveyor.hasBike,
      })
    } else {
      setFormData({
        name: '',
        mobileNumber: '',
        password: '',
        isActive: true,
        hasBike: false,
      })
    }
    
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedSurveyor(null)
    setFormData({
      name: '',
      mobileNumber: '',
      password: '',
      isActive: true,
      hasBike: false,
    })
  }

  const handleSubmit = async () => {
    try {
      setDialogLoading(true)
      
      if (dialogMode === 'create') {
        await surveyorService.create(formData as any)
      } else if (selectedSurveyor) {
        const updateData = { ...formData }
        if (!updateData.password) {
          delete (updateData as any).password // Don't update password if empty
        }
        await surveyorService.update(selectedSurveyor.id, updateData as any)
      }
      
      await fetchSurveyors()
      handleCloseDialog()
    } catch (error: any) {
      setError(error.message || 'Failed to save surveyor')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleToggleStatus = async (surveyor: User) => {
    try {
      await surveyorService.toggleStatus(surveyor.id)
      await fetchSurveyors()
    } catch (error: any) {
      setError(error.message || 'Failed to update surveyor status')
    }
  }

  const handleDelete = async (surveyor: User) => {
    try {
      await surveyorService.delete(surveyor.id)
      await fetchSurveyors()
    } catch (error: any) {
      setError(error.message || 'Failed to delete surveyor')
    }
  }

  // Helpers to open confirmation dialogs
  const confirmAndExecute = (title: string, content: string, action: () => Promise<void>) => {
    setConfirmTitle(title)
    setConfirmContent(content)
    setConfirmAction(() => action)
    setConfirmOpen(true)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setFormData({ 
      ...formData, 
      isActive: event.target.value === 'true'
    })
  }

  const activeSurveyors = surveyors.filter(s => s.isActive).length
  const inactiveSurveyors = surveyors.filter(s => !s.isActive).length
  const withBikeCount = surveyors.filter(s => s.role === 'SURVEYOR' && s.hasBike).length
  const withoutBikeCount = surveyors.filter(s => s.role === 'SURVEYOR' && !s.hasBike).length

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Surveyor Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog('create')}
        >
          Add Surveyor
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 240px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Badge />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {surveyors.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Surveyors
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 240px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <PersonAdd />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {activeSurveyors}
                  </Typography>
                  <Typography color="text.secondary">
                    Active Surveyors
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 240px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <PersonOff />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {inactiveSurveyors}
                  </Typography>
                  <Typography color="text.secondary">
                    Inactive Surveyors
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Surveyors Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Mobile Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Bike</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {surveyors
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((surveyor) => (
                <TableRow key={surveyor.id} hover>
                  <TableCell>
                    <Avatar sx={{ bgcolor: surveyor.isActive ? 'success.main' : 'grey.400' }}>
                      {surveyor.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {surveyor.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      {surveyor.mobileNumber}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={surveyor.isActive ? 'Active' : 'Inactive'}
                      color={surveyor.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={surveyor.hasBike ? 'Yes' : 'No'}
                      color={surveyor.hasBike ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      {new Date(surveyor.createdAt).toLocaleDateString()}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title={surveyor.isActive ? 'Edit Surveyor' : 'Edit disabled for inactive'}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => confirmAndExecute(
                              'Edit Surveyor',
                              `Open edit dialog for ${surveyor.name}?`,
                              async () => { handleOpenDialog('edit', surveyor) }
                            )}
                            disabled={!surveyor.isActive}
                          >
                            <Edit />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={surveyor.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => confirmAndExecute(
                            surveyor.isActive ? 'Deactivate Surveyor' : 'Activate Surveyor',
                            `${surveyor.isActive ? 'Deactivate' : 'Activate'} ${surveyor.name}?`,
                            async () => { await handleToggleStatus(surveyor) }
                          )}
                          color={surveyor.isActive ? 'warning' : 'success'}
                        >
                          {surveyor.isActive ? <PersonOff /> : <PersonAdd />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Surveyor">
                        <IconButton
                          size="small"
                          onClick={() => confirmAndExecute(
                            'Delete Surveyor',
                            `Are you sure you want to delete ${surveyor.name}? This action cannot be undone.`,
                            async () => { await handleDelete(surveyor) }
                          )}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
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
          count={surveyors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Generic Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <Typography>{confirmContent}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={async () => {
            setConfirmOpen(false)
            if (confirmAction) await confirmAction()
            setConfirmAction(null)
          }} variant="contained" color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New Surveyor' : 'Edit Surveyor'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Mobile Number"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              margin="normal"
              required
              type="tel"
            />
            <TextField
              fullWidth
              label={dialogMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required={dialogMode === 'create'}
              helperText={dialogMode === 'edit' ? 'Leave blank to keep current password' : ''}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.isActive ? 'true' : 'false'}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Bike</InputLabel>
              <Select
                value={formData.hasBike ? 'true' : 'false'}
                label="Bike"
                onChange={(e) => setFormData({ ...formData, hasBike: e.target.value === 'true' })}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={dialogLoading || !formData.name || !formData.mobileNumber || (dialogMode === 'create' && !formData.password)}
          >
            {dialogLoading ? <CircularProgress size={20} /> : (dialogMode === 'create' ? 'Create' : 'Update')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}