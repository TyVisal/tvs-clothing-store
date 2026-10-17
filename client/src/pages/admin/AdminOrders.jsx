import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

const NEXT_STATUS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    const res = await api.get("/orders/admin/all", {
      params: filter ? { status: filter } : {},
    });
    setOrders(res.data);
  }, [filter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const openOrder = async (id) => {
    setError("");
    const res = await api.get(`/orders/admin/${id}`);
    setSelected(res.data);
  };

  const changeStatus = async (status) => {
    setError("");
    try {
      await api.put(`/orders/admin/${selected.id}/status`, { status });
      await openOrder(selected.id);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  if (!orders) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders.</p>
      ) : (
        <div className="border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-3">#TVS{String(o.id).padStart(5, "0")}</td>
                  <td className="p-3">{o.customer_name}</td>
                  <td className="p-3">${o.total_amount}</td>
                  <td className="p-3 capitalize">{o.status}</td>
                  <td className="p-3">
                    <button
                      onClick={() => openOrder(o.id)}
                      className="underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="mt-6 border rounded p-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-bold">
              Order #TVS{String(selected.id).padStart(5, "0")}
            </h2>
            <button
              onClick={() => setSelected(null)}
              className="text-sm underline"
            >
              Close
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {selected.customer_name} · {selected.phone} · {selected.email}
          </p>
          <p className="text-sm text-gray-600">
            {selected.address}, {selected.city}
          </p>

          <div className="mt-3 divide-y border rounded">
            {selected.items.map((item, i) => (
              <div key={i} className="p-2 flex justify-between text-sm">
                <span>
                  {item.name} ({item.color}/{item.size}) × {item.quantity}
                </span>
                <span>${item.line_total}</span>
              </div>
            ))}
          </div>
          <p className="text-right font-bold mt-2">
            Total: ${selected.total_amount}
          </p>

          <div className="mt-4">
            <p className="text-sm mb-2">
              Status: <strong className="capitalize">{selected.status}</strong>
            </p>
            {NEXT_STATUS[selected.status].length === 0 ? (
              <p className="text-sm text-gray-500">
                This order can no longer change.
              </p>
            ) : (
              <div className="flex gap-2">
                {NEXT_STATUS[selected.status].map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    className={`px-3 py-1 rounded text-sm capitalize ${
                      s === "cancelled"
                        ? "border text-red-600"
                        : "bg-black text-white"
                    }`}
                  >
                    Mark as {s}
                  </button>
                ))}
              </div>
            )}
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
