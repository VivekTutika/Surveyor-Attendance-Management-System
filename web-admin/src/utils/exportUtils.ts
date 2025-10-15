import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Attendance, BikeMeterReading, reportService } from '@/services/api'

// CSV Export Functions
export const buildFileName = (base: string, surveyorName: string | null, startDate?: string | null, endDate?: string | null) => {
  const nameParts: string[] = [base]
  if (surveyorName) {
    // sanitize name
    const safe = surveyorName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    nameParts.push(safe)
  }
  if (startDate && endDate) {
    nameParts.push(startDate.replace(/-/g, ''))
    nameParts.push(endDate.replace(/-/g, ''))
  }
  return nameParts.join('-')
}

export const exportAttendanceToCSV = async (data: Attendance[], opts: { surveyorName?: string | null; startDate?: string | null; endDate?: string | null; userId?: number | null; createdBy?: string | null }) => {
  try {
    const headers = ['Date', 'Time', 'Surveyor', 'Mobile', 'Type', 'Latitude', 'Longitude']
    const csvLines = data.map(record => {
      const date = record?.capturedAt ? new Date(record.capturedAt) : null
      const dateStr = date ? date.toLocaleDateString() : ''
      const timeStr = date ? date.toLocaleTimeString() : ''
      const surveyor = record?.user?.name ?? ''
      const mobile = record?.user?.mobileNumber ?? ''
      const type = record?.type ?? ''
      const lat = (record?.latitude ?? '')
      const lon = (record?.longitude ?? '')
      return [dateStr, timeStr, surveyor, mobile, type, String(lat), String(lon)].join(',')
    })

    const csvContent = [headers.join(','), ...csvLines].join('\n')
    const filenameBase = opts.surveyorName ? `attendance-${opts.surveyorName}` : 'attendance-all'
    const filename = `${buildFileName(filenameBase, null, opts.startDate ?? null, opts.endDate ?? null)}.csv`
    downloadCSV(csvContent, filename)

    // Record the report generation (non-blocking)
    reportService.create({ userId: opts.userId ?? 0, reportType: 'CSV', startDate: opts.startDate ?? null, endDate: opts.endDate ?? null, filePath: filename, generatedAt: new Date().toISOString(), createdBy: opts.createdBy ?? 'admin' }).catch(() => {})
  } catch (err) {
    console.error('Failed to export attendance CSV', err)
    throw err
  }
}

export const exportBikeReadingsToCSV = async (data: BikeMeterReading[], opts: { surveyorName?: string | null; startDate?: string | null; endDate?: string | null; userId?: number | null; reportKind?: 'RAW' | 'COMPREHENSIVE'; createdBy?: string | null }) => {
  try {
    const headers = ['Date', 'Time', 'Surveyor', 'Mobile', 'Reading (KM)', 'Photo URL']
    const csvLines = data.map(record => {
      const date = record?.capturedAt ? new Date(record.capturedAt) : null
      const dateStr = date ? date.toLocaleDateString() : ''
      const timeStr = date ? date.toLocaleTimeString() : ''
      const surveyor = record?.user?.name ?? ''
      const mobile = record?.user?.mobileNumber ?? ''
  const reading = (record?.reading ?? '')
      const photo = record?.photoPath ?? ''
      return [dateStr, timeStr, surveyor, mobile, String(reading), photo].join(',')
    })

    const csvContent = [headers.join(','), ...csvLines].join('\n')
  const kindSuffix = opts.reportKind === 'COMPREHENSIVE' ? 'comprehensive' : 'raw'
  // Ensure the report kind is part of the filename even when a specific surveyor is selected
  const filenameBase = opts.surveyorName ? `bike-readings-${kindSuffix}` : `bike-readings-all-${kindSuffix}`
  const filename = `${buildFileName(filenameBase, opts.surveyorName ?? null, opts.startDate ?? null, opts.endDate ?? null)}.csv`
    downloadCSV(csvContent, filename)

    reportService.create({ userId: opts.userId ?? 0, reportType: 'CSV', startDate: opts.startDate ?? null, endDate: opts.endDate ?? null, filePath: filename, generatedAt: new Date().toISOString(), createdBy: opts.createdBy ?? 'admin' }).catch(() => {})
  } catch (err) {
    console.error('Failed to export bike readings CSV', err)
    throw err
  }
}

