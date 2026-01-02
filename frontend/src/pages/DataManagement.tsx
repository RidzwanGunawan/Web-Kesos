import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Container, Group, Loader, Modal, NumberInput, Select, Table, Text, Textarea, TextInput, Title } from '@mantine/core'
import api from '../services/api'
import { DATA_TABLES, tableLabel } from '../config/tables'

type ColumnMeta = { name: string; type: string }

export default function DataManagement() {
  const [table, setTable] = useState<string | null>(DATA_TABLES[0])
  const [columns, setColumns] = useState<ColumnMeta[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [kelurahanOptions, setKelurahanOptions] = useState<string[]>([])
  const [userKelurahan, setUserKelurahan] = useState<string | null>(null)
  const [opened, setOpened] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  const tableOptions = useMemo(
    () => DATA_TABLES.map((value) => ({ value, label: tableLabel(value) })),
    []
  )

  useEffect(() => {
    api.get('/users/me')
      .then((res) => setUserKelurahan(res.data.kelurahan || null))
      .catch(() => setUserKelurahan(null))

    api.get('/kelurahan')
      .then((res) => setKelurahanOptions(res.data || []))
      .catch(() => setKelurahanOptions([]))
  }, [])

  useEffect(() => {
    if (!table) return
    setLoading(true)
    Promise.all([
      api.get(`/data/${table}/meta`),
      api.get(`/data/${table}`)
    ])
      .then(([metaRes, dataRes]) => {
        setColumns(metaRes.data.columns || [])
        setRows(dataRes.data.data || [])
      })
      .catch(() => {
        setColumns([])
        setRows([])
      })
      .finally(() => setLoading(false))
  }, [table])

  function openCreate() {
    setEditing(null)
    setFormValues(userKelurahan ? { kelurahan: userKelurahan } : {})
    setOpened(true)
  }

  function openEdit(row: any) {
    setEditing(row)
    setFormValues(row)
    setOpened(true)
  }

  function handleChange(key: string, value: any) {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    if (!table) return
    try {
      setSaving(true)
      if (editing?.id) {
        await api.put(`/data/${table}/${editing.id}`, formValues)
      } else {
        await api.post(`/data/${table}`, formValues)
      }
      setOpened(false)
      const refreshed = await api.get(`/data/${table}`)
      setRows(refreshed.data.data || [])
    } finally {
      setSaving(false)
    }
  }

  async function remove(row: any) {
    if (!table) return
    const ok = window.confirm(`Hapus data ${row.nama || row.id}?`)
    if (!ok) return
    await api.delete(`/data/${table}/${row.id}`)
    const refreshed = await api.get(`/data/${table}`)
    setRows(refreshed.data.data || [])
  }

  const editableColumns = columns.filter((col) => col.name !== 'id')

  return (
    <Container fluid className="dashboard">
      <Group justify="space-between" align="center" mb="lg">
        <div>
          <Title order={2}>Manajemen Data</Title>
          <Text c="dimmed">Kelola data berdasarkan kategori dan kelurahan.</Text>
        </div>
        <Group>
          <Select
            data={tableOptions}
            value={table}
            onChange={setTable}
            placeholder="Pilih kategori"
          />
          <Button className="primary-btn" onClick={openCreate}>Tambah Data</Button>
        </Group>
      </Group>

      <Card className="glass-card table-card" p="lg">
        <Group justify="space-between" align="center" mb="md">
          <Title order={4}>{table ? tableLabel(table) : 'Pilih kategori'}</Title>
          {loading ? <Text c="dimmed">Memuat data...</Text> : null}
        </Group>
        <Table className="data-table" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.name}>{col.name}</Table.Th>
              ))}
              <Table.Th>Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length + 1}>
                  <Group justify="center" py="xl">
                    <Loader color="teal" />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ) : rows.length ? (
              rows.map((row) => (
                <Table.Tr key={row.id}>
                  {columns.map((col) => (
                    <Table.Td key={col.name}>{String(row[col.name] ?? '')}</Table.Td>
                  ))}
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="xs" variant="light" className="action-btn" onClick={() => openEdit(row)}>Edit</Button>
                      <Button size="xs" color="red" variant="light" className="action-btn" onClick={() => remove(row)}>Hapus</Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={columns.length + 1}>
                  {loading ? 'Memuat data...' : 'Belum ada data.'}
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={opened} onClose={() => setOpened(false)} title={editing ? 'Edit Data' : 'Tambah Data'} centered>
        <div className="form-stack">
          {editableColumns.map((col) => {
            const value = formValues[col.name] ?? ''
            if (col.name === 'keterangan') {
              return (
                <Textarea
                  key={col.name}
                  label={col.name}
                  value={value}
                  onChange={(e) => handleChange(col.name, e.target.value)}
                />
              )
            }
            if (col.type.includes('int')) {
              return (
                <NumberInput
                  key={col.name}
                  label={col.name}
                  value={value === '' ? undefined : Number(value)}
                  onChange={(val) => handleChange(col.name, val)}
                />
              )
            }
            if (col.name === 'kelurahan') {
              return (
                <Select
                  key={col.name}
                  label={col.name}
                  data={userKelurahan ? [userKelurahan] : kelurahanOptions}
                  value={userKelurahan || value || null}
                  onChange={(val) => handleChange(col.name, val)}
                  disabled={!!userKelurahan}
                />
              )
            }
            return (
              <TextInput
                key={col.name}
                label={col.name}
                value={value}
                onChange={(e) => handleChange(col.name, e.target.value)}
              />
            )
          })}
        </div>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setOpened(false)}>Batal</Button>
          <Button className="primary-btn" onClick={save} loading={saving}>Simpan</Button>
        </Group>
      </Modal>
    </Container>
  )
}
