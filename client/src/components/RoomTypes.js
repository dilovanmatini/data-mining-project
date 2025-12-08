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

// Generate colors for bars
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

// Chart options factory for Room Types
const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'x', // Vertical bar chart
  plugins: {
    legend: {
      display: false, // No legend needed for single dataset
    },
    title: {
      display: true,
      text: 'Most Common Room Types',
      font: {
        size: 18,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const value = context.parsed.y;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `Count: ${formatNumber(value)} (${percentage}%)`;
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Room Type',
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
const RoomTypesChart = memo(({ data }) => {
  if (!data) return null;
  const options = getChartOptions();
  return <Bar data={data} options={options} />;
});

RoomTypesChart.displayName = 'RoomTypesChart';

const RoomTypes = () => {
  const [roomTypesData, setRoomTypesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchRoomTypes = useCallback(async () => {
    if (fetchingRef.current) {
      console.log('Already fetching, skipping...');
      return; // Prevent multiple calls
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setRoomTypesData(null); // Clear previous data to prevent chart updates during fetch
      const response = await fetch('/api/room-types');
      if (!response.ok) {
        throw new Error('Failed to fetch room types data');
      }
      const data = await response.json();
      setRoomTypesData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching room types:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false; // Reset after fetch completes
    }
  }, []);

  useEffect(() => {
    fetchRoomTypes();
  }, [fetchRoomTypes]);

  const chartData = useMemo(() => {
    if (!roomTypesData) return null;
    const colors = generateColors(roomTypesData.labels.length);
    return {
      labels: roomTypesData.labels,
      datasets: [
        {
          label: 'Number of Properties',
          data: roomTypesData.data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    };
  }, [roomTypesData]);

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minHeight: '400px'
    }}>
      {loading && <p>Loading room types data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && chartData && roomTypesData && (
        <>
          <div style={{ height: '500px', position: 'relative' }}>
            <RoomTypesChart data={chartData} />
          </div>
          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '14px', 
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            Discover the most popular room configurations in Dubai's real estate market. 
            This chart shows which room types are trending, helping you understand market preferences 
            and demand patterns for different property sizes.
          </p>
        </>
      )}
    </div>
  );
};

export default RoomTypes;