// PDF Export Functions
export const exportAttendanceToPDF = async (data: Attendance[], opts: { surveyorName?: string | null; startDate?: string | null; endDate?: string | null; userId?: number | null; createdBy?: string | null }) => {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('Attendance Report', 14, 22)
  
  // Date range
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35)
  
  // Table
  const tableData = data.map(record => [
    new Date(record.capturedAt).toLocaleDateString(),
    new Date(record.capturedAt).toLocaleTimeString(),
    record.user.name,
    record.user.mobileNumber,
    record.type,
    `${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}`
  ])

  autoTable(doc, {
    head: [['Date', 'Time', 'Surveyor', 'Mobile', 'Type', 'Location']],
    body: tableData,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [25, 118, 210] },
    styles: { fontSize: 8 }
  })

  const filename = `${buildFileName(opts.surveyorName ? `attendance-${opts.surveyorName}` : 'attendance-all', null, opts.startDate ?? null, opts.endDate ?? null)}.pdf`
  doc.save(filename)
  reportService.create({ userId: opts.userId ?? 0, reportType: 'PDF', startDate: opts.startDate ?? null, endDate: opts.endDate ?? null, filePath: filename, generatedAt: new Date().toISOString(), createdBy: opts.createdBy ?? 'admin' }).catch(() => {})
}

export const exportBikeReadingsToPDF = async (data: BikeMeterReading[], opts: { surveyorName?: string | null; startDate?: string | null; endDate?: string | null; userId?: number | null; reportKind?: 'RAW' | 'COMPREHENSIVE'; createdBy?: string | null }) => {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('Bike Meter Readings Report', 14, 22)
  
  // Date range
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35)
  
  // Table
  const tableData = data.map(record => [
    new Date(record.capturedAt).toLocaleDateString(),
    new Date(record.capturedAt).toLocaleTimeString(),
    record.user.name,
    record.user.mobileNumber,
    `${record.reading} KM`
  ])

  autoTable(doc, {
    head: [['Date', 'Time', 'Surveyor', 'Mobile', 'Reading']],
    body: tableData,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [25, 118, 210] },
    styles: { fontSize: 10 }
  })

  const kindSuffix = opts.reportKind === 'COMPREHENSIVE' ? 'comprehensive' : 'raw'
  // Embed kind into filename and pass surveyorName separately so buildFileName will sanitize the name
  const filename = `${buildFileName(opts.surveyorName ? `bike-readings-${kindSuffix}` : `bike-readings-all-${kindSuffix}`, opts.surveyorName ?? null, opts.startDate ?? null, opts.endDate ?? null)}.pdf`
  doc.save(filename)
  reportService.create({ userId: opts.userId ?? 0, reportType: 'PDF', startDate: opts.startDate ?? null, endDate: opts.endDate ?? null, filePath: filename, generatedAt: new Date().toISOString(), createdBy: opts.createdBy ?? 'admin' }).catch(() => {})
}

// Helper function to download CSV
const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Format data for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Surveyor details exports
export const exportSurveyorsToCSV = async (data: any[], opts: { surveyorName?: string | null; createdBy?: string | null; userId?: number | null }) => {
  const headers = ['Employee ID', 'Surveyor Name', 'Mobile', 'Bike', 'Project', 'Location']
  const csvContent = [headers.join(','), ...data.map(s => [s.employeeId ?? '', s.name ?? '', s.mobileNumber ?? '', s.hasBike ? 'Yes' : 'No', s.project?.name ?? '', s.location?.name ?? ''].join(','))].join('\n')
  const filenameBase = opts.userId ? `surveyor-details-${opts.surveyorName ?? 'single'}` : 'surveyor-details-all'
  const filename = `${buildFileName(filenameBase, null, null, null)}.csv`
  downloadCSV(csvContent, filename)

  try {
    await reportService.create({ userId: opts.userId ?? 0, reportType: 'CSV', startDate: null, endDate: null, filePath: filename, generatedAt: new Date().toISOString(), createdBy: opts.createdBy ?? 'admin' })
  } catch (e) {}
}

export const exportSurveyorsToPDF = async (data: any[], opts: { surveyorName?: string | null; createdBy?: string | null; userId?: number | null }) => {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Surveyor Details', 14, 22)
  const tableData = data.map(s => [s.employeeId ?? '', s.name ?? '', s.mobileNumber ?? '', s.hasBike ? 'Yes' : 'No', s.project?.name ?? '', s.location?.name ?? ''])
  autoTable(doc, { head: [['Employee ID', 'Surveyor Name', 'Mobile', 'Bike', 'Project', 'Location']], body: tableData, startY: 35 })
  const filenameBase = opts.userId ? `surveyor-details-${opts.surveyorName ?? 'single'}` : 'surveyor-details-all'
  const filename = `${buildFileName(filenameBase, null, null, null)}.pdf`
  doc.save(filename)

  try {
    await reportService.create({ userId: opts.userId ?? 0, reportType: 'PDF', startDate: null, endDate: null, filePath: filename, generatedAt: new Date().toISOString(), createdBy: opts.createdBy ?? 'admin' })
  } catch (e) {}
}

