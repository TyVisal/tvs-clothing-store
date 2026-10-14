import pool from "../config/db.js";

const LOW_STOCK_LIMIT = 5;

export const getDashboard = async (req, res) => {
  try {
    const counts = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM products WHERE is_active = TRUE)::int AS products,
         (SELECT COUNT(*) FROM orders)::int AS orders,
         (SELECT COUNT(*) FROM users WHERE role = 'client')::int AS customers`,
    );

    const sales = await pool.query(
      `SELECT
         COALESCE(SUM(total_amount) FILTER (WHERE status = 'delivered'), 0) AS total_sales,
         COALESCE(SUM(total_amount) FILTER (
           WHERE status <> 'cancelled' AND created_at::date = CURRENT_DATE), 0) AS today_sales
       FROM orders`,
    );

    const best = await pool.query(
      `SELECT p.name, SUM(oi.quantity)::int AS sold
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN product_variants v ON v.id = oi.product_variant_id
       JOIN products p ON p.id = v.product_id
       WHERE o.status <> 'cancelled'
       GROUP BY p.name
       ORDER BY sold DESC
       LIMIT 5`,
    );

    const low = await pool.query(
      `SELECT p.name, v.size, v.color, v.stock
       FROM product_variants v
       JOIN products p ON p.id = v.product_id
       WHERE v.stock <= $1 AND p.is_active = TRUE
       ORDER BY v.stock, p.name`,
      [LOW_STOCK_LIMIT],
    );

    res.json({
      ...counts.rows[0],
      total_sales: Number(sales.rows[0].total_sales),
      today_sales: Number(sales.rows[0].today_sales),
      best_sellers: best.rows,
      low_stock: low.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
