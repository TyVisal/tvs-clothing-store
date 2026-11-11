import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const hasDiscount = product.discount_price !== null;
  const soldOut = Number(product.total_stock) === 0;
  const percent = hasDiscount
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              soldOut ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-taupe text-sm">
            No image
          </div>
        )}

        {hasDiscount && !soldOut && (
          <span className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{percent}%
          </span>
        )}
        {soldOut && (
          <span className="absolute top-3 left-3 bg-espresso text-cream text-xs font-semibold px-2.5 py-1 rounded-full">
            Sold out
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs uppercase tracking-wide text-taupe">
          {product.category}
        </p>
        <h3 className="font-medium group-hover:text-accent transition">
          {product.name}
        </h3>
        <div className="mt-1 text-sm">
          {hasDiscount ? (
            <>
              <span className="font-bold text-accent">
                ${product.discount_price}
              </span>{" "}
              <span className="text-taupe line-through">${product.price}</span>
            </>
          ) : (
            <span className="font-bold">${product.price}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
