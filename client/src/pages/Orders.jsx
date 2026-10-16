import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api.get("/orders").then((res) => setOrders(res.data));
  }, [user, navigate]);

  if (!orders) return <p className="max-w-6xl mx-auto px-4 py-8">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">You have no orders yet.</p>
      ) : (
        <div className="divide-y border rounded">
          {orders.map((o) => (
            <div key={o.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  Order #TVS{String(o.id).padStart(5, "0")}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(o.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className="font-semibold">${o.total_amount}</p>
              <span className="text-sm capitalize border rounded-full px-3 py-1">
                {o.status}
              </span>
              <Link to={`/orders/${o.id}`} className="underline text-sm">
                View details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
