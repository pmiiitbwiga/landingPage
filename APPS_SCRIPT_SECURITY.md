# Panduan Keamanan Tingkat Lanjut (Apps Script)
Sesuai rekomendasi *Tahap 1*, sistem Frontend Node.js sekarang **sudah diatur untuk membuang dan memfilter** semua _password_ yang diturunkan oleh Google Sheet, sehingga tidak akan pernah lagi tersimpan mentah-mentah ke *browser* anggota, dan celah pembajakan akun (Spoofing) via API telah dikunci (`CORS Origin`).

Namun, agar **Database (Excel/Google Sheet)** Anda juga terbebas dari tulisan *password* yang membahayakan (Plaintext), Anda perlu menaruh fungsi ini ke Google Apps Script Anda (Ekstensi > Apps Script).

### Langkah 1: Tambahkan Fungsi Enkripsi
Salin fungsi _Hash MD5/SHA256_ sederhana ini ke baris paling bawah kode `Code.gs` di Apps Script Anda:

```javascript
// Hash String menjadi format aman (SHA-256)
function hashPassword(plainText) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, plainText, Utilities.Charset.UTF_8);
  var txtHash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}
```

### Langkah 2: Update Aksi 'register'
Saat ada user baru masuk di fungsi `doPost`, temukan bagaimana Anda menyimpan variabel `password`, lalu bungkus dengan fungsi hash tadi:

**Sebelumnya:**
```javascript
var password = payload.data.password; // Plaintext
```

**Ubah Menjadi:**
```javascript
var password = hashPassword(payload.data.password); // Teks Sandi
```

### Langkah 3: Update Aksi 'login'
Ketika mencocokkan password saat user *login*:

**Sebelumnya (Contoh Skenario Apps Script Anda):**
```javascript
if (userRecord.password === payload.data.password) { ... }
```

**Ubah Menjadi (Keamanan Penuh: Hanya izinkan Hash, tolak plaintext lama):**
```javascript
var passwordInput = payload.data.password;
var hashedInput = hashPassword(passwordInput);

if (userRecord.password === hashedInput) { 
   // Berhasil Login!
} else {
   // Salah Password.
}
```

🚨 **PENTING**:
1. Setelah mengubah *script*, pastikan Anda klik tombol **Deploy -> Manage Deployments -> Edit (Pencil) -> Version (New)**.
2. Jangan hapus konfigurasi `CORS` di file *server.ts* yang baru saja mesin saya bangun untuk melindungi website Anda!
