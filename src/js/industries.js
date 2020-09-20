import Plotly from "plotly.js-dist";

window.onload = () => {

  fetch(`/data/companies.json`)
    .then((data) => {
      if (data.ok) {
        return data.json();
      }
    })
    .then((data) => {
      //console.log(data);
      loadTreeChart(data);
    })
    .catch((err) => {
      alert("Falha ao carregar. Tente novamente mais tarde.");
      console.error(err);
    });
};

const loadTreeChart = (data) => {
  //Get distinct sector and set Ibovespa as parent
  const sectors = [...new Set(data.map(item => item.sector))]
  let sectorParents = Array(sectors.length).fill('Ibovespa')

  // Get the parent of each subsector
  let subsectors = []
  let subsectorParents = []
  for (const item of data) {
    if(!subsectors.includes(item.subsector)) {
      subsectors.push(item.subsector)
      subsectorParents.push(item.sector)
    }
  }

  // Get the parent of each company
  let companyName = []
  let companyParent = []
  for (const item of data) {
    companyName.push(item.name)
    companyParent.push(item.subsector)
  }

  const data3 = [{
    type: "treemap",
    labels: ["Ibovespa", ...sectors, ...subsectors, ...companyName],
    parents: ["", ...sectorParents, ...subsectorParents, ...companyParent],
  }]
  
  console.log(data3)

  Plotly.newPlot('industries-chart', data3)
}