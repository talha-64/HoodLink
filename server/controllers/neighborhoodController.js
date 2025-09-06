import pool from "../db.js";

export const getAllNeighborhoods = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT postal_code, name, city FROM neighborhoods"
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: "Sorry!! No neighborhoods available" });
    }

    const neighborhoods = result.rows;
    res.status(200).json({ neighborhoods: neighborhoods });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
