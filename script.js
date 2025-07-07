let chart;
let coinId = 'bitcoin';

async function fetchHistoricalData() {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1&interval=hourly`;
    const response = await axios.get(url);
    const prices = response.data.prices;

    const labels = prices.map(p => {
      const date = new Date(p[0]);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const data = prices.map(p => p[1]);
    updateChart(labels, data);

    const latestPrice = data[data.length - 1];
    document.getElementById('btc-price').textContent = `$${latestPrice.toLocaleString()}`;
    document.getElementById('crypto-name').textContent = `${coinId.charAt(0).toUpperCase() + coinId.slice(1)} Price (CoinGecko)`;

  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    document.getElementById('btc-price').textContent = 'Error loading data';
  }
}

function initChart() {
  const ctx = document.getElementById('priceChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Price (USD)',
        data: [],
        borderColor: 'orange',
        backgroundColor: 'rgba(255,165,0,0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { display: true },
        y: { beginAtZero: false }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `$${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            }
          }
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x'
          },
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: 'x'
          }
        }
      }
    }
  });

  // Добавим обработчик кнопки сброса зума
  document.getElementById('resetZoomBtn').addEventListener('click', () => {
    chart.resetZoom();
  });
}


function updateChart(labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

// Обработка выбора монеты
document.getElementById('coin-select').addEventListener('change', (e) => {
  coinId = e.target.value;
  fetchHistoricalData();
});

document.addEventListener('DOMContentLoaded', () => {
  initChart();
  fetchHistoricalData();
  setInterval(fetchHistoricalData, 60000);
});
