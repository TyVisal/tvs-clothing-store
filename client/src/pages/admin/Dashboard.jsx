import { useEffect, useState } from "react";
import api from "../../api/axios";

function StatCard({ label, value }) {
  return (
    <div className="border rounded p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Something went wrong"),
      );
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Products" value={data.products} />
        <StatCard label="Orders" value={data.orders} />
        <StatCard label="Customers" value={data.customers} />
        <StatCard
          label="Total sales"
          value={`$${data.total_sales.toFixed(2)}`}
        />
        <StatCard
          label="Today's sales"
          value={`$${data.today_sales.toFixed(2)}`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="font-semibold mb-2">Best selling products</h2>
          {data.best_sellers.length === 0 ? (
            <p className="text-sm text-gray-500">No sales yet.</p>
          ) : (
            <ol className="border rounded divide-y">
              {data.best_sellers.map((b, i) => (
                <li key={b.name} className="p-3 flex justify-between text-sm">
                  <span>
                    {i + 1}. {b.name}
                  </span>
                  <span>{b.sold} sold</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-2">Low stock</h2>
          {data.low_stock.length === 0 ? (
            <p className="text-sm text-gray-500">
              All products are well stocked.
            </p>
          ) : (
            <ul className="border rounded divide-y">
              {data.low_stock.map((s, i) => (
                <li key={i} className="p-3 flex justify-between text-sm">
                  <span>
                    {s.name} ({s.color}/{s.size})
                  </span>
                  <span
                    className={
                      s.stock === 0
                        ? "text-red-600 font-semibold"
                        : "text-orange-600"
                    }
                  >
                    {s.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
