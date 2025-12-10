const { Presensi, User } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    let options = { 
      where: {},
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'email', 'role']
        }
      ]
    };

    // Filter berdasarkan nama dari tabel User
    if (nama) {
      options.include[0].where = {
        nama: {
          [Op.like]: `%${nama}%`,
        }
      };
    }

    // Filter berdasarkan rentang tanggal
    if (tanggalMulai && tanggalSelesai) {
      const startDate = new Date(tanggalMulai);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(tanggalSelesai);
      endDate.setHours(23, 59, 59, 999);
      
      options.where.checkIn = {
        [Op.between]: [startDate, endDate]
      };
    } else if (tanggalMulai) {
      const startDate = new Date(tanggalMulai);
      startDate.setHours(0, 0, 0, 0);
      
      options.where.checkIn = {
        [Op.gte]: startDate
      };
    } else if (tanggalSelesai) {
      const endDate = new Date(tanggalSelesai);
      endDate.setHours(23, 59, 59, 999);
      
      options.where.checkIn = {
        [Op.lte]: endDate
      };
    }

    const records = await Presensi.findAll(options);

    res.json({
      reportDate: new Date().toLocaleDateString(),
      totalRecords: records.length,
      filters: {
        nama: nama || null,
        tanggalMulai: tanggalMulai || null,
        tanggalSelesai: tanggalSelesai || null
      },
      data: records,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil laporan", error: error.message });
  }
};