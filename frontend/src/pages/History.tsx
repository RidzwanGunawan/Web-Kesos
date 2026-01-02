import React, { useEffect, useState } from 'react'
import { Badge, Card, Container, Group, Loader, Table, Text, Title } from '@mantine/core'
import api from '../services/api'

type LogItem = {
  id: number
  waktu: string
  username_pengguna: string
  aksi: string
  nama_tabel: string
  id_data: number
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/logs')
      .then((res) => setLogs(res.data.data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Container fluid className="dashboard">
      <Group justify="space-between" align="center" mb="lg">
        <div>
          <Title order={2}>Audit Log</Title>
          <Text c="dimmed">Riwayat perubahan data untuk kebutuhan monitoring.</Text>
        </div>
      </Group>

      <Card className="glass-card table-card" p="lg">
        <Table className="data-table" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Waktu</Table.Th>
              <Table.Th>Pengguna</Table.Th>
              <Table.Th>Aksi</Table.Th>
              <Table.Th>Tabel</Table.Th>
              <Table.Th>ID Data</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Group justify="center" py="xl">
                    <Loader color="teal" />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ) : logs.length ? (
              logs.map((log) => (
                <Table.Tr key={log.id}>
                  <Table.Td>{new Date(log.waktu).toLocaleString('id-ID')}</Table.Td>
                  <Table.Td>{log.username_pengguna}</Table.Td>
                  <Table.Td>
                    <Badge className="badge-soft" variant="light">
                      {log.aksi}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{log.nama_tabel}</Table.Td>
                  <Table.Td>{log.id_data}</Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>Belum ada log aktivitas.</Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>
    </Container>
  )
}
