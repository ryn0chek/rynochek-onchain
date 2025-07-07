let chart;
const MS_IN_DAY = 24 * 60 * 60 * 1000;
const MAX_LIMIT = 1000;

function initChart() {
  const chartDom = document.getElementById('chart');
  chart = echarts.init(chartDom);

  chart.setOption({
    title: { text: '', left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        return params.map(p => {
          const date = p.axisValue;
          return `${p.marker} ${p.seriesName}<br/>${date}<br/>$${p.data[1].toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        }).join('<br/><br/>');
      }
    },
    legend: { show: true },
    xAxis: { type: 'time', boundaryGap: false },
    yAxis: { type: 'value', scale: true },
    dataZoom: [
      { type: 'inside', throttle: 50 },
      { type: 'slider' }
    ],
    series: [] // динамически добавим
  });
}

async function fetchAllBinanceData(symbol) {
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

    await new Promise(resolve => setTimeout(resolve, 150)); // антиспам
  }

  return allData;
}

async function fetchOnchainMetric(url) {
  const response = await fetch(url);
  const raw = await response.json();

  return raw.map(entry => [new Date(entry.date), entry.value]);
}

async function updateChart(symbol) {
  try {
    document.getElementById('chart-title').textContent = `Loading ${symbol}...`;

    const priceData = await fetchAllBinanceData(symbol);
    let lthData = [];
    let sthData = [];

    if (symbol === 'BTCUSDT') {
      lthData = await fetchOnchainMetric('https://bitcoin-data.com/api/realized_price/lth');
      sthData = await fetchOnchainMetric('https://bitcoin-data.com/api/realized_price/sth');
    }

    const series = [
      {
        name: `${symbol} Price`,
        type: 'line',
        data: priceData,
        showSymbol: false,
        lineStyle: { width: 2, color: '#2196f3' },
        areaStyle: { color: 'rgba(33,150,243,0.2)' }
      }
    ];

    if (lthData.length) {
      series.push({
        name: 'LTH Realized Price',
        type: 'line',
        data: lthData,
        showSymbol: false,
        lineStyle: { width: 2, color: '#4caf50', type: 'dashed' }
      });
    }

    if (sthData.length) {
      series.push({
        name: 'STH Realized Price',
        type: 'line',
        data: sthData,
        showSymbol: false,
        lineStyle: { width: 2, color: '#f44336', type: 'dashed' }
      });
    }

    chart.setOption({
      title: { text: `${symbol} Historical Price` },
      series
    });

    document.getElementById('chart-title').textContent = `${symbol} Price Chart`;
  } catch (err) {
    console.error('Error updating chart:', err);
    document.getElementById('chart-title').textContent = 'Error loading data';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initChart();

  const select = document.getElementById('coin-select');
  updateChart(select.value);

  select.addEventListener('change', () => {
    updateChart(select.value);
  });

  document.getElementById('resetZoomBtn').addEventListener('click', () => {
    chart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 });
  });
});
