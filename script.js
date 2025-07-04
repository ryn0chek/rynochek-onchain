// Запрос к Bitstamp API
async function fetchBitstampData() {
  try {
    const response = await axios.get('https://www.bitstamp.net/api/v2/ticker/btcusd/');
    document.getElementById('btc-price').textContent = `$${response.data.last}`;
    document.getElementById('btc-volume').textContent = `${response.data.volume} BTC`;
  } catch (error) {
    console.error('Error fetching Bitstamp data:', error);
  }
}

// Запрос к Blockchain.com API
async function fetchOnchainData() {
  try {
    const response = await axios.get('https://api.blockchain.info/stats');
    document.getElementById('total-txs').textContent = response.data.totalbtcsent.toLocaleString();
    document.getElementById('utxo-count').textContent = response.data.utxo_count.toLocaleString();
  } catch (error) {
    console.error('Error fetching on-chain data:', error);
  }
}

// Инициализация графиков
function initCharts() {
  // График цены (заглушка — данные можно добавить из API)
  const priceCtx = document.getElementById('priceChart').getContext('2d');
  new Chart(priceCtx, {
    type: 'line',
    data: {
      labels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
      datasets: [{
        label: 'BTC/USD',
        data: [50000, 51000, 49500, 50500, 50300],
        borderColor: 'orange',
        tension: 0.1
      }]
    }
  });

  // График транзакций
  const txCtx = document.getElementById('txChart').getContext('2d');
  new Chart(txCtx, {
    type: 'bar',
    data: {
      labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
      datasets: [{
        label: 'Transactions',
        data: [250000, 300000, 280000, 320000, 290000],
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    }
  });
}

// Обновление данных каждые 60 секунд
fetchBitstampData();
fetchOnchainData();
initCharts();
setInterval(() => {
  fetchBitstampData();
  fetchOnchainData();
}, 60000);