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

// Chart options factory for Price by Area
const getChartOptions = (propertyUsage) => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // Horizontal bar chart
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: `Price vs. Area (Top 20 Areas) - ${propertyUsage || 'All'}`,
      font: {
        size: 18,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const value = context.parsed.x;
          return `Average Price: ${formatPrice(value)}`;
        },
      },
    },
  },
  scales: {
    x: {
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
    y: {
      title: {
        display: true,
        text: 'Area',
      },
    },
  },
});

// Memoized chart component to prevent infinite re-renders
const PriceByAreaChart = memo(({ data, propertyUsage }) => {
  if (!data) return null;
  const options = getChartOptions(propertyUsage);
  return <Bar data={data} options={options} />;
});

PriceByAreaChart.displayName = 'PriceByAreaChart';

const PriceByArea = () => {
  const [areaData, setAreaData] = useState(null);
  const [propertyUsages, setPropertyUsages] = useState([]);
  const [selectedPropertyUsage, setSelectedPropertyUsage] = useState('All');
  const [loading, setLoading] = useState(true);
  const [loadingUsages, setLoadingUsages] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  // Fetch available property usage options
  useEffect(() => {
    const fetchPropertyUsages = async () => {
      try {
        setLoadingUsages(true);
        const response = await fetch('/api/property-usage');
        if (!response.ok) {
          throw new Error('Failed to fetch property usage options');
        }
        const usages = await response.json();
        setPropertyUsages(['All', ...usages]);
        setLoadingUsages(false);
      } catch (err) {
        console.error('Error fetching property usages:', err);
        setLoadingUsages(false);
      }
    };
    fetchPropertyUsages();
  }, []);

  const fetchPriceByArea = useCallback(async (propertyUsage) => {
    if (fetchingRef.current) {
      console.log('Already fetching, skipping...');
      return; // Prevent multiple calls
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setAreaData(null); // Clear previous data to prevent chart updates during fetch
      const url = propertyUsage === 'All'
        ? '/api/price-by-area'
        : `/api/price-by-area?propertyUsage=${encodeURIComponent(propertyUsage)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch price by area data');
      }
      const data = await response.json();
      setAreaData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching price by area:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false; // Reset after fetch completes
    }
  }, []);

  useEffect(() => {
    if (propertyUsages.length > 0 && !loadingUsages && selectedPropertyUsage) {
      fetchPriceByArea(selectedPropertyUsage);
    }
  }, [selectedPropertyUsage, propertyUsages.length, loadingUsages, fetchPriceByArea]);

  const chartData = useMemo(() => {
    if (!areaData) return null;
    return {
      labels: areaData.labels,
      datasets: [
        {
          label: 'Average Price',
          data: areaData.data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
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
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="property-usage-select-area" style={{ fontWeight: 'bold' }}>
          Property Usage:
        </label>
        <select
          id="property-usage-select-area"
          value={selectedPropertyUsage}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue !== selectedPropertyUsage) {
              setSelectedPropertyUsage(newValue);
            }
          }}
          disabled={loadingUsages}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            minWidth: '200px',
            cursor: loadingUsages ? 'not-allowed' : 'pointer'
          }}
        >
          {loadingUsages ? (
            <option>Loading...</option>
          ) : (
            propertyUsages.map(usage => (
              <option key={usage} value={usage}>
                {usage}
              </option>
            ))
          )}
        </select>
      </div>
      {loading && <p>Loading price by area data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && chartData && areaData && (
        <>
          <div style={{ height: '500px', position: 'relative' }}>
            <PriceByAreaChart data={chartData} propertyUsage={selectedPropertyUsage} />
          </div>
          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '14px', 
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            Compare average property prices across different areas in Dubai. This visualization 
            helps you identify the most and least expensive neighborhoods for your selected property type.
          </p>
        </>
      )}
    </div>
  );
};

export default PriceByArea;

