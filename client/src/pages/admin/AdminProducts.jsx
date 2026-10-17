import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

const emptyForm = {
  category_id: "",
  name: "",
  description: "",
  gender: "unisex",
  price: "",
  discount_price: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [variants, setVariants] = useState([{ size: "", color: "", stock: 0 }]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [openProduct, setOpenProduct] = useState(null);
  const [newVariant, setNewVariant] = useState({
    size: "",
    color: "",
    stock: 0,
  });
  const [variantError, setVariantError] = useState("");

  const load = useCallback(async () => {
    const res = await api.get("/products/admin/all");
    setProducts(res.data);
  }, []);

  useEffect(() => {
    load();
    api.get("/categories/admin/all").then((res) => setCategories(res.data));
  }, [load]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const updateVariant = (i, field, value) => {
    setVariants(
      variants.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/products", {
        category_id: Number(form.category_id),
        name: form.name,
        description: form.description,
        gender: form.gender,
        price: Number(form.price),
        discount_price:
          form.discount_price === "" ? null : Number(form.discount_price),
        variants: variants.map((v) => ({
          size: v.size.trim(),
          color: v.color.trim(),
          stock: Number(v.stock),
        })),
      });
      setForm(emptyForm);
      setVariants([{ size: "", color: "", stock: 0 }]);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const toggleActive = async (p) => {
    await api.put(`/products/${p.id}`, { is_active: !p.is_active });
    await load();
  };

  const loadOpenProduct = async (id) => {
    const res = await api.get(`/products/${id}`);
    setOpenProduct(res.data);
  };

  const toggleVariants = async (p) => {
    setVariantError("");
    if (openId === p.id) {
      setOpenId(null);
      setOpenProduct(null);
      return;
    }
    setOpenId(p.id);
    try {
      await loadOpenProduct(p.id);
    } catch {
      setOpenProduct(null);
      setVariantError(
        "This product is disabled. Enable it to manage its variants.",
      );
    }
  };

  const saveStock = async (variantId, stock) => {
    setVariantError("");
    try {
      await api.put(`/products/variants/${variantId}`, {
        stock: Number(stock),
      });
      await loadOpenProduct(openId);
      await load();
    } catch (err) {
      setVariantError(err.response?.data?.message || "Something went wrong");
    }
  };

  const addVariant = async () => {
    setVariantError("");
    try {
      await api.post(`/products/${openId}/variants`, {
        size: newVariant.size.trim(),
        color: newVariant.color.trim(),
        stock: Number(newVariant.stock),
      });
      setNewVariant({ size: "", color: "", stock: 0 });
      await loadOpenProduct(openId);
      await load();
    } catch (err) {
      setVariantError(err.response?.data?.message || "Something went wrong");
    }
  };

  if (!products) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          {showForm ? "Close form" : "+ Add product"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border rounded p-4 mb-6 space-y-3"
        >
          <p className="font-semibold">Add product</p>
          <input
            name="name"
            placeholder="Product name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
            >
              <option value="">Choose category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="border rounded px-3 py-2"
            >
              <option value="unisex">Unisex</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
            </select>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
            />
            <input
              name="discount_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Discount price (optional)"
              value={form.discount_price}
              onChange={handleChange}
              className="border rounded px-3 py-2"
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">
              Variants (size, color, stock)
            </p>
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  placeholder="Size (M)"
                  value={v.size}
                  onChange={(e) => updateVariant(i, "size", e.target.value)}
                  className="w-24 border rounded px-2 py-1"
                  required
                />
                <input
                  placeholder="Color (Black)"
                  value={v.color}
                  onChange={(e) => updateVariant(i, "color", e.target.value)}
                  className="flex-1 border rounded px-2 py-1"
                  required
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, "stock", e.target.value)}
                  className="w-24 border rounded px-2 py-1"
                  required
                />
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setVariants(variants.filter((_, idx) => idx !== i))
                    }
                    className="text-red-600 text-sm underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setVariants([...variants, { size: "", color: "", stock: 0 }])
              }
              className="text-sm underline"
            >
              + Add another variant
            </button>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="bg-black text-white px-4 py-2 rounded text-sm">
            Save product
          </button>
        </form>
      )}

      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">
                  {p.discount_price !== null ? (
                    <>
                      ${p.discount_price}{" "}
                      <span className="line-through text-gray-400">
                        ${p.price}
                      </span>
                    </>
                  ) : (
                    `$${p.price}`
                  )}
                </td>
                <td className="p-3">{p.total_stock}</td>
                <td className="p-3">{p.is_active ? "Active" : "Disabled"}</td>
                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => toggleVariants(p)}
                    className="underline"
                  >
                    {openId === p.id ? "Hide variants" : "Variants"}
                  </button>
                  <button onClick={() => toggleActive(p)} className="underline">
                    {p.is_active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId && (
        <div className="mt-6 border rounded p-4">
          <p className="font-semibold mb-3">Variants</p>
          {variantError && (
            <p className="text-red-600 text-sm mb-2">{variantError}</p>
          )}
          {openProduct && (
            <>
              <table className="w-full text-sm mb-4">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-1">Color</th>
                    <th className="py-1">Size</th>
                    <th className="py-1">Stock</th>
                    <th className="py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {openProduct.variants.map((v) => (
                    <VariantRow
                      key={`${v.id}-${v.stock}`}
                      variant={v}
                      onSave={saveStock}
                    />
                  ))}
                </tbody>
              </table>

              <p className="text-sm font-semibold mb-2">
                Add a new size or color
              </p>
              <div className="flex gap-2">
                <input
                  placeholder="Size"
                  value={newVariant.size}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, size: e.target.value })
                  }
                  className="w-24 border rounded px-2 py-1"
                />
                <input
                  placeholder="Color"
                  value={newVariant.color}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, color: e.target.value })
                  }
                  className="flex-1 border rounded px-2 py-1"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={newVariant.stock}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, stock: e.target.value })
                  }
                  className="w-24 border rounded px-2 py-1"
                />
                <button
                  onClick={addVariant}
                  className="bg-black text-white px-3 py-1 rounded text-sm"
                >
                  Add
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function VariantRow({ variant, onSave }) {
  const [stock, setStock] = useState(variant.stock);

  return (
    <tr>
      <td className="py-1">{variant.color}</td>
      <td className="py-1">{variant.size}</td>
      <td className="py-1">
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-24 border rounded px-2 py-1"
        />
      </td>
      <td className="py-1">
        <button onClick={() => onSave(variant.id, stock)} className="underline">
          Save stock
        </button>
      </td>
    </tr>
  );
}
