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

// Chart options factory for Top 10 Areas Property Type Distribution
const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Top 10 Areas by Total Transactions - Property Type Distribution',
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
const TopAreasPropertyTypeDistributionChart = memo(({ data }) => {
  if (!data) return null;
  const options = getChartOptions();
  return <Bar data={data} options={options} />;
});

TopAreasPropertyTypeDistributionChart.displayName = 'TopAreasPropertyTypeDistributionChart';

const TopAreasPropertyTypeDistribution = () => {
  const [distributionData, setDistributionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchTopAreasPropertyTypeDistribution = useCallback(async () => {
    if (fetchingRef.current) {
      console.log('Already fetching, skipping...');
      return; // Prevent multiple calls
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setDistributionData(null); // Clear previous data to prevent chart updates during fetch
      const response = await fetch('/api/top-areas-property-type-distribution');
      if (!response.ok) {
        throw new Error('Failed to fetch top areas property type distribution data');
      }
      const data = await response.json();
      setDistributionData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching top areas property type distribution:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false; // Reset after fetch completes
    }
  }, []);

  useEffect(() => {
    fetchTopAreasPropertyTypeDistribution();
  }, [fetchTopAreasPropertyTypeDistribution]);

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
      {loading && <p>Loading top areas property type distribution data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && chartData && distributionData && (
        <>
          <div style={{ height: '500px', position: 'relative' }}>
            <TopAreasPropertyTypeDistributionChart data={chartData} />
          </div>
          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '14px', 
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            Explore the distribution of different property types across the top 10 most active areas in Dubai. 
            This stacked bar chart focuses on the areas with the highest transaction volumes, providing a clean 
            and readable view of property type composition in the most active real estate markets.
          </p>
        </>
      )}
    </div>
  );
};

export default TopAreasPropertyTypeDistribution;
