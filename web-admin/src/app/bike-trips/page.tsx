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
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Checkbox,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
// dayjs imported below with Dayjs type
import Link from 'next/link'
import { bikeTripService, surveyorService } from '@/services/api'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import AdminLayout from '@/components/AdminLayout'

export default function BikeTripsPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [total, setTotal] = useState(0)
  // date range filters
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs())
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs())
  const [surveyorList, setSurveyorList] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [selectedSurveyor, setSelectedSurveyor] = useState<string | ''>('')
  const [selectedProject, setSelectedProject] = useState<string | ''>('')
  const [selectedLocation, setSelectedLocation] = useState<string | ''>('')
  // removed hasBike filter as requested

  // Dialogs

  // Approve/Disapprove confirmation
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [approveTarget, setApproveTarget] = useState<any | null>(null)

  // Final KM confirmation (when new final differs from computed)
  const [finalConfirmOpen, setFinalConfirmOpen] = useState(false)
  const [pendingFinal, setPendingFinal] = useState<{ trip: any; newFinal: number; computed?: number } | null>(null)
  // locally staged final values that will only be persisted when the trip is approved
  const [pendingFinals, setPendingFinals] = useState<Record<string, number>>({})

  // Final KM edit
  const [editingTrip, setEditingTrip] = useState<any | null>(null)
  const [finalKmValue, setFinalKmValue] = useState<string>('')
  const [isSavingFinal, setIsSavingFinal] = useState(false)
  // selection / bulk approve state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAllLoading, setSelectAllLoading] = useState(false)
  const [bulkApproveDialogOpen, setBulkApproveDialogOpen] = useState(false)
  const [bulkApproving, setBulkApproving] = useState(false)
  const [bulkActionMode, setBulkActionMode] = useState<'approve' | 'disapprove' | 'mixed'>('approve')

  useEffect(() => {
    fetchTrips()
  }, [page, rowsPerPage, startDate, endDate, selectedSurveyor, selectedProject, selectedLocation])

  useEffect(() => {
    // load surveyors for filter
    (async () => {
      try {
        const s = await surveyorService.getAll()
        setSurveyorList(s)
      } catch (err) {
        console.error('Failed to load surveyors for filter', err)
      }
    })()
  }, [])

  useEffect(() => { fetchProjectList(); fetchLocationList() }, [])
  const fetchProjectList = async () => {
    try {
      const p = await surveyorService.getProjects()
      setProjects(p || [])
    } catch (e) {
      console.error('Failed to load projects for filter', e)
    }
  }
  const fetchLocationList = async () => {
    try {
      const l = await surveyorService.getLocations()
      setLocations(l || [])
    } catch (e) {
      console.error('Failed to load locations for filter', e)
    }
  }

  const fetchTrips = async () => {
    try {
      setLoading(true)
  const params: any = { page: page + 1, limit: rowsPerPage }
      if (startDate) params.startDate = (startDate as Dayjs).format('YYYY-MM-DD')
      if (endDate) params.endDate = (endDate as Dayjs).format('YYYY-MM-DD')
      if (selectedSurveyor) params.userId = selectedSurveyor
  // include project/location if selected
  if (selectedProject) params.projectId = selectedProject
  if (selectedLocation) params.locationId = selectedLocation
      // projectId/locationId will be added from UI state if present
      if ((window as any) && false) { /* placeholder to keep TS happy in patched area */ }
      // no hasBike param
      // include project/location if provided via state
      if ((params as any).projectId === undefined && (projects && projects.length > 0)) {
        // no-op: projects available
      }
      if (selectedSurveyor) params.userId = selectedSurveyor
      // Add project/location from local state if present
      // (we store selected values in selectedSurveyor variable only; UI below will add selects that set local variables via setSelectedSurveyor)
      const data = await bikeTripService.getTrips(params)
      // backend may return array or paginated
      if (Array.isArray(data)) {
        setTrips(data)
        setTotal(data.length)
      } else {
        setTrips(data.trips || data)
        setTotal(data.total || (data.trips ? data.trips.length : 0))
      }
    } catch (err) {
      console.error('Failed to fetch trips', err)
    } finally {
      setLoading(false)
    }
  }

  // image preview removed — bike-trips shows KM values only

  const handleEditFinal = (trip: any) => {
    // Prefill with finalKm if present, otherwise computed distance
    const computed = trip.computedKm ?? (trip.eveningKm != null && trip.morningKm != null ? (trip.eveningKm - trip.morningKm) : undefined)
    setEditingTrip(trip)
    setFinalKmValue(String(trip.finalKm ?? computed ?? ''))
  }

  const handleSaveFinal = async () => {
    if (!editingTrip) return
    const id = editingTrip.id
    const km = Number(finalKmValue)
    if (isNaN(km)) return
    // Compare with computedKm and require confirmation if different — but DO NOT persist yet.
    const computed = editingTrip.computedKm ?? (editingTrip.eveningKm != null && editingTrip.morningKm != null ? (editingTrip.eveningKm - editingTrip.morningKm) : undefined)
    if (computed != null && Number(km) !== Number(computed)) {
      setPendingFinal({ trip: editingTrip, newFinal: km, computed })
      setFinalConfirmOpen(true)
      return
    }

    // Stage pending final locally; will be persisted when the trip is approved
    setPendingFinals((p) => ({ ...p, [String(id)]: km }))
    setEditingTrip(null)
  }

  const handleToggleApprove = (trip: any) => {
    // open confirm dialog
    setApproveTarget(trip)
    setApproveDialogOpen(true)
  }

  const confirmToggleApprove = async () => {
    if (!approveTarget) return
    try {
      // Only persist finalKm when approving (not when disapproving)
      const staged = pendingFinals[String(approveTarget.id)]
      const computed = approveTarget.computedKm ?? (approveTarget.eveningKm != null && approveTarget.morningKm != null ? (approveTarget.eveningKm - approveTarget.morningKm) : undefined)
      if (!approveTarget.isApproved) {
        // Currently not approved -> approving now: persist staged or computed as final if needed
        if (staged !== undefined) {
          await bikeTripService.setFinalKm(approveTarget.id, staged)
        } else if ((approveTarget.finalKm == null || approveTarget.finalKm === '') && typeof computed === 'number' && isFinite(computed)) {
          await bikeTripService.setFinalKm(approveTarget.id, computed)
        }
        // clear any staged pending final we persisted
        if (staged !== undefined) {
          setPendingFinals((p) => {
            const copy = { ...p }
            delete copy[String(approveTarget.id)]
            return copy
          })
        }
      } else {
        // Currently approved -> disapproving: per requirement do not change finalKm
      }
      await bikeTripService.toggleApprove(approveTarget.id)
      await fetchTrips()
    } catch (err) {
      console.error('Failed to toggle approve', err)
    } finally {
      setApproveDialogOpen(false)
      setApproveTarget(null)
    }
  }

  // If finalKm is missing, set it to computed first then proceed to confirm approve
  const handleApproveWithFinal = async (trip: any) => {
    const computed = trip.computedKm ?? (trip.eveningKm != null && trip.morningKm != null ? (trip.eveningKm - trip.morningKm) : undefined)
    try {
      if ((trip.finalKm == null || trip.finalKm === '') && typeof computed === 'number' && isFinite(computed)) {
        // set final km to computed first
        await bikeTripService.setFinalKm(trip.id, computed)
        // refresh trip data to include finalKm
        await fetchTrips()
      }
      // open confirm approve dialog
      setApproveTarget(trip)
      setApproveDialogOpen(true)
    } catch (err) {
      console.error('Failed to set final before approve', err)
    }
  }

  const cancelToggleApprove = () => {
    setApproveDialogOpen(false)
    setApproveTarget(null)
  }

  const confirmFinalSave = async () => {
    if (!pendingFinal) return
    try {
      setIsSavingFinal(true)
      await bikeTripService.setFinalKm(pendingFinal.trip.id, pendingFinal.newFinal)
      await fetchTrips()
      setEditingTrip(null)
    } catch (err) {
      console.error('Failed to save final km', err)
    } finally {
      setIsSavingFinal(false)
      setFinalConfirmOpen(false)
      setPendingFinal(null)
    }
  }

  const cancelFinalConfirm = () => {
    setFinalConfirmOpen(false)
    setPendingFinal(null)
  }

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectAllOnPage = (rows: any[]) => {
    const ids = rows.map(r => r.id)
    const allSelected = ids.every(i => selectedIds.includes(i))
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)))
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...ids])))
    }
  }

  const handleBulkApproveConfirm = async () => {
    setBulkApproveDialogOpen(false)
    if (selectedIds.length === 0) return
    try {
      setBulkApproving(true)
      // Attempt to fetch all matching trips to get current states (if not present in current page)
      const params: any = { page: 1, limit: selectedIds.length }
      if (startDate) params.startDate = (startDate as Dayjs).format('YYYY-MM-DD')
      if (endDate) params.endDate = (endDate as Dayjs).format('YYYY-MM-DD')
      if (selectedSurveyor) params.userId = selectedSurveyor
      if (selectedProject) params.projectId = selectedProject
      if (selectedLocation) params.locationId = selectedLocation
      const data = await bikeTripService.getTrips(params)
      const all = Array.isArray(data) ? data : (data.trips || [])
      const map = new Map(all.map((t: any) => [String(t.id), t]))

      // Determine actual action mode based on fetched items
      const fetchedForSelected = selectedIds.map(id => map.get(String(id))).filter(Boolean)
      const anyNotApproved = fetchedForSelected.some((t: any) => !t.isApproved)
      const allApproved = fetchedForSelected.length > 0 && fetchedForSelected.every((t: any) => t.isApproved)
      const resolvedMode: 'approve' | 'disapprove' | 'mixed' = allApproved ? 'disapprove' : anyNotApproved ? 'approve' : 'mixed'
      setBulkActionMode(resolvedMode)

      await Promise.all(selectedIds.map(async (id) => {
        try {
          const trip = map.get(String(id)) as any
          const staged = pendingFinals[String(id)]
          const computed = (trip as any)?.computedKm ?? ((trip as any)?.eveningKm != null && (trip as any)?.morningKm != null ? ((trip as any).eveningKm - (trip as any).morningKm) : undefined)
          if (trip && !(trip as any).isApproved) {
            if (staged !== undefined) {
              await bikeTripService.setFinalKm(id, staged)
            } else if (((trip as any).finalKm == null || (trip as any).finalKm === '') && typeof computed === 'number' && isFinite(computed)) {
              await bikeTripService.setFinalKm(id, computed)
            }
            await bikeTripService.toggleApprove(id)
          } else {
            // disapprove path: do not change finalKm
            await bikeTripService.toggleApprove(id)
          }
        } catch (e) {
          console.error('bulk approve item failed', id, e)
        }
      }))
      await fetchTrips()
      setSelectedIds([])
    } catch (err) {
      console.error('Bulk approve failed', err)
    } finally {
      setBulkApproving(false)
    }
  }

  return (
    <AdminLayout>
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              color={(() => {
                // decide color based on current selection states
                const selectedOnPage = trips.filter(t => selectedIds.includes(t.id))
                if (selectedOnPage.length === 0) return 'primary'
                const anyNotApproved = selectedOnPage.some(t => !t.isApproved)
                const allApproved = selectedOnPage.every(t => t.isApproved)
                if (anyNotApproved && !allApproved) return 'warning'
                return allApproved ? 'error' : 'success'
              })() as any}
              onClick={async () => {
                // derive action mode from current known trips; if mixed/missing, we'll resolve in confirm handler
                const selectedOnPage = trips.filter(t => selectedIds.includes(t.id))
                const anyNotApproved = selectedOnPage.some(t => !t.isApproved)
                const allApproved = selectedOnPage.length > 0 && selectedOnPage.every(t => t.isApproved)
                if (allApproved) setBulkActionMode('disapprove')
                else if (anyNotApproved) setBulkActionMode('approve')
                else setBulkActionMode('mixed')
                setBulkApproveDialogOpen(true)
              }} disabled={selectedIds.length === 0}>
              {(() => {
                const selectedOnPage = trips.filter(t => selectedIds.includes(t.id))
                if (selectedOnPage.length === 0) return `Approve All (${selectedIds.length})`
                const allApproved = selectedOnPage.every(t => t.isApproved)
                const anyNotApproved = selectedOnPage.some(t => !t.isApproved)
                if (allApproved) return `Disapprove All (${selectedIds.length})`
                if (anyNotApproved && !allApproved) return `Approve Selected (${selectedIds.length})`
                return `Toggle Approval (${selectedIds.length})`
              })()}
            </Button>
            <Button variant="text" onClick={async () => {
              // select all matching
              setSelectAllLoading(true)
              try {
                const params: any = {}
                if (startDate) params.startDate = (startDate as Dayjs).format('YYYY-MM-DD')
                if (endDate) params.endDate = (endDate as Dayjs).format('YYYY-MM-DD')
                if (selectedSurveyor) params.userId = selectedSurveyor
                if (selectedProject) params.projectId = selectedProject
                if (selectedLocation) params.locationId = selectedLocation
                const data = await bikeTripService.getTrips(params)
                const all = Array.isArray(data) ? data : (data.trips || [])
                setSelectedIds(all.map((t: any) => t.id))
              } catch (e) {
                console.error('select all matching failed', e)
              } finally {
                setSelectAllLoading(false)
              }
            }} disabled={selectAllLoading || trips.length === 0}>{selectAllLoading ? 'Selecting...' : 'Select All Matching'}</Button>
          </Box>
          <Box>
            <Link href="/bike-readings">
              <Button startIcon={<ArrowBack />}>Back</Button>
            </Link>
          </Box>
        </Box>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          <DatePicker label="Start Date" value={startDate} onChange={(d) => setStartDate(d)} />
          <DatePicker label="End Date" value={endDate} onChange={(d) => setEndDate(d)} />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel id="surveyor-filter-label">Surveyor</InputLabel>
            <Select labelId="surveyor-filter-label" value={selectedSurveyor} label="Surveyor" onChange={(e) => setSelectedSurveyor(e.target.value)}>
              <MenuItem value="">
                <em>All Surveyors</em>
              </MenuItem>
              {surveyorList.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Project</InputLabel>
            <Select value={selectedProject} label="Project" onChange={(e) => setSelectedProject(e.target.value)}>
              <MenuItem value=""><em>All Projects</em></MenuItem>
              {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Location</InputLabel>
            <Select value={selectedLocation} label="Location" onChange={(e) => setSelectedLocation(e.target.value)}>
              <MenuItem value=""><em>All Locations</em></MenuItem>
              {locations.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => {
            // Clear filters
            setStartDate(null)
            setEndDate(null)
            setSelectedSurveyor('')
            setSelectedProject('')
            setSelectedLocation('')
            setPage(0)
            // refresh list
            fetchTrips()
          }}>Clear Filters</Button>
        </Stack>
      </LocalizationProvider>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedIds.length > 0 && selectedIds.length < Math.min(rowsPerPage, trips.length)}
                    checked={selectedIds.length > 0 && selectedIds.length === Math.min(rowsPerPage, trips.length)}
                    onChange={() => selectAllOnPage(trips.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage))}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Surveyor</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Check IN (Morning)</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Check OUT (Evening)</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Calculated Distance</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Final KM</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center"><CircularProgress /></TableCell>
                </TableRow>
              ) : trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">No records</TableCell>
                </TableRow>
              ) : (
                trips.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedIds.includes(t.id)} onChange={() => toggleSelect(t.id)} />
                    </TableCell>
                    <TableCell align="center">{t.surveyor?.employeeId ?? t.surveyorId}</TableCell>
                    <TableCell align="center">{t.surveyor?.name}</TableCell>
                    <TableCell align="center">{dayjs(t.date).format('YYYY-MM-DD')}</TableCell>
                    <TableCell align="center">{t.morningKm != null ? `${t.morningKm} KM` : '-'}</TableCell>
                    <TableCell align="center">{t.eveningKm != null ? `${t.eveningKm} KM` : '-'}</TableCell>
                    <TableCell align="center">{t.computedKm ?? (t.eveningKm != null && t.morningKm != null ? (t.eveningKm - t.morningKm) : '-')}</TableCell>
                    <TableCell align="center">
                      {(() => {
                        const staged = pendingFinals[String(t.id)]
                        const computed = t.computedKm ?? (t.eveningKm != null && t.morningKm != null ? (t.eveningKm - t.morningKm) : undefined)
                        // If editing modal is open for this trip, show its input
                        if (editingTrip && String(editingTrip.id) === String(t.id)) {
                          return (
                            <TextField size="small" value={finalKmValue} onChange={(e) => setFinalKmValue(e.target.value)} />
                          )
                        }
                        // If there's a staged pending value, show it with a small label
                        if (staged !== undefined) return <Typography>{staged} (staged)</Typography>
                        // If finalKm already persisted, display it
                        if (t.finalKm != null) return <Typography>{t.finalKm}</Typography>
                        // If both readings exist (computed available), show an editable input prefilled with computed
                        if (computed !== undefined && computed !== null) {
                          const value = staged !== undefined ? staged : computed
                          return (
                            <TextField size="small" value={String(value)} onChange={(e) => {
                              const v = Number(e.target.value)
                              if (!isNaN(v)) {
                                setPendingFinals(p => ({ ...p, [String(t.id)]: v }))
                              }
                            }} />
                          )
                        }
                        return <Typography>-</Typography>
                      })()}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                        {(() => {
                          const computed = t.computedKm ?? (t.eveningKm != null && t.morningKm != null ? (t.eveningKm - t.morningKm) : undefined)
                          const actionable = typeof computed === 'number' && isFinite(computed)
                          return (
                            <>
                              <Button size="small" color={t.isApproved ? 'error' : 'success'} variant="contained" onClick={() => handleApproveWithFinal(t)} disabled={!actionable}>
                                {t.isApproved ? 'Disapprove' : 'Approve'}
                              </Button>
                              <Button size="small" variant="contained" color="secondary" onClick={() => handleEditFinal(t)} disabled={!t.isApproved}>Update</Button>
                            </>
                          )
                        })()}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
        />
      </Paper>

      <Dialog open={approveDialogOpen} onClose={cancelToggleApprove}>
        <DialogTitle>{approveTarget?.isApproved ? 'Confirm Disapprove' : 'Confirm Approve'}</DialogTitle>
        <DialogContent>
          <Typography>
            {approveTarget?.isApproved ? 'Are you sure you want to disapprove this trip?' : 'Are you sure you want to approve this trip?'}
          </Typography>
          <Box mt={2} display="flex" gap={2} justifyContent="flex-end">
            <Button onClick={cancelToggleApprove}>Cancel</Button>
            <Button variant="contained" color={approveTarget?.isApproved ? 'error' : 'primary'} onClick={confirmToggleApprove}>Confirm</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkApproveDialogOpen} onClose={() => setBulkApproveDialogOpen(false)}>
        <DialogTitle>{bulkActionMode === 'approve' ? 'Confirm Approve Selected' : bulkActionMode === 'disapprove' ? 'Confirm Disapprove Selected' : 'Confirm Toggle Approval'}</DialogTitle>
        <DialogContent>
          <Typography>
            {bulkActionMode === 'approve' && `Are you sure you want to approve the selected trips (${selectedIds.length})?`}
            {bulkActionMode === 'disapprove' && `Are you sure you want to disapprove the selected trips (${selectedIds.length})?`}
            {bulkActionMode === 'mixed' && `The selected trips contain a mix of approved and unapproved records; confirming will toggle approval for each.`}
          </Typography>
          <Box mt={2} display="flex" gap={2} justifyContent="flex-end">
            <Button onClick={() => setBulkApproveDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color={bulkActionMode === 'disapprove' ? 'error' : 'primary'} onClick={handleBulkApproveConfirm} disabled={bulkApproving}>{bulkApproving ? (bulkActionMode === 'disapprove' ? 'Processing...' : 'Approving...') : 'Confirm'}</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={finalConfirmOpen} onClose={cancelFinalConfirm}>
        <DialogTitle>Confirm Final KM</DialogTitle>
        <DialogContent>
          <Typography>
            Computed KM: {pendingFinal?.computed ?? '-'}
          </Typography>
          <Typography>
            New Final KM: {pendingFinal?.newFinal}
          </Typography>
          <Box mt={2} display="flex" gap={2} justifyContent="flex-end">
            <Button onClick={cancelFinalConfirm}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={confirmFinalSave} disabled={isSavingFinal}>{isSavingFinal ? 'Saving...' : 'Confirm'}</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTrip} onClose={() => setEditingTrip(null)}>
        <DialogTitle>Update Final KM</DialogTitle>
        <DialogContent>
          <TextField label="Final KM" value={finalKmValue} onChange={(e) => setFinalKmValue(e.target.value)} fullWidth />
          <Box mt={2} display="flex" gap={2} justifyContent="flex-end">
            <Button onClick={() => setEditingTrip(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveFinal} disabled={isSavingFinal || !(editingTrip?.isApproved)}>{isSavingFinal ? 'Updating...' : 'Update'}</Button>
          </Box>
        </DialogContent>
      </Dialog>
      </Box>
    </AdminLayout>
  )
}
