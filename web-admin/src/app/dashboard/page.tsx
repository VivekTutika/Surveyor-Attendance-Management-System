'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material'
import {
  People,
  Assignment,
  TrendingUp,
  PersonAdd,
  CheckCircle,
} from '@mui/icons-material'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { dashboardService, DashboardStats, attendanceService, bikeMeterService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import dayjs from 'dayjs'

interface StatsCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  subtitle?: string
}

function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weeklyAttendanceDataState, setWeeklyAttendanceDataState] = useState<Array<{ date: string; count: number }>>([])
  const [monthlyStatsDataState, setMonthlyStatsDataState] = useState<Array<{ month: string; attendance: number; bikeReadings: number }>>([])
  const isMounted = useRef(true)
  const fetchInProgress = useRef(false)

  useEffect(() => {
    isMounted.current = true
    
    // Fetch data when component mounts
    fetchDashboardStats()
    
    return () => {
      isMounted.current = false
      fetchInProgress.current = false
    }
  }, []) // Only run once on mount

  useEffect(() => {
    // If user becomes null (logged out), stop loading and clear data
    if (!user && isMounted.current) {
      setLoading(false)
      setStats(null)
      setError(null)
      setWeeklyAttendanceDataState([])
      setMonthlyStatsDataState([])
    }
  }, [user])

  const fetchDashboardStats = async () => {
    // Prevent multiple concurrent fetches
    if (fetchInProgress.current || !user) {
      return
    }

    fetchInProgress.current = true

    try {
      if (isMounted.current) {
        setLoading(true)
        setError(null)
      }
      
      const data = await dashboardService.getStats()
      
      if (!isMounted.current) {
        fetchInProgress.current = false
        return
      }
      
      if (isMounted.current) {
        setStats(data)
        // fetch raw attendance/bike data to compute client-side buckets using capturedAt (same approach as Attendance page)
        try {
          // Weekly: last 7 days (including today)
          const start = dayjs().subtract(6, 'day').format('YYYY-MM-DD')
          const end = dayjs().format('YYYY-MM-DD')
          const attResp: any = await attendanceService.getAll({ startDate: start, endDate: end, page: 1, limit: 10000 })
          
          if (!isMounted.current) {
            fetchInProgress.current = false
            return
          }
          
          const attArr = attResp.attendance || []
          const weekMap: Record<string, number> = {}
          attArr.forEach((a: any) => {
            const key = dayjs(a.capturedAt).format('YYYY-MM-DD')
            weekMap[key] = (weekMap[key] || 0) + 1
          })
          const weekly = Array.from({ length: 7 }).map((_, i) => {
            const k = dayjs().subtract(6 - i, 'day').format('YYYY-MM-DD')
            return { date: k, count: weekMap[k] || 0 }
          })
          setWeeklyAttendanceDataState(weekly)

          // Monthly: last 6 months (including current)
          const monthsBack = 6
          const startMonthDate = dayjs().subtract(monthsBack - 1, 'month').startOf('month').format('YYYY-MM-DD')
          const endMonthDate = dayjs().endOf('month').format('YYYY-MM-DD')
          const attMonthlyResp: any = await attendanceService.getAll({ startDate: startMonthDate, endDate: endMonthDate, page: 1, limit: 10000 })
          
          if (!isMounted.current) {
            fetchInProgress.current = false
            return
          }
          
          const bikeResp: any = await bikeMeterService.getAll({ startDate: startMonthDate, endDate: endMonthDate, page: 1, limit: 10000 })
          
          if (!isMounted.current) {
            fetchInProgress.current = false
            return
          }
          
          const attMonthlyArr = attMonthlyResp.attendance || []
          const bikeArr = bikeResp.readings || []
          const attMonthMap: Record<string, number> = {}
          attMonthlyArr.forEach((a: any) => {
            const key = dayjs(a.capturedAt).format('YYYY-MM')
            attMonthMap[key] = (attMonthMap[key] || 0) + 1
          })
          const bikeMonthMap: Record<string, number> = {}
          bikeArr.forEach((b: any) => {
            // bike readings may use 'date' or 'capturedAt'
            const dateField = b.capturedAt || b.date
            const key = dayjs(dateField).format('YYYY-MM')
            bikeMonthMap[key] = (bikeMonthMap[key] || 0) + 1
          })
          const months: string[] = []
          for (let i = monthsBack - 1; i >= 0; i--) {
            months.push(dayjs().subtract(i, 'month').format('YYYY-MM'))
          }
          const monthly = months.map(m => ({
            month: dayjs(`${m}-01`).format('MMM YYYY'),
            attendance: attMonthMap[m] || 0,
            bikeReadings: bikeMonthMap[m] || 0,
          }))
          setMonthlyStatsDataState(monthly)
        } catch (err) {
          if (isMounted.current) {
            console.error('Error fetching raw attendance/bike data for charts:', err)
          }
        }
      }
    } catch (error: any) {
      if (isMounted.current) {
        // Handle network timeout errors specifically
        if (error.message && error.message.includes('timeout')) {
          setError('Network timeout. Please check your connection and try again.')
        } 
        // Only set error if it's not an auth error (which should be handled by ProtectedRoute)
        else if (error.response?.status !== 401 && error.message !== 'Authentication required') {
          setError(error.message || 'Failed to fetch dashboard statistics')
        }
        // For auth errors, we just silently stop since ProtectedRoute will handle navigation
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
      fetchInProgress.current = false
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  if (!stats) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No data available
      </Alert>
    )
  }

  // if client-side computed weekly/monthly data is available, prefer it; otherwise fall back to server stats
  const weeklyAttendanceData = (weeklyAttendanceDataState.length > 0)
    ? weeklyAttendanceDataState
    : (stats?.weeklyAttendance || [])
        .map(item => ({ ...item, date: item.date }))
        .filter(item => !!item.date)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const monthlyStatsData = (monthlyStatsDataState.length > 0)
    ? monthlyStatsDataState
    : (stats?.monthlyStats || [])

  return (
    <Box>
      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <StatsCard
          title="Total Surveyors"
          value={stats.totalSurveyors}
          icon={<People />}
          color="primary.main"
          subtitle="Registered in system"
  />

        <StatsCard
          title="Active Surveyors"
          value={stats.activeSurveyors}
          icon={<PersonAdd />}
          color="success.main"
          subtitle="Currently active"
        />

        <StatsCard
          title="Surveyors with Bikes"
          value={(stats as any).surveyorsWithBikes ?? 0}
          icon={<TwoWheelerIcon />}
          color="primary.main"
          subtitle="Surveyors who have bikes"
        />

        <StatsCard
          title="Surveyors without Bikes"
          value={(stats as any).surveyorsWithoutBikes ?? 0}
          icon={<TwoWheelerIcon />}
          color="warning.main"
          subtitle="Surveyors who don't have bikes"
        />

        <StatsCard
          title="Attendance Check-ins (Morning)"
          value={stats.todayAttendanceMorning ?? 0}
          icon={<CheckCircle />}
          color="primary.main"
          subtitle="Morning check-ins today"
        />

        <StatsCard
          title="Attendance Check-outs (Evening)"
          value={stats.todayAttendanceEvening ?? 0}
          icon={<CheckCircle />}
          color="secondary.main"
          subtitle="Evening check-outs today"
        />

        <StatsCard
          title="Bike Readings (Morning)"
          value={stats.todayBikeMorning ?? 0}
          icon={<TwoWheelerIcon />}
          color="warning.main"
          subtitle="Morning bike readings"
        />

        <StatsCard
          title="Bike Readings (Evening)"
          value={stats.todayBikeEvening ?? 0}
          icon={<TwoWheelerIcon />}
          color="warning.dark"
          subtitle="Evening bike readings"
        />
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Weekly Attendance Chart */}
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Attendance Trend
            </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={weeklyAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric' 
                    })}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#1976d2" 
                    strokeWidth={2}
                    name="Attendance Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

        {/* Monthly Stats Chart */}
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Statistics
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyStatsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" fill="#1976d2" name="Attendance" />
                  <Bar dataKey="bikeReadings" fill="#ff9800" name="Bike Readings" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
      </Box>
    </Box>
  )
}