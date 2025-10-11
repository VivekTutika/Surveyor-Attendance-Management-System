'use client'

import { useState, useEffect } from 'react'
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
  DirectionsBike,
  TrendingUp,
  PersonAdd,
  CheckCircle,
} from '@mui/icons-material'
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
import { dashboardService, DashboardStats } from '@/services/api'

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
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardService.getStats()
      setStats(data)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch dashboard statistics')
    } finally {
      setLoading(false)
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to the SAMS Admin Portal. Here's a quick overview of your system.
      </Typography>

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
          icon={<DirectionsBike />}
          color="primary.main"
          subtitle="Surveyors who have bikes"
        />

        <StatsCard
          title="Surveyors without Bikes"
          value={(stats as any).surveyorsWithoutBikes ?? 0}
          icon={<DirectionsBike />}
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
          icon={<DirectionsBike />}
          color="warning.main"
          subtitle="Morning bike readings"
        />

        <StatsCard
          title="Bike Readings (Evening)"
          value={stats.todayBikeEvening ?? 0}
          icon={<DirectionsBike />}
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
                <LineChart data={stats.weeklyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
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
                <BarChart data={stats.monthlyStats}>
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

        {/* System Status */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="success" />
              <Typography variant="body2">API Server: Online</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="success" />
              <Typography variant="body2">Database: Connected</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="success" />
              <Typography variant="body2">File Storage: Available</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}