import { createChart, CrosshairMode } from "lightweight-charts";
import { colors } from "./colors";
import { movingAverage } from "./indicators";

/**
 * Create a candlestick chart
 * @param {Object} data Company's data
 * @param {HTMLElement} container DOMElement
 * @param {Number} height chart height
 */
export function createCandlestickChart(data, container, height) {
  const getChartWidth = () => {
    return container ? container.clientWidth : 0;
  };

  const chart = createChart(container, {
    width: getChartWidth(),
    height: height,
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
    upColor: colors.blue,
    borderUpColor: colors.blue,
    downColor: colors.red,
    borderVisible: true,
    wickVisible: true,
    wickColor: "rgb(0, 0, 0)",
    borderDownColor: colors.red,
    wickUpColor: colors.blue,
    wickDownColor: colors.blue,
    title: "Cotação",
  });

  series.setData(data.price);

  chart.timeScale().setVisibleLogicalRange({
    from: data.price.length - 60,
    to: data.price.length,
  });

  chart
    .addLineSeries({
      title: "",
      color: colors.gray,
      lineWidth: 2,
    })
    .setData(movingAverage(data.price, 7));

  const volumeSeries = chart.addHistogramSeries({
    priceFormat: {
      type: "volume",
    },
    title: "Volume",
    priceScaleId: "",
    scaleMargins: {
      top: 0.8,
      bottom: 0,
    },
  });

  const volumeData = data.price.map(function (tick) {
    let color = colors.red;
    if (tick.close > tick.open) {
      color = colors.blue;
    }
    return { time: tick.time, value: tick.volume, color: color };
  });

  volumeSeries.setData(volumeData);
}
