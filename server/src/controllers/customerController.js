import pool from "../config/db.js";

export const getCustomers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
              COUNT(o.id)::int AS order_count
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id
       WHERE u.role = 'client'
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, total_amount, status, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const setCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res
        .status(400)
        .json({ message: "is_active must be true or false" });
    }

    const result = await pool.query(
      `UPDATE users SET is_active = $1
       WHERE id = $2 AND role = 'client'
       RETURNING id, name, email, is_active`,
      [is_active, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
