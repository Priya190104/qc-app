'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { apiClient } from '@/lib/api';

const STAGES_ORDER = [
  'DI_OPERATOR_DATA_UKUR',
  'DI_PETUGAS_UKUR',
  'DI_OPERATOR_DATA_PEMETAAN',
  'DI_PETUGAS_PEMETAAN',
  'PEMILIHAN_KKS',
  'DI_KKS',
  'REVISI_KKS',
  'DI_KEPALA_SEKSI',
  'REVISI_KASI',
  'SELESAI',
  'DITUTUP',
];

interface EditBerkasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  berkas: {
    id: string;
    nomor: string;
    status?: string;
    kegiatan?: string;
    tanggalBerkas?: string;
    tahunBerkas?: number;
    namaPemohon?: string;
    kecamatan?: string;
    desa?: string;
    namaProsedur?: string;
    luasPendaftaran?: number;
    di302?: string;
    di305?: string;
    deskripsi?: string;
    // Workflow fields
    noSTP?: string;
    tglSTP?: string;
    noSHATNIBEL?: string;
    luasHasilUkur?: number;
    nib?: string;
    nibel?: string;
    jumlahBidang?: number;
    noSU?: string;
  };
}

interface KecamatanOption {
  id: string;
  nama: string;
}

interface DesaOption {
  id: string;
  nama: string;
  kecamatanId: string;
}

interface ProsedurOption {
  id: string;
  nama: string;
}

interface KegiatanOption {
  id: string;
  nama: string;
}

const kegiatanData: KegiatanOption[] = [
  { id: '1', nama: 'Rutin' },
  { id: '2', nama: 'BMD' },
  { id: '3', nama: 'BMN' },
  { id: '4', nama: 'Redistribusi Tanah' },
  { id: '5', nama: 'Konsolidasi Tanah' },
  { id: '6', nama: 'Lintor' },
  { id: '7', nama: 'Wakaf' },
];

const prosedurData: ProsedurOption[] = [
  { id: '1', nama: 'Pengukuran dan Pemetaan Kadastral' },
  { id: '2', nama: 'Pemecahan' },
  { id: '3', nama: 'Penggabungan' },
  { id: '4', nama: 'Pemisahan' },
  { id: '5', nama: 'Penataan Batas' },
  { id: '6', nama: 'Pengembalian Batas' },
];

const kecamatanData: KecamatanOption[] = [
  { id: '1', nama: 'Adipala' },
  { id: '2', nama: 'Bantarsari' },
  { id: '3', nama: 'Binangun' },
  { id: '4', nama: 'Cilacap Selatan' },
  { id: '5', nama: 'Cilacap Tengah' },
  { id: '6', nama: 'Cilacap Utara' },
  { id: '7', nama: 'Cimanggu' },
  { id: '8', nama: 'Cipari' },
  { id: '9', nama: 'Dayeuhluhur' },
  { id: '10', nama: 'Gandrungmangu' },
  { id: '11', nama: 'Jeruklegi' },
  { id: '12', nama: 'Kampung Laut' },
  { id: '13', nama: 'Karangpucung' },
  { id: '14', nama: 'Kawunganten' },
  { id: '15', nama: 'Kedungreja' },
  { id: '16', nama: 'Kesugihan' },
  { id: '17', nama: 'Kroya' },
  { id: '18', nama: 'Majenang' },
  { id: '19', nama: 'Maos' },
  { id: '20', nama: 'Nusawungu' },
  { id: '21', nama: 'Patimuan' },
  { id: '22', nama: 'Sampang' },
  { id: '23', nama: 'Sidareja' },
  { id: '24', nama: 'Wanareja' },
];

