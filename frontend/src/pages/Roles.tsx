import React, { useEffect, useState } from 'react'
import { Badge, Button, Card, Checkbox, Container, Group, Loader, Modal, Table, Text, TextInput, Title } from '@mantine/core'
import api from '../services/api'

type PermissionItem = { id: number; name: string; label: string }
type RoleItem = { id: number; name: string; label: string; permissions: PermissionItem[] }

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [permissions, setPermissions] = useState<PermissionItem[]>([])
  const [opened, setOpened] = useState(false)
  const [editing, setEditing] = useState<RoleItem | null>(null)
  const [formValues, setFormValues] = useState({ name: '', label: '' })
  const [selectedPerms, setSelectedPerms] = useState<number[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      setLoading(true)
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/roles/permissions')
      ])
      setRoles(rolesRes.data.data || [])
      setPermissions(permsRes.data.data || [])
      setError('')
    } catch {
      setError('Tidak bisa memuat role & permission.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setFormValues({ name: '', label: '' })
    setSelectedPerms([])
    setOpened(true)
  }

  function openEdit(role: RoleItem) {
    setEditing(role)
    setFormValues({ name: role.name, label: role.label })
    setSelectedPerms(role.permissions.map((p) => p.id))
    setOpened(true)
  }

  async function save() {
    if (!formValues.name || !formValues.label) return
    try {
      setSaving(true)
      if (editing) {
        await api.put(`/roles/${editing.id}`, formValues)
        await api.put(`/roles/${editing.id}/permissions`, { permissions: selectedPerms })
      } else {
        const res = await api.post('/roles', formValues)
        const roleId = res.data.data.id
        await api.put(`/roles/${roleId}/permissions`, { permissions: selectedPerms })
      }
      setOpened(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function remove(role: RoleItem) {
    const ok = window.confirm(`Hapus role ${role.label}?`)
    if (!ok) return
    await api.delete(`/roles/${role.id}`)
    await load()
  }

  return (
    <Container fluid className="dashboard">
      <Group justify="space-between" align="center" mb="lg">
        <div>
          <Title order={2}>Role & Permission</Title>
          <Text c="dimmed">Atur akses fitur berdasarkan role pengguna.</Text>
        </div>
        <Button className="primary-btn" onClick={openCreate}>Tambah Role</Button>
      </Group>

      <Card className="glass-card table-card" p="lg">
        {error ? <Text c="red" mb="sm">{error}</Text> : null}
        <Table className="data-table" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Role</Table.Th>
              <Table.Th>Key</Table.Th>
              <Table.Th>Permission</Table.Th>
              <Table.Th>Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Group justify="center" py="xl">
                    <Loader color="teal" />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ) : roles.length ? (
              roles.map((role) => (
                <Table.Tr key={role.id}>
                  <Table.Td>{role.label}</Table.Td>
                  <Table.Td>
                    <Badge className="badge-soft" variant="light">{role.name}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {role.permissions.map((perm) => (
                        <Badge key={perm.id} className="badge-soft" variant="light">
                          {perm.label}
                        </Badge>
                      ))}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="xs" variant="light" className="action-btn" onClick={() => openEdit(role)}>Edit</Button>
                      <Button size="xs" color="red" variant="light" className="action-btn" onClick={() => remove(role)}>Hapus</Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>Belum ada role.</Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={opened} onClose={() => setOpened(false)} title={editing ? 'Edit Role' : 'Tambah Role'} centered>
        <div className="form-stack">
          <TextInput
            label="Nama Role (key)"
            value={formValues.name}
            onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))}
            disabled={!!editing}
          />
          <TextInput
            label="Label Role"
            value={formValues.label}
            onChange={(e) => setFormValues((prev) => ({ ...prev, label: e.target.value }))}
          />
          <div>
            <Text fw={500} mb="xs">Permission</Text>
            <div className="form-stack">
              {permissions.map((perm) => (
                <Checkbox
                  key={perm.id}
                  label={perm.label}
                  checked={selectedPerms.includes(perm.id)}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked
                    setSelectedPerms((prev) =>
                      checked ? [...prev, perm.id] : prev.filter((id) => id !== perm.id)
                    )
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setOpened(false)}>Batal</Button>
          <Button className="primary-btn" onClick={save} loading={saving}>Simpan</Button>
        </Group>
      </Modal>
    </Container>
  )
}
