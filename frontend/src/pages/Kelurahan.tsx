import React, { useEffect, useState } from 'react'
import { Button, Card, Container, Group, Loader, Modal, Table, Text, TextInput, Title } from '@mantine/core'
import api from '../services/api'

type KelurahanItem = { id: number; nama_kelurahan: string }

export default function KelurahanPage() {
  const [items, setItems] = useState<KelurahanItem[]>([])
  const [opened, setOpened] = useState(false)
  const [editing, setEditing] = useState<KelurahanItem | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      setLoading(true)
      const res = await api.get('/kelurahan/manage')
      setItems(res.data.data || [])
      setError('')
    } catch (err: any) {
      setItems([])
      setError('Tidak bisa memuat data kelurahan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setName('')
    setOpened(true)
  }

  function openEdit(item: KelurahanItem) {
    setEditing(item)
    setName(item.nama_kelurahan)
    setOpened(true)
  }

  async function save() {
    if (!name.trim()) return
    try {
      setSaving(true)
      if (editing) {
        await api.put(`/kelurahan/${editing.id}`, { nama_kelurahan: name.trim() })
      } else {
        await api.post('/kelurahan', { nama_kelurahan: name.trim() })
      }
      setOpened(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function remove(item: KelurahanItem) {
    const ok = window.confirm(`Hapus kelurahan ${item.nama_kelurahan}?`)
    if (!ok) return
    await api.delete(`/kelurahan/${item.id}`)
    await load()
  }

  return (
    <Container fluid className="dashboard">
      <Group justify="space-between" align="center" mb="lg">
        <div>
          <Title order={2}>Kelurahan</Title>
          <Text c="dimmed">Kelola daftar kelurahan untuk akses operator.</Text>
        </div>
        <Button className="primary-btn" onClick={openCreate}>Tambah Kelurahan</Button>
      </Group>

      <Card className="glass-card table-card" p="lg">
        {error ? <Text c="red" mb="sm">{error}</Text> : null}
        <Table className="data-table" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nama Kelurahan</Table.Th>
              <Table.Th>Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Group justify="center" py="xl">
                    <Loader color="teal" />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ) : items.length ? (
              items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.nama_kelurahan}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="xs" variant="light" className="action-btn" onClick={() => openEdit(item)}>Edit</Button>
                      <Button size="xs" color="red" variant="light" className="action-btn" onClick={() => remove(item)}>Hapus</Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={2}>Belum ada kelurahan.</Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={opened} onClose={() => setOpened(false)} title={editing ? 'Edit Kelurahan' : 'Tambah Kelurahan'} centered>
        <div className="form-stack">
          <TextInput
            label="Nama Kelurahan"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setOpened(false)}>Batal</Button>
          <Button className="primary-btn" onClick={save} loading={saving}>Simpan</Button>
        </Group>
      </Modal>
    </Container>
  )
}
