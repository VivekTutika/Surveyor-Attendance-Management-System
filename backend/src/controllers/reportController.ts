import { Request, Response } from 'express'
import { ReportService } from '../services/reportService'

export const createReport = async (req: Request, res: Response) => {
  try {
    const payload = req.body
    // expect userId, reportType, startDate, endDate, filePath, createdBy
    const record = await ReportService.createRecord({
      userId: payload.userId,
      reportType: payload.reportType,
      startDate: payload.startDate ?? null,
      endDate: payload.endDate ?? null,
      filePath: payload.filePath,
      generatedAt: payload.generatedAt ? new Date(payload.generatedAt) : new Date(),
      createdBy: payload.createdBy || 'unknown',
    })

    res.status(201).json({ success: true, data: record })
  } catch (err: any) {
    console.error('createReport error', err)
    res.status(500).json({ success: false, message: 'Failed to record report' })
  }
}

export const consolidatedAttendance = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, surveyorId, projectId, locationId } = req.query as any
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'startDate and endDate are required' })
    const result = await ReportService.getConsolidatedAttendance({ startDate, endDate, surveyorId: surveyorId ? Number(surveyorId) : undefined, projectId: projectId ? Number(projectId) : undefined, locationId: locationId ? Number(locationId) : undefined })
    res.json({ success: true, data: result })
  } catch (err: any) {
    console.error('consolidatedAttendance error', err)
    res.status(500).json({ success: false, message: 'Failed to generate consolidated attendance' })
  }
}

export const consolidatedBikeReadings = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, surveyorId, projectId, locationId } = req.query as any
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'startDate and endDate are required' })
    const result = await ReportService.getConsolidatedBikeReadings({ startDate, endDate, surveyorId: surveyorId ? Number(surveyorId) : undefined, projectId: projectId ? Number(projectId) : undefined, locationId: locationId ? Number(locationId) : undefined })
    res.json({ success: true, data: result })
  } catch (err: any) {
    console.error('consolidatedBikeReadings error', err)
    res.status(500).json({ success: false, message: 'Failed to generate consolidated bike readings' })
  }
}
