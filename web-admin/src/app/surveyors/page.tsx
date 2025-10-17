'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Snackbar,
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
  employeeId?: string
  aadharNumber?: string
  isActive: boolean
  hasBike?: boolean
  projectId?: number | ''
  locationId?: number | ''
}

export default function SurveyorsPage() {
  const [surveyors, setSurveyors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  
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
    employeeId: '',
    aadharNumber: '',
    isActive: true,
    hasBike: false,
    projectId: '',
    locationId: '',
  })
  const [projects, setProjects] = useState<Array<{id:number;name:string}>>([])
  const [locations, setLocations] = useState<Array<{id:number;name:string}>>([])
  // Add Project/Location dialog states
  const [addProjectOpen, setAddProjectOpen] = useState(false)
  const [addLocationOpen, setAddLocationOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newLocationName, setNewLocationName] = useState('')
  const [creatingMeta, setCreatingMeta] = useState(false)
  // Update/Delete project/location states
  const [updateProjectOpen, setUpdateProjectOpen] = useState(false)
  const [updateLocationOpen, setUpdateLocationOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('')
  const [editMetaName, setEditMetaName] = useState('')
  const [deletingMetaType, setDeletingMetaType] = useState<'project' | 'location' | null>(null)
  // Snackbar for success/info messages
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success')
  // Column filter states: 'all' | 'active' | 'inactive' for status
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  // Bike filter: 'all' | 'yes' | 'no'
  const [bikeFilter, setBikeFilter] = useState<'all' | 'yes' | 'no'>('all')
  // Additional filter selections to mirror Reports page
  const [selectedSurveyorFilter, setSelectedSurveyorFilter] = useState<string>('')
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('')
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('')

  useEffect(() => {
    fetchSurveyors()
  }, [])

  // fetch projects and locations for selects
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const p = await surveyorService.getProjects()
        setProjects(p || [])
      } catch (e) {
        // ignore
      }
      try {
        const l = await surveyorService.getLocations()
        setLocations(l || [])
      } catch (e) {
        // ignore
      }
    }
    fetchMeta()
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
        aadharNumber: (surveyor as any).aadharNumber ?? '',
        employeeId: surveyor.employeeId ?? '',
        password: '', // Don't populate password for editing
        isActive: surveyor.isActive,
        hasBike: !!surveyor.hasBike,
        projectId: surveyor.project?.id ?? '',
        locationId: surveyor.location?.id ?? '',
      })
    } else {
      setFormData({
        name: '',
        mobileNumber: '',
        password: '',
        employeeId: '',
        aadharNumber: '',
        isActive: true,
        hasBike: false,
        projectId: '',
        locationId: '',
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
      employeeId: '',
      isActive: true,
      hasBike: false,
      projectId: '',
      locationId: '',
    })
  }

  const handleSubmit = async () => {
    try {
      // Client-side Aadhar validation: required on create, optional on update (but if present must be 12 digits)
      const aadhar = formData.aadharNumber ?? ''
      if (dialogMode === 'create') {
        if (!/^\d{12}$/.test(aadhar)) {
          setError('Aadhar Number must be exactly 12 digits')
          return
        }
      } else {
        if (aadhar && !/^\d{12}$/.test(aadhar)) {
          setError('Aadhar Number must be exactly 12 digits')
          return
        }
      }

      setDialogLoading(true)

      if (dialogMode === 'create') {
        await surveyorService.create(formData)
      } else if (selectedSurveyor) {
        const updateData = { ...formData }
        if (!updateData.password) {
          delete (updateData as any).password // Don't update password if empty
        }
        await surveyorService.update(selectedSurveyor.id, updateData)
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

  const handleCreateProject = async () => {
    try {
      if (!newProjectName.trim()) return
      setCreatingMeta(true)
      await surveyorService.createProject({ name: newProjectName.trim() })
      // refresh meta lists
      const p = await surveyorService.getProjects()
      setProjects(p || [])
      setNewProjectName('')
      setAddProjectOpen(false)
      // show success snackbar
      setSnackbarMessage('Project created successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setCreatingMeta(false)
    }
  }

  const handleCreateLocation = async () => {
    try {
      if (!newLocationName.trim()) return
      setCreatingMeta(true)
      await surveyorService.createLocation({ name: newLocationName.trim() })
      const l = await surveyorService.getLocations()
      setLocations(l || [])
      setNewLocationName('')
      setAddLocationOpen(false)
      // show success snackbar
      setSnackbarMessage('Location created successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create location')
    } finally {
      setCreatingMeta(false)
    }
  }

  // Update project flow
  const openUpdateProject = () => {
    setSelectedProjectId('')
    setEditMetaName('')
    setUpdateProjectOpen(true)
  }

  const handleStartEditProject = (id: number) => {
    const p = projects.find(pr => pr.id === id)
    if (!p) return
    setSelectedProjectId(id)
    setEditMetaName(p.name)
  }

  const handleConfirmUpdateProject = async () => {
    if (!selectedProjectId || !editMetaName.trim()) return
    confirmAndExecute('Update Project', `Update project to "${editMetaName}"?`, async () => {
      try {
        setCreatingMeta(true)
        await surveyorService.updateProject(selectedProjectId, { name: editMetaName.trim() })
        const p = await surveyorService.getProjects()
        setProjects(p || [])
        setUpdateProjectOpen(false)
        setSnackbarMessage('Project updated successfully')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      } catch (err: any) {
        setError(err.message || 'Failed to update project')
      } finally {
        setCreatingMeta(false)
      }
    })
  }

  // Delete project
  const handleDeleteProject = async (id: number) => {
    confirmAndExecute('Delete Project', `Are you sure you want to delete this project? This action cannot be undone.`, async () => {
      try {
        setCreatingMeta(true)
        await surveyorService.deleteProject(id)
        const p = await surveyorService.getProjects()
        setProjects(p || [])
        setSnackbarMessage('Project deleted successfully')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      } catch (err: any) {
        setError(err.message || 'Failed to delete project')
      } finally {
        setCreatingMeta(false)
      }
    })
  }

  // Update location flow
  const openUpdateLocation = () => {
    setSelectedLocationId('')
    setEditMetaName('')
    setUpdateLocationOpen(true)
  }

  const handleStartEditLocation = (id: number) => {
    const l = locations.find(loc => loc.id === id)
    if (!l) return
    setSelectedLocationId(id)
    setEditMetaName(l.name)
  }

  const handleConfirmUpdateLocation = async () => {
    if (!selectedLocationId || !editMetaName.trim()) return
    confirmAndExecute('Update Location', `Update location to "${editMetaName}"?`, async () => {
      try {
        setCreatingMeta(true)
        await surveyorService.updateLocation(selectedLocationId, { name: editMetaName.trim() })
        const l = await surveyorService.getLocations()
        setLocations(l || [])
        setUpdateLocationOpen(false)
        setSnackbarMessage('Location updated successfully')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      } catch (err: any) {
        setError(err.message || 'Failed to update location')
      } finally {
        setCreatingMeta(false)
      }
    })
  }

  const handleDeleteLocation = async (id: number) => {
    confirmAndExecute('Delete Location', `Are you sure you want to delete this location? This action cannot be undone.`, async () => {
      try {
        setCreatingMeta(true)
        await surveyorService.deleteLocation(id)
        const l = await surveyorService.getLocations()
        setLocations(l || [])
        setSnackbarMessage('Location deleted successfully')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      } catch (err: any) {
        setError(err.message || 'Failed to delete location')
      } finally {
        setCreatingMeta(false)
      }
    })
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

  // filtered list for table (applies status and bike filters)
  const filteredSurveyors = surveyors.filter(s => {
    if (statusFilter === 'active' && !s.isActive) return false
    if (statusFilter === 'inactive' && s.isActive) return false
    if (bikeFilter === 'yes' && !s.hasBike) return false
    if (bikeFilter === 'no' && s.hasBike) return false
    if (selectedSurveyorFilter && String(s.id) !== String(selectedSurveyorFilter)) return false
    if (selectedProjectFilter && String(s.project?.id) !== String(selectedProjectFilter)) return false
    if (selectedLocationFilter && String(s.location?.id) !== String(selectedLocationFilter)) return false
    return true
  })

  // sort filtered surveyors by employeeId (numeric if possible)
  const filteredAndSortedSurveyors = [...filteredSurveyors].sort((a, b) => {
    const ax = (a.employeeId ?? '').toString()
    const ay = (b.employeeId ?? '').toString()
    const nx = Number(ax)
    const ny = Number(ay)
    if (!isNaN(nx) && !isNaN(ny)) return nx - ny
    return ax.localeCompare(ay)
  })

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog('create')}>Add Surveyor</Button>
        <Button variant="contained" startIcon={<Add />} onClick={() => confirmAndExecute('Add Project', 'Create a new project?', async () => { setAddProjectOpen(true) })}>Add Project</Button>
        <Button variant="outlined" onClick={openUpdateProject}>Update Project</Button>
        <Button variant="outlined" color="error" onClick={() => { setDeletingMetaType('project'); setSelectedProjectId('') }}>Delete Project</Button>
        <Button variant="contained" startIcon={<Add />} onClick={() => confirmAndExecute('Add Location', 'Create a new location?', async () => { setAddLocationOpen(true) })}>Add Location</Button>
        <Button variant="outlined" onClick={openUpdateLocation}>Update Location</Button>
        <Button variant="outlined" color="error" onClick={() => { setDeletingMetaType('location'); setSelectedLocationId('') }}>Delete Location</Button>
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
      {/* Filters: moved under stats cards per request */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel>Surveyor</InputLabel>
            <Select value={selectedSurveyorFilter} label="Surveyor" onChange={(e) => { setSelectedSurveyorFilter(e.target.value as string); setPage(0) }}>
              <MenuItem value=""><em>All Surveyors</em></MenuItem>
              {surveyors.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel>Project</InputLabel>
            <Select value={selectedProjectFilter} label="Project" onChange={(e) => { setSelectedProjectFilter(e.target.value as string); setPage(0) }}>
              <MenuItem value=""><em>All Projects</em></MenuItem>
              {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel>Location</InputLabel>
            <Select value={selectedLocationFilter} label="Location" onChange={(e) => { setSelectedLocationFilter(e.target.value as string); setPage(0) }}>
              <MenuItem value=""><em>All Locations</em></MenuItem>
              {locations.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Mobile Number</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Location</TableCell>
                <TableCell
                  onClick={() => {
                    // cycle: all -> active -> inactive -> all
                    setStatusFilter(s => s === 'all' ? 'active' : s === 'active' ? 'inactive' : 'all')
                    setPage(0)
                  }}
                  sx={{ cursor: 'pointer', userSelect: 'none', color: statusFilter !== 'all' ? 'primary.main' : 'inherit' }}
                >
                  Status
                </TableCell>
                <TableCell
                  onClick={() => {
                    // cycle: all -> yes -> no -> all
                    setBikeFilter(b => b === 'all' ? 'yes' : b === 'yes' ? 'no' : 'all')
                    setPage(0)
                  }}
                  sx={{ cursor: 'pointer', userSelect: 'none', color: bikeFilter !== 'all' ? 'primary.main' : 'inherit' }}
                >
                  Bike
                </TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedSurveyors
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((surveyor) => (
                <TableRow key={surveyor.id} hover>
                  <TableCell>
                    {surveyor.employeeId ? (
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {surveyor.employeeId}
                      </Typography>
                    ) : (
                      <Typography>-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {surveyor.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {surveyor.mobileNumber}
                    </Box>
                  </TableCell>
                  <TableCell>{surveyor.project?.name || '-'}</TableCell>
                  <TableCell>{surveyor.location?.name || '-'}</TableCell>
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
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredAndSortedSurveyors.length}
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

      {/* Add Project Dialog */}
      <Dialog open={addProjectOpen} onClose={() => setAddProjectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Project Name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddProjectOpen(false)}>Cancel</Button>
          <Button onClick={async () => {
            // show confirm before creating
            confirmAndExecute('Create Project', `Create project "${newProjectName}"?`, async () => { await handleCreateProject() })
            setAddProjectOpen(false)
          }} variant="contained" disabled={creatingMeta || !newProjectName.trim()}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Add Location Dialog */}
      <Dialog open={addLocationOpen} onClose={() => setAddLocationOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Location</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Location Name"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddLocationOpen(false)}>Cancel</Button>
          <Button onClick={async () => {
            confirmAndExecute('Create Location', `Create location "${newLocationName}"?`, async () => { await handleCreateLocation() })
            setAddLocationOpen(false)
          }} variant="contained" disabled={creatingMeta || !newLocationName.trim()}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Update Project Dialog */}
      <Dialog open={updateProjectOpen} onClose={() => setUpdateProjectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Project</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Project</InputLabel>
            <Select
              value={selectedProjectId}
              label="Select Project"
              onChange={(e) => {
                const v = e.target.value as unknown as number
                setSelectedProjectId(v)
                handleStartEditProject(v)
              }}
            >
              <MenuItem value="">Select</MenuItem>
              {projects.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Updated Name" value={editMetaName} onChange={(e) => setEditMetaName(e.target.value)} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateProjectOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmUpdateProject} variant="contained" disabled={creatingMeta || !selectedProjectId || !editMetaName.trim()}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Update Location Dialog */}
      <Dialog open={updateLocationOpen} onClose={() => setUpdateLocationOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Location</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Location</InputLabel>
            <Select
              value={selectedLocationId}
              label="Select Location"
              onChange={(e) => {
                const v = e.target.value as unknown as number
                setSelectedLocationId(v)
                handleStartEditLocation(v)
              }}
            >
              <MenuItem value="">Select</MenuItem>
              {locations.map(l => (
                <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Updated Name" value={editMetaName} onChange={(e) => setEditMetaName(e.target.value)} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateLocationOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmUpdateLocation} variant="contained" disabled={creatingMeta || !selectedLocationId || !editMetaName.trim()}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Meta Selection Dialog */}
      <Dialog open={!!deletingMetaType} onClose={() => setDeletingMetaType(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {deletingMetaType === 'project' ? 'Project' : 'Location'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select {deletingMetaType === 'project' ? 'Project' : 'Location'}</InputLabel>
            <Select
              value={deletingMetaType === 'project' ? selectedProjectId : selectedLocationId}
              label={`Select ${deletingMetaType === 'project' ? 'Project' : 'Location'}`}
              onChange={(e) => {
                const v = e.target.value as unknown as number
                if (deletingMetaType === 'project') setSelectedProjectId(v)
                else setSelectedLocationId(v)
              }}
            >
              <MenuItem value="">Select</MenuItem>
              {(deletingMetaType === 'project' ? projects : locations).map((m: any) => (
                <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingMetaType(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (deletingMetaType === 'project' && selectedProjectId) {
                await handleDeleteProject(Number(selectedProjectId))
              }
              if (deletingMetaType === 'location' && selectedLocationId) {
                await handleDeleteLocation(Number(selectedLocationId))
              }
              setDeletingMetaType(null)
            }}
            disabled={!((deletingMetaType === 'project' && selectedProjectId) || (deletingMetaType === 'location' && selectedLocationId))}
          >
            Delete
          </Button>
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
              label="Employee ID"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              margin="normal"
              required={dialogMode === 'create'}
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
              label="Aadhar Number"
              value={formData.aadharNumber}
              onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
              margin="normal"
              required={dialogMode === 'create'}
              helperText={dialogMode === 'create' ? 'Enter 12 digit Aadhar number (numbers only)' : 'Optional — 12 digits if present'}
              slotProps={{
                htmlInput: {
                  maxLength: 12
                }
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Project</InputLabel>
              <Select
                value={formData.projectId ?? ''}
                label="Project"
                onChange={(e) => {
                  const v = e.target.value as unknown as string
                  setFormData({ ...formData, projectId: v === '' ? '' : Number(v) })
                }}
              >
                <MenuItem value="">None</MenuItem>
                {projects.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Location</InputLabel>
              <Select
                value={formData.locationId ?? ''}
                label="Location"
                onChange={(e) => {
                  const v = e.target.value as unknown as string
                  setFormData({ ...formData, locationId: v === '' ? '' : Number(v) })
                }}
              >
                <MenuItem value="">None</MenuItem>
                {locations.map(l => (
                  <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
        disabled={dialogLoading || !formData.name || !formData.mobileNumber || (dialogMode === 'create' && !formData.password) || (dialogMode === 'create' && !formData.employeeId)}
          >
            {dialogLoading ? <CircularProgress size={20} /> : (dialogMode === 'create' ? 'Create' : 'Update')}
          </Button>
        </DialogActions>
      </Dialog>

        {/* Snackbar for success messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
    </Box>
  )
}