import pool from "../config/db.js";

const DELIVERY_FEE = 2;

export const checkout = async (req, res) => {
  const {
    customer_name,
    phone,
    address,
    city,
    payment_method = "cash_on_delivery",
  } = req.body;

  if (!customer_name || !phone || !address || !city) {
    return res
      .status(400)
      .json({ message: "customer_name, phone, address and city are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const cartResult = await client.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [req.user.id],
    );
    if (cartResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Your cart is empty" });
    }
    const cartId = cartResult.rows[0].id;

    const items = await client.query(
      `SELECT ci.product_variant_id, ci.quantity, v.stock, p.name, v.size, v.color,
              COALESCE(p.discount_price, p.price) AS unit_price
       FROM cart_items ci
       JOIN product_variants v ON v.id = ci.product_variant_id
       JOIN products p ON p.id = v.product_id
       WHERE ci.cart_id = $1
       FOR UPDATE OF v`,
      [cartId],
    );

    if (items.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Your cart is empty" });
    }

    for (const item of items.rows) {
      if (item.quantity > item.stock) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Not enough stock for ${item.name} (${item.color}/${item.size}). Only ${item.stock} left.`,
        });
      }
    }

    const subtotal = items.rows.reduce(
      (sum, i) => sum + Number(i.unit_price) * i.quantity,
      0,
    );
    const total = subtotal + DELIVERY_FEE;

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, customer_name, phone, address, city, payment_method, delivery_fee, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        customer_name,
        phone,
        address,
        city,
        payment_method,
        DELIVERY_FEE,
        total,
      ],
    );
    const order = orderResult.rows[0];

    for (const item of items.rows) {
      await client.query(
        "INSERT INTO order_items (order_id, product_variant_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [order.id, item.product_variant_id, item.quantity, item.unit_price],
      );
      await client.query(
        "UPDATE product_variants SET stock = stock - $1 WHERE id = $2",
        [item.quantity, item.product_variant_id],
      );
    }

    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);

    await client.query("COMMIT");
    res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};
