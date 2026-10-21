import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [profileMsg, setProfileMsg] = useState("");
  const [pw, setPw] = useState({ current_password: "", new_password: "" });
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api.get("/auth/me").then((res) =>
      setForm({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone || "",
        address: res.data.address || "",
      }),
    );
  }, [user, navigate]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    try {
      const res = await api.put("/auth/me", {
        name: form.name,
        phone: form.phone,
        address: form.address,
      });
      const saved = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...saved, name: res.data.name }),
      );
      setProfileMsg("Profile saved. Refresh to see the new name in the menu.");
    } catch (err) {
      setProfileMsg(err.response?.data?.message || "Something went wrong");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg("");
    try {
      await api.put("/auth/password", pw);
      setPw({ current_password: "", new_password: "" });
      setPwMsg("Password changed");
    } catch (err) {
      setPwMsg(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-10">
      <form onSubmit={saveProfile} className="space-y-3">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full name"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          value={form.email}
          disabled
          className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500"
        />
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone"
          className="w-full border rounded px-3 py-2"
        />
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Address"
          className="w-full border rounded px-3 py-2"
        />
        {profileMsg && <p className="text-sm">{profileMsg}</p>}
        <button className="bg-black text-white px-4 py-2 rounded text-sm">
          Save profile
        </button>
      </form>

      <form onSubmit={savePassword} className="space-y-3">
        <h2 className="text-xl font-bold">Change password</h2>
        <input
          type="password"
          value={pw.current_password}
          onChange={(e) => setPw({ ...pw, current_password: e.target.value })}
          placeholder="Current password"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          value={pw.new_password}
          onChange={(e) => setPw({ ...pw, new_password: e.target.value })}
          placeholder="New password (min 6 characters)"
          className="w-full border rounded px-3 py-2"
          required
        />
        {pwMsg && <p className="text-sm">{pwMsg}</p>}
        <button className="bg-black text-white px-4 py-2 rounded text-sm">
          Change password
        </button>
      </form>
    </div>
  );
}
