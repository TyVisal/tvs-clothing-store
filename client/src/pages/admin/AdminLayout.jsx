import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/orders", label: "Orders" },
];
export default function AdminLayout() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
      <aside className="w-48 shrink-0">
        <p className="font-bold mb-3">Admin</p>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
