"use client"

import { useEffect, useState } from 'react'
import { Box, Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { surveyorService } from '@/services/api'

export default function SurveyorsReportPage() {
  const [surveyors, setSurveyors] = useState<any[]>([])
  const [startDate, setStartDate] = useState<any>(dayjs().subtract(7, 'day'))
  const [endDate, setEndDate] = useState<any>(dayjs())
  const [userId, setUserId] = useState<string>('')

  useEffect(() => { fetchSurveyors() }, [])
  const fetchSurveyors = async () => {
    try { const data = await surveyorService.getAll(); setSurveyors(data) } catch (err) { console.error(err) }
  }

  const handleExport = async () => {
    // simple CSV export same as previous logic
    const data = await surveyorService.getAll()
    const headers = ['Name', 'Mobile', 'Project', 'Location']
    const csv = [headers.join(','), ...data.map((s: any) => [s.name, s.mobileNumber, s.project || '', s.location || ''].join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'surveyors.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>Surveyors Details</Typography>
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
            <Button variant="outlined" onClick={handleExport}>Export CSV</Button>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  )
}
