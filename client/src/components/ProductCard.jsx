import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const hasDiscount = product.discount_price !== null;

  return (
    <Link
      to={`/products/${product.id}`}
      className="block border rounded overflow-hidden hover:shadow-md transition"
    >
      <div className="bg-gray-100 h-48 flex items-center justify-center text-gray-400">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          "No image"
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500">{product.category}</p>
        <h3 className="font-semibold">{product.name}</h3>
        <div className="mt-1">
          {hasDiscount ? (
            <>
              <span className="font-bold">${product.discount_price}</span>{" "}
              <span className="text-sm text-gray-400 line-through">
                ${product.price}
              </span>
            </>
          ) : (
            <span className="font-bold">${product.price}</span>
          )}
        </div>
        {Number(product.total_stock) === 0 && (
          <p className="text-xs text-red-600 mt-1">Out of stock</p>
        )}
      </div>
    </Link>
  );
}
