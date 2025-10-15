"use client"

import { useEffect, useState } from 'react'
import { Box, Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import Link from 'next/link'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { surveyorService, bikeMeterService, authService } from '@/services/api'
import { exportBikeReadingsToCSV, exportBikeReadingsToPDF, buildBikeReadingsCSVString, buildBikeReadingsPDFBlob } from '@/utils/exportUtils'

export default function BikeReadingsReportPage() {
  const [surveyors, setSurveyors] = useState<any[]>([])
  const [startDate, setStartDate] = useState<any>(dayjs().subtract(7, 'day'))
  const [endDate, setEndDate] = useState<any>(dayjs())
  const [userId, setUserId] = useState<string>('')
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

  useEffect(() => { fetchProfile() }, [])
  const fetchProfile = async () => {
    try { const p = await authService.getProfile(); setAdminProfile(p) } catch (e) { console.error(e) }
  }

  const handleExportCSV = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    const data = await bikeMeterService.getAll(params)
    const surveyorName = userId ? (surveyors.find(s => String(s.id) === String(userId))?.name ?? null) : null
    await exportBikeReadingsToCSV(data.readings, { surveyorName, startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, reportKind, createdBy: adminProfile?.name ?? 'admin' })
  }

  const handleExportPDF = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    const data = await bikeMeterService.getAll(params)
    const surveyorName = userId ? (surveyors.find(s => String(s.id) === String(userId))?.name ?? null) : null
    await exportBikeReadingsToPDF(data.readings, { surveyorName, startDate: params.startDate ?? null, endDate: params.endDate ?? null, userId: adminProfile?.id ?? null, reportKind, createdBy: adminProfile?.name ?? 'admin' })
  }

  const generatePreview = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    const data = await bikeMeterService.getAll(params)
    const readings = data.readings
    if (previewType === 'CSV') {
      const headers = ['Date', 'Time', 'Surveyor', 'Mobile', 'Reading (KM)', 'Photo URL']
  const total = readings.length
  const rows = readings.slice(0, 10).map(record => {
        const date = record?.capturedAt ? new Date(record.capturedAt) : null
        const dateStr = date ? date.toLocaleDateString() : ''
        const timeStr = date ? date.toLocaleTimeString() : ''
        const surveyor = record?.user?.name ?? ''
        const mobile = record?.user?.mobileNumber ?? ''
        const reading = String(record?.reading ?? '')
        const photo = record?.photoPath ?? ''
        return [dateStr, timeStr, surveyor, mobile, reading, photo]
      })
  setPreviewRows({ headers, rows })
  setPreviewTotal(total)
      if (previewBlobUrl) { URL.revokeObjectURL(previewBlobUrl); setPreviewBlobUrl(null) }
    } else {
      const blob = buildBikeReadingsPDFBlob(readings, { surveyorName: userId ? (surveyors.find(s => String(s.id) === String(userId))?.name ?? null) : null, startDate: params.startDate ?? null, endDate: params.endDate ?? null, reportKind })
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
