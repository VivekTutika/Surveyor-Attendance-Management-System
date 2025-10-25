"use client"

import { useEffect, useState } from 'react'
import { Box, Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import Link from 'next/link'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { surveyorService, bikeMeterService, bikeTripService, authService, reportService } from '@/services/api'
import {
  exportBikeReadingsToCSV,
  exportBikeReadingsToPDF,
  buildBikeReadingsCSVString,
  buildBikeReadingsPDFBlob,
  exportConsolidatedBikeReadingsToCSV,
  exportConsolidatedBikeReadingsToPDF,
  buildConsolidatedBikeReadingsPDFBlob,
  exportBikeTripsToCSV,
  exportBikeTripsToPDF,
  buildBikeTripsPDFBlob,
} from '@/utils/exportUtils'

export default function BikeReadingsReportPage() {
  const [surveyors, setSurveyors] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [startDate, setStartDate] = useState<any>(dayjs().subtract(7, 'day'))
  const [endDate, setEndDate] = useState<any>(dayjs())
  const [userId, setUserId] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [locationId, setLocationId] = useState<string>('')
  const [reportKind, setReportKind] = useState<'RAW' | 'COMPREHENSIVE'>('RAW')
  const [adminProfile, setAdminProfile] = useState<any>(null)
  // Preview state
  const [previewType, setPreviewType] = useState<'CSV' | 'PDF'>('CSV')
  const [previewRows, setPreviewRows] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [previewTotal, setPreviewTotal] = useState<number | null>(null)
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)

  useEffect(() => { fetchSurveyors() }, [])
  const fetchSurveyors = async () => {
    try { const data = await surveyorService.getAll(); setSurveyors(data) } catch (err) { console.error(err) }
  }
  useEffect(() => { fetchProjects(); fetchLocations() }, [])
  const fetchProjects = async () => { try { const p = await surveyorService.getProjects(); setProjects(p) } catch (e) { console.error(e) } }
  const fetchLocations = async () => { try { const l = await surveyorService.getLocations(); setLocations(l) } catch (e) { console.error(e) } }

  useEffect(() => { fetchProfile() }, [])
  const fetchProfile = async () => {
    try { const p = await authService.getProfile(); setAdminProfile(p) } catch (e) { console.error(e) }
  }

  const handleExportCSV = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    if (projectId) params.projectId = projectId
    if (locationId) params.locationId = locationId
    // For RAW report call existing service, for COMPREHENSIVE call consolidated endpoint
    if (reportKind === 'RAW') {
      let trips = await bikeTripService.getTrips(params)
      // Ensure trips sorted by employeeId before exporting
      trips = [...(Array.isArray(trips) ? trips : trips.trips || trips)].sort((x: any, y: any) => {
        const ax = (x.surveyor?.employeeId ?? x.surveyorId ?? '').toString()
        const ay = (y.surveyor?.employeeId ?? y.surveyorId ?? '').toString()
        const nx = Number(ax)
        const ny = Number(ay)
        if (!isNaN(nx) && !isNaN(ny)) return nx - ny
        return ax.localeCompare(ay)
      })
      const surveyorName = userId ? (surveyors.find(s => String(s.id) === String(userId))?.name ?? null) : null
      await exportBikeTripsToCSV(trips, { surveyorName, startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, reportKind, createdBy: adminProfile?.name ?? 'admin' })
      return
    }
    // consolidated endpoint expects 'surveyorId' query param name
    if (params.userId) { params.surveyorId = params.userId; delete params.userId }
    if (params.projectId) { params.projectId = params.projectId }
    if (params.locationId) { params.locationId = params.locationId }
    const res = await reportService.getConsolidatedBikeReadings(params)
    res.data.surveyors = [...(res.data.surveyors || [])].sort((a: any, b: any) => {
      const ax = (a.employeeId ?? '').toString()
      const ay = (b.employeeId ?? '').toString()
      const nx = Number(ax)
      const ny = Number(ay)
      if (!isNaN(nx) && !isNaN(ny)) return nx - ny
      return ax.localeCompare(ay)
    })
    await exportConsolidatedBikeReadingsToCSV(res.data, { startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
  }

  const handleExportPDF = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    if (projectId) params.projectId = projectId
    if (locationId) params.locationId = locationId
    if (reportKind === 'RAW') {
      let trips = await bikeTripService.getTrips(params)
      const surveyorName = userId ? (surveyors.find(s => String(s.id) === String(userId))?.name ?? null) : null
      trips = [...(Array.isArray(trips) ? trips : trips.trips || trips)].sort((x: any, y: any) => {
        const ax = (x.surveyor?.employeeId ?? x.surveyorId ?? '').toString()
        const ay = (y.surveyor?.employeeId ?? y.surveyorId ?? '').toString()
        const nx = Number(ax)
        const ny = Number(ay)
        if (!isNaN(nx) && !isNaN(ny)) return nx - ny
        return ax.localeCompare(ay)
      })
      await exportBikeTripsToPDF(trips, { surveyorName, startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, reportKind, createdBy: adminProfile?.name ?? 'admin' })
      return
    }
    if (params.userId) { params.surveyorId = params.userId; delete params.userId }
    if (params.projectId) { params.projectId = params.projectId }
    if (params.locationId) { params.locationId = params.locationId }
    const res = await reportService.getConsolidatedBikeReadings(params)
    await exportConsolidatedBikeReadingsToPDF(res.data, { startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
  }

  const generatePreview = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    // If comprehensive, use consolidated endpoint for preview to match export
    if (projectId) params.projectId = projectId
    if (locationId) params.locationId = locationId
    if (reportKind === 'COMPREHENSIVE') {
      // Convert userId to surveyorId for consolidated endpoint
      if (params.userId) { params.surveyorId = params.userId; delete params.userId }
      const res = await reportService.getConsolidatedBikeReadings(params)
      const consolidated = res.data
      consolidated.surveyors = [...(consolidated.surveyors || [])].sort((a: any, b: any) => {
        const ax = (a.employeeId ?? '').toString()
        const ay = (b.employeeId ?? '').toString()
        const nx = Number(ax)
        const ny = Number(ay)
        if (!isNaN(nx) && !isNaN(ny)) return nx - ny
        return ax.localeCompare(ay)
      })
      setPreviewTotal(consolidated.surveyors.length)
        if (previewType === 'CSV') {
        const headers = ['Employee ID', 'Surveyor Name', ...consolidated.dates.slice(0, 10).map((d: string) => {
          const dt = new Date(`${d}T00:00:00.000Z`)
          const dateShort = dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short' } as any)
          const dayShort = dt.toLocaleDateString(undefined, { weekday: 'short' } as any)
          return `${dateShort}\n${dayShort}`
        })]
        const rows = consolidated.surveyors.slice(0, 10).map((r: any) => [r.employeeId, r.name, ...consolidated.dates.slice(0, 10).map((d: string) => r[d] != null ? Number(r[d]).toFixed(1) : '0')])
        setPreviewRows({ headers, rows })
        if (previewBlobUrl) { URL.revokeObjectURL(previewBlobUrl); setPreviewBlobUrl(null) }
      } else {
        const blob = buildConsolidatedBikeReadingsPDFBlob(consolidated)
        const url = URL.createObjectURL(blob)
        setPreviewBlobUrl(url)
        setPreviewRows(null)
      }
      return
    }

    // RAW preview path
    let trips = await bikeTripService.getTrips(params)
    if (previewType === 'CSV') {
      const headers = ['Employee ID', 'Surveyor Name', 'Date', 'Morning Reading', 'Evening Reading', 'Distance (KM)']
      trips = [...(Array.isArray(trips) ? trips : trips.trips || trips)].sort((x: any, y: any) => {
        const ax = (x.surveyor?.employeeId ?? x.surveyorId ?? '').toString()
        const ay = (y.surveyor?.employeeId ?? y.surveyorId ?? '').toString()
        const nx = Number(ax)
        const ny = Number(ay)
        if (!isNaN(nx) && !isNaN(ny)) return nx - ny
        return ax.localeCompare(ay)
      })
      const total = trips.length
      const rows = trips.slice(0, 10).map((t: any) => {
        const emp = t.surveyor?.employeeId ?? ''
        const name = t.surveyor?.name ?? ''
        const dt = t.date ? new Date(t.date) : null
        const dateStr = dt ? dt.toLocaleDateString() : ''
        const morning = t.morningKm != null ? Number(t.morningKm).toFixed(1) : ''
        const evening = t.eveningKm != null ? Number(t.eveningKm).toFixed(1) : ''
        // Show the finalKm value if it exists and the trip is approved
        const distance = t.isApproved && t.finalKm != null ? Number(t.finalKm).toFixed(1) : '0'
        return [emp, name, dateStr, morning, evening, distance]
      })
      setPreviewRows({ headers, rows })
      setPreviewTotal(total)
      if (previewBlobUrl) { URL.revokeObjectURL(previewBlobUrl); setPreviewBlobUrl(null) }
    } else {
      const blob = buildBikeTripsPDFBlob(trips, { surveyorName: userId ? (surveyors.find(s => String(s.id) === String(userId))?.name ?? null) : null, startDate: params.startDate ?? null, endDate: params.endDate ?? null, reportKind })
      const url = URL.createObjectURL(blob)
      setPreviewBlobUrl(url)
      setPreviewRows(null)
    }
  }

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMeta, setConfirmMeta] = useState<{ type: 'CSV' | 'PDF'; count?: number } | null>(null)

  const openConfirm = (type: 'CSV' | 'PDF') => {
    setConfirmMeta({ type })
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!confirmMeta) return
    setConfirmOpen(false)
    if (confirmMeta.type === 'CSV') await handleExportCSV()
    else await handleExportPDF()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ mb: 2 }}>Bike Meter Readings</Typography>
          <Box>
            <Link href="/reports">
              <Button startIcon={<ArrowBack />}>Back</Button>
            </Link>
          </Box>
        </Box>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <DatePicker label="Start Date" value={startDate} onChange={(v) => setStartDate(v)} format="DD/MM/YYYY" />
            <DatePicker label="End Date" value={endDate} onChange={(v) => setEndDate(v)} format="DD/MM/YYYY" />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Surveyor</InputLabel>
              <Select value={userId} label="Surveyor" onChange={(e) => setUserId(e.target.value)}>
                <MenuItem value=""><em>All Surveyors</em></MenuItem>
                {surveyors.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Project</InputLabel>
              <Select value={projectId} label="Project" onChange={(e) => setProjectId(e.target.value)}>
                <MenuItem value=""><em>All Projects</em></MenuItem>
                {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Location</InputLabel>
              <Select value={locationId} label="Location" onChange={(e) => setLocationId(e.target.value)}>
                <MenuItem value=""><em>All Locations</em></MenuItem>
                {locations.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Report Type</InputLabel>
              <Select value={reportKind} label="Report Type" onChange={(e) => setReportKind(e.target.value as any)}>
                <MenuItem value={'RAW'}>Raw Readings</MenuItem>
                <MenuItem value={'COMPREHENSIVE'}>Date-Distance (Comprehensive)</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small">
                <InputLabel>Preview</InputLabel>
                <Select value={previewType} label="Preview" onChange={(e) => setPreviewType(e.target.value as any)} sx={{ minWidth: 120 }}>
                  <MenuItem value={'CSV'}>CSV</MenuItem>
                  <MenuItem value={'PDF'}>PDF</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" onClick={generatePreview}>Generate Preview</Button>
            </Box>
            <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
              <Button startIcon={<></>} variant="outlined" onClick={() => openConfirm('CSV')}>Export CSV</Button>
              <Button startIcon={<></>} variant="outlined" onClick={() => openConfirm('PDF')}>Export PDF</Button>
            </Box>
          </Box>
        </Paper>
        {/* Preview panel */}
        <Paper sx={{ p: 2, mb: 2, minHeight: 200, position: 'relative' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Preview</Typography>
          <Button size="small" variant="text" onClick={() => { setPreviewRows(null); setPreviewBlobUrl(null); setPreviewTotal(null) }} sx={{ position: 'absolute', top: 8, right: 8 }}>Close Preview</Button>
          {previewType === 'CSV' && previewRows && (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {previewTotal !== null && (
                <Typography variant="caption" sx={{ mb: 1 }}>{`Showing ${previewRows.rows.length} of ${previewTotal} rows`}</Typography>
              )}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {previewRows.headers.map((h, idx) => {
                      const isNumeric = idx >= 2
                      return <TableCell key={h} align={isNumeric ? 'center' : 'left'}><strong>{h}</strong></TableCell>
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                    {previewRows.rows.map((r, i) => (
                    <TableRow key={i}>
                      {r.map((c, j) => {
                        const isNumeric = j >= 2
                        return <TableCell key={j} align={isNumeric ? 'center' : 'left'}>{c}</TableCell>
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
          {previewType === 'PDF' && previewBlobUrl && (
            <iframe title="pdf-preview" src={previewBlobUrl} style={{ width: '100%', height: 400, border: 'none' }} />
          )}
          {!previewRows && !previewBlobUrl && (
            <Typography color="text.secondary">No preview generated. Click "Generate Preview" to see the file.</Typography>
          )}
        </Paper>
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm Export</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to export the bike readings report?</Typography>
            <Box mt={2} display="flex" gap={2} justifyContent="flex-end">
              <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleConfirm}>Confirm</Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}
