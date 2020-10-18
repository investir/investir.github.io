import Plotly from "plotly.js-dist";
import "../scss/main.scss";
import { colors } from "./colors";
import { initSearch } from "./search";

window.onload = () => {

  fetch(`/data/companies.json`)
    .then((data) => {
      if (data.ok) {
        return data.json();
      }
    })
    .then((data) => {
      loadTable(data);
      loadTreeChart(data);
      initSearch(data);
    })
    .catch((err) => {
      alert("Falha ao carregar. Tente novamente mais tarde.");
      console.error(err);
    });
};

const loadTable = (data) => {
  data.sort((a, b) => b.market_value - a.market_value)
  const tbody = document.querySelector('.tbl-comapanies-body');
  data.forEach(item => {
    const tr = document.createElement('tr');
    const value = item.market_value;
    tr.innerHTML = `
      <td><a href="/empresas.html?papel=${item.tick}">${item.tick}</a></td>
      <td><a href="/empresas.html?papel=${item.tick}">${item.name}</a></td>
      <td>${item.sector}</td>
      <td>${item.subsector}</td>
      <td class="has-text-right">R$ ${value.toLocaleString("pt-BR", {   
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
      })}</td>`;
    tbody.appendChild(tr);
  });
}

const loadTreeChart = (data) => {
  //Get distinct sector and set Ibovespa as parent
  const sectors = [...new Set(data.map(item => item.sector))]
  const sectorParents = Array(sectors.length).fill('Ibovespa')

  // Get the parent of each subsector
  const subsectors = []
  const subsectorParents = []
  const subsectorValue = []
  const subsectorsIds = []
  for (const item of data) {
    const key = `${item.sector}-${item.subsector}`
    if(!subsectorsIds.includes(key)) {
      subsectors.push(item.subsector)
      subsectorsIds.push(key)
      subsectorParents.push(item.sector)
      const value =  data.reduce((prev, c) => {
        if (c.subsector === item.subsector && c.sector == item.sector){
          return prev + c.market_value/1000000000.0;
        }
        return prev;
      }, 0);
      subsectorValue.push(value)
    }
  }

  const total = data.reduce((prev, item) => prev + item.market_value/1000000000.0, 0)
  const sectorValue = sectors.map(sector => {
      return data.reduce((prev, item) => {
        if (item.sector === sector){
          return prev + item.market_value/1000000000.0;
        }
        return prev;
      }, 0);
  });


  // Get the parent of each company
  let companyName = []
  let companyParent = []
  let companyValue = []
  for (const item of data) {
    companyName.push(`${item.name} (${item.tick})`)
    const key = `${item.sector}-${item.subsector}`
    companyParent.push(key)
    companyValue.push(item.market_value/1000000000.0)
  }

  const treemap = [{
    type: "treemap",
    ids: [...companyName, ...subsectorsIds, ...sectors, "Ibovespa"],
    labels: [...companyName, ...subsectors, ...sectors, "Ibovespa"],
    parents: [...companyParent, ...subsectorParents, ...sectorParents, ""],
    values: [...companyValue,  ...subsectorValue, ...sectorValue, total],
    texttemplate: "%{label}<br>R$ %{value:,.1f}B (%{percentParent})",
    hoverinfo: "label",
    branchvalues: "total",
    textfont: {
      size: 12,
      color: "#ffffff"
    },
    tiling: {
      pad: 0
    }
  }];

  Plotly.newPlot('industries-chart', treemap, {
    height: 500,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0,
      pad: 0
    },
    colorway : colors.categorical,
  })
}
