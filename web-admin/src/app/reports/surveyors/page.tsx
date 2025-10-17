"use client"

import { useEffect, useState } from 'react'
import { Box, Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent } from '@mui/material'
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import Link from 'next/link'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { surveyorService, authService } from '@/services/api'
import { exportSurveyorsToCSV, exportSurveyorsToPDF, buildSurveyorsCSVString, buildSurveyorsPDFBlob } from '@/utils/exportUtils'

export default function SurveyorsReportPage() {
  const [surveyors, setSurveyors] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [adminProfile, setAdminProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [locationId, setLocationId] = useState<string>('')
  const [previewType, setPreviewType] = useState<'CSV' | 'PDF'>('CSV')
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)

  useEffect(() => { fetchSurveyors() }, [])
  const fetchSurveyors = async () => {
    try { const data = await surveyorService.getAll(); setSurveyors(data) } catch (err) { console.error(err) }
  }
  const [previewRows, setPreviewRows] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [previewTotal, setPreviewTotal] = useState<number | null>(null)

  useEffect(() => { fetchProfile() }, [])
  const fetchProfile = async () => {
    try { const p = await authService.getProfile(); setAdminProfile(p) } catch (e) { console.error(e) }
  }

  useEffect(() => { fetchProjectList(); fetchLocationList() }, [])
  const fetchProjectList = async () => {
    try { const p = await surveyorService.getProjects(); setProjects(p || []) } catch (e) { console.error(e) }
  }
  const fetchLocationList = async () => {
    try { const l = await surveyorService.getLocations(); setLocations(l || []) } catch (e) { console.error(e) }
  }

  const handleExportCSV = async () => {
    const data = await surveyorService.getAll()
    let filtered = data.filter(d =>
      (!userId || String(d.id) === String(userId)) &&
      (!projectId || String(d.project?.id) === String(projectId)) &&
      (!locationId || String(d.location?.id) === String(locationId))
    )
    filtered = [...filtered].sort((a: any, b: any) => {
      const ax = (a.employeeId ?? '').toString()
      const ay = (b.employeeId ?? '').toString()
      const nx = Number(ax)
      const ny = Number(ay)
      if (!isNaN(nx) && !isNaN(ny)) return nx - ny
      return ax.localeCompare(ay)
    })
    const surveyorName = userId ? (surveyors.find(s => String(s.id) === String(userId))?.name ?? null) : null
    await exportSurveyorsToCSV(filtered, { surveyorName, createdBy: adminProfile?.name ?? 'admin', userId: adminProfile?.id ?? null })
  }

  const handleExportPDF = async () => {
    const data = await surveyorService.getAll()
    let filtered = data.filter(d =>
      (!userId || String(d.id) === String(userId)) &&
      (!projectId || String(d.project?.id) === String(projectId)) &&
      (!locationId || String(d.location?.id) === String(locationId))
    )
    filtered = [...filtered].sort((a: any, b: any) => {
      const ax = (a.employeeId ?? '').toString()
      const ay = (b.employeeId ?? '').toString()
      const nx = Number(ax)
      const ny = Number(ay)
      if (!isNaN(nx) && !isNaN(ny)) return nx - ny
      return ax.localeCompare(ay)
    })
    const surveyorName = userId ? (surveyors.find(s => String(s.id) === String(userId))?.name ?? null) : null
    await exportSurveyorsToPDF(filtered, { surveyorName, createdBy: adminProfile?.name ?? 'admin', userId: adminProfile?.id ?? null })
  }

  const generatePreview = async () => {
    const all = await surveyorService.getAll()
    let filtered = all.filter(d =>
      (!userId || String(d.id) === String(userId)) &&
      (!projectId || String(d.project?.id) === String(projectId)) &&
      (!locationId || String(d.location?.id) === String(locationId))
    )
    filtered = [...filtered].sort((a: any, b: any) => {
      const ax = (a.employeeId ?? '').toString()
      const ay = (b.employeeId ?? '').toString()
      const nx = Number(ax)
      const ny = Number(ay)
      if (!isNaN(nx) && !isNaN(ny)) return nx - ny
      return ax.localeCompare(ay)
    })
    if (previewType === 'CSV') {
      const headers = ['Employee ID', 'Surveyor Name', 'Mobile', 'Aadhar', 'Bike', 'Project', 'Location']
      const total = filtered.length
      const rows = filtered.slice(0, 10).map(s => [s.employeeId ?? '', s.name ?? '', s.mobileNumber ?? '', (s as any).aadharNumber ?? '', s.hasBike ? 'Yes' : 'No', s.project?.name ?? '', s.location?.name ?? ''])
      setPreviewRows({ headers, rows })
      setPreviewTotal(total)
      if (previewBlobUrl) { URL.revokeObjectURL(previewBlobUrl); setPreviewBlobUrl(null) }
    } else {
      const blob = buildSurveyorsPDFBlob(filtered)
      const url = URL.createObjectURL(blob)
      setPreviewBlobUrl(url)
      setPreviewRows(null)
    }
  }

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMeta, setConfirmMeta] = useState<{ type: 'CSV' | 'PDF'; count?: number; filename?: string } | null>(null)

  const openConfirm = (type: 'CSV' | 'PDF', filename?: string, count?: number) => {
    setConfirmMeta({ type, filename, count })
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!confirmMeta) return
    setConfirmOpen(false)
    // perform the export that was requested
    if (confirmMeta.type === 'CSV') await handleExportCSV()
    else await handleExportPDF()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={{ mb: 2 }}>Surveyors Details</Typography>
        <Box>
          <Link href="/reports">
            <Button startIcon={<ArrowBack />}>Back</Button>
          </Link>
        </Box>
        </Box>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 240 }}>
              <InputLabel>Surveyor</InputLabel>
              <Select value={userId} label="Surveyor" onChange={(e) => setUserId(e.target.value)}>
                <MenuItem value=""><em>All Surveyors</em></MenuItem>
                {surveyors.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Project</InputLabel>
              <Select value={projectId} label="Project" onChange={(e) => setProjectId(e.target.value)}>
                <MenuItem value=""><em>All Projects</em></MenuItem>
                {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220 }}>
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
              <Button variant="outlined" onClick={() => openConfirm('CSV')}>Export CSV</Button>
              <Button variant="outlined" onClick={() => openConfirm('PDF')}>Export PDF</Button>
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
                <Typography variant="caption" sx={{ mb: 1 }}>{`Showing ${previewRows?.rows.length ?? 0} of ${previewTotal} rows`}</Typography>
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

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm Export</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to export the report{confirmMeta?.count ? ` (${confirmMeta.count} records)` : ''}?</Typography>
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

// Note: Confirmation dialog markup inserted at bottom of component file should be inside the component return;

