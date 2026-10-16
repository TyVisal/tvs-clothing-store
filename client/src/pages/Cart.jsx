import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const DELIVERY_FEE = 2;

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");

  const loadCart = useCallback(async () => {
    const res = await api.get("/cart");
    setCart(res.data);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadCart();
  }, [user, navigate, loadCart]);

  const changeQuantity = async (item, quantity) => {
    setError("");
    try {
      await api.put(`/cart/items/${item.item_id}`, { quantity });
      await loadCart();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const removeItem = async (item) => {
    setError("");
    await api.delete(`/cart/items/${item.item_id}`);
    await loadCart();
  };

  if (!cart) return <p className="max-w-6xl mx-auto px-4 py-8">Loading...</p>;

  if (cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-gray-500">Your cart is empty.</p>
        <Link to="/" className="underline mt-2 inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

      <div className="divide-y border rounded">
        {cart.items.map((item) => (
          <div
            key={item.item_id}
            className="p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.color} / {item.size}
              </p>
              <p className="text-sm">${item.unit_price} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeQuantity(item, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="border rounded w-8 h-8 disabled:opacity-40"
              >
                -
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => changeQuantity(item, item.quantity + 1)}
                className="border rounded w-8 h-8"
              >
                +
              </button>
            </div>
            <p className="w-20 text-right font-semibold">${item.line_total}</p>
            <button
              onClick={() => removeItem(item)}
              className="text-red-600 text-sm underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      <div className="mt-6 ml-auto max-w-xs space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>${DELIVERY_FEE.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-1">
          <span>Total</span>
          <span>${(cart.subtotal + DELIVERY_FEE).toFixed(2)}</span>
        </div>
        <Link
          to="/checkout"
          className="block text-center bg-black text-white py-2 rounded mt-3"
        >
          Checkout
        </Link>
        <Link to="/" className="block text-center underline text-sm mt-2">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
