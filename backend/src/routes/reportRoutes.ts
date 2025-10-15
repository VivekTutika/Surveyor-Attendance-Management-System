import express from 'express'
import { createReport } from '../controllers/reportController'

const router = express.Router()

// POST /api/reports
router.post('/', createReport)

export default router
