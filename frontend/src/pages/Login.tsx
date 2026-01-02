import React, { useState } from 'react'
import api, { setAuthToken } from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import { TextInput, PasswordInput, Paper, Title, Container, Button, Text, Stack } from '@mantine/core'

export default function LoginPage(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e: React.FormEvent){
    e.preventDefault()
    setMsg('')
    try{
      setLoading(true)
      const res = await api.post('/auth/login', { username, password })
      if(res.data.success){
        const token = res.data.token
        localStorage.setItem('token', token)
        setAuthToken(token)
        nav('/dashboard')
      } else {
        setMsg(res.data.message || 'Login failed')
      }
    }catch(err){
      setMsg('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-backdrop" />
      <Container size={420} my={80}>
        <Paper radius="md" p="xl" className="glass-card">
          <Title order={2} ta="center" mb="md">Masuk ke Web KESOS</Title>
          <Text c="dimmed" ta="center" mb="lg">
            Sistem terintegrasi untuk pemantauan kesejahteraan sosial tingkat kelurahan.
          </Text>
          <form onSubmit={submit}>
            <Stack>
            <TextInput label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {msg ? <Text c="red">{msg}</Text> : null}
            <Button type="submit" className="primary-btn" loading={loading}>Login</Button>
            <Text size="sm" ta="center" c="dimmed">
              Kembali ke <Link to="/" className="text-link">Beranda</Link>
            </Text>
            </Stack>
          </form>
        </Paper>
      </Container>
    </div>
  )
}
