import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Order not found"));
  }, [id, user, navigate]);

  if (error) return <p className="max-w-4xl mx-auto px-4 py-8">{error}</p>;
  if (!order) return <p className="max-w-4xl mx-auto px-4 py-8">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="underline text-sm">
        ← Back to my orders
      </Link>
      <h1 className="text-2xl font-bold mt-3">
        Order #TVS{String(order.id).padStart(5, "0")}
      </h1>
      <p className="text-sm text-gray-500">
        {new Date(order.created_at).toLocaleString()} · Status:{" "}
        <strong className="capitalize">{order.status}</strong>
      </p>

      <div className="mt-4 text-sm">
        <p>
          {order.customer_name} · {order.phone}
        </p>
        <p>
          {order.address}, {order.city}
        </p>
        <p>Payment: Cash on Delivery</p>
      </div>

      <div className="mt-4 divide-y border rounded">
        {order.items.map((item, i) => (
          <div key={i} className="p-3 flex justify-between text-sm">
            <span>
              {item.name} ({item.color}/{item.size}) × {item.quantity}
            </span>
            <span>${item.line_total}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 ml-auto max-w-xs space-y-1">
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>${order.delivery_fee}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-1">
          <span>Total</span>
          <span>${order.total_amount}</span>
        </div>
      </div>
    </div>
  );
}
