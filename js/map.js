
var worldData;

// The svg
var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(100)
  .center([0, 20])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([50, 60, 70, 80, 90, 95, 100, 105])  // Adjust as needed
  .range(d3.schemeGreens[8]); 

// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
  .defer(d3.json, "https://raw.githubusercontent.com/DAVIHS23/g07/main/data/IQ_level.json")
  .await(ready);


function ready(error, topo, IQLevelData) {
  worldData = topo
  worldData.features = worldData.features.filter(function (d) {
    return d.properties.name !== "Antarctica";
  });

  let mouseOver = function (d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", 0.5);

    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black");

    var iqData = IQLevelData.find((iq) => iq.country === d.properties.name);
    console.log(d.properties.name)

    if (iqData) {
      var tooltipContent = `
        <strong>${iqData.country}</strong><br>
        Rank: ${iqData.rank}<br>
        IQ: ${iqData.IQ}<br>
      `;

      tooltip.html(tooltipContent)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 30) + "px")
        .style("opacity", 1);
    } else {
      var tooltipContent = `
        <strong>${d.properties.name}</strong><br>
        Rank: undefined<br>
        IQ: undefined<br>
      `;

      tooltip.html(tooltipContent)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 30) + "px")
        .style("opacity", 1); 
    }
  };

  let mouseLeave = function (d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", 0.8);

    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "transparent");

    tooltip.style("opacity", 0);
    
  };

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(worldData.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", function (d) {
      var iqData = IQLevelData.find((iq) => iq.country === d.properties.name);
      return iqData ? colorScale(iqData.IQ) : "gray";  // Default to gray if no IQ data is available
    })
    .style("stroke", "transparent")
    .attr("class", function (d) { return "Country" })
    .style("opacity", 0.8)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave);
  
}

// Define a tooltip div
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


  