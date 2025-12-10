import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../utils/auth";
import Navbar from "./Navbar";

const BASE_URL = "http://localhost:3001"; // mudah diubah kalau nanti deploy

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchReports = async (nama = "", startDate = "", endDate = "") => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      let url = `${BASE_URL}/api/reports/daily?`;
      if (nama) url += `nama=${encodeURIComponent(nama)}&`;
      if (startDate) url += `tanggalMulai=${startDate}&`;
      if (endDate) url += `tanggalSelesai=${tanggalSelesai}`;

      const response = await axios.get(url, config);
      setReports(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Gagal mengambil data laporan");
      setReports([]);
    }
  };

  useEffect(() => {
    fetchReports("", "", "");
  }, [navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(searchTerm, tanggalMulai, tanggalSelesai);
  };

  const handleReset = () => {
    setSearchTerm("");
    setTanggalMulai("");
    setTanggalSelesai("");
    fetchReports("", "", "");
  };

  // sanitize path supaya tidak punya leading slash ganda
  const makePhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    const clean = photoPath.replace(/^\/+/, ''); // remove leading slashes
    return `${BASE_URL}/${clean}`;
  };

  const openPhotoModal = (photoPath) => {
    setSelectedPhoto(makePhotoUrl(photoPath));
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Laporan Presensi Harian
        </h1>

        {/* Form pencarian (sama seperti sebelumnya) */}
        <form onSubmit={handleSearchSubmit} className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Cari berdasarkan nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
              Cari
            </button>
            <button type="button" onClick={handleReset} className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-md shadow-sm hover:bg-gray-600">
              Reset
            </button>
          </div>
        </form>

        {error && <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>}

        {!error && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti Foto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.length > 0 ? (
                  reports.map((presensi) => (
                    <tr key={presensi.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{presensi.user ? presensi.user.nama : "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{presensi.user ? presensi.user.email : "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(presensi.checkIn).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {presensi.checkOut ? new Date(presensi.checkOut).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "Belum Check-Out"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {presensi.buktiFoto ? (
                          <img
                            src={makePhotoUrl(presensi.buktiFoto)}
                            alt="thumbnail"
                            className="w-16 h-12 object-cover rounded cursor-pointer border"
                            onClick={() => openPhotoModal(presensi.buktiFoto)}
                          />
                        ) : (
                          <span className="text-gray-400">Tidak ada</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Tidak ada data yang ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal untuk menampilkan foto */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closePhotoModal}>
          <div className="relative max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={closePhotoModal} className="absolute top-6 right-6 text-white text-3xl font-bold hover:text-gray-300">×</button>
            <img src={selectedPhoto} alt="Bukti Presensi" className="max-w-full max-h-screen rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </>
  );
}

export default ReportPage;