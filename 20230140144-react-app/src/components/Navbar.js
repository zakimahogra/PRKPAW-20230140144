import { useNavigate } from "react-router-dom";
import { decodeToken, removeToken, isAdmin } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const user = decodeToken();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <h1
              className="text-xl font-bold text-gray-900 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              Sistem Presensi
            </h1>
          </div>

          {/* Menu Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/presensi")}
              className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
            >
              Presensi
            </button>

            {/* Menu Laporan - Hanya untuk Admin */}
            {isAdmin() && (
              <button
                onClick={() => navigate("/reports")}
                className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
              >
                Laporan Admin
              </button>
            )}

            {/* User Info & Logout */}
            <div className="flex items-center space-x-3 border-l border-gray-300 pl-4">
              <span className="text-sm font-medium text-gray-800">
                {user?.nama ?? "User"}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition shadow"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
