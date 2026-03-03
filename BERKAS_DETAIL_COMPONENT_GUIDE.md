# Komponen Detail Berkas - Panduan Penggunaan

## Deskripsi

Sistem detail berkas yang reusable dengan 3 tab:

1. **Tab Pembaruan Data** - Konten custom per proses (bisa dihide)
2. **Tab Detail Berkas** - Tampilan data berkas (standar)
3. **Tab History Berkas** - Riwayat perubahan (standar)

## Struktur Komponen

```
components/berkas/
├── BerkasDetailLayout.tsx    # Layout utama dengan tab navigation
├── BerkasDetailTab.tsx        # Tab detail berkas (standar)
├── BerkasHistoryTab.tsx       # Tab history berkas (standar)
└── index.ts                   # Export semua komponen
```

## Cara Penggunaan

### 1. Import Komponen

```tsx
import {
  BerkasDetailLayout,
  BerkasDetailTab,
  BerkasHistoryTab,
} from "@/components/berkas";
```

### 2. Contoh Implementasi Dasar (View-Only seperti KKS)

```tsx
export default function DetailBerkasPage() {
  const [berkas, setBerkas] = useState<Berkas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... fetch berkas logic

  return (
    <BerkasDetailLayout
      berkas={berkas}
      loading={loading}
      error={error}
      backUrl="/berkas/proses/kks"
      pageTitle="🎯 Detail Berkas KKS"
      hideUpdateTab={true} // Hide tab pembaruan
      detailTab={<BerkasDetailTab berkas={berkas!} />}
      historyTab={<BerkasHistoryTab history={berkas?.history} />}
    >
      {/* Kosongkan karena hideUpdateTab=true */}
      <></>
    </BerkasDetailLayout>
  );
}
```

### 3. Contoh Implementasi dengan Form Update (Operator Data Ukur)

```tsx
export default function UpdateBerkasDataUkurPage() {
  const [berkas, setBerkas] = useState<Berkas | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    puLapangId: "",
    noSTP: "",
    tglSTP: "",
    // ... field lainnya
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic untuk update berkas
  };

  return (
    <BerkasDetailLayout
      berkas={berkas}
      loading={loading}
      error={error}
      success={success}
      backUrl="/berkas/proses/operator-data-ukur"
      pageTitle="📏 Perbarui Data Ukur"
      updateTabLabel="Perbarui Data Ukur"
      detailTab={<BerkasDetailTab berkas={berkas!} />}
      historyTab={<BerkasHistoryTab history={berkas?.history} />}
    >
      {/* Form custom untuk update data ukur */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input fields custom sesuai kebutuhan proses */}
          <Input
            label="No. STP"
            name="noSTP"
            value={formData.noSTP}
            onChange={(e) =>
              setFormData({ ...formData, noSTP: e.target.value })
            }
          />
          {/* ... field lainnya */}
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/berkas/proses/operator-data-ukur">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </BerkasDetailLayout>
  );
}
```

## Props BerkasDetailLayout

| Prop             | Type              | Required | Description                                    |
| ---------------- | ----------------- | -------- | ---------------------------------------------- |
| `berkas`         | `any \| null`     | ✅       | Data berkas                                    |
| `loading`        | `boolean`         | ✅       | Status loading                                 |
| `error`          | `string \| null`  | ✅       | Error message                                  |
| `success`        | `string \| null`  | ❌       | Success message                                |
| `backUrl`        | `string`          | ✅       | URL untuk tombol kembali                       |
| `pageTitle`      | `string`          | ✅       | Judul halaman                                  |
| `updateTabLabel` | `string`          | ❌       | Label tab pembaruan (default: "Perbarui Data") |
| `children`       | `React.ReactNode` | ✅       | Konten tab pembaruan (form custom)             |
| `detailTab`      | `React.ReactNode` | ✅       | Konten tab detail                              |
| `historyTab`     | `React.ReactNode` | ✅       | Konten tab history                             |
| `hideUpdateTab`  | `boolean`         | ❌       | Hide tab pembaruan (default: false)            |

## Struktur Folder untuk Setiap Proses

```
app/berkas/proses/
├── operator-data-berkas/
│   ├── page.tsx           # List berkas
│   └── [id]/
│       └── page.tsx       # Detail berkas dengan form update
├── operator-data-ukur/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── operator-data-pemetaan/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── operator-pemeriksaan/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── petugas-ukur/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── petugas-pemetaan/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── kks/
│   ├── page.tsx           # View-only (hideUpdateTab=true)
│   └── [id]/
│       └── page.tsx
└── kepala-seksi/
    ├── page.tsx
    └── [id]/
        └── page.tsx
```

## Contoh Link dari List ke Detail

```tsx
// Di halaman list (page.tsx)
<Link href={`/berkas/proses/operator-data-ukur/${berkas.id}`}>
  <Button size="sm" variant="outline">
    Perbarui
  </Button>
</Link>

// Untuk proses view-only seperti KKS
<Link href={`/berkas/proses/kks/${berkas.id}`}>
  <Button size="sm" variant="outline">
    Lihat Detail
  </Button>
</Link>
```

## Kustomisasi Per Proses

Setiap proses dapat memiliki:

1. **Form update yang berbeda** - Sesuaikan field yang dibutuhkan
2. **Validasi berbeda** - Sesuai dengan business rules
3. **Label tab berbeda** - Gunakan prop `updateTabLabel`
4. **Aksi berbeda** - Bisa update, approve, reject, dll
5. **View-only mode** - Set `hideUpdateTab={true}` untuk proses yang hanya monitoring

## Catatan Penting

- ✅ Tab Detail dan History menggunakan komponen standar
- ✅ Tab Pembaruan adalah slot untuk konten custom
- ✅ Semua proses punya struktur yang konsisten
- ✅ Loading dan error handling sudah di-handle oleh layout
- ✅ Komponen reusable memudahkan maintenance
