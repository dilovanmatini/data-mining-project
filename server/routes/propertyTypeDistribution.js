// Property Type Distribution per Area API Route
// Returns count of properties grouped by area and property type for stacked bar chart

export const getPropertyTypeDistribution = async (db) => {
  try {
    console.log('Fetching property type distribution per area data...');
    
    const [rows] = await db.query(`
      SELECT 
        area_name_en,
        property_type_en,
        COUNT(*) AS count
      FROM real_estate
      GROUP BY area_name_en, property_type_en
      ORDER BY area_name_en, count DESC
    `);

    if (!rows || rows.length === 0) {
      return { 
        labels: [], 
        datasets: [] 
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

    // Get all unique property types (sorted for consistency)
    const propertyTypes = Array.from(propertyTypesSet).sort();
    
    // Get all areas (sorted alphabetically)
    const areas = Object.keys(areaDataMap).sort();

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
      
      // Create data array for this property type across all areas
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

    console.log(`Fetched property type distribution for ${areas.length} areas and ${propertyTypes.length} property types`);

    return {
      labels: areas,
      datasets: datasets,
    };
  } catch (err) {
    console.error("Error in getPropertyTypeDistribution:", err);
    console.error("Error stack:", err.stack);
    throw err;
  }
};
