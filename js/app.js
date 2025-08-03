//import { sum } from 'd3';
//import { rollup } from 'd3-array';
document.addEventListener('DOMContentLoaded', init);

async function init() {
  const scenes = ['#scene-1', '#scene-2', '#scene-3'];
  let currentScene = 0;

  // Load data
  var evGlobalData = await d3.csv("ev_global.csv", d => ({
    Year: +d.year,
    Country: d.region_country,
    Vehicles_Sold: +d.value,
    Mode: +d.mode
  }));

  evGlobalData = d3.sort(evGlobalData, d => d.Year);

  var evCountryData = await d3.csv("ev.csv", d => ({
    Year: +d.year,
    Country: d.region_country,
    Vehicles_Sold: +d.value,
    Mode: +d.mode
  }));

  evCountryData = d3.sort(evCountryData, d => d.Year);

  //console.log(evCountryData);

  var phevGlobalData = await d3.csv("phev_global.csv", d => ({
    Year: +d.year,
    Country: d.region_country,
    Vehicles_Sold: +d.value
  }));

  phevGlobalData = d3.sort(phevGlobalData, d => d.Year);

  var phevCountryData = await d3.csv("phev.csv", d => ({
    Year: +d.year,
    Country: d.region_country,
    Vehicles_Sold: +d.value
  }));

  phevCountryData = d3.sort(phevCountryData, d => d.Year);

  //var evCountryCumData = d3.rollup(evCountryData, v => d3.sum(v, d => d.Vehicles_Sold), d => d.Country);


  var evphevCountryCumData = await d3.csv("evphev_cumm.csv", d => ({
    Country: d.region_country,
    Vehicles_Sold: +d.value
  }));
  //console.log(evphevCountryCumData);
  evphevCountryCumData = evphevCountryCumData.sort((a,b) => d3.descending(a.Vehicles_Sold, b.Vehicles_Sold));

  //console.log(evphevCountryCumData);

  // Initial chart rendering
  updateChartForScene(currentScene);

  // Populate the dropdown menu with country options
  const countries = Array.from(new Set(evCountryData.map(d => d.Country)));
  const countrySelect = d3.select("#country-select");
  countrySelect.selectAll("option")
    .data(countries)
    .enter().append("option")
    .attr("value", d => d)
    .text(d => d);

  // Add event listeners to buttons
  document.getElementById('next').addEventListener('click', () => {
    if (currentScene < scenes.length - 1) {
      d3.select(scenes[currentScene]).classed('active', false);
      currentScene++;
      d3.select(scenes[currentScene]).classed('active', true);
      updateChartForScene(currentScene);
    }
  });

  document.getElementById('previous').addEventListener('click', () => {
    if (currentScene > 0) {
      d3.select(scenes[currentScene]).classed('active', false);
      currentScene--;
      d3.select(scenes[currentScene]).classed('active', true);
      updateChartForScene(currentScene);
    }
  });

  d3.select("#country-select").on("change", function() {
    const selectedCountry = d3.select(this).property("value");
    updateCountryChart(selectedCountry);
  });

  function createLineChart(evGlobalData, phevGlobalData) {
    console.log("Creating line chart..."); // Debugging
    // Clear existing SVG content
    d3.select("#line-chart").selectAll("*").remove();

    const svg = d3.select("#line-chart").append("svg")
      .attr("width", 800)
      .attr("height", 600);

    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(evGlobalData, d => new Date(d.Year, 0, 1)))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([d3.min(evGlobalData, d => d.Vehicles_Sold), d3.max(evGlobalData, d => d.Vehicles_Sold)])
      .range([height, 0]);

    const line = d3.line()
      .x(d => x(new Date(d.Year, 0, 1)))
      .y(d => y(d.Vehicles_Sold));

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).tickSize(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    g.append("g")
      .call(d3.axisLeft(y));

    // EV line path
    const evPath = g.append("path")
      .datum(evGlobalData)
      .attr("fill", "none")
      .attr("stroke", "#2E86AB")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", line);

    // PHEV line path
    const phevPath = g.append("path")
      .datum(phevGlobalData)
      .attr("fill", "none")
      .attr("stroke", "#F24236")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", line);

    // Animate line drawing
    const evPathLength = evPath.node().getTotalLength();
    evPath
      .attr("stroke-dasharray", evPathLength + " " + evPathLength)
      .attr("stroke-dashoffset", evPathLength)
      .transition()
      .duration(1500)
      .attr("stroke-dashoffset", 0);

    const phevPathLength = phevPath.node().getTotalLength();
    phevPath
      .attr("stroke-dasharray", phevPathLength + " " + phevPathLength)
      .attr("stroke-dashoffset", phevPathLength)
      .transition()
      .duration(1500)
      .delay(300)
      .attr("stroke-dashoffset", 0);

    // Add legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(300, 20)`);

    // EV legend item
    const evLegend = legend.append("g")
      .attr("class", "legend-item");

    evLegend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#2E86AB")
      .attr("stroke-width", 3);

    evLegend.append("circle")
      .attr("cx", 10)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", "#2E86AB")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    evLegend.append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.32em")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text("Electric Vehicles (EV)");

    // PHEV legend item
    const phevLegend = legend.append("g")
      .attr("class", "legend-item")
      .attr("transform", "translate(0, 25)");

    phevLegend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#F24236")
      .attr("stroke-width", 3);

    phevLegend.append("circle")
      .attr("cx", 10)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", "#F24236")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    phevLegend.append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.32em")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text("Plug-in Hybrid (PHEV)");

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .text("Vehicles Sold");

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .text("Year");
  }

  function getRandomColor() {
    var r = Math.floor(Math.random() * 256); // Random red value
    var g = Math.floor(Math.random() * 256); // Random green value
    var b = Math.floor(Math.random() * 256); // Random blue value
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function createBarChart(evphevCountryCumData) {
    const evphevCountryCumData_25 = evphevCountryCumData.slice(0, 25);
    console.log("Creating bar chart..."); // Debugging
    // Clear existing SVG content
    d3.select("#bar-chart").selectAll("*").remove();

    const svg = d3.select("#bar-chart").append("svg")
      .attr("width", 800)
      .attr("height", 600);

    const margin = { top: 20, right: 30, bottom: 80, left: 80 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);


    const x = d3.scaleLinear()
                .domain([d3.min(evphevCountryCumData_25, d => d.Vehicles_Sold), d3.max(evphevCountryCumData_25, d => d.Vehicles_Sold)])
                .range([3, width]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    const y = d3.scaleBand()
      .domain(evphevCountryCumData_25.map(d => d.Country)).range([0, height]).padding(0.1);

    g.append("g")
      .call(d3.axisLeft(y));

    g.selectAll(".bar")
      .data(evphevCountryCumData_25)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", x(0))
      .attr("y", d => y(d.Country))
      .attr("width", d => x(d.Vehicles_Sold))
      .attr("height", y.bandwidth())//d => height - (d => d.Vehicles_Sold))  //d => height - y(d => d.Vehicles_Sold))
      .attr("fill", getRandomColor)
      .transition() // Begin the animation
      .duration(1000) // Set the duration of the animation to 1000ms (1 second)
      .delay((d, i) => i * 150); // Add a slight delay for a staggered effect


    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .text("Vehicles Sold");
  }


  function createLineChartPerCountry(evCountryData, phevCountryData) {
    console.log("Creating line chart for selected country..."); // Debugging
    console.log(evCountryData);

    // Clear existing SVG content
    d3.select("#country-chart").selectAll("*").remove();

    const svg = d3.select("#country-chart").append("svg")
      .attr("width", 800)
      .attr("height", 600);

    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Create tooltip for annotations
    const tooltip = d3.select("body").select(".slope-tooltip").empty()
      ? d3.select("body").append("div")
        .attr("class", "slope-tooltip")
        .style("position", "absolute")
        .style("padding", "12px")
        .style("background", "rgba(0, 0, 0, 0.9)")
        .style("color", "white")
        .style("border-radius", "8px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("opacity", 0)
        .style("transition", "opacity 0.3s")
        .style("max-width", "250px")
      : d3.select("body").select(".slope-tooltip");

    // Combine both datasets for y-domain calculation
    const allData = [...evCountryData, ...phevCountryData];

    const x = d3.scaleTime()
      .domain(d3.extent(allData, d => new Date(d.Year, 0, 1)))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(allData, d => d.Vehicles_Sold)])
      .nice()
      .range([height, 0]);

    const line = d3.line()
      .x(d => x(new Date(d.Year, 0, 1)))
      .y(d => y(d.Vehicles_Sold))
      .curve(d3.curveMonotoneX);

    // Function to calculate slope between two points
    function calculateSlope(point1, point2) {
      const deltaY = point2.Vehicles_Sold - point1.Vehicles_Sold;
      const deltaX = point2.Year - point1.Year;
      return deltaX !== 0 ? deltaY / deltaX : 0;
    }

    // Function to find the point with the largest slope
    function findLargestSlopePoint(data) {
      let maxSlope = -Infinity;
      let maxSlopePoint = null;

      for (let i = 0; i < data.length - 1; i++) {
        const currentSlope = calculateSlope(data[i], data[i + 1]);

        if (currentSlope > maxSlope) {
          maxSlope = currentSlope;
          maxSlopePoint = {
            point: data[i], // Starting point of the steepest slope
            nextPoint: data[i + 1], // End point of the steepest slope
            slope: currentSlope,
            index: i
          };
        }
      }

      return maxSlopePoint;
    }

    // Find the largest slope points for both datasets
    const evLargestSlope = findLargestSlopePoint(evCountryData);
    const phevLargestSlope = findLargestSlopePoint(phevCountryData);

    console.log("EV Largest Slope Point:", evLargestSlope);
    console.log("PHEV Largest Slope Point:", phevLargestSlope);

    // Add grid lines
    g.selectAll(".grid-line")
      .data(y.ticks())
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-width", 1);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).tickSize(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("fill", "#666");

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(",d")))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#666");

    // EV line path
    const evPath = g.append("path")
      .datum(evCountryData)
      .attr("fill", "none")
      .attr("stroke", "#2E86AB")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", line);

    // PHEV line path
    const phevPath = g.append("path")
      .datum(phevCountryData)
      .attr("fill", "none")
      .attr("stroke", "#F24236")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", line);

    // Animate line drawing
    const evPathLength = evPath.node().getTotalLength();
    evPath
      .attr("stroke-dasharray", evPathLength + " " + evPathLength)
      .attr("stroke-dashoffset", evPathLength)
      .transition()
      .duration(1500)
      .attr("stroke-dashoffset", 0);

    const phevPathLength = phevPath.node().getTotalLength();
    phevPath
      .attr("stroke-dasharray", phevPathLength + " " + phevPathLength)
      .attr("stroke-dashoffset", phevPathLength)
      .transition()
      .duration(1500)
      .delay(300)
      .attr("stroke-dashoffset", 0);

    // Add EV largest slope annotation (only if it exists)
    if (evLargestSlope) {
      const evAnnotation = g.append("g")
        .attr("class", "ev-slope-annotation")
        .attr("transform", `translate(${x(new Date(evLargestSlope.point.Year, 0, 1))}, ${y(evLargestSlope.point.Vehicles_Sold)})`);

      // Add annotation circle for EV
      evAnnotation.append("circle")
        .attr("r", 0)
        .attr("fill", "#FFD700")
        .attr("stroke", "#2E86AB")
        .attr("stroke-width", 3)
        .transition()
        .delay(2000)
        .duration(600)
        .attr("r", 8);

      // Add annotation arrow for EV
      evAnnotation.append("path")
        .attr("d", "M-15,-15 L-5,-5 M-15,-15 L-10,-20 M-15,-15 L-20,-10")
        .attr("stroke", "#FFD700")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("opacity", 0)
        .transition()
        .delay(2300)
        .duration(400)
        .attr("opacity", 1);

      // Add text annotation for EV
      const evTextGroup = evAnnotation.append("g")
        .attr("class", "ev-annotation-text")
        .attr("opacity", 0);

      // Background rectangle for text
      const evTextBg = evTextGroup.append("rect")
        .attr("x", -25)
        .attr("y", -45)
        .attr("width", 140)
        .attr("height", 40)
        .attr("rx", 5)
        .attr("fill", "rgba(46, 134, 171, 0.9)")
        .attr("stroke", "#FFD700")
        .attr("stroke-width", 2);

      // Main title text
      evTextGroup.append("text")
        .attr("x", -20)
        .attr("y", -32)
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text("🚀 Steepest Growth");

      // Growth rate text
      evTextGroup.append("text")
        .attr("x", -20)
        .attr("y", -20)
        .style("font-size", "10px")
        .style("fill", "white")
        .text(`+${evLargestSlope.slope.toLocaleString(undefined, {maximumFractionDigits: 0})} vehicles/year`);

      // Year text
      evTextGroup.append("text")
        .attr("x", -20)
        .attr("y", -8)
        .style("font-size", "10px")
        .style("fill", "white")
        .text(`From ${evLargestSlope.point.Year}`);

      // Animate text appearance
      evTextGroup
        .transition()
        .delay(2700)
        .duration(500)
        .attr("opacity", 1);
    }

    // Add PHEV largest slope annotation (only if it exists)
    if (phevLargestSlope) {
      const phevAnnotation = g.append("g")
        .attr("class", "phev-slope-annotation")
        .attr("transform", `translate(${x(new Date(phevLargestSlope.point.Year, 0, 1))}, ${y(phevLargestSlope.point.Vehicles_Sold)})`);

      // Add annotation circle for PHEV
      phevAnnotation.append("circle")
        .attr("r", 0)
        .attr("fill", "#FF6B35")
        .attr("stroke", "#F24236")
        .attr("stroke-width", 3)
        .transition()
        .delay(2200)
        .duration(600)
        .attr("r", 8);

      // Add annotation arrow for PHEV
      phevAnnotation.append("path")
        .attr("d", "M-15,-15 L-5,-5 M-15,-15 L-10,-20 M-15,-15 L-20,-10")
        .attr("stroke", "#FF6B35")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("opacity", 0)
        .transition()
        .delay(2500)
        .duration(400)
        .attr("opacity", 1);

      // Add text annotation for PHEV
      const phevTextGroup = phevAnnotation.append("g")
        .attr("class", "phev-annotation-text")
        .attr("opacity", 0);

      // Background rectangle for text
      const phevTextBg = phevTextGroup.append("rect")
        .attr("x", -25)
        .attr("y", -45)
        .attr("width", 140)
        .attr("height", 40)
        .attr("rx", 5)
        .attr("fill", "rgba(242, 66, 54, 0.9)")
        .attr("stroke", "#FF6B35")
        .attr("stroke-width", 2);

      // Main title text
      phevTextGroup.append("text")
        .attr("x", -20)
        .attr("y", -32)
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text("🚀 Steepest Growth");

      // Growth rate text
      phevTextGroup.append("text")
        .attr("x", -20)
        .attr("y", -20)
        .style("font-size", "10px")
        .style("fill", "white")
        .text(`+${phevLargestSlope.slope.toLocaleString(undefined, {maximumFractionDigits: 0})} vehicles/year`);

      // Year text
      phevTextGroup.append("text")
        .attr("x", -20)
        .attr("y", -8)
        .style("font-size", "10px")
        .style("fill", "white")
        .text(`From ${phevLargestSlope.point.Year}`);

      // Animate text appearance
      phevTextGroup
        .transition()
        .delay(2900)
        .duration(500)
        .attr("opacity", 1);
    }

    // Add legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(300, 20)`);

    // EV legend item
    const evLegend = legend.append("g")
      .attr("class", "legend-item");

    evLegend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#2E86AB")
      .attr("stroke-width", 3);

    evLegend.append("circle")
      .attr("cx", 10)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", "#2E86AB")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    evLegend.append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.32em")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text("Electric Vehicles (EV)");

    // PHEV legend item
    const phevLegend = legend.append("g")
      .attr("class", "legend-item")
      .attr("transform", "translate(0, 25)");

    phevLegend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#F24236")
      .attr("stroke-width", 3);

    phevLegend.append("circle")
      .attr("cx", 10)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", "#F24236")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    phevLegend.append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.32em")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text("Plug-in Hybrid (PHEV)");

    // Steepest slope legend
    const slopeLegend = legend.append("g")
      .attr("class", "legend-item")
      .attr("transform", "translate(0, 50)");

    slopeLegend.append("circle")
      .attr("cx", 10)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", "#FFD700")
      .attr("stroke", "#333")
      .attr("stroke-width", 2);

    slopeLegend.append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.32em")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text("🚀 Steepest Growth Point");

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .text("Vehicles Sold");

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .text("Year");

    console.log("Line chart created successfully with slope annotations!");
  }

  let defaultCountry = "USA";

  function updateChartForScene(sceneIndex) {
    if (sceneIndex === 0) {
      document.getElementById("previous").style.backgroundColor = 'grey';
      document.getElementById("next").style.backgroundColor = '';
      document.getElementById("next").disabled = false;
      createLineChart(evGlobalData, phevGlobalData);
    } else if (sceneIndex === 1) {
      document.getElementById("previous").style.backgroundColor = '';
      document.getElementById("next").style.backgroundColor = '';
      createBarChart(evphevCountryCumData);
    } else if (sceneIndex === 2) {
      document.getElementById("previous").style.backgroundColor = '';
      document.getElementById("next").style.backgroundColor = 'grey';
      document.getElementById('country-select').selectedIndex = 1;
      updateCountryChart(defaultCountry);
    }
  }

  function updateCountryChart(selectedCountry) {
    console.log("Select country is:" +selectedCountry);
    //console.log("phevCountryData:" +phevCountryData);
    const filtered_evCountryData = evCountryData.filter(d => d.Country === selectedCountry);
    //console.log("Data for select country is:" +filtered_evCountryData);
    const filtered_phevCountryData = phevCountryData.filter(d => d.Country === selectedCountry);
    createLineChartPerCountry(filtered_evCountryData, filtered_phevCountryData);
  }

}
