import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-wide">
          TVS CLOTHING
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              {user.role === "admin" && <Link to="/admin">Admin</Link>}
              <Link to="/cart">Cart</Link>
              <Link to="/orders">My Orders</Link>
              <span>Hi, {user.name}</span>
              <button onClick={handleLogout} className="underline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
