import Plotly from "plotly.js-dist";

window.onload = () => {
  const container = document.getElementById("tester");
  Plotly.newPlot(
    container,
    [
      {
        x: [1, 2, 3, 4, 5],
        y: [1, 2, 4, 8, 16],
      },
    ],
    {
      margin: { t: 0 },
    }
  );
};
