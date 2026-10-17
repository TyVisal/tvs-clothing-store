import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await api.get("/categories/admin/all");
    setCategories(res.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name, description });
      } else {
        await api.post("/categories", { name, description });
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description || "");
    setError("");
  };

  const toggleActive = async (c) => {
    setError("");
    await api.put(`/categories/${c.id}`, { is_active: !c.is_active });
    await load();
  };

  const remove = async (c) => {
    setError("");
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await api.delete(`/categories/${c.id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  if (!categories) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      <form
        onSubmit={handleSubmit}
        className="border rounded p-4 mb-6 space-y-3"
      >
        <p className="font-semibold">
          {editingId ? "Edit category" : "Add category"}
        </p>
        <input
          placeholder="Name (e.g. Jeans)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button className="bg-black text-white px-4 py-2 rounded text-sm">
            {editingId ? "Save changes" : "Add category"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="p-3">{c.name}</td>
                <td className="p-3 text-gray-500">{c.description}</td>
                <td className="p-3">{c.is_active ? "Active" : "Disabled"}</td>
                <td className="p-3 flex gap-3">
                  <button onClick={() => startEdit(c)} className="underline">
                    Edit
                  </button>
                  <button onClick={() => toggleActive(c)} className="underline">
                    {c.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => remove(c)}
                    className="underline text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
