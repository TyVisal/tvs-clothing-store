import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const DELIVERY_FEE = 2;

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [form, setForm] = useState({
    customer_name: user?.name || "",
    phone: "",
    address: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api.get("/cart").then((res) => setCart(res.data));
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/orders/checkout", {
        ...form,
        payment_method: "cash_on_delivery",
      });
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  if (!cart) return <p className="max-w-6xl mx-auto px-4 py-8">Loading...</p>;

  if (cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link to="/" className="underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <input
          name="customer_name"
          placeholder="Full name"
          value={form.customer_name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          name="phone"
          placeholder="Phone number"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          name="city"
          placeholder="City / Province"
          value={form.city}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
        <div className="border rounded px-3 py-2 bg-gray-50 text-sm">
          Payment: <strong>Cash on Delivery</strong>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={submitting}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {submitting ? "Placing order..." : "Place Order"}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-4">Order summary</h2>
        <div className="divide-y border rounded">
          {cart.items.map((item) => (
            <div
              key={item.item_id}
              className="p-3 flex justify-between text-sm"
            >
              <span>
                {item.name} ({item.color}/{item.size}) × {item.quantity}
              </span>
              <span>${item.line_total}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1">
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
        </div>
      </div>
    </div>
  );
}
