import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Attendance, BikeMeterReading } from '@/services/api'

// CSV Export Functions
export const exportAttendanceToCSV = (data: Attendance[]) => {
  const headers = ['Date', 'Time', 'Surveyor', 'Mobile', 'Type', 'Latitude', 'Longitude']
  
  const csvContent = [
    headers.join(','),
    ...data.map(record => [
      new Date(record.capturedAt).toLocaleDateString(),
      new Date(record.capturedAt).toLocaleTimeString(),
      record.user.name,
      record.user.mobileNumber,
      record.type,
      record.latitude.toString(),
      record.longitude.toString()
    ].join(','))
  ].join('\\n')

  downloadCSV(csvContent, 'attendance-report.csv')
}

export const exportBikeReadingsToCSV = (data: BikeMeterReading[]) => {
  const headers = ['Date', 'Time', 'Surveyor', 'Mobile', 'Reading (KM)', 'Photo URL']
  
  const csvContent = [
    headers.join(','),
    ...data.map(record => [
      new Date(record.capturedAt).toLocaleDateString(),
      new Date(record.capturedAt).toLocaleTimeString(),
      record.user.name,
      record.user.mobileNumber,
      record.reading.toString(),
      record.photoPath
    ].join(','))
  ].join('\\n')

  downloadCSV(csvContent, 'bike-readings-report.csv')
}

// PDF Export Functions
export const exportAttendanceToPDF = (data: Attendance[]) => {
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

  doc.save('attendance-report.pdf')
}

export const exportBikeReadingsToPDF = (data: BikeMeterReading[]) => {
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

  doc.save('bike-readings-report.pdf')
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