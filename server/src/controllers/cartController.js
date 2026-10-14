import pool from "../config/db.js";

const getOrCreateCartId = async (userId) => {
  const existing = await pool.query("SELECT id FROM cart WHERE user_id = $1", [
    userId,
  ]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const created = await pool.query(
    "INSERT INTO cart (user_id) VALUES ($1) RETURNING id",
    [userId],
  );
  return created.rows[0].id;
};

export const getCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCartId(req.user.id);

    const result = await pool.query(
      `SELECT ci.id AS item_id, ci.quantity,
              v.id AS variant_id, v.size, v.color, v.stock,
              p.id AS product_id, p.name,
              COALESCE(p.discount_price, p.price) AS unit_price,
              COALESCE(p.discount_price, p.price) * ci.quantity AS line_total,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY id LIMIT 1) AS image
       FROM cart_items ci
       JOIN product_variants v ON v.id = ci.product_variant_id
       JOIN products p ON p.id = v.product_id
       WHERE ci.cart_id = $1
       ORDER BY ci.id`,
      [cartId],
    );

    const subtotal = result.rows.reduce(
      (sum, row) => sum + Number(row.line_total),
      0,
    );
    res.json({ items: result.rows, subtotal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { product_variant_id, quantity = 1 } = req.body;

    if (!product_variant_id || !Number.isInteger(quantity) || quantity < 1) {
      return res
        .status(400)
        .json({
          message:
            "product_variant_id and a quantity of 1 or more are required",
        });
    }

    const variant = await pool.query(
      `SELECT v.stock FROM product_variants v
       JOIN products p ON p.id = v.product_id
       WHERE v.id = $1 AND p.is_active = TRUE`,
      [product_variant_id],
    );
    if (variant.rows.length === 0) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    const cartId = await getOrCreateCartId(req.user.id);

    const current = await pool.query(
      "SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_variant_id = $2",
      [cartId, product_variant_id],
    );
    const newQuantity = (current.rows[0]?.quantity || 0) + quantity;

    if (newQuantity > variant.rows[0].stock) {
      return res
        .status(400)
        .json({ message: `Only ${variant.rows[0].stock} in stock` });
    }

    const result = await pool.query(
      `INSERT INTO cart_items (cart_id, product_variant_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_variant_id)
       DO UPDATE SET quantity = EXCLUDED.quantity
       RETURNING *`,
      [cartId, product_variant_id, newQuantity],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res
        .status(400)
        .json({ message: "quantity must be a whole number, 1 or more" });
    }

    const cartId = await getOrCreateCartId(req.user.id);

    const item = await pool.query(
      `SELECT v.stock FROM cart_items ci
       JOIN product_variants v ON v.id = ci.product_variant_id
       WHERE ci.id = $1 AND ci.cart_id = $2`,
      [itemId, cartId],
    );
    if (item.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    if (quantity > item.rows[0].stock) {
      return res
        .status(400)
        .json({ message: `Only ${item.rows[0].stock} in stock` });
    }

    const result = await pool.query(
      "UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *",
      [quantity, itemId],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cartId = await getOrCreateCartId(req.user.id);

    const result = await pool.query(
      "DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id",
      [itemId, cartId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
