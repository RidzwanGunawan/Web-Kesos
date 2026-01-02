import React from 'react'
import { Link } from 'react-router-dom'
import { DATA_TABLES, tableLabel } from '../config/tables'

export default function LandingPage() {
  const previewTables = DATA_TABLES.slice(0, 6)

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand">Web KESOS</div>
        <nav className="nav-actions">
          <a href="#fitur" className="ghost-link">Fitur</a>
          <a href="#insight" className="ghost-link">Insight</a>
          <a href="#alur" className="ghost-link">Alur</a>
          <Link to="/login" className="primary-btn">Masuk</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Sistem Kesejahteraan Sosial Terpadu</p>
          <h1>
            Kendalikan data, prioritas bantuan, dan laporan kelurahan
            <span className="accent"> secara real-time.</span>
          </h1>
          <p className="lead">
            Web KESOS menyatukan data pendidikan, sosial, keagamaan, dan infrastruktur menjadi dashboard
            yang mudah dipantau oleh kelurahan dan admin kota.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="primary-btn">Masuk Dashboard</Link>
            <a href="#alur" className="secondary-btn">Lihat Alur</a>
          </div>
          <div className="hero-metrics">
            <div>
              <h4>16+</h4>
              <span>Kategori Data</span>
            </div>
            <div>
              <h4>4</h4>
              <span>Kelurahan Prioritas</span>
            </div>
            <div>
              <h4>Realtime</h4>
              <span>Monitoring & Audit</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="glass-card hero-card">
            <div className="hero-card-header">
              <span className="dot dot-green" />
              <span className="dot dot-amber" />
              <span className="dot dot-blue" />
            </div>
            <h3>Snapshot Data Kelurahan</h3>
            <div className="hero-list">
              {previewTables.map((table) => (
                <div key={table} className="hero-list-item">
                  <span>{tableLabel(table)}</span>
                  <strong>{Math.floor(Math.random() * 120) + 40}</strong>
                </div>
              ))}
            </div>
            <div className="pulse-line" />
          </div>
          <div className="orbit-ring" />
        </div>
      </section>

      <section id="fitur" className="section feature-showcase">
        <div className="section-header">
          <p className="eyebrow">Fitur Utama</p>
          <h2>Dashboard cerdas, akses aman, dan data yang konsisten</h2>
        </div>
        <div className="feature-grid interactive">
          <div className="feature-card glass-card">
            <div className="feature-icon">📊</div>
            <h3>Monitoring Statistik</h3>
            <p>Ringkas data kelurahan per kategori dan pantau tren dengan grafik dinamis.</p>
            <div className="feature-chip">Realtime</div>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">🧭</div>
            <h3>Manajemen Data</h3>
            <p>CRUD data setiap kategori dengan validasi dan audit trail terintegrasi.</p>
            <div className="feature-chip">CRUD</div>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">🧾</div>
            <h3>Audit Log</h3>
            <p>Setiap perubahan tercatat: siapa, kapan, dan data apa yang diubah.</p>
            <div className="feature-chip">Traceable</div>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">🛡️</div>
            <h3>Role & Akses</h3>
            <p>Master admin memantau semua kelurahan, operator fokus pada wilayahnya.</p>
            <div className="feature-chip">RBAC</div>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">🏘️</div>
            <h3>Kelurahan Dinamis</h3>
            <p>Tambah kelurahan baru tanpa hardcode dan langsung terhubung ke operator.</p>
            <div className="feature-chip">Scalable</div>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">🧩</div>
            <h3>Role Manager</h3>
            <p>Atur permission dari panel admin untuk kontrol akses yang fleksibel.</p>
            <div className="feature-chip">Flexible</div>
          </div>
        </div>
      </section>

      <section id="insight" className="section insight">
        <div className="section-header">
          <p className="eyebrow">Insight Cepat</p>
          <h2>Panel data yang terasa hidup dan responsif</h2>
        </div>
        <div className="insight-grid">
          <div className="glass-card insight-card">
            <h4>Distribusi Bantuan</h4>
            <div className="bar-stack">
              <span style={{ width: '78%' }} />
              <span style={{ width: '52%' }} />
              <span style={{ width: '34%' }} />
            </div>
            <p>Perbandingan penyaluran bantuan sosial per RW.</p>
          </div>
          <div className="glass-card insight-card">
            <h4>Prioritas Kelurahan</h4>
            <ul>
              <li><strong>Cigadung</strong> - 12 isu aktif</li>
              <li><strong>Sukaluyu</strong> - 7 isu aktif</li>
              <li><strong>Cihaurgeulis</strong> - 5 isu aktif</li>
            </ul>
          </div>
          <div className="glass-card insight-card">
            <h4>Audit Ringkas</h4>
            <div className="timeline">
              <div><span>10:42</span> Data Bantuan Sosial diperbarui</div>
              <div><span>09:15</span> Operator Neglasari login</div>
              <div><span>08:57</span> Data Lansia diverifikasi</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section marquee">
        <div className="marquee-track">
          <span>Dashboard Statistik</span>
          <span>Data Bantuan Sosial</span>
          <span>Audit Trail</span>
          <span>Manajemen User</span>
          <span>Kelurahan Dinamis</span>
          <span>Role & Permission</span>
          <span>Validasi Data</span>
        </div>
      </section>

      <section className="section use-cases">
        <div className="section-header">
          <p className="eyebrow">Use Case</p>
          <h2>Digunakan untuk monitoring harian, laporan bulanan, dan intervensi cepat</h2>
        </div>
        <div className="use-grid">
          <div className="glass-card use-card">
            <h4>Posyandu & Lansia</h4>
            <p>Tracking layanan kesehatan dan kebutuhan lansia terlantar.</p>
            <div className="use-tag">Kesehatan</div>
          </div>
          <div className="glass-card use-card">
            <h4>Pendidikan</h4>
            <p>Monitoring PAUD/TK/sekolah untuk perencanaan bantuan.</p>
            <div className="use-tag">Pendidikan</div>
          </div>
          <div className="glass-card use-card">
            <h4>Bansos</h4>
            <p>Distribusi bantuan sosial berbasis data terverifikasi.</p>
            <div className="use-tag">Bantuan</div>
          </div>
          <div className="glass-card use-card">
            <h4>Keagamaan</h4>
            <p>Pelaporan kegiatan idul fitri/adha dan qurban.</p>
            <div className="use-tag">Keagamaan</div>
          </div>
        </div>
      </section>

      <section id="alur" className="section flow">
        <div className="section-header">
          <p className="eyebrow">Alur Kerja</p>
          <h2>Operasional end-to-end dalam satu platform</h2>
        </div>
        <div className="flow-grid">
          <div className="flow-step">
            <span>01</span>
            <h4>Login Aman</h4>
            <p>Autentikasi JWT dengan akses berbasis peran.</p>
          </div>
          <div className="flow-step">
            <span>02</span>
            <h4>Input & Validasi</h4>
            <p>Data masuk dari kelurahan, otomatis disaring sesuai wewenang.</p>
          </div>
          <div className="flow-step">
            <span>03</span>
            <h4>Dashboard & Insight</h4>
            <p>Visualisasi kategori data untuk keputusan cepat.</p>
          </div>
          <div className="flow-step">
            <span>04</span>
            <h4>Audit & Laporan</h4>
            <p>Riwayat perubahan siap untuk laporan dan supervisi.</p>
          </div>
        </div>
      </section>

      <section className="section security">
        <div className="section-header">
          <p className="eyebrow">Keamanan</p>
          <h2>Data sensitif dikelola dengan kontrol akses yang ketat</h2>
        </div>
        <div className="security-grid">
          <div className="glass-card security-card">
            <h4>JWT + RBAC</h4>
            <p>Autentikasi aman dengan role & permission yang bisa diatur.</p>
          </div>
          <div className="glass-card security-card">
            <h4>Audit Detail</h4>
            <p>Semua perubahan tercatat untuk kebutuhan akuntabilitas.</p>
          </div>
          <div className="glass-card security-card">
            <h4>Data Konsisten</h4>
            <p>Kelurahan terkontrol, menghindari duplikasi & typo data.</p>
          </div>
        </div>
      </section>

      <section className="section stat-band">
        <div className="stat-item">
          <h3>98%</h3>
          <p>Validasi data tepat waktu</p>
        </div>
        <div className="stat-item">
          <h3>24/7</h3>
          <p>Monitoring kinerja kelurahan</p>
        </div>
        <div className="stat-item">
          <h3>1.2K</h3>
          <p>Record per bulan terkelola</p>
        </div>
      </section>

      <section id="kontak" className="section cta">
        <div className="glass-card cta-card">
          <h2>Siap mengintegrasikan data kesejahteraan sosial?</h2>
          <p>Aktifkan dashboard dan mulai kelola data kelurahan secara terpadu hari ini.</p>
          <Link to="/login" className="primary-btn">Masuk Dashboard</Link>
        </div>
      </section>
    </div>
  )
}
