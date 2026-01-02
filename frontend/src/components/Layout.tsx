import React, { useEffect, useState } from 'react'
import { AppShell, Text, Group, Button, Badge } from '@mantine/core'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import api, { setAuthToken } from '../services/api'

export default function Layout({ children }: { children: React.ReactNode }){
  const nav = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<{ nama?: string; role?: string; permissions?: string[] } | null>(null)

  useEffect(() => {
    api.get('/users/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
  }, [])

  function logout() {
    localStorage.removeItem('token')
    setAuthToken(null)
    nav('/login')
  }

  const links = [
    { to: '/dashboard', label: 'Dashboard', perms: ['dashboard.view'] },
    { to: '/data', label: 'Manajemen Data', perms: ['data.read'] },
    { to: '/kelurahan', label: 'Kelurahan', perms: ['kelurahan.manage'] },
    { to: '/roles', label: 'Role & Permission', perms: ['roles.manage'] },
    { to: '/users', label: 'Manajemen User', perms: ['users.manage'] },
    { to: '/history', label: 'Audit Log', perms: ['logs.view'] }
  ]

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{ width: 250 }}
    >
      <AppShell.Header p="xs">
        <Group justify="space-between" align="center" h="100%">
          <Group gap="sm">
            <Text fw={700}>Web KESOS</Text>
            <Badge variant="light" color="teal">Admin Panel</Badge>
          </Group>
          <Group gap="sm">
            <Text size="sm" c="dimmed">{user?.nama || 'Pengguna'}</Text>
            <Button variant="outline" color="red" className="logout-btn" onClick={logout}>
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="xs">
        <Text fw={600} mb="sm">Navigation</Text>
        <div className="nav-list">
          {links
            .filter((link) => !link.perms || link.perms.some((perm) => user?.permissions?.includes(perm)))
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
        </div>
      </AppShell.Navbar>
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
