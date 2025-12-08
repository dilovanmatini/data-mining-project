// Area Price and Popularity (Bubble Chart) API Route
// Returns average price and total listings per area for bubble chart visualization

export const getAreaPricePopularity = async (db) => {
  try {
    console.log('Fetching area price and popularity data...');
    
    const [rows] = await db.query(`
      SELECT 
        area_name_en AS area,
        ROUND(AVG(actual_worth), 2) AS avg_price,
        COUNT(*) AS total_listings
      FROM real_estate
      WHERE actual_worth IS NOT NULL
      GROUP BY area_name_en
      HAVING total_listings > 3
      ORDER BY avg_price DESC
    `);

    if (!rows || rows.length === 0) {
      return { 
        areas: [],
        data: []
      };
    }

    // Transform data for bubble chart
    // Each bubble needs: x (avg_price), y (total_listings), r (radius based on listings or price)
    const areas = rows.map(row => row.area || 'Unknown');
    const data = rows.map(row => ({
      x: parseFloat(row.avg_price),
      y: parseInt(row.total_listings),
      r: Math.sqrt(parseInt(row.total_listings)) * 2, // Radius proportional to listings count
      area: row.area || 'Unknown',
      avgPrice: parseFloat(row.avg_price),
      totalListings: parseInt(row.total_listings)
    }));

    console.log(`Fetched ${rows.length} areas with price and popularity data`);

    return {
      areas: areas,
      data: data,
    };
  } catch (err) {
    console.error("Error in getAreaPricePopularity:", err);
    console.error("Error stack:", err.stack);
    throw err;
  }
};
