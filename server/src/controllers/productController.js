import pool from "../config/db.js";

import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "tvs-clothing-store" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });

export const getProducts = async (req, res) => {
  try {
    const { search, category_id, gender, size, color, min_price, max_price } =
      req.query;

    const conditions = ["p.is_active = TRUE", "c.is_active = TRUE"];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`p.name ILIKE $${values.length}`);
    }
    if (category_id) {
      values.push(category_id);
      conditions.push(`p.category_id = $${values.length}`);
    }
    if (gender) {
      values.push(gender);
      conditions.push(`p.gender = $${values.length}`);
    }
    if (min_price) {
      values.push(min_price);
      conditions.push(
        `COALESCE(p.discount_price, p.price) >= $${values.length}`,
      );
    }
    if (max_price) {
      values.push(max_price);
      conditions.push(
        `COALESCE(p.discount_price, p.price) <= $${values.length}`,
      );
    }
    if (size || color) {
      const variantConditions = ["v.product_id = p.id", "v.stock > 0"];
      if (size) {
        values.push(size);
        variantConditions.push(`v.size = $${values.length}`);
      }
      if (color) {
        values.push(color);
        variantConditions.push(`v.color ILIKE $${values.length}`);
      }
      conditions.push(
        `EXISTS (SELECT 1 FROM product_variants v WHERE ${variantConditions.join(" AND ")})`,
      );
    }

    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.gender, p.price, p.discount_price,
              c.name AS category,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY id LIMIT 1) AS image,
              COALESCE((SELECT SUM(stock) FROM product_variants WHERE product_id = p.id), 0) AS total_stock
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY p.created_at DESC`,
      values,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await pool.query(
      `SELECT p.id, p.name, p.description, p.gender, p.price, p.discount_price,
              p.category_id, c.name AS category
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1 AND p.is_active = TRUE`,
      [id],
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variants = await pool.query(
      "SELECT id, size, color, stock FROM product_variants WHERE product_id = $1 ORDER BY color, size",
      [id],
    );
    const images = await pool.query(
      "SELECT id, image_url FROM product_images WHERE product_id = $1 ORDER BY id",
      [id],
    );

    res.json({
      ...productResult.rows[0],
      variants: variants.rows,
      images: images.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      category_id,
      name,
      description,
      gender,
      price,
      discount_price,
      variants,
      images,
    } = req.body;

    if (!category_id || !name || price === undefined) {
      return res
        .status(400)
        .json({ message: "category_id, name and price are required" });
    }
    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        message: "At least one variant (size/color/stock) is required",
      });
    }

    await client.query("BEGIN");

    const productResult = await client.query(
      `INSERT INTO products (category_id, name, description, gender, price, discount_price)
       VALUES ($1, $2, $3, COALESCE($4, 'unisex'), $5, $6)
       RETURNING *`,
      [
        category_id,
        name.trim(),
        description || null,
        gender || null,
        price,
        discount_price ?? null,
      ],
    );
    const product = productResult.rows[0];

    for (const v of variants) {
      await client.query(
        "INSERT INTO product_variants (product_id, size, color, stock) VALUES ($1, $2, $3, $4)",
        [product.id, v.size, v.color, v.stock ?? 0],
      );
    }

    if (Array.isArray(images)) {
      for (const url of images) {
        await client.query(
          "INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)",
          [product.id, url],
        );
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23503") {
      return res.status(400).json({ message: "Category does not exist" });
    }
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "Duplicate size/color in variants" });
    }
    if (err.code === "23514") {
      return res
        .status(400)
        .json({ message: "Invalid value (gender, price, or stock)" });
    }
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

export const getAllProductsAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.gender, p.price, p.discount_price, p.is_active,
              c.name AS category,
              COALESCE((SELECT SUM(stock) FROM product_variants WHERE product_id = p.id), 0) AS total_stock
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ORDER BY p.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      gender,
      price,
      discount_price,
      is_active,
    } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET category_id = COALESCE($1, category_id),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           gender = COALESCE($4, gender),
           price = COALESCE($5, price),
           discount_price = COALESCE($6, discount_price),
           is_active = COALESCE($7, is_active)
       WHERE id = $8
       RETURNING *`,
      [
        category_id ?? null,
        name ? name.trim() : null,
        description ?? null,
        gender ?? null,
        price ?? null,
        discount_price ?? null,
        is_active ?? null,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ message: "Category does not exist" });
    }
    if (err.code === "23514") {
      return res
        .status(400)
        .json({ message: "Invalid value (gender, price, or discount)" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const updateVariantStock = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { stock } = req.body;

    if (stock === undefined || !Number.isInteger(stock) || stock < 0) {
      return res
        .status(400)
        .json({ message: "stock must be a whole number, 0 or more" });
    }

    const result = await pool.query(
      "UPDATE product_variants SET stock = $1 WHERE id = $2 RETURNING *",
      [stock, variantId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Variant not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, color, stock } = req.body;

    if (!size || !color) {
      return res.status(400).json({ message: "size and color are required" });
    }

    const result = await pool.query(
      `INSERT INTO product_variants (product_id, size, color, stock)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, size, color, stock ?? 0],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(404).json({ message: "Product not found" });
    }
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "This size and color already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const addProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Please choose an image" });
    }

    const exists = await pool.query("SELECT id FROM products WHERE id = $1", [
      id,
    ]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // const url = `/uploads/${req.file.filename}`;
    const uploaded = await uploadToCloudinary(req.file.buffer);
    const url = uploaded.secure_url;
    const result = await pool.query(
      "INSERT INTO product_images (product_id, image_url) VALUES ($1, $2) RETURNING *",
      [id, url],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const result = await pool.query(
      "DELETE FROM product_images WHERE id = $1 RETURNING id",
      [imageId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
