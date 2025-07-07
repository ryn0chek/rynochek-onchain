let chart;
let priceData = [];
let timeLabels = [];

// Инициализация графика
function initChart() {
  const ctx = document.getElementById('priceChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'BTC/USD',
        data: [],
        borderColor: 'orange',
        backgroundColor: 'rgba(255,165,0,0.1)',
        tension: 0.2,
        fill: true,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Price (USD)'
          }
        }
      }
    }
  });
}

// Получение цены и обновление графика
async function fetchBTCPrice() {
  try {
    const response = await axios.get('https://www.bitstamp.net/api/v2/ticker/btcusd/');
    const price = parseFloat(response.data.last);
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    console.log(`[INFO] ${time} - BTC Price: $${price}`);

    document.getElementById('btc-price').textContent = `$${price.toLocaleString()}`;

    if (priceData.length >= 30) {
      priceData.shift();
      timeLabels.shift();
    }

    priceData.push(price);
    timeLabels.push(time);

    chart.data.labels = timeLabels;
    chart.data.datasets[0].data = priceData;
    chart.update();
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    document.getElementById('btc-price').textContent = 'Error loading data';
  }
}

// Ждём полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  initChart();
  fetchBTCPrice();
  setInterval(fetchBTCPrice, 60000);
});