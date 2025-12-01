import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to format numbers with commas
const formatNumber = (num) => {
  return num.toLocaleString();
};

// Generate colors for donut chart segments
const generateColors = (count) => {
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
  
  // Repeat colors if needed
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

// Chart options factory for Property Usage Distribution
const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Property Usage Distribution',
      font: {
        size: 18,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${formatNumber(value)} (${percentage}%)`;
        },
      },
    },
  },
  cutout: '60%', // Creates the donut hole
});

// Memoized chart component to prevent infinite re-renders
const PropertyUsageDistributionChart = memo(({ data }) => {
  if (!data) return null;
  const options = getChartOptions();
  return <Doughnut data={data} options={options} />;
});

PropertyUsageDistributionChart.displayName = 'PropertyUsageDistributionChart';

const PropertyUsageDistribution = () => {
  const [distributionData, setDistributionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchPropertyUsageDistribution = useCallback(async () => {
    if (fetchingRef.current) {
      console.log('Already fetching, skipping...');
      return; // Prevent multiple calls
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setDistributionData(null); // Clear previous data to prevent chart updates during fetch
      const response = await fetch('/api/property-usage-distribution');
      if (!response.ok) {
        throw new Error('Failed to fetch property usage distribution data');
      }
      const data = await response.json();
      setDistributionData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching property usage distribution:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false; // Reset after fetch completes
    }
  }, []);

  useEffect(() => {
    fetchPropertyUsageDistribution();
  }, [fetchPropertyUsageDistribution]);

  const chartData = useMemo(() => {
    if (!distributionData) return null;
    const colors = generateColors(distributionData.labels.length);
    return {
      labels: distributionData.labels,
      datasets: [
        {
          label: 'Number of Properties',
          data: distributionData.data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
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
      {loading && <p>Loading property usage distribution data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && chartData && distributionData && (
        <>
          <div style={{ height: '500px', position: 'relative' }}>
            <PropertyUsageDistributionChart data={chartData} />
          </div>
          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '14px', 
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            Explore the composition of Dubai's real estate market by property usage type. 
            This chart shows what percentage of properties are residential, commercial, or other usage types.
          </p>
        </>
      )}
    </div>
  );
};

export default PropertyUsageDistribution;

