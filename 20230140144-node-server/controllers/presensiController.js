const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const multer = require('multer');
const path = require('path');

const timeZone = "Asia/Jakarta";

// Konfigurasi Multer untuk upload foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pastikan folder 'uploads/' ada di root server Anda!
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // --- PERBAIKAN: Penanganan req.user.id yang hilang (Fallback) ---
    // Mencegah Multer crash jika Autentikasi gagal.
    const userId = req.user && req.user.id ? req.user.id : 'unknown';

    cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

// Batasi ukuran file (misalnya 5MB)
exports.upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas 5MB
});

// CheckIn dengan foto
exports.CheckIn = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // --- VALIDASI AUTENTIKASI DINI ---
    if (!userId) {
        return res.status(401).json({
            message: "Akses ditolak: Autentikasi gagal.",
            errorDetail: "Token tidak valid atau sesi berakhir. Silakan login ulang."
        });
    }

    const { latitude, longitude } = req.body;
    const waktuSekarang = new Date();
    
    // ==========================================================
    // >>> PERBAIKAN: VALIDASI WAJIB KOORDINAT (Mengatasi Schema Error) <<<
    // ==========================================================
    if (!latitude || !longitude) {
        return res.status(400).json({
            message: "Gagal check-in. Koordinat lokasi (Latitude/Longitude) wajib diisi.",
            errorDetail: "Pastikan GPS atau izin lokasi di browser Anda aktif."
        });
    }
    
    const userLat = parseFloat(latitude);
    const userLong = parseFloat(longitude);
    
    if (isNaN(userLat) || isNaN(userLong)) {
        return res.status(400).json({
            message: "Gagal check-in. Format koordinat tidak valid.",
            errorDetail: "Koordinat yang diterima dari frontend bukan format angka."
        });
    }


    // Ambil path foto jika ada — normalisasi path agar menggunakan forward slash
    let buktiFoto = null;
    if (req.file && req.file.path) {
      buktiFoto = req.file.path.replace(/\\/g, '/');
    }

    const existingRecord = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({
        message: "Anda sudah melakukan check-in dan belum check-out.",
      });
    }

    const newRecord = await Presensi.create({
      userId,
      checkIn: waktuSekarang,
      latitude: userLat, 
      longitude: userLong,
      buktiFoto: buktiFoto
    });

    res.status(201).json({
      message: `Check-in berhasil pada ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
      data: newRecord,
    });
  } catch (error) {
    // --- Peningkatan Logging untuk Debugging ---
    console.error("Error Check-in:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan pada server", 
      errorDetail: error.message 
    });
  }
};

exports.CheckOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const waktuSekarang = new Date();
    
    // Validasi Autentikasi
    if (!userId) {
        return res.status(401).json({ message: "Akses ditolak: Token tidak valid." });
    }

    const recordToUpdate = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ada check-in aktif. Anda belum check-in atau sudah check-out.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    res.json({
      message: "Check-out berhasil",
      data: recordToUpdate,
    });
  } catch (error) {
    console.error("Error Check-out:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", errorDetail: error.message });
  }
};

exports.updatePresensi = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    const recordToUpdate = await Presensi.findByPk(id);
    if (!recordToUpdate) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    if (checkIn) recordToUpdate.checkIn = new Date(checkIn);
    if (checkOut) recordToUpdate.checkOut = new Date(checkOut);

    await recordToUpdate.save();
    res.json({ message: "Presensi berhasil diperbarui", data: recordToUpdate });
  } catch (error) {
    console.error("Error updatePresensi:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", errorDetail: error.message });
  }
};

exports.deletePresensi = async (req, res) => {
  try {
    const { id } = req.params;
    const recordToDelete = await Presensi.findByPk(id);

    if (!recordToDelete) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    await recordToDelete.destroy();
    res.status(200).json({ message: "Presensi berhasil dihapus" });
  } catch (error) {
    console.error("Error deletePresensi:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", errorDetail: error.message });
  }
};