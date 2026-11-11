import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold">
            TVS<span className="text-accent">.</span>
          </p>
          <p className="mt-3 text-sm text-clay max-w-xs">
            Comfortable, quality clothing for everyday life. Delivered to your
            door.
          </p>
        </div>
        <div>
          <p className="font-semibold mb-3">Shop</p>
          <ul className="space-y-2 text-sm text-clay">
            <li>
              <Link to="/shop" className="hover:text-accent">
                All products
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-accent">
                My orders
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-accent">
                My profile
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3">Contact</p>
          <ul className="space-y-2 text-sm text-clay">
            <li>Phnom Penh, Cambodia</li>
            <li>Payment: Cash on Delivery</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-taupe">
        © {new Date().getFullYear()} TVS Clothing Store. All rights reserved.
      </div>
    </footer>
  );
}
