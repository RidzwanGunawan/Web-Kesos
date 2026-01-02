import React, { useEffect, useMemo, useState } from 'react'
import { Card, Container, Grid, Group, Loader, Select, Table, Text, Title } from '@mantine/core'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import api from '../services/api'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

type StatItem = { kategori: string; total: number }

export default function Dashboard() {
  const [stats, setStats] = useState<StatItem[]>([])
  const [kelurahan, setKelurahan] = useState<string | null>(null)
  const [kelurahanOptions, setKelurahanOptions] = useState<string[]>([])
  const [userKelurahan, setUserKelurahan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/users/me')
      .then((res) => setUserKelurahan(res.data.kelurahan || null))
      .catch(() => setUserKelurahan(null))

    api.get('/kelurahan')
      .then((res) => setKelurahanOptions(res.data || []))
      .catch(() => setKelurahanOptions([]))
  }, [])

  useEffect(() => {
    const activeKelurahan = userKelurahan || kelurahan
    const params = activeKelurahan ? { params: { kelurahan: activeKelurahan } } : undefined
    setLoading(true)
    api.get('/stats', params)
      .then((res) => setStats(res.data || []))
      .catch(() => setStats([]))
      .finally(() => setLoading(false))
  }, [kelurahan, userKelurahan])

  const totals = useMemo(() => {
    const total = stats.reduce((acc, item) => acc + (item.total || 0), 0)
    const top = [...stats].sort((a, b) => b.total - a.total).slice(0, 5)
    return { total, top }
  }, [stats])

  const chartData = useMemo(() => {
    return {
      labels: stats.map((s) => s.kategori),
      datasets: [
        {
          label: 'Jumlah Data',
          data: stats.map((s) => s.total),
          backgroundColor: 'rgba(32, 211, 194, 0.8)'
        }
      ]
    }
  }, [stats])

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: '#9bb0c8' },
          grid: { color: 'rgba(61, 79, 104, 0.3)' }
        },
        y: {
          ticks: { color: '#9bb0c8' },
          grid: { color: 'rgba(61, 79, 104, 0.3)' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#eaf2ff' }
        }
      }
    }
  }, [])

  return (
    <Container fluid className="dashboard">
      <Group justify="space-between" align="center" mb="lg">
        <div>
          <Title order={2}>Dashboard</Title>
          <Text c="dimmed">Ringkasan data kesejahteraan sosial per kelurahan.</Text>
        </div>
        {loading ? <Loader size="sm" color="teal" /> : null}
        <Select
          data={kelurahanOptions}
          placeholder="Filter kelurahan"
          value={userKelurahan || kelurahan}
          onChange={setKelurahan}
          clearable={!userKelurahan}
          disabled={!!userKelurahan}
        />
      </Group>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card className="glass-card" p="lg">
            <Text size="sm" c="dimmed">Total Data</Text>
            <Title order={2}>{totals.total}</Title>
            <Text size="sm" c="dimmed">Akumulasi dari semua kategori</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card className="glass-card" p="lg">
            <Text size="sm" c="dimmed">Kelurahan Aktif</Text>
            <Title order={2}>{kelurahanOptions.length}</Title>
            <Text size="sm" c="dimmed">Data siap dipantau</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card className="glass-card" p="lg">
            <Text size="sm" c="dimmed">Kategori Teratas</Text>
            <Title order={2}>{totals.top[0]?.kategori || 'Belum ada'}</Title>
            <Text size="sm" c="dimmed">Kategori dengan data terbanyak</Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid gutter="lg" mt="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card className="glass-card" p="lg">
            <Group justify="space-between" align="center" mb="md">
              <Title order={4}>Distribusi Data</Title>
              <Text size="sm" c="dimmed">Kategori per kelurahan</Text>
            </Group>
            <div style={{ height: 320, display: 'grid', placeItems: 'center' }}>
              {loading ? <Loader color="teal" /> : <Bar data={chartData} options={chartOptions} />}
            </div>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card className="glass-card" p="lg">
            <Title order={4} mb="md">Top Kategori</Title>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Kategori</Table.Th>
                  <Table.Th>Jumlah</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {totals.top.length ? (
                  totals.top.map((item) => (
                    <Table.Tr key={item.kategori}>
                      <Table.Td>{item.kategori}</Table.Td>
                      <Table.Td>{item.total}</Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={2}>Belum ada data</Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
