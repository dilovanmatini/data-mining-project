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
    const rounded = Math.round(millions);
    return `$${rounded}m`;
  } else if (price >= 1000) {
    const thousands = price / 1000;
    const rounded = Math.round(thousands);
    return `$${rounded}k`;
  } else {
    return `$${Math.round(price).toLocaleString()}`;
  }
};

// Chart options factory for Price by Property Type
const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'x', // Vertical bar chart
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Price by Property Type',
      font: {
        size: 18,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const value = context.parsed.y;
          return `Average Price: ${formatPrice(value)}`;
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Property Type',
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Average Price (USD)',
      },
      ticks: {
        callback: function(value) {
          return formatPrice(value);
        },
      },
    },
  },
});

// Memoized chart component to prevent infinite re-renders
const PriceByPropertyTypeChart = memo(({ data }) => {
  if (!data) return null;
  const options = getChartOptions();
  return <Bar data={data} options={options} />;
});

PriceByPropertyTypeChart.displayName = 'PriceByPropertyTypeChart';

const PriceByPropertyType = () => {
  const [propertyTypeData, setPropertyTypeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchPriceByPropertyType = useCallback(async () => {
    if (fetchingRef.current) {
      console.log('Already fetching, skipping...');
      return; // Prevent multiple calls
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setPropertyTypeData(null); // Clear previous data to prevent chart updates during fetch
      const response = await fetch('/api/price-by-property-type');
      if (!response.ok) {
        throw new Error('Failed to fetch price by property type data');
      }
      const data = await response.json();
      setPropertyTypeData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching price by property type:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false; // Reset after fetch completes
    }
  }, []);

  useEffect(() => {
    fetchPriceByPropertyType();
  }, [fetchPriceByPropertyType]);

  const chartData = useMemo(() => {
    if (!propertyTypeData) return null;
    return {
      labels: propertyTypeData.labels,
      datasets: [
        {
          label: 'Average Price',
          data: propertyTypeData.data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [propertyTypeData]);

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minHeight: '400px'
    }}>
      {loading && <p>Loading price by property type data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && chartData && propertyTypeData && (
        <>
          <div style={{ height: '500px', position: 'relative' }}>
            <PriceByPropertyTypeChart data={chartData} />
          </div>
          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '14px', 
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            See how average property prices vary by property type (apartments, villas, townhouses, etc.). 
            Use this to understand which property types command higher or lower prices in the market.
          </p>
        </>
      )}
    </div>
  );
};

export default PriceByPropertyType;

