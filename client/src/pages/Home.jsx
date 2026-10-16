import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {};
      if (search) params.search = search;
      if (categoryId) params.category_id = categoryId;
      if (gender) params.gender = gender;

      api
        .get("/products", { params })
        .then((res) => setProducts(res.data))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, categoryId, gender]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search clothing..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All genders</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="unisex">Unisex</option>
          <option value="kids">Kids</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategoryId("")}
          className={`px-3 py-1 rounded-full border text-sm ${
            categoryId === "" ? "bg-black text-white" : ""
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(String(c.id))}
            className={`px-3 py-1 rounded-full border text-sm ${
              categoryId === String(c.id) ? "bg-black text-white" : ""
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
