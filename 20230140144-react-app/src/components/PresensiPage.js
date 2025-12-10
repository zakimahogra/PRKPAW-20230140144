import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import Navbar from "./Navbar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Webcam from "react-webcam";

// Fix icon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function PresensiPage() {
  const [coords, setCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Webcam
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const img = webcamRef.current.getScreenshot();
    setImage(img);
  }, []);

  // Ambil lokasi
  const getLocation = () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoadingLocation(false);
      },
      (err) => {
        setError("Gagal mengambil lokasi.");
        setLoadingLocation(false);
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  // ---- CHECK IN ----
  const handleCheckIn = async () => {
    setError("");
    setMessage("");

    if (!coords || !image) {
      setError("Lokasi dan Foto wajib ada!");
      return;
    }

    try {
      const blob = await (await fetch(image)).blob();

      const formData = new FormData();
      formData.append("latitude", coords.lat);
      formData.append("longitude", coords.lng);
      formData.append("image", blob, "selfie.jpg");

      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-in",
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal check-in");
    }
  };

  // ---- CHECK OUT ----
  const handleCheckOut = async () => {
    setError("");
    setMessage("");
    try {
      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-out",
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal check-out");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            Lakukan Presensi
          </h2>

          {loadingLocation && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 text-center">
              <p className="text-gray-600">Mengambil lokasi Anda...</p>
            </div>
          )}

          {/* MAP */}
          {coords && (
            <div className="mb-6 border rounded-lg overflow-hidden shadow-md">
              <MapContainer
                center={[coords.lat, coords.lng]}
                zoom={15}
                style={{ height: "300px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap"
                />
                <Marker position={[coords.lat, coords.lng]}>
                  <Popup>
                    <strong>Lokasi Presensi Anda</strong>
                    <br />
                    Lat: {coords.lat}
                    <br />
                    Lng: {coords.lng}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          {/* CAMERA */}
          <div className="my-4 border rounded-lg overflow-hidden bg-black">
            {image ? (
              <img src={image} alt="Selfie" className="w-full" />
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full"
              />
            )}
          </div>

          <div className="mb-4">
            {!image ? (
              <button
                onClick={capture}
                className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              >
                Ambil Foto 📸
              </button>
            ) : (
              <button
                onClick={() => setImage(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded w-full"
              >
                Foto Ulang 🔄
              </button>
            )}
          </div>

          {/* MESSAGE */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            {message && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {/* Koordinat */}
            {coords && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-gray-700">
                <strong>Koordinat Anda:</strong>
                <br />
                Latitude: {coords.lat}
                <br />
                Longitude: {coords.lng}
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex space-x-4">
              <button
                onClick={handleCheckIn}
                disabled={!coords}
                className={`w-full py-3 px-4 font-semibold rounded-md shadow-sm ${
                  coords
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Check-In
              </button>

              <button
                onClick={handleCheckOut}
                className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700"
              >
                Check-Out
              </button>
            </div>

            {!coords && (
              <button
                onClick={getLocation}
                className="w-full mt-4 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700"
              >
                Coba Ambil Lokasi Lagi
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PresensiPage;
