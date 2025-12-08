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

// Helper function to format numbers with commas
const formatNumber = (num) => {
  return num.toLocaleString();
};

// Chart options factory for Property Type Distribution per Area
const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Distribution of Property Types per Area',
      font: {
        size: 18,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.parsed.y || 0;
          return `${label}: ${formatNumber(value)}`;
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      title: {
        display: true,
        text: 'Area',
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Properties',
      },
      ticks: {
        callback: function(value) {
          return formatNumber(value);
        },
      },
    },
  },
});

// Memoized chart component to prevent infinite re-renders
const PropertyTypeDistributionChart = memo(({ data }) => {
  if (!data) return null;
  const options = getChartOptions();
  return <Bar data={data} options={options} />;
});

PropertyTypeDistributionChart.displayName = 'PropertyTypeDistributionChart';

const PropertyTypeDistribution = () => {
  const [distributionData, setDistributionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchPropertyTypeDistribution = useCallback(async () => {
    if (fetchingRef.current) {
      console.log('Already fetching, skipping...');
      return; // Prevent multiple calls
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setDistributionData(null); // Clear previous data to prevent chart updates during fetch
      const response = await fetch('/api/property-type-distribution');
      if (!response.ok) {
        throw new Error('Failed to fetch property type distribution data');
      }
      const data = await response.json();
      setDistributionData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching property type distribution:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false; // Reset after fetch completes
    }
  }, []);

  useEffect(() => {
    fetchPropertyTypeDistribution();
  }, [fetchPropertyTypeDistribution]);

  const chartData = useMemo(() => {
    if (!distributionData) return null;
    return {
      labels: distributionData.labels,
      datasets: distributionData.datasets,
    };
  }, [distributionData]);

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minHeight: '400px'
    }}>
      {loading && <p>Loading property type distribution data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && chartData && distributionData && (
        <>
          <div style={{ height: '500px', position: 'relative' }}>
            <PropertyTypeDistributionChart data={chartData} />
          </div>
          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '14px', 
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            Explore the distribution of different property types across various areas in Dubai. 
            This stacked bar chart shows how property types are distributed within each area, 
            helping you understand the composition of the real estate market by location.
          </p>
        </>
      )}
    </div>
  );
};

export default PropertyTypeDistribution;
