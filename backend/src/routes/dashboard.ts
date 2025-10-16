import { Router } from 'express';
import { prisma } from '../config/db';
import { startOfDayUTC, startOfTodayUTC } from '../utils/dateUtils';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// GET /dashboard/stats - Get dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
  // Use UTC day boundaries to avoid local timezone shifts
  const todayStart = startOfTodayUTC();
  const tomorrowStart = new Date(todayStart);
  // advance by one UTC day
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

  // Get current date for weekly/monthly calculations (anchored to UTC start of day)
  const currentDate = new Date();
  const weekAgoDate = new Date(currentDate);
  weekAgoDate.setUTCDate(weekAgoDate.getUTCDate() - 7);
  const weekAgo = startOfDayUTC(weekAgoDate.toISOString().split('T')[0]);

  const monthAgoDate = new Date(currentDate);
  monthAgoDate.setUTCMonth(monthAgoDate.getUTCMonth() - 6);
  const monthAgo = startOfDayUTC(monthAgoDate.toISOString().split('T')[0]);

    // Get basic counts
    const [
      totalSurveyors,
      activeSurveyors,
      todayAttendance,
      todayBikeReadings
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'SURVEYOR' }
      }),
      prisma.user.count({
        where: { 
          role: 'SURVEYOR',
          isActive: true 
        }
      }),
      prisma.attendance.count({
        where: {
          capturedAt: {
            gte: todayStart,
            lt: tomorrowStart
          }
        }
      }),
      prisma.bikeMeterReading.count({
        where: {
          capturedAt: {
            gte: todayStart,
            lt: tomorrowStart
          }
        }
      })
    ]);

    // Counts for surveyors with and without bikes
    // Use `any`-typed temporaries to avoid excess property checks against generated
    // Prisma types while we ensure the client/types are fully available.
    const whereSurveyorsWithBike: any = { role: 'SURVEYOR', hasBike: true };
    const whereSurveyorsWithoutBike: any = { role: 'SURVEYOR', hasBike: false };

    const [surveyorsWithBikes, surveyorsWithoutBikes] = await Promise.all([
      prisma.user.count({ where: whereSurveyorsWithBike }),
      prisma.user.count({ where: whereSurveyorsWithoutBike }),
    ]);

    // Today's counts by type
    const [todayAttendanceByType, todayBikeByType] = await Promise.all([
      prisma.attendance.groupBy({
        by: ['type'],
        where: {
          capturedAt: { gte: todayStart, lt: tomorrowStart }
        },
        _count: { id: true }
      }),
      prisma.bikeMeterReading.groupBy({
        by: ['type'],
        where: {
          capturedAt: { gte: todayStart, lt: tomorrowStart }
        },
        _count: { id: true }
      })
    ]);

    const todayAttendanceMorning = todayAttendanceByType.find(t => t.type === 'MORNING')?._count.id || 0;
    const todayAttendanceEvening = todayAttendanceByType.find(t => t.type === 'EVENING')?._count.id || 0;
    const todayBikeMorning = todayBikeByType.find(t => t.type === 'MORNING')?._count.id || 0;
    const todayBikeEvening = todayBikeByType.find(t => t.type === 'EVENING')?._count.id || 0;

    // Get weekly attendance data
    const weeklyAttendance = await prisma.attendance.groupBy({
      by: ['date'],
      _count: {
        id: true
      },
      where: {
        date: {
          gte: weekAgo
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get monthly stats
    const monthlyAttendance = await prisma.attendance.groupBy({
      by: ['capturedAt'],
      _count: {
        id: true
      },
      where: {
        capturedAt: {
          gte: monthAgo
        }
      }
    });

    const monthlyBikeReadings = await prisma.bikeMeterReading.groupBy({
      by: ['capturedAt'],
      _count: {
        id: true
      },
      where: {
        capturedAt: {
          gte: monthAgo
        }
      }
    });

    // Process monthly data
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setUTCMonth(date.getUTCMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const attendanceCount = monthlyAttendance.filter(item => 
        item.capturedAt.toISOString().slice(0, 7) === monthKey
      ).reduce((sum, item) => sum + item._count.id, 0);
      
      const bikeReadingCount = monthlyBikeReadings.filter(item => 
        item.capturedAt.toISOString().slice(0, 7) === monthKey
      ).reduce((sum, item) => sum + item._count.id, 0);

      monthlyStats.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        attendance: attendanceCount,
        bikeReadings: bikeReadingCount
      });
    }

    // Format weekly attendance data
    const formattedWeeklyAttendance = weeklyAttendance.map(item => ({
      date: item.date.toISOString(),
      count: item._count.id
    }));

    // Fill missing days in weekly data
    const completeWeeklyAttendance = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      
      const existingData = formattedWeeklyAttendance.find(item => 
        item.date.slice(0, 10) === dateStr
      );
      
      completeWeeklyAttendance.push({
        date: date.toISOString(),
        count: existingData ? existingData.count : 0
      });
    }

    const dashboardStats = {
      totalSurveyors,
      activeSurveyors,
      surveyorsWithBikes,
      surveyorsWithoutBikes,
      todayAttendance,
      todayBikeReadings,
      todayAttendanceMorning,
      todayAttendanceEvening,
      todayBikeMorning,
      todayBikeEvening,
      weeklyAttendance: completeWeeklyAttendance,
      monthlyStats
    };

    res.json({
      success: true,
      data: dashboardStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

export default router;