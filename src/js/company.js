import Plotly from "plotly.js-dist";
import { createChart, CrosshairMode } from "lightweight-charts";
import "../scss/main.scss";
import { movingAverage, unpack } from "./indicators";
import { colors } from "./colors";

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let tick = urlParams.get("papel");

  if (!tick) {
    tick = "petr4"; // fallback for Petrobrás
  }

  tick = tick.toLowerCase().trim();

  fetch(`/data/${tick}.json`)
    .then((data) => {
      if (data.ok) {
        return data.json();
      }
    })
    .then((data) => {
      console.log(data);

      loadCompanyInfo(tick, data);
      loadPrinceChart(data);
      loadNetIncome(data);
      loadAssetLiability(data);
      loadNetAssetChart(data);
      loadSearch();
    })
    .catch((err) => {
      alert("Falha ao carregar. Tente novamente mais tarde.");
      console.error(err);
    });
};

const loadSearch = () => {
  fetch(`/data/companies.json`)
    .then((data) => {
      if (data.ok) {
        return data.json();
      }
    })
    .then((companies) => {
      bulmahead(
        "search",
        "prova-menu",
        (searchTerm) =>
          new Promise(
            (filter, rj) =>
              filter(
                companies
                  .filter(
                    (company) =>
                      company.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      company.tick
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((company) => ({
                    label: `${company.tick} - ${company.name}`,
                    value: company.tick,
                  }))
              ),
            150,
            1
          ),
        (result) => {
          console.log(result);
          document.location.href = `/empresas.html?papel=${result.value}`;
        }
      );
    })
    .catch((err) => {
      console.error("Search error", err);
    });
};

/**
 * Load net income / revenue chart (barchart)
 * @param {Object} data company data
 */
const loadNetIncome = (data) => {
  const netIncome = {
    y: unpack(data.balance, "net_income"),
    x: unpack(data.balance, "year"),
    name: "Lucro Líquido",
    type: "bar",
    textposition: "auto",
  };

  const revenue = {
    y: unpack(data.balance, "revenue"),
    x: unpack(data.balance, "year"),
    name: "Receita",
    type: "bar",
    textposition: "auto",
  };

  Plotly.newPlot("net-income-chart", [revenue, netIncome], {
    barmode: "group",
    yaxis: {
      title: "Total em Reais (R$)",
    },
    xaxis: {
      type: "category",
      title: "Ano",
    },
  });
};

/**
 * Load net asset chart (barchart)
 * @param {Object} data company data
 */
const loadNetAssetChart = (data) => {
  const netAsset = {
    y: unpack(data.balance, "net_income"),
    x: unpack(data.balance, "year"),
    name: "Patrimônio Líquido",
    type: "bar",
    textposition: "auto",
  };

  Plotly.newPlot("net-asset-chart", [netAsset], {
    barmode: "group",
    yaxis: {
      title: "Total em Reais (R$)",
    },
    xaxis: {
      type: "category",
      title: "Ano",
    },
  });
};

/**
 * Load assets / liability  chart (barchart)
 * @param {Object} data company data
 */
const loadAssetLiability = (data) => {
  const asset = {
    y: unpack(data.balance, "asset"),
    x: unpack(data.balance, "year"),
    name: "Ativo Circulante",
    type: "bar",
    textposition: "auto",
  };

  const liability = {
    y: unpack(data.balance, "liability"),
    x: unpack(data.balance, "year"),
    name: "Passivo Circulante",
    type: "bar",
    textposition: "auto",
  };

  const liquidity = {
    y: data.balance.map((data) => data.asset / data.liability),
    x: unpack(data.balance, "year"),
    name: "Liquidez Corrente",
    type: "scatter",
    yaxis: "y2",
    textposition: "auto",
  };

  Plotly.newPlot("asset-liability-chart", [asset, liability, liquidity], {
    barmode: "group",
    yaxis: {
      title: "Total em Reais (R$)",
    },
    xaxis: {
      type: "category",
      title: "Ano",
    },
    yaxis2: {
      title: "Liquidez",
      overlaying: "y",
      side: "right",
    },
  });
};

/**
 * Load company information
 * @param {String} tick company's tick
 * @param {Object} data company data
 */
const loadCompanyInfo = (tick, data) => {
  document.querySelector(".tick").textContent = tick.toUpperCase();
  document.querySelector(".description").textContent = data.name;

  if (data.logo) {
    const logo = document.querySelector(".logo");
    logo.classList.remove("is-hidden");
    logo.setAttribute("src", data.logo);
  }
};

/**
 * Load price chart (candlesticks)
 * @param {Object} data company data
 */
const loadPrinceChart = (data) => {
  const container = document.getElementById("priceChart");

  const chartHeight = 500;

  const getChartWidth = () => {
    return container ? container.clientWidth : 0;
  };

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

  chart
    .addLineSeries({
      title: "Média Móvel",
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
      color = colors.green;
    }
    return { time: tick.time, value: tick.volume, color: color };
  });

  volumeSeries.setData(volumeData);
};
