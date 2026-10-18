import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(null);
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await api.get("/customers");
    setCustomers(res.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (c) => {
    setError("");
    try {
      await api.put(`/customers/${c.id}/status`, { is_active: !c.is_active });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const viewOrders = async (c) => {
    setError("");
    if (selected?.id === c.id) {
      setSelected(null);
      return;
    }
    const res = await api.get(`/customers/${c.id}/orders`);
    setOrders(res.data);
    setSelected(c);
  };

  if (!customers) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {customers.length === 0 ? (
        <p className="text-gray-500">No customers yet.</p>
      ) : (
        <div className="border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Orders</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">{c.order_count}</td>
                  <td className="p-3">{c.is_active ? "Active" : "Disabled"}</td>
                  <td className="p-3 flex gap-3">
                    <button onClick={() => viewOrders(c)} className="underline">
                      {selected?.id === c.id ? "Hide orders" : "Orders"}
                    </button>
                    <button
                      onClick={() => toggleActive(c)}
                      className="underline"
                    >
                      {c.is_active ? "Disable" : "Enable"}
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
          <p className="font-semibold mb-3">Orders of {selected.name}</p>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders.</p>
          ) : (
            <ul className="divide-y text-sm">
              {orders.map((o) => (
                <li key={o.id} className="py-2 flex justify-between">
                  <span>#TVS{String(o.id).padStart(5, "0")}</span>
                  <span>{new Date(o.created_at).toLocaleDateString()}</span>
                  <span>${o.total_amount}</span>
                  <span className="capitalize">{o.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
