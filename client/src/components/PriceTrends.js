import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Helper function to format prices with k/m abbreviations
const formatPrice = (price) => {
  if (price >= 1000000) {
    const millions = price / 1000000;
    const rounded = Math.round(millions * 10) / 10;
    return `$${rounded}m`;
  } else if (price >= 1000) {
    const thousands = price / 1000;
    const rounded = Math.round(thousands * 10) / 10;
    return `$${rounded}k`;
  } else {
    return `$${Math.round(price).toLocaleString()}`;
  }
};

// Chart options factory for Price Trends
const getChartOptions = (period) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: `Price Trends Over Time - ${period === 'monthly' ? 'Monthly' : 'Yearly'}`,
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
        text: period === 'monthly' ? 'Month' : 'Year',
      },
      ticks: {
        maxRotation: period === 'monthly' ? 45 : 0,
        minRotation: period === 'monthly' ? 45 : 0,
      },
    },
    y: {
      beginAtZero: false,
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
  elements: {
    line: {
      tension: 0.4, // Smooth curves
    },
  },
});

// Memoized chart component to prevent infinite re-renders
const PriceTrendsChart = memo(({ data, period }) => {
  if (!data) return null;
  const options = getChartOptions(period);
  return <Line data={data} options={options} />;
});

PriceTrendsChart.displayName = 'PriceTrendsChart';

const PriceTrends = () => {
  const [trendsData, setTrendsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('yearly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchPriceTrends = useCallback(async (period) => {
    if (fetchingRef.current) {
      console.log('Already fetching, skipping...');
      return; // Prevent multiple calls
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setTrendsData(null); // Clear previous data to prevent chart updates during fetch
      const url = `/api/price-trends?period=${encodeURIComponent(period)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch price trends data');
      }
      const data = await response.json();
      setTrendsData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching price trends:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false; // Reset after fetch completes
    }
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchPriceTrends(selectedPeriod);
    }
  }, [selectedPeriod, fetchPriceTrends]);

  const chartData = useMemo(() => {
    if (!trendsData) return null;
    return {
      labels: trendsData.labels,
      datasets: [
        {
          label: 'Average Price',
          data: trendsData.data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [trendsData]);

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minHeight: '400px'
    }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="period-select" style={{ fontWeight: 'bold' }}>
          Period:
        </label>
        <select
          id="period-select"
          value={selectedPeriod}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue !== selectedPeriod) {
              setSelectedPeriod(newValue);
            }
          }}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            minWidth: '150px',
            cursor: 'pointer'
          }}
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      {loading && <p>Loading price trends data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && chartData && trendsData && (
        <>
          <div style={{ height: '500px', position: 'relative' }}>
            <PriceTrendsChart data={chartData} period={selectedPeriod} />
          </div>
          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '14px', 
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            Track how average property prices have changed over time. Switch between monthly and yearly 
            views to identify short-term fluctuations or long-term market trends.
          </p>
        </>
      )}
    </div>
  );
};

export default PriceTrends;

