// Price by Property Type API Route
// Returns average price grouped by property type

const AED_TO_USD_RATE = 3.67;

export const getPriceByPropertyType = async (db) => {
  try {
    console.log('Fetching price by property type data...');
    
    const [rows] = await db.query(`
      SELECT property_type_en, AVG(actual_worth) AS avg_price
      FROM real_estate
      WHERE actual_worth > 0 AND property_type_en IS NOT NULL
      GROUP BY property_type_en
      ORDER BY avg_price DESC
    `);

    if (!rows || rows.length === 0) {
      return { labels: [], data: [] };
    }

    // Extract labels (property types) and data (average prices converted to USD)
    const labels = rows.map(row => row.property_type_en || 'Unknown');
    const data = rows.map(row => parseFloat(row.avg_price) / AED_TO_USD_RATE);

    console.log(`Fetched ${rows.length} property types with average prices`);

    return {
      labels,
      data,
    };
  } catch (err) {
    console.error("Error in getPriceByPropertyType:", err);
    console.error("Error stack:", err.stack);
    throw err;
  }
};

