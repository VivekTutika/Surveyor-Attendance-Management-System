"use client"

import { useEffect, useState } from 'react'
import { Box, Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { surveyorService, attendanceService } from '@/services/api'
import { exportAttendanceToCSV, exportAttendanceToPDF } from '@/utils/exportUtils'

export default function AttendanceReportPage() {
  const [surveyors, setSurveyors] = useState<any[]>([])
  const [startDate, setStartDate] = useState<any>(dayjs().subtract(7, 'day'))
  const [endDate, setEndDate] = useState<any>(dayjs())
  const [userId, setUserId] = useState<string>('')

  useEffect(() => { fetchSurveyors() }, [])
  const fetchSurveyors = async () => {
    try { const data = await surveyorService.getAll(); setSurveyors(data) } catch (err) { console.error(err) }
  }

  const handleExportCSV = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    const data = await attendanceService.getAll(params)
    exportAttendanceToCSV(data.attendance)
  }

  const handleExportPDF = async () => {
    const params: any = {}
    if (startDate) params.startDate = startDate.format('YYYY-MM-DD')
    if (endDate) params.endDate = endDate.format('YYYY-MM-DD')
    if (userId) params.userId = userId
    const data = await attendanceService.getAll(params)
    exportAttendanceToPDF(data.attendance)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>Surveyors Attendance</Typography>
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
            <Button startIcon={<></>} variant="outlined" onClick={handleExportCSV}>Export CSV</Button>
            <Button startIcon={<></>} variant="outlined" onClick={handleExportPDF}>Export PDF</Button>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  )
}
