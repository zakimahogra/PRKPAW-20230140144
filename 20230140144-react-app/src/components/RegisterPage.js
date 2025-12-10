import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nama: "",
    role: "mahasiswa",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert("Register berhasil!");
      navigate("/login");
    } else {
      alert("Register gagal!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-100 to-violet-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-md shadow-xl p-8 rounded-2xl w-full max-w-md border border-white/40"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Create Account 🌼
        </h1>

        <input
          type="text"
          name="nama"
          placeholder="Nama Lengkap"
          className="w-full border border-gray-300 p-3 rounded-xl mb-4 focus:ring-2 focus:ring-pink-300 outline-none transition"
          onChange={handleChange}
        />

        <select
          name="role"
          className="w-full border border-gray-300 p-3 rounded-xl mb-4 focus:ring-2 focus:ring-purple-300 outline-none transition"
          onChange={handleChange}
        >
          <option value="mahasiswa">Mahasiswa</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-3 rounded-xl mb-4 focus:ring-2 focus:ring-purple-300 outline-none transition"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-3 rounded-xl mb-6 focus:ring-2 focus:ring-pink-300 outline-none transition"
          onChange={handleChange}
        />

        <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90 text-white p-3 rounded-xl shadow-lg transition">
          Register
        </button>

        <p className="text-center mt-5 text-sm text-gray-700">
          Sudah punya akun?
          <a href="/login" className="text-blue-600 font-medium hover:underline">
            {" "}Login
          </a>
        </p>
      </form>
    </div>
  );
}
