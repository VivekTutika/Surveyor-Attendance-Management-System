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
  const [selectedSurveyor, setSelectedSurveyor] = useState<string | ''>('')
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

  useEffect(() => {
    fetchTrips()
  }, [page, rowsPerPage, startDate, endDate, selectedSurveyor])

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

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const params: any = { page: page + 1, limit: rowsPerPage }
      if (startDate) params.startDate = (startDate as Dayjs).format('YYYY-MM-DD')
      if (endDate) params.endDate = (endDate as Dayjs).format('YYYY-MM-DD')
      if (selectedSurveyor) params.userId = selectedSurveyor
      // no hasBike param
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
      // If there's a locally staged pending final for this trip, persist it now before approving
      const staged = pendingFinals[String(approveTarget.id)]
      const computed = approveTarget.computedKm ?? (approveTarget.eveningKm != null && approveTarget.morningKm != null ? (approveTarget.eveningKm - approveTarget.morningKm) : undefined)
      if (staged !== undefined) {
        await bikeTripService.setFinalKm(approveTarget.id, staged)
      } else if ((approveTarget.finalKm == null || approveTarget.finalKm === '') && typeof computed === 'number' && isFinite(computed)) {
        // if no final present but computed exists, persist computed as final on approve
        await bikeTripService.setFinalKm(approveTarget.id, computed)
      }
      await bikeTripService.toggleApprove(approveTarget.id)
      // clear any staged pending final we persisted
      if (staged !== undefined) {
        setPendingFinals((p) => {
          const copy = { ...p }
          delete copy[String(approveTarget.id)]
          return copy
        })
      }
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

  return (
    <AdminLayout>
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" gutterBottom>
            Distance Travelled
          </Typography>
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
          <FormControl sx={{ minWidth: 240 }}>
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
          <Button variant="outlined" onClick={() => { setPage(0); fetchTrips() }}>Filter</Button>
        </Stack>
      </LocalizationProvider>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
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
                  <TableCell colSpan={8} align="center"><CircularProgress /></TableCell>
                </TableRow>
              ) : trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No records</TableCell>
                </TableRow>
              ) : (
                trips.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell align="center">{t.surveyor?.employeeId ?? t.surveyorId}</TableCell>
                    <TableCell align="center">{t.surveyor?.name}</TableCell>
                    <TableCell align="center">{dayjs(t.date).format('YYYY-MM-DD')}</TableCell>
                    <TableCell align="center">{t.morningKm != null ? `${t.morningKm} KM` : '-'}</TableCell>
                    <TableCell align="center">{t.eveningKm != null ? `${t.eveningKm} KM` : '-'}</TableCell>
                    <TableCell align="center">{t.computedKm ?? (t.eveningKm != null && t.morningKm != null ? (t.eveningKm - t.morningKm) : '-')}</TableCell>
                    <TableCell align="center">
                      {(() => {
                        const staged = pendingFinals[String(t.id)]
                        if (staged !== undefined) return <Typography>{staged} (staged)</Typography>
                        if (t.finalKm != null) return <Typography>{t.finalKm}</Typography>
                        return <Button size="small" variant="contained" color="primary" onClick={() => handleEditFinal(t)}>Set Final KM</Button>
                      })()}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                        {/* compute the computed distance for this row */}
                        {(() => {
                          const computed = t.computedKm ?? (t.eveningKm != null && t.morningKm != null ? (t.eveningKm - t.morningKm) : undefined)
                          const actionable = typeof computed === 'number' && isFinite(computed)
                          return (
                            <>
                              <Button size="small" color={t.isApproved ? 'error' : 'success'} variant="contained" onClick={() => handleApproveWithFinal(t)} disabled={!actionable}>
                                {t.isApproved ? 'Disapprove' : 'Approve'}
                              </Button>
                              <Button size="small" variant="contained" color="secondary" onClick={() => handleEditFinal(t)} disabled={!actionable}>Update</Button>
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
            <Button variant="contained" color="primary" onClick={confirmToggleApprove}>Confirm</Button>
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
            <Button variant="contained" onClick={handleSaveFinal} disabled={isSavingFinal}>{isSavingFinal ? 'Updating...' : 'Update'}</Button>
          </Box>
        </DialogContent>
      </Dialog>
      </Box>
    </AdminLayout>
  )
}
