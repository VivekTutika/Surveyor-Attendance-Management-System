"use client"

import React, { useState } from "react"
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Assignment,
  DirectionsBike,
  Assessment,
  AccountCircle,
  Logout,
  AdminPanelSettings,
} from "@mui/icons-material"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

const drawerWidth = 240
const collapsedWidth = 64

interface AdminLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { text: "Surveyors", icon: <People />, path: "/surveyors" },
  { text: "Attendance", icon: <Assignment />, path: "/attendance" },
  { text: "Bike Readings", icon: <DirectionsBike />, path: "/bike-readings" },
  { text: "Reports", icon: <Assessment />, path: "/reports" },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget)
  const handleProfileMenuClose = () => setAnchorEl(null)
  const handleLogout = () => {
    handleProfileMenuClose()
    logout()
  }
  const handleNavigation = (path: string) => {
    router.push(path)
    if (isMobile) setMobileOpen(false)
  }

  const drawerContent = (
    <Box sx={{ width: hovered ? drawerWidth : collapsedWidth }}>
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AdminPanelSettings color="primary" />
          {hovered && (
            <Typography variant="h6" noWrap component="div" color="primary">
              SAMS Admin
            </Typography>
          )}
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "rgba(25,118,210,0.08)",
                  "&:hover": { backgroundColor: "rgba(25,118,210,0.12)" },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === item.path ? "primary.main" : "inherit",
                  minWidth: 0,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {hovered && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    "& .MuiTypography-root": {
                      fontWeight: pathname === item.path ? 600 : 400,
                      color:
                        pathname === item.path ? "primary.main" : "inherit",
                    },
                    ml: 2,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: "flex" }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${collapsedWidth}px)` },
          ml: { md: `${collapsedWidth}px` },
        }}
      >
        <Toolbar>
          {/* Hamburger for mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page Title */}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => item.path === pathname)?.text ||
              "Admin Portal"}
          </Typography>

          {/* User Avatar & Menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Welcome, {user?.name}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        keepMounted
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Sidebar Drawer */}
      <Box component="nav" aria-label="admin sidebar">
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer (expand on hover) — overlaying so main content is full width */}
        <Drawer
          variant="permanent"
          open
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': (theme) => ({
              boxSizing: 'border-box',
              width: hovered ? drawerWidth : collapsedWidth,
              transition: 'width 200ms',
              overflowX: 'hidden',
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              zIndex: theme.zIndex.drawer + 2,
              backgroundColor: theme.palette.background.paper,
            }),
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${collapsedWidth}px)` },
          ml: { md: `${collapsedWidth}px` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          position: 'relative',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
