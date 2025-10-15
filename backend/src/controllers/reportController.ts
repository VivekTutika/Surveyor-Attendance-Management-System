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
