// Most Common Room Types API Route
// Returns count of properties grouped by room type

export const getRoomTypes = async (db) => {
  try {
    console.log('Fetching most common room types data...');
    
    const [rows] = await db.query(`
      SELECT 
        rooms_en,
        COUNT(*) AS count
      FROM real_estate
      WHERE rooms_en IS NOT NULL
      GROUP BY rooms_en
      ORDER BY count DESC
    `);

    if (!rows || rows.length === 0) {
      return { 
        labels: [], 
        data: [] 
      };
    }

    // Extract labels (room types) and data (counts)
    const labels = rows.map(row => row.rooms_en || 'Unknown');
    const data = rows.map(row => parseInt(row.count));

    console.log(`Fetched ${rows.length} room types with distribution data`);

    return {
      labels,
      data,
    };
  } catch (err) {
    console.error("Error in getRoomTypes:", err);
    console.error("Error stack:", err.stack);
    throw err;
  }
};