const desaData: DesaOption[] = [
  // Adipala
  { id: '1', nama: 'Adipala', kecamatanId: '1' },
  { id: '2', nama: 'Adiraja', kecamatanId: '1' },
  { id: '3', nama: 'Adireja Kulon', kecamatanId: '1' },
  { id: '4', nama: 'Adireja Wetan', kecamatanId: '1' },
  { id: '5', nama: 'Bunton', kecamatanId: '1' },
  { id: '6', nama: 'Doplang', kecamatanId: '1' },
  { id: '7', nama: 'Glempangpasir', kecamatanId: '1' },
  { id: '8', nama: 'Gombolharjo', kecamatanId: '1' },
  { id: '9', nama: 'Kalikudi', kecamatanId: '1' },
  { id: '10', nama: 'Karanganyar', kecamatanId: '1' },
  { id: '11', nama: 'Karangbenda', kecamatanId: '1' },
  { id: '12', nama: 'Karangsari', kecamatanId: '1' },
  { id: '13', nama: 'Pedasong', kecamatanId: '1' },
  { id: '14', nama: 'Penggalang', kecamatanId: '1' },
  { id: '15', nama: 'Welahan Wetan', kecamatanId: '1' },
  { id: '16', nama: 'Wlahar', kecamatanId: '1' },
  // Bantarsari
  { id: '17', nama: 'Bantarsari', kecamatanId: '2' },
  { id: '18', nama: 'Binangun', kecamatanId: '2' },
  { id: '19', nama: 'Bulaksari', kecamatanId: '2' },
  { id: '20', nama: 'Cikedondong', kecamatanId: '2' },
  { id: '21', nama: 'Citembong', kecamatanId: '2' },
  { id: '22', nama: 'Kamulyan', kecamatanId: '2' },
  { id: '23', nama: 'Kedungwadas', kecamatanId: '2' },
  { id: '24', nama: 'Rawajaya', kecamatanId: '2' },
  // Binangun
  { id: '25', nama: 'Alangamba', kecamatanId: '3' },
  { id: '26', nama: 'Bangkal', kecamatanId: '3' },
  { id: '27', nama: 'Binangun', kecamatanId: '3' },
  { id: '28', nama: 'Jati', kecamatanId: '3' },
  { id: '29', nama: 'Jepara Kulon', kecamatanId: '3' },
  { id: '30', nama: 'Jepara Wetan', kecamatanId: '3' },
  { id: '31', nama: 'Karangnangka', kecamatanId: '3' },
  { id: '32', nama: 'Kemojing', kecamatanId: '3' },
  { id: '33', nama: 'Kepudang', kecamatanId: '3' },
  { id: '34', nama: 'Pagubugan', kecamatanId: '3' },
  { id: '35', nama: 'Pagubugan Kulon', kecamatanId: '3' },
  { id: '36', nama: 'Pasuruhan', kecamatanId: '3' },
  { id: '37', nama: 'Pesawahan', kecamatanId: '3' },
  { id: '38', nama: 'Sidaurip', kecamatanId: '3' },
  { id: '39', nama: 'Sidayu', kecamatanId: '3' },
  { id: '40', nama: 'Widarapayung Kulon', kecamatanId: '3' },
  { id: '41', nama: 'Widarapayung Wetan', kecamatanId: '3' },
  // Cilacap Selatan
  { id: '42', nama: 'Cilacap', kecamatanId: '4' },
  { id: '43', nama: 'Sidakaya', kecamatanId: '4' },
  { id: '44', nama: 'Tambakreja', kecamatanId: '4' },
  { id: '45', nama: 'Tegalkamulyan', kecamatanId: '4' },
  { id: '46', nama: 'Tegalreja', kecamatanId: '4' },
  // Cilacap Tengah
  { id: '47', nama: 'Donan', kecamatanId: '5' },
  { id: '48', nama: 'Gunungsimping', kecamatanId: '5' },
  { id: '49', nama: 'Kutawaru', kecamatanId: '5' },
  { id: '50', nama: 'Lomanis', kecamatanId: '5' },
  { id: '51', nama: 'Sidanegara', kecamatanId: '5' },
  // Cilacap Utara
  { id: '52', nama: 'Gumilir', kecamatanId: '6' },
  { id: '53', nama: 'Karangtalun', kecamatanId: '6' },
  { id: '54', nama: 'Kebonmanis', kecamatanId: '6' },
  { id: '55', nama: 'Mertasinga', kecamatanId: '6' },
  { id: '56', nama: 'Tritih Kulon', kecamatanId: '6' },
  // Cimanggu
  { id: '57', nama: 'Bantarmangu', kecamatanId: '7' },
  { id: '58', nama: 'Bantarpanjang', kecamatanId: '7' },
  { id: '59', nama: 'Cibalung', kecamatanId: '7' },
  { id: '60', nama: 'Cijati', kecamatanId: '7' },
  { id: '61', nama: 'Cilempuyang', kecamatanId: '7' },
  { id: '62', nama: 'Cimanggu', kecamatanId: '7' },
  { id: '63', nama: 'Cisalak', kecamatanId: '7' },
  { id: '64', nama: 'Karangreja', kecamatanId: '7' },
  { id: '65', nama: 'Karangsari', kecamatanId: '7' },
  { id: '66', nama: 'Kutabima', kecamatanId: '7' },
  { id: '67', nama: 'Mandala', kecamatanId: '7' },
  { id: '68', nama: 'Negarajati', kecamatanId: '7' },
  { id: '69', nama: 'Panimbang', kecamatanId: '7' },
  { id: '70', nama: 'Pesahangan', kecamatanId: '7' },
  { id: '71', nama: 'Rejodadi', kecamatanId: '7' },
  // Cipari
  { id: '72', nama: 'Caruy', kecamatanId: '8' },
  { id: '73', nama: 'Cipari', kecamatanId: '8' },
  { id: '74', nama: 'Cisuru', kecamatanId: '8' },
  { id: '75', nama: 'Karangreja', kecamatanId: '8' },
  { id: '76', nama: 'Kutasari', kecamatanId: '8' },
  { id: '77', nama: 'Mekarsari', kecamatanId: '8' },
  { id: '78', nama: 'Mulyadadi', kecamatanId: '8' },
  { id: '79', nama: 'Pegadingan', kecamatanId: '8' },
  { id: '80', nama: 'Segaralangu', kecamatanId: '8' },
  { id: '81', nama: 'Serang', kecamatanId: '8' },
  { id: '82', nama: 'Sidasari', kecamatanId: '8' },
  // Dayeuhluhur
  { id: '83', nama: 'Bingkeng', kecamatanId: '9' },
  { id: '84', nama: 'Bolang', kecamatanId: '9' },
  { id: '85', nama: 'Cijeruk', kecamatanId: '9' },
  { id: '86', nama: 'Cilumping', kecamatanId: '9' },
  { id: '87', nama: 'Ciwalen', kecamatanId: '9' },
  { id: '88', nama: 'Datar', kecamatanId: '9' },
  { id: '89', nama: 'Dayeuhluhur', kecamatanId: '9' },
  { id: '90', nama: 'Hanum', kecamatanId: '9' },
  { id: '91', nama: 'Kutaagung', kecamatanId: '9' },
  { id: '92', nama: 'Matenggeng', kecamatanId: '9' },
  { id: '93', nama: 'Panulisan', kecamatanId: '9' },
  { id: '94', nama: 'Panulisan Barat', kecamatanId: '9' },
  { id: '95', nama: 'Panulisan Timur', kecamatanId: '9' },
  { id: '96', nama: 'Sumpinghayu', kecamatanId: '9' },
  // Gandrungmangu
  { id: '97', nama: 'Bulusari', kecamatanId: '10' },
  { id: '98', nama: 'Cinangsi', kecamatanId: '10' },
  { id: '99', nama: 'Cisumur', kecamatanId: '10' },
  { id: '100', nama: 'Gandrungmangu', kecamatanId: '10' },
  { id: '101', nama: 'Gandrungmanis', kecamatanId: '10' },
  { id: '102', nama: 'Gintungreja', kecamatanId: '10' },
  { id: '103', nama: 'Karanganyar', kecamatanId: '10' },
  { id: '104', nama: 'Karanggintung', kecamatanId: '10' },
  { id: '105', nama: 'Kertajaya', kecamatanId: '10' },
  { id: '106', nama: 'Layansari', kecamatanId: '10' },
  { id: '107', nama: 'Muktisari', kecamatanId: '10' },
  { id: '108', nama: 'Rungkang', kecamatanId: '10' },
  { id: '109', nama: 'Sidaurip', kecamatanId: '10' },
  { id: '110', nama: 'Wringinharjo', kecamatanId: '10' },
  // Jeruklegi
  { id: '111', nama: 'Babagan', kecamatanId: '11' },
  { id: '112', nama: 'Brebeg', kecamatanId: '11' },
  { id: '113', nama: 'Cilibang', kecamatanId: '11' },
  { id: '114', nama: 'Citepus', kecamatanId: '11' },
  { id: '115', nama: 'Jambusari', kecamatanId: '11' },
  { id: '116', nama: 'Jeruklegi Kulon', kecamatanId: '11' },
  { id: '117', nama: 'Jeruklegi Wetan', kecamatanId: '11' },
  { id: '118', nama: 'Karangkemiri', kecamatanId: '11' },
  { id: '119', nama: 'Mandala', kecamatanId: '11' },
  { id: '120', nama: 'Prapagan', kecamatanId: '11' },
  { id: '121', nama: 'Sawangan', kecamatanId: '11' },
  { id: '122', nama: 'Sumingkir', kecamatanId: '11' },
  { id: '123', nama: 'Tritih Lor', kecamatanId: '11' },
  { id: '124', nama: 'Tritih Wetan', kecamatanId: '11' },
  // Kampung Laut
  { id: '125', nama: 'Klaces', kecamatanId: '12' },
  { id: '126', nama: 'Panikel', kecamatanId: '12' },
  { id: '127', nama: 'Ujungalang', kecamatanId: '12' },
  { id: '128', nama: 'Ujunggagak', kecamatanId: '12' },
  // Karangpucung
  { id: '129', nama: 'Babakan', kecamatanId: '13' },
  { id: '130', nama: 'Bengbulang', kecamatanId: '13' },
  { id: '131', nama: 'Cidadap', kecamatanId: '13' },
  { id: '132', nama: 'Ciporos', kecamatanId: '13' },
  { id: '133', nama: 'Ciruyung', kecamatanId: '13' },
  { id: '134', nama: 'Gunungtelu', kecamatanId: '13' },
  { id: '135', nama: 'Karangpucung', kecamatanId: '13' },
  { id: '136', nama: 'Karangsari', kecamatanId: '13' },
  { id: '137', nama: 'Pamulihan', kecamatanId: '13' },
  { id: '138', nama: 'Pengawaren', kecamatanId: '13' },
  { id: '139', nama: 'Pesuruhan', kecamatanId: '13' },
  { id: '140', nama: 'Sidamulya', kecamatanId: '13' },
  { id: '141', nama: 'Sindangbarang', kecamatanId: '13' },
  { id: '142', nama: 'Surusunda', kecamatanId: '13' },
  { id: '143', nama: 'Tayem', kecamatanId: '13' },
  { id: '144', nama: 'Tayem Timur', kecamatanId: '13' },
  // Kawunganten
  { id: '145', nama: 'Babakan', kecamatanId: '14' },
  { id: '146', nama: 'Bojong', kecamatanId: '14' },
  { id: '147', nama: 'Bringkeng', kecamatanId: '14' },
  { id: '148', nama: 'Grugu', kecamatanId: '14' },
  { id: '149', nama: 'Kalijeruk', kecamatanId: '14' },
  { id: '150', nama: 'Kawunganten', kecamatanId: '14' },
  { id: '151', nama: 'Kawunganten Kidul', kecamatanId: '14' },
  { id: '152', nama: 'Kawunganten Lor', kecamatanId: '14' },
  { id: '153', nama: 'Kubangkangkung', kecamatanId: '14' },
  { id: '154', nama: 'Mentasan', kecamatanId: '14' },
  { id: '155', nama: 'Sarwadadi', kecamatanId: '14' },
  { id: '156', nama: 'Sidaurip', kecamatanId: '14' },
  { id: '157', nama: 'Ujungmanik', kecamatanId: '14' },
  // Kedungreja
  { id: '158', nama: 'Bangunreja', kecamatanId: '15' },
  { id: '159', nama: 'Bojongsari', kecamatanId: '15' },
  { id: '160', nama: 'Bumireja', kecamatanId: '15' },
  { id: '161', nama: 'Ciklapa', kecamatanId: '15' },
  { id: '162', nama: 'Jatisari', kecamatanId: '15' },
  { id: '163', nama: 'Kaliwungu', kecamatanId: '15' },
  { id: '164', nama: 'Kedungreja', kecamatanId: '15' },
  { id: '165', nama: 'Rejamulya', kecamatanId: '15' },
  { id: '166', nama: 'Sidanegara', kecamatanId: '15' },
  { id: '167', nama: 'Tambakreja', kecamatanId: '15' },
  { id: '168', nama: 'Tambaksari', kecamatanId: '15' },
  // Kesugihan
  { id: '169', nama: 'Bulupayung', kecamatanId: '16' },
  { id: '170', nama: 'Ciwuni', kecamatanId: '16' },
  { id: '171', nama: 'Dondong', kecamatanId: '16' },
  { id: '172', nama: 'Jangrana', kecamatanId: '16' },
  { id: '173', nama: 'Kalisabuk', kecamatanId: '16' },
  { id: '174', nama: 'Karangjengkol', kecamatanId: '16' },
  { id: '175', nama: 'Karangkandri', kecamatanId: '16' },
  { id: '176', nama: 'Keleng', kecamatanId: '16' },
  { id: '177', nama: 'Kesugihan', kecamatanId: '16' },
  { id: '178', nama: 'Kesugihan Kidul', kecamatanId: '16' },
  { id: '179', nama: 'Kuripan', kecamatanId: '16' },
  { id: '180', nama: 'Kuripan Kidul', kecamatanId: '16' },
  { id: '181', nama: 'Menganti', kecamatanId: '16' },
  { id: '182', nama: 'Pesanggrahan', kecamatanId: '16' },
  { id: '183', nama: 'Planjan', kecamatanId: '16' },
  { id: '184', nama: 'Slarang', kecamatanId: '16' },
  // Kroya
  { id: '185', nama: 'Ayamalas', kecamatanId: '17' },
  { id: '186', nama: 'Bajing', kecamatanId: '17' },
  { id: '187', nama: 'Bajing Kulon', kecamatanId: '17' },
  { id: '188', nama: 'Buntu', kecamatanId: '17' },
  { id: '189', nama: 'Gentasari', kecamatanId: '17' },
  { id: '190', nama: 'Karangmangu', kecamatanId: '17' },
  { id: '191', nama: 'Karangturi', kecamatanId: '17' },
  { id: '192', nama: 'Kedawung', kecamatanId: '17' },
  { id: '193', nama: 'Kroya', kecamatanId: '17' },
  { id: '194', nama: 'Mergawati', kecamatanId: '17' },
  { id: '195', nama: 'Mujur', kecamatanId: '17' },
  { id: '196', nama: 'Mujur Lor', kecamatanId: '17' },
  { id: '197', nama: 'Pekuncen', kecamatanId: '17' },
  { id: '198', nama: 'Pesanggrahan', kecamatanId: '17' },
  { id: '199', nama: 'Pucung Kidul', kecamatanId: '17' },
  { id: '200', nama: 'Pucung Lor', kecamatanId: '17' },
  { id: '201', nama: 'Sikampuh', kecamatanId: '17' },
  // Majenang
  { id: '202', nama: 'Bener', kecamatanId: '18' },
  { id: '203', nama: 'Boja', kecamatanId: '18' },
  { id: '204', nama: 'Cibeunying', kecamatanId: '18' },
  { id: '205', nama: 'Cilopadang', kecamatanId: '18' },
  { id: '206', nama: 'Jenang', kecamatanId: '18' },
  { id: '207', nama: 'Mulyadadi', kecamatanId: '18' },
  { id: '208', nama: 'Mulyasari', kecamatanId: '18' },
  { id: '209', nama: 'Padangjaya', kecamatanId: '18' },
  { id: '210', nama: 'Padangsari', kecamatanId: '18' },
  { id: '211', nama: 'Pahonjean', kecamatanId: '18' },
  { id: '212', nama: 'Pengadegan', kecamatanId: '18' },
  { id: '213', nama: 'Sadabumi', kecamatanId: '18' },
  { id: '214', nama: 'Sadahayu', kecamatanId: '18' },
  { id: '215', nama: 'Salebu', kecamatanId: '18' },
  { id: '216', nama: 'Sepatnunggal', kecamatanId: '18' },
  { id: '217', nama: 'Sindangsari', kecamatanId: '18' },
  { id: '218', nama: 'Ujungbarang', kecamatanId: '18' },
  // Maos
  { id: '219', nama: 'Glempang', kecamatanId: '19' },
  { id: '220', nama: 'Kalijaran', kecamatanId: '19' },
  { id: '221', nama: 'Karangkemiri', kecamatanId: '19' },
  { id: '222', nama: 'Karangreja', kecamatanId: '19' },
  { id: '223', nama: 'Karangrena', kecamatanId: '19' },
  { id: '224', nama: 'Klapagada', kecamatanId: '19' },
  { id: '225', nama: 'Maos Kidul', kecamatanId: '19' },
  { id: '226', nama: 'Maos Lor', kecamatanId: '19' },
  { id: '227', nama: 'Mernek', kecamatanId: '19' },
  { id: '228', nama: 'Panisihan', kecamatanId: '19' },
  // Nusawungu
  { id: '229', nama: 'Banjareja', kecamatanId: '20' },
  { id: '230', nama: 'Banjarsari', kecamatanId: '20' },
  { id: '231', nama: 'Banjarwaru', kecamatanId: '20' },
  { id: '232', nama: 'Danasri', kecamatanId: '20' },
  { id: '233', nama: 'Danasri Kidul', kecamatanId: '20' },
  { id: '234', nama: 'Danasri Lor', kecamatanId: '20' },
  { id: '235', nama: 'Jetis', kecamatanId: '20' },
  { id: '236', nama: 'Karangpakis', kecamatanId: '20' },
  { id: '237', nama: 'Karangputat', kecamatanId: '20' },
  { id: '238', nama: 'Karangsembung', kecamatanId: '20' },
  { id: '239', nama: 'Karangtawang', kecamatanId: '20' },
  { id: '240', nama: 'Kedungbenda', kecamatanId: '20' },
  { id: '241', nama: 'Klumprit', kecamatanId: '20' },
  { id: '242', nama: 'Nusawangkal', kecamatanId: '20' },
  { id: '243', nama: 'Nusawungu', kecamatanId: '20' },
  { id: '244', nama: 'Purwodadi', kecamatanId: '20' },
  { id: '245', nama: 'Sikanco', kecamatanId: '20' },
  // Patimuan
  { id: '246', nama: 'Bulupayung', kecamatanId: '21' },
  { id: '247', nama: 'Cimrutu', kecamatanId: '21' },
  { id: '248', nama: 'Cinyawang', kecamatanId: '21' },
  { id: '249', nama: 'Patimuan', kecamatanId: '21' },
  { id: '250', nama: 'Purwadadi', kecamatanId: '21' },
  { id: '251', nama: 'Rawaapu', kecamatanId: '21' },
  { id: '252', nama: 'Sidamukti', kecamatanId: '21' },
  // Sampang
  { id: '253', nama: 'Brani', kecamatanId: '22' },
  { id: '254', nama: 'Karangasem', kecamatanId: '22' },
  { id: '255', nama: 'Karangjati', kecamatanId: '22' },
  { id: '256', nama: 'Karangtengah', kecamatanId: '22' },
  { id: '257', nama: 'Ketanggung', kecamatanId: '22' },
  { id: '258', nama: 'Nusajati', kecamatanId: '22' },
  { id: '259', nama: 'Paberasan', kecamatanId: '22' },
  { id: '260', nama: 'Paketingan', kecamatanId: '22' },
  { id: '261', nama: 'Sampang', kecamatanId: '22' },
  { id: '262', nama: 'Sidasari', kecamatanId: '22' },
  // Sidareja
  { id: '263', nama: 'Gunungreja', kecamatanId: '23' },
  { id: '264', nama: 'Karanggedang', kecamatanId: '23' },
  { id: '265', nama: 'Kunci', kecamatanId: '23' },
  { id: '266', nama: 'Margasari', kecamatanId: '23' },
  { id: '267', nama: 'Penyarang', kecamatanId: '23' },
  { id: '268', nama: 'Sidamulya', kecamatanId: '23' },
  { id: '269', nama: 'Sidareja', kecamatanId: '23' },
  { id: '270', nama: 'Sudagaran', kecamatanId: '23' },
  { id: '271', nama: 'Tegalsari', kecamatanId: '23' },
  { id: '272', nama: 'Tinggarjaya', kecamatanId: '23' },
  // Wanareja
  { id: '273', nama: 'Adimulya', kecamatanId: '24' },
  { id: '274', nama: 'Bantar', kecamatanId: '24' },
  { id: '275', nama: 'Cigintung', kecamatanId: '24' },
  { id: '276', nama: 'Cilongkrang', kecamatanId: '24' },
  { id: '277', nama: 'Jambu', kecamatanId: '24' },
  { id: '278', nama: 'Limbangan', kecamatanId: '24' },
  { id: '279', nama: 'Madura', kecamatanId: '24' },
  { id: '280', nama: 'Madusari', kecamatanId: '24' },
  { id: '281', nama: 'Majingklak', kecamatanId: '24' },
  { id: '282', nama: 'Malabar', kecamatanId: '24' },
  { id: '283', nama: 'Palugon', kecamatanId: '24' },
  { id: '284', nama: 'Purwasari', kecamatanId: '24' },
  { id: '285', nama: 'Sidamulya', kecamatanId: '24' },
  { id: '286', nama: 'Tambaksari', kecamatanId: '24' },
  { id: '287', nama: 'Tarisi', kecamatanId: '24' },
  { id: '288', nama: 'Wanareja', kecamatanId: '24' },
];

