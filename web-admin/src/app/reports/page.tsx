"use client"

import React from "react"
import { Box, Typography, Card, CardContent, CardActionArea, Avatar } from "@mui/material"
import {
  People,
  Assignment,
  DirectionsBike,
} from "@mui/icons-material"
import Link from "next/link"

export default function ReportsLanding() {
  return (
    <Box>
      {/* Reports Grid (replaced with flex Boxes for simpler layout and to avoid Grid typing issues) */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {/* Surveyors Report */}
        <Box sx={{ flex: "1 1 320px", minWidth: 280 }}>
          <Card elevation={2}>
            <CardActionArea component={Link} href="/reports/surveyors">
              <CardContent>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Surveyors Details</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Export surveyor directory and details.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>

        {/* Attendance Report */}
        <Box sx={{ flex: "1 1 320px", minWidth: 280 }}>
          <Card elevation={2}>
            <CardActionArea component={Link} href="/reports/attendance">
              <CardContent>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Surveyors Attendance</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Export attendance CSV/PDF per surveyor and date range.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>

        {/* Bike Readings Report */}
        <Box sx={{ flex: "1 1 320px", minWidth: 280 }}>
          <Card elevation={2}>
            <CardActionArea component={Link} href="/reports/bike-readings">
              <CardContent>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <DirectionsBike />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Bike Meter Readings</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Export bike meter readings by surveyor and date range.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
