import Plotly from "plotly.js-dist";
import "../scss/main.scss";
import { createCandlestickChart } from "./candlestick";

window.onload = () => {
  fetch(`/data/ibov.json`)
    .then((data) => {
      if (data.ok) {
        return data.json();
      }
    })
    .then((data) => {
      loadPrinceChart(data);
    })
    .catch((err) => {
      alert("Falha ao carregar. Tente novamente mais tarde.");
      console.error(err);
    });
};

/**
 * Load price chart (candlesticks)
 * @param {Object} data company data
 */
const loadPrinceChart = (data) => {
  const container = document.getElementById("priceChart");
  const chartHeight = 500;
  createCandlestickChart(data, container, chartHeight);
};