export default function EditBerkasModal({
  isOpen,
  onClose,
  onSuccess,
  berkas,
}: EditBerkasModalProps) {
  const [formData, setFormData] = useState({
    kegiatan: '',
    tanggalBerkas: '',
    tahunBerkas: '',
    namaPemohon: '',
    kecamatan: '',
    desa: '',
    namaProsedur: '',
    luasPendaftaran: '',
    di302: '',
    di305: '',
    deskripsi: '',
    // Workflow fields
    noSTP: '',
    tglSTP: '',
    noSHATNIBEL: '',
    luasHasilUkur: '',
    nib: '',
    nibel: '',
    jumlahBidang: '',
    noSU: '',
  });

  const [filteredDesa, setFilteredDesa] = useState<DesaOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-populate form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Find kecamatan id from nama
    const kecamatanMatch = kecamatanData.find(
      (k) => k.nama.toLowerCase() === berkas.kecamatan?.toLowerCase()
    );
    const kecamatanId = kecamatanMatch?.id ?? '';

    // Find desa id from nama + kecamatanId
    const desaMatch = desaData.find(
      (d) => d.nama.toLowerCase() === berkas.desa?.toLowerCase() && d.kecamatanId === kecamatanId
    );
    const desaId = desaMatch?.id ?? '';

    // Find prosedur id from nama
    const prosedurMatch = prosedurData.find(
      (p) => p.nama.toLowerCase() === berkas.namaProsedur?.toLowerCase()
    );
    const prosedurId = prosedurMatch?.id ?? '';

    // Find kegiatan id from nama
    const kegiatanMatch = kegiatanData.find(
      (k) => k.nama.toLowerCase() === berkas.kegiatan?.toLowerCase()
    );
    const kegiatanId = kegiatanMatch?.id ?? '';

    // Format tanggalBerkas to YYYY-MM-DD for date input
    let tanggalValue = '';
    if (berkas.tanggalBerkas) {
      tanggalValue = berkas.tanggalBerkas.split('T')[0];
    }

    setFormData({
      kegiatan: kegiatanId || berkas.kegiatan || '',
      tanggalBerkas: tanggalValue,
      tahunBerkas: berkas.tahunBerkas?.toString() ?? '',
      namaPemohon: berkas.namaPemohon ?? '',
      kecamatan: kecamatanId,
      desa: desaId,
      namaProsedur: prosedurId || berkas.namaProsedur || '',
      luasPendaftaran: berkas.luasPendaftaran?.toString() ?? '',
      di302: berkas.di302 ?? '',
      di305: berkas.di305 ?? '',
      deskripsi: berkas.deskripsi ?? '',
      // Workflow fields
      noSTP: berkas.noSTP ?? '',
      tglSTP: berkas.tglSTP ? berkas.tglSTP.split('T')[0] : '',
      noSHATNIBEL: berkas.noSHATNIBEL ?? '',
      luasHasilUkur: berkas.luasHasilUkur?.toString() ?? '',
      nib: berkas.nib ?? '',
      nibel: berkas.nibel ?? '',
      jumlahBidang: berkas.jumlahBidang?.toString() ?? '',
      noSU: berkas.noSU ?? '',
    });

    if (kecamatanId) {
      setFilteredDesa(desaData.filter((d) => d.kecamatanId === kecamatanId));
    }

    setError(null);
  }, [isOpen, berkas]);

  // Update filtered desa when kecamatan changes
  useEffect(() => {
    if (formData.kecamatan) {
      const filtered = desaData.filter((d) => d.kecamatanId === formData.kecamatan);
      setFilteredDesa(filtered);
    } else {
      setFilteredDesa([]);
    }
  }, [formData.kecamatan]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const value = e.target.value;
    if (field === 'kecamatan') {
      setFormData((prev) => ({ ...prev, kecamatan: value, desa: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.kegiatan.trim()) throw new Error('Kegiatan harus diisi');
      if (!formData.tanggalBerkas) throw new Error('Tanggal berkas harus diisi');
      if (!formData.tahunBerkas) throw new Error('Tahun berkas harus diisi');
      if (!formData.namaPemohon.trim()) throw new Error('Nama pemohon harus diisi');
      if (!formData.kecamatan) throw new Error('Kecamatan harus dipilih');
      if (!formData.desa) throw new Error('Desa/Kelurahan harus dipilih');
      if (!formData.namaProsedur) throw new Error('Nama prosedur harus dipilih');
      if (!formData.luasPendaftaran) throw new Error('Luas pendaftaran harus diisi');
      if (!formData.di302.trim()) throw new Error('DI.302 harus diisi');
      if (!formData.di305.trim()) throw new Error('DI.305 harus diisi');

      const payload: Record<string, any> = {
        kegiatan: kegiatanData.find((k) => k.id === formData.kegiatan)?.nama || formData.kegiatan,
        tanggalBerkas: formData.tanggalBerkas,
        tahunBerkas: parseInt(formData.tahunBerkas),
        namaPemohon: formData.namaPemohon,
        kecamatan:
          kecamatanData.find((k) => k.id === formData.kecamatan)?.nama || formData.kecamatan,
        desa: desaData.find((d) => d.id === formData.desa)?.nama || formData.desa,
        namaProsedur:
          prosedurData.find((p) => p.id === formData.namaProsedur)?.nama || formData.namaProsedur,
        luasPendaftaran: parseInt(formData.luasPendaftaran),
        di302: formData.di302,
        di305: formData.di305,
        deskripsi: formData.deskripsi || undefined,
      };

      // Append Data Ukur fields if visible
      const stageIdx = STAGES_ORDER.indexOf(berkas.status ?? '');
      if (stageIdx >= 0) {
        if (formData.noSTP) payload.noSTP = formData.noSTP;
        if (formData.tglSTP) payload.tglSTP = formData.tglSTP;
        if (formData.noSHATNIBEL) payload.noSHATNIBEL = formData.noSHATNIBEL;
      }

      // Append Hasil Ukur fields if visible
      if (stageIdx >= STAGES_ORDER.indexOf('DI_PETUGAS_UKUR')) {
        if (formData.luasHasilUkur) payload.luasHasilUkur = parseInt(formData.luasHasilUkur);
        if (formData.nib) payload.nib = formData.nib;
        if (formData.nibel) payload.nibel = formData.nibel;
        if (formData.jumlahBidang) payload.jumlahBidang = parseInt(formData.jumlahBidang);
        if (formData.noSU) payload.noSU = formData.noSU;
      }

      await apiClient.patch(`/berkas/${berkas.id}`, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memperbarui berkas');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentStageIndex = STAGES_ORDER.indexOf(berkas.status ?? '');
  const showDataUkur = currentStageIndex >= 0;
  const showHasilUkur = currentStageIndex >= STAGES_ORDER.indexOf('DI_PETUGAS_UKUR');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">✏️ Edit Berkas</h2>
            <p className="text-sm text-gray-500 mt-1">No. {berkas.nomor}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <Alert type="error" message={error} />}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            ⚠️ Perubahan data berkas akan dicatat dalam riwayat sistem.
          </div>

          {/* Row 1: Kegiatan + Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kegiatan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kegiatan}
                onChange={(e) => handleInputChange(e, 'kegiatan')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Pilih Kegiatan --</option>
                {kegiatanData.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Berkas <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggalBerkas}
                onChange={(e) => handleInputChange(e, 'tanggalBerkas')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Row 2: Nama Pemohon + Tahun */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pemohon <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.namaPemohon}
                onChange={(e) => handleInputChange(e, 'namaPemohon')}
                placeholder="Nama lengkap pemohon"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun Berkas <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.tahunBerkas}
                onChange={(e) => handleInputChange(e, 'tahunBerkas')}
                placeholder="Contoh: 2026"
                min={2000}
                max={2100}
                required
              />
            </div>
          </div>

          {/* Row 3: Kecamatan + Desa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kecamatan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kecamatan}
                onChange={(e) => handleInputChange(e, 'kecamatan')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Pilih Kecamatan --</option>
                {kecamatanData.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desa/Kelurahan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.desa}
                onChange={(e) => handleInputChange(e, 'desa')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                disabled={!formData.kecamatan}
                required
              >
                <option value="">-- Pilih Desa/Kelurahan --</option>
                {filteredDesa.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Prosedur + Luas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Prosedur <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.namaProsedur}
                onChange={(e) => handleInputChange(e, 'namaProsedur')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Pilih Prosedur --</option>
                {prosedurData.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Luas Pendaftaran (m²) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.luasPendaftaran}
                onChange={(e) => handleInputChange(e, 'luasPendaftaran')}
                placeholder="Luas dalam m²"
                min={1}
                required
              />
            </div>
          </div>

          {/* Row 5: DI.302 + DI.305 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DI.302 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.di302}
                onChange={(e) => handleInputChange(e, 'di302')}
                placeholder="Nomor DI.302"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DI.305 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.di305}
                onChange={(e) => handleInputChange(e, 'di305')}
                placeholder="Nomor DI.305"
                required
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => handleInputChange(e, 'deskripsi')}
              placeholder="Catatan tambahan (opsional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Data Ukur (stage: DI_OPERATOR_DATA_UKUR ke atas) */}
          {showDataUkur && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">📐 Data Pengukuran</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. STP</label>
                  <Input
                    value={formData.noSTP}
                    onChange={(e) => handleInputChange(e, 'noSTP')}
                    placeholder="Nomor STP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal STP
                  </label>
                  <input
                    type="date"
                    value={formData.tglSTP}
                    onChange={(e) => handleInputChange(e, 'tglSTP')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. SHA/TNIBEL
                  </label>
                  <Input
                    value={formData.noSHATNIBEL}
                    onChange={(e) => handleInputChange(e, 'noSHATNIBEL')}
                    placeholder="Nomor SHA/TNIBEL"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hasil Ukur (stage: DI_PETUGAS_UKUR ke atas) */}
          {showHasilUkur && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">📏 Hasil Pengukuran</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Luas Hasil Ukur (m²)
                  </label>
                  <Input
                    type="number"
                    value={formData.luasHasilUkur}
                    onChange={(e) => handleInputChange(e, 'luasHasilUkur')}
                    placeholder="Luas hasil pengukuran"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Bidang
                  </label>
                  <Input
                    type="number"
                    value={formData.jumlahBidang}
                    onChange={(e) => handleInputChange(e, 'jumlahBidang')}
                    placeholder="Jumlah bidang tanah"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIB</label>
                  <Input
                    value={formData.nib}
                    onChange={(e) => handleInputChange(e, 'nib')}
                    placeholder="Nomor Identifikasi Bidang"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIBEL</label>
                  <Input
                    value={formData.nibel}
                    onChange={(e) => handleInputChange(e, 'nibel')}
                    placeholder="NIBEL"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. SU</label>
                  <Input
                    value={formData.noSU}
                    onChange={(e) => handleInputChange(e, 'noSU')}
                    placeholder="Nomor Surat Ukur"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : '💾 Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
