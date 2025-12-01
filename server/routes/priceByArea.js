// Price by Area API Route
// Returns average price for top 20 areas
// propertyUsage: 'Residential' or 'Commercial'

const AED_TO_USD_RATE = 3.67;

export const getPriceByArea = async (db, propertyUsage = null) => {
  try {
    console.log(`Fetching price by area data (Property Usage: ${propertyUsage || 'All'})...`);
    
    // Build WHERE clause based on property usage
    let whereClause = "actual_worth > 0 AND area_name_en IS NOT NULL";
    let queryParams = [];
    
    if (propertyUsage) {
      whereClause += " AND property_usage_en = ?";
      queryParams.push(propertyUsage);
    }
    
    const [rows] = await db.query(`
      SELECT area_name_en, AVG(actual_worth) AS avg_price
      FROM real_estate
      WHERE ${whereClause}
      GROUP BY area_name_en
      ORDER BY avg_price DESC
      LIMIT 20
    `, queryParams);

    if (!rows || rows.length === 0) {
      return { labels: [], data: [] };
    }

    // Extract labels (area names) and data (average prices converted to USD)
    const labels = rows.map(row => row.area_name_en);
    const data = rows.map(row => parseFloat(row.avg_price) / AED_TO_USD_RATE);

    console.log(`Fetched ${rows.length} areas with average prices`);

    return {
      labels,
      data,
    };
  } catch (err) {
    console.error("Error in getPriceByArea:", err);
    console.error("Error stack:", err.stack);
    throw err;
  }
};

