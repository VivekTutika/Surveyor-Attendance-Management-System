import { prisma } from '../config/db'

export interface ReportRecord {
  userId: number
  reportType: 'CSV' | 'PDF'
  startDate?: string | null
  endDate?: string | null
  filePath: string
  generatedAt?: Date
  createdBy: string
}

export class ReportService {
  static async createRecord(payload: ReportRecord) {
    const record = await (prisma as any).report.create({
      data: {
        userId: payload.userId,
        reportType: payload.reportType,
        startDate: payload.startDate ? new Date(payload.startDate) : null,
        endDate: payload.endDate ? new Date(payload.endDate) : null,
        filePath: payload.filePath,
        generatedAt: payload.generatedAt ?? new Date(),
        createdBy: payload.createdBy,
      },
    })

    return record
  }

  // return array of dates between start and end (inclusive) as YYYY-MM-DD strings
  static getDateRange(start: string, end: string) {
    const startDt = new Date(start)
    const endDt = new Date(end)
    const out: string[] = []
    for (let d = new Date(startDt); d <= endDt; d.setUTCDate(d.getUTCDate() + 1)) {
      out.push(d.toISOString().split('T')[0])
    }
    return out
  }

  // Consolidated attendance: returns list of surveyors and matrix of H/P/A per date
  static async getConsolidatedAttendance(opts: { startDate: string; endDate: string; surveyorId?: number; projectId?: number; locationId?: number }) {
    const { startDate, endDate, surveyorId, projectId, locationId } = opts
    const dates = ReportService.getDateRange(startDate, endDate)

    // fetch surveyors filtered by project/location/surveyorId
    const surveyorWhere: any = { role: 'SURVEYOR' }
    if (surveyorId) surveyorWhere.id = surveyorId
    if (projectId) surveyorWhere.projectId = projectId
    if (locationId) surveyorWhere.locationId = locationId

  const surveyors = await prisma.user.findMany({ where: surveyorWhere, select: { id: true, employeeId: true, name: true, aadharNumber: true } as any })

    // Parse incoming date filters as UTC date-only to avoid local timezone shifts.
    // Expecting date/startDate/endDate in YYYY-MM-DD format.
    const sParts = (startDate as string).split('-').map((p) => parseInt(p, 10));
    const eParts = (endDate as string).split('-').map((p) => parseInt(p, 10));
    let sUtc: Date;
    let eUtc: Date;
    
    if (sParts.length === 3 && eParts.length === 3) {
      sUtc = new Date(Date.UTC(sParts[0], sParts[1] - 1, sParts[2], 0, 0, 0, 0));
      eUtc = new Date(Date.UTC(eParts[0], eParts[1] - 1, eParts[2], 23, 59, 59, 999));
    } else {
      sUtc = new Date(startDate as string);
      sUtc.setUTCHours(0, 0, 0, 0);
      eUtc = new Date(endDate as string);
      eUtc.setUTCHours(23, 59, 59, 999);
    }

    // Fetch attendance rows in the date range for these surveyors
    const attendanceRows = await prisma.attendance.findMany({
      where: {
    userId: { in: (surveyors.map(s => s.id) as any) },
        date: { gte: sUtc, lte: eUtc }
      },
      select: { userId: true, date: true, type: true }
    })

    // Build a map userId::date -> { hasCheckIn, hasCheckOut }
    const map = new Map<string, { checkIn?: boolean; checkOut?: boolean }>()
    attendanceRows.forEach(r => {
      const key = `${r.userId}::${new Date(r.date).toISOString().split('T')[0]}`
      const existing = map.get(key) || {}
      if (r.type === 'MORNING') existing.checkIn = true
      if (r.type === 'EVENING') existing.checkOut = true
      map.set(key, existing)
    })

    // Construct matrix with new logic:
    // P - Present (both checkIn and checkOut)
    // MH - Morning Half (only checkIn)
    // EH - Evening Half (only checkOut)
    // A - Absent (neither checkIn nor checkOut)
    const rows = surveyors.map(s => {
      const row: any = { employeeId: s.employeeId ?? '', name: s.name }
      dates.forEach(d => {
        const key = `${s.id}::${d}`
        const val = map.get(key)
        
        if (!val) {
          // No attendance records for this date
          row[d] = 'A'
        } else if (val.checkIn && val.checkOut) {
          // Both checkIn and checkOut exist
          row[d] = 'P'
        } else if (val.checkIn) {
          // Only checkIn exists (Morning Half)
          row[d] = 'MH'
        } else if (val.checkOut) {
          // Only checkOut exists (Evening Half)
          row[d] = 'EH'
        } else {
          // Neither checkIn nor checkOut exists
          row[d] = 'A'
        }
      })
      return row
    })

    return { dates, surveyors: rows }
  }

  // Consolidated bike readings: returns matrix of final_km (only if approved) per date
  static async getConsolidatedBikeReadings(opts: { startDate: string; endDate: string; surveyorId?: number; projectId?: number; locationId?: number }) {
    const { startDate, endDate, surveyorId, projectId, locationId } = opts
    const dates = ReportService.getDateRange(startDate, endDate)

    const surveyorWhere: any = { role: 'SURVEYOR' }
    if (surveyorId) surveyorWhere.id = surveyorId
    if (projectId) surveyorWhere.projectId = projectId
    if (locationId) surveyorWhere.locationId = locationId

  const surveyors = await prisma.user.findMany({ where: surveyorWhere, select: { id: true, employeeId: true, name: true, aadharNumber: true } as any })

    // Parse incoming date filters as UTC date-only to avoid local timezone shifts.
    // Expecting date/startDate/endDate in YYYY-MM-DD format.
    const sParts = (startDate as string).split('-').map((p) => parseInt(p, 10));
    const eParts = (endDate as string).split('-').map((p) => parseInt(p, 10));
    let sUtc: Date;
    let eUtc: Date;
    
    if (sParts.length === 3 && eParts.length === 3) {
      sUtc = new Date(Date.UTC(sParts[0], sParts[1] - 1, sParts[2], 0, 0, 0, 0));
      eUtc = new Date(Date.UTC(eParts[0], eParts[1] - 1, eParts[2], 23, 59, 59, 999));
    } else {
      sUtc = new Date(startDate as string);
      sUtc.setUTCHours(0, 0, 0, 0);
      eUtc = new Date(endDate as string);
      eUtc.setUTCHours(23, 59, 59, 999);
    }

    // fetch bike trips in date range for these surveyors
    const trips = await prisma.bikeTrip.findMany({
      where: {
  surveyorId: { in: (surveyors.map(s => s.id) as any) },
        date: { gte: sUtc, lte: eUtc },
        // Only include approved trips
        isApproved: true
      },
      select: { surveyorId: true, date: true, finalKm: true, isApproved: true }
    })

    const map = new Map<string, number>()
    trips.forEach(t => {
      const d = new Date(t.date).toISOString().split('T')[0]
      const key = `${t.surveyorId}::${d}`
      // Show the finalKm value if it exists and the trip is approved
      map.set(key, t.finalKm ?? 0)
    })

    const rows = surveyors.map(s => {
      const row: any = { employeeId: s.employeeId ?? '', name: s.name }
      dates.forEach(d => {
        const key = `${s.id}::${d}`
        row[d] = map.get(key) ?? 0
      })
      return row
    })

    return { dates, surveyors: rows }
  }
}