// Preview / builder helpers (return raw content or Blob for preview)
export const buildBikeReadingsCSVString = (data: BikeMeterReading[], opts: { surveyorName?: string | null; startDate?: string | null; endDate?: string | null; reportKind?: 'RAW' | 'COMPREHENSIVE' }) => {
  const headers = ['Date', 'Time', 'Surveyor', 'Mobile', 'Reading (KM)', 'Photo URL']
  const csvLines = data.map(record => {
    const date = record?.capturedAt ? new Date(record.capturedAt) : null
    const dateStr = date ? date.toLocaleDateString() : ''
    const timeStr = date ? date.toLocaleTimeString() : ''
    const surveyor = record?.user?.name ?? ''
    const mobile = record?.user?.mobileNumber ?? ''
    const reading = (record?.reading ?? '')
    const photo = record?.photoPath ?? ''
    // escape commas in fields
    const esc = (s: any) => {
      if (s === null || s === undefined) return ''
      const str = String(s)
      if (str.includes(',' ) || str.includes('\n') || str.includes('"')) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    }
    return [esc(dateStr), esc(timeStr), esc(surveyor), esc(mobile), esc(reading), esc(photo)].join(',')
  })

  return [headers.join(','), ...csvLines].join('\n')
}

export const buildBikeReadingsPDFBlob = (data: BikeMeterReading[], opts: { surveyorName?: string | null; startDate?: string | null; endDate?: string | null; reportKind?: 'RAW' | 'COMPREHENSIVE' }) => {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Bike Meter Readings', 14, 20)
  doc.setFontSize(11)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

  const tableData = data.map(record => [
    record.capturedAt ? new Date(record.capturedAt).toLocaleDateString() : '',
    record.capturedAt ? new Date(record.capturedAt).toLocaleTimeString() : '',
    record.user?.name ?? '',
    record.user?.mobileNumber ?? '',
    String(record.reading ?? '')
  ])

  autoTable(doc, {
    head: [['Date', 'Time', 'Surveyor', 'Mobile', 'Reading']],
    body: tableData,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 9 }
  })

  const blob = doc.output('blob')
  return blob
}

export const buildAttendanceCSVString = (data: Attendance[], opts: { surveyorName?: string | null; startDate?: string | null; endDate?: string | null }) => {
  const headers = ['Date', 'Time', 'Surveyor', 'Mobile', 'Type', 'Latitude', 'Longitude']
  const csvLines = data.map(record => {
    const date = record?.capturedAt ? new Date(record.capturedAt) : null
    const dateStr = date ? date.toLocaleDateString() : ''
    const timeStr = date ? date.toLocaleTimeString() : ''
    const surveyor = record?.user?.name ?? ''
    const mobile = record?.user?.mobileNumber ?? ''
    const lat = (record?.latitude ?? '')
    const lon = (record?.longitude ?? '')
    return [dateStr, timeStr, surveyor, mobile, record?.type ?? '', String(lat), String(lon)].join(',')
  })
  return [headers.join(','), ...csvLines].join('\n')
}

export const buildAttendancePDFBlob = (data: Attendance[], opts: { surveyorName?: string | null; startDate?: string | null; endDate?: string | null }) => {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Attendance Report', 14, 20)
  doc.setFontSize(11)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
  const tableData = data.map(record => [
    record.capturedAt ? new Date(record.capturedAt).toLocaleDateString() : '',
    record.capturedAt ? new Date(record.capturedAt).toLocaleTimeString() : '',
    record.user?.name ?? '',
    record.user?.mobileNumber ?? '',
    record.type ?? '',
    `${record.latitude ?? ''}, ${record.longitude ?? ''}`
  ])
  autoTable(doc, { head: [['Date', 'Time', 'Surveyor', 'Mobile', 'Type', 'Location']], body: tableData, startY: 40, styles: { fontSize: 9 } })
  return doc.output('blob')
}

export const buildSurveyorsCSVString = (data: any[]) => {
  const headers = ['Name', 'Mobile', 'Project', 'Location']
  const csvContent = [headers.join(','), ...data.map(s => [s.name, s.mobileNumber, s.project?.name ?? '', s.location?.name ?? ''].join(','))].join('\n')
  return csvContent
}

