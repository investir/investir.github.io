import Plotly from "plotly.js-dist";
import "../scss/main.scss";

function unpack(rows, key) {
  return rows.map(function (row) {
    return row[key];
  });
}

const loadPrinceChart = (data) => {
  Plotly.d3.csv(
    "https://raw.githubusercontent.com/plotly/datasets/master/finance-charts-apple.csv",
    function (err, rows) {
      var trace = {
        x: unpack(rows, "Date"),
        close: unpack(rows, "AAPL.Close"),
        high: unpack(rows, "AAPL.High"),
        low: unpack(rows, "AAPL.Low"),
        open: unpack(rows, "AAPL.Open"),

        // cutomise colors
        increasing: { line: { color: "black" } },
        decreasing: { line: { color: "red" } },

        type: "candlestick",
        xaxis: "x",
        yaxis: "y",
      };

      var data = [trace];

      var layout = {
        dragmode: "zoom",
        showlegend: false,
        xaxis: {
          autorange: true,
          title: "Date",
          rangeselector: {
            x: 0,
            y: 1.2,
            xanchor: "left",
            font: { size: 8 },
            buttons: [
              {
                step: "month",
                stepmode: "backward",
                count: 1,
                label: "1 month",
              },
              {
                step: "month",
                stepmode: "backward",
                count: 6,
                label: "6 months",
              },
              {
                step: "all",
                label: "All dates",
              },
            ],
          },
        },
        yaxis: {
          autorange: true,
        },
      };

      Plotly.newPlot("priceChart", data, layout);
    }
  );
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
