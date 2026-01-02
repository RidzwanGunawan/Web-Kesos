import React, { useEffect, useState } from 'react'
import { Badge, Button, Card, Container, Group, Loader, Modal, Select, Table, Text, TextInput, Title } from '@mantine/core'
import api from '../services/api'

type UserItem = {
  id: number
  nama_lengkap: string
  username: string
  role: string
  kelurahan?: string | null
  createdAt: string
}

type RoleItem = {
  id: number
  name: string
  label: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [kelurahanOptions, setKelurahanOptions] = useState<string[]>([])
  const [error, setError] = useState('')
  const [opened, setOpened] = useState(false)
  const [editing, setEditing] = useState<UserItem | null>(null)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      setLoading(true)
      const [usersRes, rolesRes, kelRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles'),
        api.get('/kelurahan')
      ])
      setUsers(usersRes.data.data || [])
      setRoles(rolesRes.data.data || [])
      setKelurahanOptions(kelRes.data || [])
      setError('')
    } catch {
      setUsers([])
      setError('Akses ditolak atau data tidak tersedia.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setFormValues({})
    setOpened(true)
  }

  function openEdit(user: UserItem) {
    setEditing(user)
    setFormValues(user)
    setOpened(true)
  }

  async function save() {
    const payload = { ...formValues }
    if (payload.password === '') delete payload.password
    try {
      setSaving(true)
      if (editing?.id) {
        await api.put(`/users/${editing.id}`, payload)
      } else {
        await api.post('/users', payload)
      }
      setOpened(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container fluid className="dashboard">
      <Group justify="space-between" align="center" mb="lg">
        <div>
          <Title order={2}>Manajemen User</Title>
          <Text c="dimmed">Kelola akun admin dan operator kelurahan.</Text>
        </div>
        <Button className="primary-btn" onClick={openCreate}>Tambah User</Button>
      </Group>

      <Card className="glass-card table-card" p="lg">
        {error ? <Text c="red" mb="sm">{error}</Text> : null}
        <Table className="data-table" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nama</Table.Th>
              <Table.Th>Username</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Kelurahan</Table.Th>
              <Table.Th>Dibuat</Table.Th>
              <Table.Th>Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Group justify="center" py="xl">
                    <Loader color="teal" />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ) : users.length ? (
              users.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>{user.nama_lengkap}</Table.Td>
                  <Table.Td>{user.username}</Table.Td>
                  <Table.Td>
                    <Badge className="badge-soft" variant="light">
                      {user.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{user.kelurahan || '-'}</Table.Td>
                  <Table.Td>{new Date(user.createdAt).toLocaleDateString('id-ID')}</Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="light" className="action-btn" onClick={() => openEdit(user)}>Edit</Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>Belum ada user.</Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={opened} onClose={() => setOpened(false)} title={editing ? 'Edit User' : 'Tambah User'} centered>
        <div className="form-stack">
          <TextInput
            label="Nama Lengkap"
            value={formValues.nama_lengkap || ''}
            onChange={(e) => setFormValues((prev) => ({ ...prev, nama_lengkap: e.target.value }))}
          />
          <TextInput
            label="Username"
            value={formValues.username || ''}
            onChange={(e) => setFormValues((prev) => ({ ...prev, username: e.target.value }))}
          />
          <TextInput
            label="Password"
            type="password"
            value={formValues.password || ''}
            onChange={(e) => setFormValues((prev) => ({ ...prev, password: e.target.value }))}
          />
          <Select
            label="Role"
            data={roles.map((role) => ({ value: role.name, label: role.label }))}
            value={formValues.role || null}
            onChange={(value) => setFormValues((prev) => ({ ...prev, role: value }))}
          />
          {formValues.role === 'operator' ? (
            <Select
              label="Kelurahan"
              data={kelurahanOptions}
              value={formValues.kelurahan || null}
              onChange={(value) => setFormValues((prev) => ({ ...prev, kelurahan: value }))}
            />
          ) : null}
        </div>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setOpened(false)}>Batal</Button>
          <Button className="primary-btn" onClick={save} loading={saving}>Simpan</Button>
        </Group>
      </Modal>
    </Container>
  )
}
