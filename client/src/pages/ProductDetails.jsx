import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError("Product not found"));
  }, [id]);

  if (error) return <p className="max-w-6xl mx-auto px-4 py-8">{error}</p>;
  if (!product)
    return <p className="max-w-6xl mx-auto px-4 py-8">Loading...</p>;

  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizesForColor = product.variants.filter((v) => v.color === color);
  const selectedVariant = product.variants.find(
    (v) => v.color === color && v.size === size,
  );
  const hasDiscount = product.discount_price !== null;

  const handleColor = (c) => {
    setColor(c);
    setSize("");
    setQuantity(1);
    setMessage("");
  };

  const handleAdd = async () => {
    setMessage("");
    if (!user) {
      navigate("/login");
      return;
    }
    if (!selectedVariant) {
      setMessage("Please choose a color and size");
      return;
    }
    try {
      await api.post("/cart/items", {
        product_variant_id: selectedVariant.id,
        quantity,
      });
      setMessage("Added to cart");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="bg-gray-100 h-96 flex items-center justify-center text-gray-400 rounded overflow-hidden">
        {product.images.length > 0 ? (
          <img
            src={product.images[0].image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          "No image"
        )}
      </div>

      <div>
        <p className="text-sm text-gray-500">{product.category}</p>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="mt-2 text-xl">
          {hasDiscount ? (
            <>
              <span className="font-bold">${product.discount_price}</span>{" "}
              <span className="text-gray-400 line-through text-base">
                ${product.price}
              </span>
            </>
          ) : (
            <span className="font-bold">${product.price}</span>
          )}
        </div>
        <p className="mt-4 text-gray-700">{product.description}</p>

        <div className="mt-6">
          <p className="font-semibold mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => handleColor(c)}
                className={`px-3 py-1 border rounded ${color === c ? "bg-black text-white" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {color && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizesForColor.map((v) => (
                <button
                  key={v.id}
                  disabled={v.stock === 0}
                  onClick={() => {
                    setSize(v.size);
                    setQuantity(1);
                    setMessage("");
                  }}
                  className={`px-3 py-1 border rounded disabled:opacity-40 disabled:line-through ${
                    size === v.size ? "bg-black text-white" : ""
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedVariant && (
          <>
            <p className="mt-4 text-sm text-gray-600">
              Available: {selectedVariant.stock}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="border rounded w-8 h-8"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(selectedVariant.stock, quantity + 1))
                }
                className="border rounded w-8 h-8"
              >
                +
              </button>
            </div>
          </>
        )}

        <button
          onClick={handleAdd}
          className="mt-6 w-full bg-black text-white py-2 rounded"
        >
          Add to Cart
        </button>
        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>
    </div>
  );
}
