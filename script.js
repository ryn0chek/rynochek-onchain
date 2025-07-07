let chart;

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
      lineStyle: { width: 2, color: '#2196f3' },
      areaStyle: { color: 'rgba(33,150,243,0.2)' }
    }]
  });
}

async function fetchBinanceData(symbol) {
  try {
    document.getElementById('chart-title').textContent = `Loading ${symbol}...`;

    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=1000`;
    const response = await fetch(url);
    const raw = await response.json();

    const formattedData = raw.map(candle => {
      return [new Date(candle[0]), parseFloat(candle[4])]; // timestamp + close
    });

    chart.setOption({
      title: { text: `${symbol} Price (Last ${formattedData.length} days)` },
      series: [{ data: formattedData }]
    });

    document.getElementById('chart-title').textContent = `${symbol} Price History`;

  } catch (error) {
    console.error('Error loading data from Binance:', error);
    document.getElementById('chart-title').textContent = 'Error loading data';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initChart();

  const select = document.getElementById('coin-select');
  fetchBinanceData(select.value);

  select.addEventListener('change', () => {
    fetchBinanceData(select.value);
  });

  document.getElementById('resetZoomBtn').addEventListener('click', () => {
    chart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 });
  });
});
