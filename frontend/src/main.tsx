import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import './styles/global.css'
import { setAuthToken } from './services/api'
import LoginPage from './pages/Login'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import LandingPage from './pages/Landing'
import DataManagement from './pages/DataManagement'
import HistoryPage from './pages/History'
import UsersPage from './pages/Users'
import KelurahanPage from './pages/Kelurahan'
import RolesPage from './pages/Roles'

const token = localStorage.getItem('token')
if (token) setAuthToken(token)

function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<RequireAuth><Layout><Dashboard/></Layout></RequireAuth>} />
          <Route path="/data" element={<RequireAuth><Layout><DataManagement/></Layout></RequireAuth>} />
          <Route path="/history" element={<RequireAuth><Layout><HistoryPage/></Layout></RequireAuth>} />
          <Route path="/kelurahan" element={<RequireAuth><Layout><KelurahanPage/></Layout></RequireAuth>} />
          <Route path="/roles" element={<RequireAuth><Layout><RolesPage/></Layout></RequireAuth>} />
          <Route path="/users" element={<RequireAuth><Layout><UsersPage/></Layout></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
