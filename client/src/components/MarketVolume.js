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

// Chart options factory for Market Volume
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
      text: 'Market Volume by Year',
      font: {
        size: 18,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const value = context.parsed.y;
          return `Total Transactions: ${formatNumber(value)}`;
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Year',
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Transactions',
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
const MarketVolumeChart = memo(({ data }) => {
  if (!data) return null;
  const options = getChartOptions();
  return <Bar data={data} options={options} />;
});

MarketVolumeChart.displayName = 'MarketVolumeChart';

const MarketVolume = () => {
  const [volumeData, setVolumeData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchMarketVolume = useCallback(async () => {
    if (fetchingRef.current) {
      console.log('Already fetching, skipping...');
      return; // Prevent multiple calls
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setVolumeData(null); // Clear previous data to prevent chart updates during fetch
      const response = await fetch('/api/market-volume');
      if (!response.ok) {
        throw new Error('Failed to fetch market volume data');
      }
      const data = await response.json();
      // Exclude year 2025 as it's incomplete
      const currentYear = new Date().getFullYear();
      const filteredLabels = [];
      const filteredValues = [];
      
      if (data.labels && data.data) {
        data.labels.forEach((label, index) => {
          const year = parseInt(label);
          if (year < currentYear) {
            filteredLabels.push(label);
            filteredValues.push(data.data[index]);
          }
        });
      }
      
      const cleanedData = {
        labels: filteredLabels,
        data: filteredValues,
      };
      
      setVolumeData(cleanedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching market volume:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false; // Reset after fetch completes
    }
  }, []);

  // Filter function to apply year range filters
  const applyFilter = useCallback((data, filter) => {
    if (!data || !data.labels || data.labels.length === 0) {
      setFilteredData(null);
      return;
    }

    if (filter === 'all') {
      setFilteredData(data);
      return;
    }

    const currentYear = new Date().getFullYear();
    const lastCompleteYear = currentYear - 1; // 2024 is the last complete year
    let startYear;

    switch (filter) {
      case 'last10':
        startYear = lastCompleteYear - 9; // Last 10 complete years (2015-2024)
        break;
      case 'last20':
        startYear = lastCompleteYear - 19; // Last 20 complete years (2005-2024)
        break;
      case 'last30':
        startYear = lastCompleteYear - 29; // Last 30 complete years (1995-2024)
        break;
      case 'since2000':
        startYear = 2000;
        break;
      case 'since2010':
        startYear = 2010;
        break;
      default:
        setFilteredData(data);
        return;
    }

    const filteredLabels = [];
    const filteredValues = [];

    data.labels.forEach((label, index) => {
      const year = parseInt(label);
      // Exclude current year (2025) and apply start year filter
      if (year >= startYear && year <= lastCompleteYear) {
        filteredLabels.push(label);
        filteredValues.push(data.data[index]);
      }
    });

    setFilteredData({
      labels: filteredLabels,
      data: filteredValues,
    });
  }, []);

  useEffect(() => {
    fetchMarketVolume();
  }, [fetchMarketVolume]);

  // Apply filter when selection changes
  useEffect(() => {
    if (volumeData) {
      applyFilter(volumeData, selectedFilter);
    }
  }, [selectedFilter, volumeData, applyFilter]);

  const chartData = useMemo(() => {
    const dataToUse = filteredData || volumeData;
    if (!dataToUse) return null;
    return {
      labels: dataToUse.labels,
      datasets: [
        {
          label: 'Number of Transactions',
          data: dataToUse.data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [filteredData, volumeData]);

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minHeight: '400px'
    }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="year-filter-select" style={{ fontWeight: 'bold' }}>
          Year Range:
        </label>
        <select
          id="year-filter-select"
          value={selectedFilter}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue !== selectedFilter) {
              setSelectedFilter(newValue);
            }
          }}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            minWidth: '180px',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Years</option>
          <option value="last10">Last 10 Years</option>
          <option value="last20">Last 20 Years</option>
          <option value="last30">Last 30 Years</option>
          <option value="since2000">Since 2000</option>
          <option value="since2010">Since 2010</option>
        </select>
      </div>
      {loading && <p>Loading market volume data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && chartData && (filteredData || volumeData) && (
        <>
          <div style={{ height: '500px', position: 'relative' }}>
            <MarketVolumeChart data={chartData} />
          </div>
          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '14px', 
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            This chart displays the total number of real estate transactions completed each year, 
            helping you understand market activity and transaction volume trends over time.
          </p>
        </>
      )}
    </div>
  );
};

export default MarketVolume;

