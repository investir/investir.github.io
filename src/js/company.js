import Plotly from "plotly.js-dist";
import { createChart, CrosshairMode } from "lightweight-charts";
import "../scss/main.scss";

function unpack(rows, key) {
  return rows.map(function (row) {
    return row[key];
  });
}

const colors = {
  red: "#e23f4d",
  green: "#49854c",
};

/**
 * returns an array with moving average of the input array
 * @param array - the input array
 * @param count - the number of elements to include in the moving average calculation
 * @param qualifier - an optional function that will be called on each
 *  value to determine whether it should be used
 */
function movingAvg(array, count) {
  // calculate average for subarray
  var avg = function (array) {
    var sum = 0,
      count = 0,
      val;
    for (var i in array) {
      val = array[i];
      sum += val;
      count++;
    }

    return sum / count;
  };

  var result = [],
    val;

  for (var i = 0, len = array.length - count; i <= len; i++) {
    val = avg(array.slice(i, i + count).map((v) => v.close));
    if (isNaN(val)) continue;
    else result.push({ time: array[i].time, value: val });
  }

  return result;
}

const loadPrinceChart = (data) => {
  const container = document.getElementById("priceChart");

  const chartHeight = 500;

  function getChartWidth() {
    return container ? container.clientWidth : 0;
  }

  const chart = createChart(container, {
    width: getChartWidth(),
    height: chartHeight,
    title: "Preço",
    localization: {
      priceFormatter: (price) => "R$" + price,
    },
    rightPriceScale: {
      borderVisible: false,
      scaleMargins: {
        top: 0,
        bottom: 0.2,
        right: 0.1,
      },
    },
    timeScale: {
      borderVisible: false,
      barSpacing: 1,
    },
    grid: {
      horzLines: {
        color: "#eeeeee",
      },
      vertLines: {
        color: "#ffffff",
      },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      horzLine: {
        visible: true,
        style: 2,
        color: "rgba(0, 0, 0, 0.3)",
        labelVisible: true,
      },
      vertLine: {
        visible: true,
        style: 2,
        color: "rgba(0, 0, 0, 0.3)",
        labelVisible: true,
      },
    },
    localization: {
      locale: "pt-BR",
      dateFormat: "dd/MM/yyyy",
    },
  });

  window.addEventListener("resize", () => {
    chart.resize(getChartWidth(), chartHeight, true);
  });

  const series = chart.addCandlestickSeries({
    upColor: colors.green,
    borderUpColor: colors.green,
    downColor: colors.red,
    borderVisible: true,
    wickVisible: true,
    wickColor: "rgb(0, 0, 0)",
    borderDownColor: colors.red,
    wickUpColor: colors.green,
    wickDownColor: colors.green,
    title: "Cotação",
  });

  series.setData(data.price);

  chart.timeScale().setVisibleLogicalRange({
    from: data.price.length - 60,
    to: data.price.length,
  });

  console.log(movingAvg(data.price, 7));
  chart
    .addLineSeries({
      color: "blue",
      lineWidth: 2,
    })
    .setData(movingAvg(data.price, 7));

  const volumeSeries = chart.addHistogramSeries({
    priceFormat: {
      type: "volume",
    },
    title: "Vol",
    priceScaleId: "",
    scaleMargins: {
      top: 0.8,
      bottom: 0,
    },
  });

  const volumeData = data.price.map(function (tick) {
    let color = colors.red;
    if (tick.close > tick.open) {
      color = colors.green;
    }
    return { time: tick.time, value: tick.volume, color: color };
  });

  volumeSeries.setData(volumeData);
};

const loadProfitChart = (data) => {
  var trace1 = {
    x: [0, 1, 2, 3, 4, 5],
    y: [1.5, 1, 1.3, 0.7, 0.8, 0.9],
    type: "scatter",
  };

  var trace2 = {
    x: [0, 1, 2, 3, 4, 5],
    y: [1, 0.5, 0.7, -1.2, 0.3, 0.4],
    type: "bar",
  };

  var data = [trace1, trace2];

  // TODO: remove duplicate
  Plotly.newPlot("profitChart1", data);
  Plotly.newPlot("profitChart2", data);
  Plotly.newPlot("profitChart3", data);
};

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let tick = urlParams.get("papel");

  if (!tick) {
    tick = "petr4";
  }

  tick = tick.toLowerCase().trim();

  fetch(`/data/${tick}.json`)
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      console.log(data);
      document.querySelector(".tick").textContent = tick.toUpperCase();
      document.querySelector(".description").textContent = data.name;

      if (data.logo) {
        const logo = document.querySelector(".logo");
        logo.classList.remove("is-hidden");
        logo.setAttribute("src", data.logo);
      }

      loadPrinceChart(data);
      loadProfitChart(data);
    })
    .catch((err) => {
      alert("Falha ao carregar");
      console.error(err);
    });
};
