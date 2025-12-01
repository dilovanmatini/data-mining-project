// Property Usage Distribution API Route
// Returns count of properties grouped by property usage

export const getPropertyUsageDistribution = async (db) => {
  try {
    console.log('Fetching property usage distribution data...');
    
    const [rows] = await db.query(`
      SELECT property_usage_en, COUNT(*) AS total
      FROM real_estate
      WHERE property_usage_en IS NOT NULL AND property_usage_en != ''
      GROUP BY property_usage_en
      ORDER BY total DESC
    `);

    if (!rows || rows.length === 0) {
      return { labels: [], data: [] };
    }

    // Extract labels (property usage types) and data (counts)
    const labels = rows.map(row => row.property_usage_en || 'Unknown');
    const data = rows.map(row => parseInt(row.total));

    console.log(`Fetched ${rows.length} property usage types with distribution data`);

    return {
      labels,
      data,
    };
  } catch (err) {
    console.error("Error in getPropertyUsageDistribution:", err);
    console.error("Error stack:", err.stack);
    throw err;
  }
};

