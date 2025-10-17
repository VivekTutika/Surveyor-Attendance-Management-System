'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false) // Default to false for security
  const { login, loading, error } = useAuth()

  // Load cached credentials and rememberMe setting on component mount
  useEffect(() => {
    const cachedRememberMe = localStorage.getItem('rememberMe')
    if (cachedRememberMe === 'true') {
      setRememberMe(true)
      
      // Only load credentials if rememberMe was enabled
      const cachedCredentials = localStorage.getItem('cachedCredentials')
      if (cachedCredentials) {
        const { employeeId: cachedEmployeeId, password: cachedPassword } = JSON.parse(cachedCredentials)
        setEmployeeId(cachedEmployeeId || '')
        setPassword(cachedPassword || '')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const id = employeeId.trim()
    
    // Save the rememberMe setting
    localStorage.setItem('rememberMe', rememberMe.toString())
    
    // Cache the credentials for next login if rememberMe is checked
    if (rememberMe) {
      localStorage.setItem('cachedCredentials', JSON.stringify({ employeeId: id, password }))
    } else {
      // Clear cached credentials if rememberMe is unchecked
      localStorage.removeItem('cachedCredentials')
    }
    
    await login(id, password)
  }

  const handleEmployeeIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeId(e.target.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setRememberMe(isChecked)
    
    // If unchecked, clear cached credentials
    if (!isChecked) {
      localStorage.removeItem('cachedCredentials')
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <AdminPanelSettings
              sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              SAMS Admin
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Surveyor Attendance Management System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Employee ID"
              type="text"
              value={employeeId}
              onChange={handleEmployeeIdChange}
              margin="normal"
              required
              autoComplete="username"
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              margin="normal"
              required
              autoComplete="current-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  color="primary"
                />
              }
              label="Remember Me"
              sx={{ mt: 1, mb: 1 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2, mb: 2 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Typography variant="caption" display="block" align="center" color="text.secondary">
            Please contact Development Team for credentials.
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}