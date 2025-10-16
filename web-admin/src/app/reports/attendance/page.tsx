"use client"

import { useEffect, useState } from 'react'
import { Box, Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import Link from 'next/link'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { surveyorService, attendanceService, authService, reportService } from '@/services/api'
import { exportAttendanceToCSV, exportAttendanceToPDF, buildAttendanceCSVString, buildAttendancePDFBlob, consolidateAttendance, exportConsolidatedAttendanceToCSV, exportConsolidatedAttendanceToPDF, buildConsolidatedAttendancePDFBlob } from '@/utils/exportUtils'

export default function AttendanceReportPage() {
  const [surveyors, setSurveyors] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [startDate, setStartDate] = useState<any>(dayjs().subtract(7, 'day'))
  const [endDate, setEndDate] = useState<any>(dayjs())
  const [userId, setUserId] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [locationId, setLocationId] = useState<string>('')
  const [adminProfile, setAdminProfile] = useState<any>(null)
  const [previewType, setPreviewType] = useState<'CSV' | 'PDF'>('CSV')
  const [previewRows, setPreviewRows] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)
  const [previewTotal, setPreviewTotal] = useState<number | null>(null)
  const [consolidatedPreview, setConsolidatedPreview] = useState<any[] | null>(null)

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
    // Call consolidated endpoint
  if (projectId) params.projectId = projectId
  if (locationId) params.locationId = locationId
  const res = await reportService.getConsolidatedAttendance(params)
    const surveyorName = userId ? (surveyors.find(s => String(s.id) === String(userId))?.name ?? null) : null
    await exportConsolidatedAttendanceToCSV(res.data, { startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
  }

  const handleExportPDF = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    if (projectId) params.projectId = projectId
    if (locationId) params.locationId = locationId
    const res = await reportService.getConsolidatedAttendance(params)
    await exportConsolidatedAttendanceToPDF(res.data, { startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
  }

  const generatePreview = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    // Use the backend consolidated endpoint for previews as well so that preview matches exported data
    const res = await reportService.getConsolidatedAttendance(params)
    const consolidated = res.data
    setPreviewTotal(consolidated.surveyors.length)
    if (previewType === 'CSV') {
      // build combined header: date on first row, day on second row (we'll show combined in preview column titles)
      const headers = ['Employee ID', 'Surveyor Name', ...consolidated.dates.slice(0, 10).map((d: string) => {
        const dt = new Date(`${d}T00:00:00.000Z`)
        const dateShort = dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
        const dayShort = dt.toLocaleDateString(undefined, { weekday: 'short' })
        return `${dateShort}\n${dayShort}`
      })]
      const rows = consolidated.surveyors.slice(0, 10).map((r: any) => [r.employeeId, r.name, ...consolidated.dates.slice(0, 10).map((d: string) => r[d] ?? '')])
      setPreviewRows({ headers, rows })
      if (previewBlobUrl) { URL.revokeObjectURL(previewBlobUrl); setPreviewBlobUrl(null) }
    } else {
      const blob = buildConsolidatedAttendancePDFBlob(consolidated)
      const url = URL.createObjectURL(blob)
      setPreviewBlobUrl(url)
      setPreviewRows(null)
    }
  }

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMeta, setConfirmMeta] = useState<{ type: 'CSV' | 'PDF'; count?: number } | null>(null)

  const openConfirm = (type: 'CSV' | 'PDF') => {
    setConfirmMeta({ type })
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!confirmMeta) return
    setConfirmOpen(false)
    if (confirmMeta.type === 'CSV') handleExportCSV()
    else handleExportPDF()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ mb: 2 }}>Surveyors Attendance</Typography>
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
              <Button startIcon={<></>} variant="outlined" onClick={async () => {
                const params: any = {}
                if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
                if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
                if (userId) params.userId = userId
                if (projectId) params.projectId = projectId
                if (locationId) params.locationId = locationId
                const res = await reportService.getConsolidatedAttendance(params)
                await exportConsolidatedAttendanceToCSV(res.data, { startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
              }}>Export CSV</Button>
              <Button startIcon={<></>} variant="outlined" onClick={async () => {
                const params: any = {}
                if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
                if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
                if (userId) params.userId = userId
                if (projectId) params.projectId = projectId
                if (locationId) params.locationId = locationId
                const res = await reportService.getConsolidatedAttendance(params)
                await exportConsolidatedAttendanceToPDF(res.data, { startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
              }}>Export PDF</Button>
            </Box>
          </Box>
        </Paper>
        <Paper sx={{ p: 2, mb: 2, minHeight: 200, position: 'relative' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Preview</Typography>
          <Button size="small" variant="text" onClick={() => { setPreviewRows(null); setPreviewBlobUrl(null); setConsolidatedPreview(null); setPreviewTotal(null) }} sx={{ position: 'absolute', top: 8, right: 8 }}>Close Preview</Button>
          {previewType === 'CSV' && previewRows && (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {previewTotal !== null && (
                <Typography variant="caption" sx={{ mb: 1 }}>{`Showing ${previewRows.rows.length} of ${previewTotal} rows`}</Typography>
              )}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {previewRows.headers.map((h, idx) => {
                      const isNumericCol = idx >= 2
                      return <TableCell key={h} align={isNumericCol ? 'center' : 'left'}><strong>{h}</strong></TableCell>
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewRows.rows.map((r, i) => (
                    <TableRow key={i}>
                      {r.map((c, j) => {
                        const isNumericCol = j >= 2 // date/value columns are from index 2 onwards in consolidated view
                        return <TableCell key={j} align={isNumericCol ? 'center' : 'left'}>{c}</TableCell>
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
            <Typography>Are you sure you want to export the attendance report{confirmMeta?.count ? ` (${confirmMeta.count} records)` : ''}?</Typography>
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
