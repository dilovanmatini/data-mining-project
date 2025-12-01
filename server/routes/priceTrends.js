// Price Trends Over Time API Route
// Returns average price trends grouped by year or month
// period: 'yearly' or 'monthly'

const AED_TO_USD_RATE = 3.67;

export const getPriceTrends = async (db, period = 'yearly') => {
  try {
    console.log(`Fetching price trends data (Period: ${period})...`);
    
    let query;
    
    if (period === 'monthly') {
      // Monthly trends
      query = `
        SELECT 
          YEAR(instance_date) AS year,
          MONTH(instance_date) AS month,
          AVG(actual_worth) AS avg_price
        FROM real_estate
        WHERE actual_worth > 0 AND instance_date IS NOT NULL
        GROUP BY year, month
        ORDER BY year, month
      `;
    } else {
      // Yearly trends (default)
      query = `
        SELECT 
          YEAR(instance_date) AS year, 
          AVG(actual_worth) AS avg_price
        FROM real_estate
        WHERE actual_worth > 0 AND instance_date IS NOT NULL
        GROUP BY year
        ORDER BY year
      `;
    }
    
    const [rows] = await db.query(query);

    if (!rows || rows.length === 0) {
      return { 
        labels: [], 
        data: [],
        period: period
      };
    }

    console.log(`Fetched ${rows.length} records for price trends`);

    let labels;
    let data;

    if (period === 'monthly') {
      // Format as "MMM YYYY"
      labels = rows.map(row => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[row.month - 1]} ${row.year}`;
      });
      data = rows.map(row => parseFloat(row.avg_price) / AED_TO_USD_RATE);
    } else {
      // Yearly format
      labels = rows.map(row => row.year.toString());
      data = rows.map(row => parseFloat(row.avg_price) / AED_TO_USD_RATE);
    }

    console.log(`Processed ${labels.length} data points for ${period} trends`);

    return {
      labels,
      data,
      period: period
    };
  } catch (err) {
    console.error("Error in getPriceTrends:", err);
    console.error("Error stack:", err.stack);
    throw err;
  }
};

