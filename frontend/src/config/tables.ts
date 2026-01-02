export const DATA_TABLES = [
  'data_paud',
  'data_tk',
  'data_sekolah',
  'data_slb',
  'data_masyarakat_miskin',
  'data_disabilitas',
  'data_pmks',
  'data_perpustakaan_rw',
  'data_bantuan_sosial',
  'laporan_sholat_idul_fitri',
  'laporan_sholat_idul_adha',
  'data_hewan_qurban',
  'data_penyaluran_zakat',
  'data_lansia_terlantar',
  'data_sarana_kesehatan',
  'data_tempat_ibadah'
];

export function tableLabel(table: string) {
  return table
    .replace(/^data_/, '')
    .replace(/^laporan_/, '')
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
