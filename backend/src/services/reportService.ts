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
}
