import pool from "../config/db.js";

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, is_active FROM categories WHERE is_active = TRUE ORDER BY name",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, is_active FROM categories ORDER BY name",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const result = await pool.query(
      `INSERT INTO categories (name, description)
       VALUES ($1, $2)
       RETURNING id, name, description, is_active`,
      [name.trim(), description || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Category name already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_active = COALESCE($3, is_active)
       WHERE id = $4
       RETURNING id, name, description, is_active`,
      [name ? name.trim() : null, description ?? null, is_active ?? null, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Category name already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (err) {
    if (err.code === "23503") {
      return res
        .status(409)
        .json({
          message: "Category has products. Disable it instead of deleting.",
        });
    }
    res.status(500).json({ message: err.message });
  }
};
