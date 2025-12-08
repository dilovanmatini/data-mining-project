// Market Volume by Year API Route
// Returns number of transactions per year

export const getMarketVolume = async (db) => {
  try {
    console.log('Fetching market volume by year data...');
    
    const [rows] = await db.query(`
      SELECT YEAR(instance_date) AS year, COUNT(*) AS total_sales
      FROM real_estate
      WHERE instance_date IS NOT NULL AND YEAR(instance_date) > 1990
      GROUP BY year
      ORDER BY year
    `);

    if (!rows || rows.length === 0) {
      return { labels: [], data: [] };
    }

    // Extract labels (years) and data (total sales counts)
    const labels = rows.map(row => row.year.toString());
    const data = rows.map(row => parseInt(row.total_sales));

    console.log(`Fetched ${rows.length} years with market volume data`);

    return {
      labels,
      data,
    };
  } catch (err) {
    console.error("Error in getMarketVolume:", err);
    console.error("Error stack:", err.stack);
    throw err;
  }
};

