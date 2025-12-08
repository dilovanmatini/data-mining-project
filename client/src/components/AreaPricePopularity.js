import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to format prices with k/m abbreviations
const formatPrice = (price) => {
  if (price >= 1000000) {
    const millions = price / 1000000;
    const rounded = millions.toFixed(1);
    return `$${rounded}m`;
  } else if (price >= 1000) {
    const thousands = price / 1000;
    const rounded = thousands.toFixed(1);
    return `$${rounded}k`;
  } else {
    return `$${Math.round(price).toLocaleString()}`;
  }
};

// Helper function to format numbers with commas
const formatNumber = (num) => {
  return num.toLocaleString();
};

// Chart options factory for Area Price and Popularity (Grouped Bar Chart)
const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // Horizontal bar chart
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Heat Ranking: Average Price per Area + Count of Properties (Top 20)',
      font: {
        size: 18,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.parsed.x;
          if (label === 'Average Price') {
            return `${label}: ${formatPrice(value)}`;
          } else {
            return `${label}: ${formatNumber(value)}`;
          }
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      stacked: false,
      title: {
        display: true,
        text: 'Value',
      },
      ticks: {
        callback: function(value) {
          return formatNumber(value);
        },
      },
    },
    y: {
      stacked: false,
      title: {
        display: true,
        text: 'Area',
      },
    },
  },
});

// Memoized chart component to prevent infinite re-renders
const AreaPricePopularityChart = memo(({ data }) => {
  if (!data) return null;
  const options = getChartOptions();
  return <Bar data={data} options={options} />;
});

AreaPricePopularityChart.displayName = 'AreaPricePopularityChart';

const AreaPricePopularity = () => {
  const [areaData, setAreaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchAreaPricePopularity = useCallback(async () => {
    if (fetchingRef.current) {
      console.log('Already fetching, skipping...');
      return; // Prevent multiple calls
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setAreaData(null); // Clear previous data to prevent chart updates during fetch
      const response = await fetch('/api/area-price-popularity');
      if (!response.ok) {
        throw new Error('Failed to fetch area price and popularity data');
      }
      const data = await response.json();
      setAreaData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching area price and popularity:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false; // Reset after fetch completes
    }
  }, []);

  useEffect(() => {
    fetchAreaPricePopularity();
  }, [fetchAreaPricePopularity]);

  const chartData = useMemo(() => {
    if (!areaData || !areaData.data || areaData.data.length === 0) return null;
    
    // Sort by average price descending and take top 20 for better readability
    const sortedData = [...areaData.data]
      .sort((a, b) => b.avgPrice - a.avgPrice)
      .slice(0, 20);
    
    const areas = sortedData.map(d => d.area);
    const avgPrices = sortedData.map(d => d.avgPrice);
    const totalListings = sortedData.map(d => d.totalListings);
    
    return {
      labels: areas,
      datasets: [
        {
          label: 'Average Price',
          data: avgPrices,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total Listings',
          data: totalListings,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [areaData]);

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minHeight: '400px'
    }}>
      {loading && <p>Loading area price and popularity data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && chartData && areaData && (
        <>
          <div style={{ height: '600px', position: 'relative' }}>
            <AreaPricePopularityChart data={chartData} />
          </div>
          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '14px', 
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            Compare average property prices and market activity across Dubai's top areas. 
            The chart shows the top 20 areas ranked by average price, with side-by-side bars 
            comparing average price (teal) and total number of listings (red) for each area.
          </p>
        </>
      )}
    </div>
  );
};

export default AreaPricePopularity;