export const buildSurveyorsPDFBlob = (data: any[]) => {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Surveyor Details', 14, 20)
  const tableData = data.map(s => [s.name, s.mobileNumber, s.project?.name ?? '', s.location?.name ?? ''])
  autoTable(doc, { head: [['Name', 'Mobile', 'Project', 'Location']], body: tableData, startY: 35 })
  return doc.output('blob')
}

// Consolidation helpers for Attendance (one row per surveyor per date)
export type ConsolidatedAttendanceRow = {
  date: string
  surveyorName: string
  mobile: string
  checkIn?: string | null
  checkOut?: string | null
}

export const consolidateAttendance = (attendance: Attendance[]): ConsolidatedAttendanceRow[] => {
  const map = new Map<string, ConsolidatedAttendanceRow>()
  attendance.forEach(a => {
    const captured = a.capturedAt ? new Date(a.capturedAt) : null
    const dateKey = captured ? captured.toISOString().split('T')[0] : (a.date ? new Date(a.date).toISOString().split('T')[0] : '')
    const userName = a.user?.name ?? ''
    const mobile = a.user?.mobileNumber ?? ''
  const key = `${(a.user as any)?.id ?? ''}::${dateKey}`
    const existing = map.get(key)
    const timeStr = captured ? new Date(captured).toLocaleTimeString() : null

    if (!existing) {
      map.set(key, {
        date: dateKey,
        surveyorName: userName,
        mobile,
        checkIn: a.type === 'MORNING' ? timeStr : null,
        checkOut: a.type === 'EVENING' ? timeStr : null,
      })
    } else {
      if (a.type === 'MORNING') existing.checkIn = timeStr
      if (a.type === 'EVENING') existing.checkOut = timeStr
    }
  })

  // Sort by date desc, then surveyor name
  const arr = Array.from(map.values())
  arr.sort((x, y) => {
    if (x.date === y.date) return x.surveyorName.localeCompare(y.surveyorName)
    return x.date < y.date ? 1 : -1
  })
  return arr
}

export const buildConsolidatedAttendanceCSVString = (consolidated: ConsolidatedAttendanceRow[]) => {
  const headers = ['Date', 'Surveyor', 'Mobile', 'Check In', 'Check Out']
  const lines = consolidated.map(r => [r.date, r.surveyorName, r.mobile, r.checkIn ?? '', r.checkOut ?? ''].map(v => {
    if (v == null) return ''
    const s = String(v)
    if (s.includes(',') || s.includes('\n') || s.includes('"')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(','))
  return [headers.join(','), ...lines].join('\n')
}

export const buildConsolidatedAttendancePDFBlob = (consolidated: ConsolidatedAttendanceRow[]) => {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Attendance (Consolidated)', 14, 20)
  doc.setFontSize(11)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
  const tableData = consolidated.map(r => [r.date, r.surveyorName, r.mobile, r.checkIn ?? '', r.checkOut ?? ''])
  autoTable(doc, { head: [['Date', 'Surveyor', 'Mobile', 'Check In', 'Check Out']], body: tableData, startY: 40, styles: { fontSize: 9 } })
  return doc.output('blob')
}

export const exportConsolidatedAttendanceToCSV = async (consolidated: ConsolidatedAttendanceRow[], opts: { startDate?: string | null; endDate?: string | null; userId?: number | null; createdBy?: string | null }) => {
  const csv = buildConsolidatedAttendanceCSVString(consolidated)
  const filename = `${buildFileName('attendance-consolidated', null, opts.startDate ?? null, opts.endDate ?? null)}.csv`
  downloadCSV(csv, filename)
  try {
    await reportService.create({ userId: opts.userId ?? 0, reportType: 'CSV', startDate: opts.startDate ?? null, endDate: opts.endDate ?? null, filePath: filename, generatedAt: new Date().toISOString(), createdBy: opts.createdBy ?? 'admin' })
  } catch (e) {}
}

export const exportConsolidatedAttendanceToPDF = async (consolidated: ConsolidatedAttendanceRow[], opts: { startDate?: string | null; endDate?: string | null; userId?: number | null; createdBy?: string | null }) => {
  const blob = buildConsolidatedAttendancePDFBlob(consolidated)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${buildFileName('attendance-consolidated', null, opts.startDate ?? null, opts.endDate ?? null)}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  try {
    await reportService.create({ userId: opts.userId ?? 0, reportType: 'PDF', startDate: opts.startDate ?? null, endDate: opts.endDate ?? null, filePath: a.download, generatedAt: new Date().toISOString(), createdBy: opts.createdBy ?? 'admin' })
  } catch (e) {}
}