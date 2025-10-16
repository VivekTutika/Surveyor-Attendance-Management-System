"use client"

import React from "react"
import { Box, Typography, Card, CardContent, CardActionArea, Avatar } from "@mui/material"
import {
  People,
  Assignment,
} from "@mui/icons-material"
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import Link from "next/link"

export default function ReportsLanding() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1200 }}>

          {/* Surveyors Report */}
          <Card sx={{ width: 360, height: 160, transition: 'transform 180ms ease, box-shadow 180ms ease' }} elevation={3}>
            <CardActionArea component={Link} href="/reports/surveyors" sx={{ height: '100%', '&:hover': { transform: 'scale(1.12)', boxShadow: 16 } }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                  <People sx={{ fontSize: 34 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Surveyors Details</Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Attendance Report */}
          <Card sx={{ width: 360, height: 160, transition: 'transform 180ms ease, box-shadow 180ms ease' }} elevation={3}>
            <CardActionArea component={Link} href="/reports/attendance" sx={{ height: '100%', '&:hover': { transform: 'scale(1.12)', boxShadow: 16 } }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 64, height: 64 }}>
                  <Assignment sx={{ fontSize: 34 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Surveyors Attendance</Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Bike Readings Report */}
          <Card sx={{ width: 360, height: 160, transition: 'transform 180ms ease, box-shadow 180ms ease' }} elevation={3}>
            <CardActionArea component={Link} href="/reports/bike-readings" sx={{ height: '100%', '&:hover': { transform: 'scale(1.2)', boxShadow: 24 } }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 64, height: 64 }}>
                  <TwoWheelerIcon sx={{ fontSize: 34 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Bike Meter Readings</Typography>
              </CardContent>
            </CardActionArea>
          </Card>

        </Box>
      </Box>
    </Box>
  )
}
