import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `text-sm transition hover:text-accent ${isActive ? "text-accent font-semibold" : ""}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  const loadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/cart");
      setCount(res.data.items.reduce((sum, i) => sum + i.quantity, 0));
    } catch {
      setCount(0);
    }
  }, [user]);

  useEffect(() => {
    loadCount();
  }, [loadCount, location.pathname]);

  useEffect(() => {
    window.addEventListener("cart-updated", loadCount);
    return () => window.removeEventListener("cart-updated", loadCount);
  }, [loadCount]);

  const shownCount = user ? count : 0;
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-clay">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          onClick={close}
          className="font-display text-2xl font-semibold"
        >
          TVS CLOTHING <span className="text-accent">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/shop" className={linkClass}>
            Shop
          </NavLink>
          {user && (
            <NavLink to="/orders" className={linkClass}>
              My Orders
            </NavLink>
          )}
          {user && (
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            onClick={close}
            className="relative"
            aria-label="Cart"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 7h12l-1 13H7L6 7z" strokeLinejoin="round" />
              <path d="M9 7a3 3 0 016 0" strokeLinecap="round" />
            </svg>
            {shownCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-[11px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {shownCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-4 text-sm">
            {user ? (
              <>
                <span className="text-taupe">Hi, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="underline hover:text-accent"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-accent">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-espresso text-cream px-4 py-2 rounded-full hover:bg-accent transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-2xl leading-none"
            aria-label="Menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-clay bg-cream px-4 py-4 flex flex-col gap-3 text-sm">
          <Link to="/shop" onClick={close}>
            Shop
          </Link>
          {user && (
            <Link to="/orders" onClick={close}>
              My Orders
            </Link>
          )}
          {user && (
            <Link to="/profile" onClick={close}>
              Profile
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" onClick={close}>
              Admin
            </Link>
          )}
          {user ? (
            <button onClick={handleLogout} className="text-left underline">
              Logout ({user.name})
            </button>
          ) : (
            <>
              <Link to="/login" onClick={close}>
                Login
              </Link>
              <Link to="/register" onClick={close}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
