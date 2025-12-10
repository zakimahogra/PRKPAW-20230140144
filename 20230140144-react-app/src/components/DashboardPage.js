import Navbar from "./Navbar";
import { decodeToken } from "../utils/auth";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const user = decodeToken();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white p-10 flex justify-center items-center">
        <div className="max-w-3xl w-full bg-white shadow-lg rounded-2xl p-10 text-center border border-gray-200">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">
            Dashboard
          </h1>

          <p className="text-gray-700 text-lg mb-2">
            Selamat datang, <strong>{user?.nama ?? "User"}</strong>!
          </p>

          <p className="text-gray-600 mb-10">
            Role:{" "}
            <span className="font-semibold text-gray-800">
              {user?.role ?? "N/A"}
            </span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Presensi Button */}
            <Link
              to="/presensi"
              className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-xl shadow-md transition transform hover:scale-105"
            >
              <h3 className="text-xl font-bold">Presensi</h3>
              <p className="text-sm mt-1">Check-in & Check-out</p>
            </Link>

            {/* Admin only */}
            {user?.role === "admin" && (
              <Link
                to="/laporan"
                className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-xl shadow-md transition transform hover:scale-105"
              >
                <h3 className="text-xl font-bold">Laporan Admin</h3>
                <p className="text-sm mt-1">Data presensi harian</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
