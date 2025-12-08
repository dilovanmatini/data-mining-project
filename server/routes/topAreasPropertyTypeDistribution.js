// Top 10 Areas by Total Transactions - Property Type Distribution API Route
// Returns count of properties grouped by top 10 areas and property type for stacked bar chart

export const getTopAreasPropertyTypeDistribution = async (db) => {
  try {
    console.log('Fetching top 10 areas property type distribution data...');
    
    // First, get the top 10 areas by total transactions
    const [topAreasRows] = await db.query(`
      SELECT area_name_en, COUNT(*) AS total_transactions
      FROM real_estate
      WHERE area_name_en IS NOT NULL
      GROUP BY area_name_en
      ORDER BY total_transactions DESC
      LIMIT 10
    `);

    if (!topAreasRows || topAreasRows.length === 0) {
      return { 
        labels: [], 
        datasets: [],
        topAreas: []
      };
    }

    const topAreas = topAreasRows.map(row => row.area_name_en);

    // Then get property type distribution for those top 10 areas
    const [rows] = await db.query(`
      SELECT 
        area_name_en,
        property_type_en,
        COUNT(*) AS count
      FROM real_estate
      WHERE area_name_en IN (?)
      GROUP BY area_name_en, property_type_en
      ORDER BY area_name_en, count DESC
    `, [topAreas]);

    if (!rows || rows.length === 0) {
      return { 
        labels: topAreas, 
        datasets: [],
        topAreas: topAreas
      };
    }

    // Transform data for stacked bar chart
    // Structure: { area: { propertyType1: count1, propertyType2: count2, ... } }
    const areaDataMap = {};
    const propertyTypesSet = new Set();

    rows.forEach(row => {
      const area = row.area_name_en || 'Unknown';
      const propertyType = row.property_type_en || 'Unknown';
      const count = parseInt(row.count);

      if (!areaDataMap[area]) {
        areaDataMap[area] = {};
      }
      areaDataMap[area][propertyType] = count;
      propertyTypesSet.add(propertyType);
    });

    // Ensure all top areas are in the map (even if they have no property types)
    topAreas.forEach(area => {
      if (!areaDataMap[area]) {
        areaDataMap[area] = {};
      }
    });

    // Get all unique property types (sorted for consistency)
    const propertyTypes = Array.from(propertyTypesSet).sort();
    
    // Use topAreas order (already sorted by transaction count DESC)
    const areas = topAreas;

    // Create datasets array - each property type is a dataset
    const datasets = propertyTypes.map((propertyType, index) => {
      // Generate colors for each property type
      const colors = [
        'rgba(54, 162, 235, 0.8)',   // Blue
        'rgba(255, 99, 132, 0.8)',   // Red
        'rgba(75, 192, 192, 0.8)',   // Teal
        'rgba(255, 206, 86, 0.8)',   // Yellow
        'rgba(153, 102, 255, 0.8)',  // Purple
        'rgba(255, 159, 64, 0.8)',   // Orange
        'rgba(199, 199, 199, 0.8)',  // Grey
        'rgba(83, 102, 255, 0.8)',   // Indigo
        'rgba(255, 99, 255, 0.8)',   // Pink
        'rgba(99, 255, 132, 0.8)',   // Green
      ];
      
      const color = colors[index % colors.length];
      
      // Create data array for this property type across all top areas
      const data = areas.map(area => {
        return areaDataMap[area][propertyType] || 0;
      });

      return {
        label: propertyType,
        data: data,
        backgroundColor: color,
        borderColor: color.replace('0.8', '1'),
        borderWidth: 1,
      };
    });

    console.log(`Fetched property type distribution for top 10 areas (${areas.length} areas) and ${propertyTypes.length} property types`);

    return {
      labels: areas,
      datasets: datasets,
      topAreas: topAreas,
    };
  } catch (err) {
    console.error("Error in getTopAreasPropertyTypeDistribution:", err);
    console.error("Error stack:", err.stack);
    throw err;
  }
};
