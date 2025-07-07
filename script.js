let chart;
const coinNames = {
  bitcoin: 'Bitcoin (BTC)',
  ethereum: 'Ethereum (ETH)'
};

function initChart() {
  const chartDom = document.getElementById('chart');
  chart = echarts.init(chartDom);

  chart.setOption({
    title: {
      text: '',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const date = params[0].axisValue;
        const price = params[0].data[1];
        return `${date}<br/>$${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      }
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      scale: true
    },
    dataZoom: [
      { type: 'inside', throttle: 50 },
      { type: 'slider' }
    ],
    series: [{
      name: 'Price',
      type: 'line',
      showSymbol: false,
      data: [],
      lineStyle: { width: 2, color: '#f90' },
      areaStyle: { color: 'rgba(255,165,0,0.2)' }
    }]
  });
}

async function fetchHistoricalData(coinId) {
  try {
    document.getElementById('chart-title').textContent = `Loading ${coinNames[coinId]}...`;

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=max&interval=daily`;
    const response = await fetch(url);
    const data = await response.json();

    const formattedData = data.prices.map(([timestamp, price]) => {
      return [new Date(timestamp), price];
    });

    chart.setOption({
      title: { text: `${coinNames[coinId]} Price History` },
      series: [{
        data: formattedData
      }]
    });

    document.getElementById('chart-title').textContent = `${coinNames[coinId]} Price History`;

  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('chart-title').textContent = 'Error loading data';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initChart();
  const select = document.getElementById('coin-select');
  fetchHistoricalData(select.value);

  select.addEventListener('change', () => {
    fetchHistoricalData(select.value);
  });

  document.getElementById('resetZoomBtn').addEventListener('click', () => {
    chart.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100
    });
  });
});
