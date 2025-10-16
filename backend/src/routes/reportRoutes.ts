import express from 'express'
import { createReport } from '../controllers/reportController'

const router = express.Router()

// POST /api/reports
router.post('/', createReport)

// Consolidated reports
import { consolidatedAttendance, consolidatedBikeReadings } from '../controllers/reportController'
router.get('/consolidated/attendance', consolidatedAttendance)
router.get('/consolidated/bike-readings', consolidatedBikeReadings)

export default router
