let chart;
const MS_IN_DAY = 24 * 60 * 60 * 1000;
const MAX_LIMIT = 1000;

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
    xAxis: { type: 'time', boundaryGap: false },
    yAxis: { type: 'value', scale: true },
    dataZoom: [
      { type: 'inside', throttle: 50 },
      { type: 'slider' }
    ],
    series: [{
      name: 'Price',
      type: 'line',
      showSymbol: false,
      data: [],
      lineStyle: { width: 2, color: '#4caf50' },
      areaStyle: { color: 'rgba(76,175,80,0.2)' }
    }]
  });
}

async function fetchAllBinanceData(symbol) {
  try {
    document.getElementById('chart-title').textContent = `Loading ${symbol} full history...`;

    const start = new Date('2017-08-17').getTime();
    const end = new Date().getTime();
    let allData = [];
    let currentStart = start;

    while (currentStart < end) {
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=${MAX_LIMIT}&startTime=${currentStart}`;
      const response = await fetch(url);
      const chunk = await response.json();

      if (!Array.isArray(chunk) || chunk.length === 0) break;

      allData = allData.concat(chunk.map(c => [new Date(c[0]), parseFloat(c[4])]));
      currentStart = chunk[chunk.length - 1][0] + MS_IN_DAY;

      // 💤 Антиспам: чуть подождём, чтобы не попасть под лимит
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    chart.setOption({
      title: { text: `${symbol} Price History (${allData.length} days)` },
      series: [{ data: allData }]
    });

    document.getElementById('chart-title').textContent = `${symbol} Full Price History`;

  } catch (err) {
    console.error('Error loading full Binance data:', err);
    document.getElementById('chart-title').textContent = 'Error loading data';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initChart();
  const select = document.getElementById('coin-select');
  fetchAllBinanceData(select.value);

  select.addEventListener('change', () => {
    fetchAllBinanceData(select.value);
  });

  document.getElementById('resetZoomBtn').addEventListener('click', () => {
    chart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 });
  });
});
