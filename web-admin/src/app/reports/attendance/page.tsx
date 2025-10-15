"use client"

import { useEffect, useState } from 'react'
import { Box, Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import Link from 'next/link'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { surveyorService, attendanceService, authService } from '@/services/api'
import { exportAttendanceToCSV, exportAttendanceToPDF, buildAttendanceCSVString, buildAttendancePDFBlob, consolidateAttendance, exportConsolidatedAttendanceToCSV, exportConsolidatedAttendanceToPDF, buildConsolidatedAttendancePDFBlob } from '@/utils/exportUtils'

export default function AttendanceReportPage() {
  const [surveyors, setSurveyors] = useState<any[]>([])
  const [startDate, setStartDate] = useState<any>(dayjs().subtract(7, 'day'))
  const [endDate, setEndDate] = useState<any>(dayjs())
  const [userId, setUserId] = useState<string>('')
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

  useEffect(() => { fetchProfile() }, [])
  const fetchProfile = async () => {
    try { const p = await authService.getProfile(); setAdminProfile(p) } catch (e) { console.error(e) }
  }

  const handleExportCSV = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    const data = await attendanceService.getAll(params)
    const surveyorName = userId ? (surveyors.find(s => String(s.id) === String(userId))?.name ?? null) : null
    await exportAttendanceToCSV(data.attendance, { surveyorName, startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
  }

  const handleExportPDF = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    const data = await attendanceService.getAll(params)
    const surveyorName = userId ? (surveyors.find(s => String(s.id) === String(userId))?.name ?? null) : null
    await exportAttendanceToPDF(data.attendance, { surveyorName, startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
  }

  const generatePreview = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    const data = await attendanceService.getAll(params)
    const attendance = data.attendance
    const consolidated = consolidateAttendance(attendance)
    setPreviewTotal(consolidated.length)
    if (previewType === 'CSV') {
      const headers = ['Date', 'Surveyor', 'Mobile', 'Check In', 'Check Out']
      const rows = consolidated.slice(0, 10).map((r: any) => [r.date, r.surveyorName, r.mobile, r.checkIn ?? '', r.checkOut ?? ''])
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
                const data = await attendanceService.getAll(params)
                const consolidated = consolidateAttendance(data.attendance)
                await exportConsolidatedAttendanceToCSV(consolidated, { startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
              }}>Export CSV</Button>
              <Button startIcon={<></>} variant="outlined" onClick={async () => {
                const params: any = {}
                if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
                if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
                if (userId) params.userId = userId
                const data = await attendanceService.getAll(params)
                const consolidated = consolidateAttendance(data.attendance)
                await exportConsolidatedAttendanceToPDF(consolidated, { startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, createdBy: adminProfile?.name ?? 'admin' })
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
                    {previewRows.headers.map(h => <TableCell key={h}><strong>{h}</strong></TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewRows.rows.map((r, i) => (
                    <TableRow key={i}>
                      {r.map((c, j) => <TableCell key={j}>{c}</TableCell>)}
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
