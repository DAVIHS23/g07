
var worldData;
var data = dataIQ_
var top20Data = data.slice(0, 20);
top20Data.reverse();
var svg = d3.select("#iq_map"),
  width = +svg.attr("width"),
  height = +svg.attr("height");
var path = d3.geoPath();
var projection = d3.geoNaturalEarth2()
  .scale(150)
  .center([0, 20])
  .translate([width / 2, height / 2]);

var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([50, 60, 70, 80, 90, 95, 100, 105])  
  .range(d3.schemeGreens[8]); 

d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
  .defer(d3.csv, "https://raw.githubusercontent.com/DAVIHS23/g07/main/data/IQ_level.csv")
  .await(ready);


function ready(error, topo, IQLevelData) {
  
  worldData = topo
  worldData.features = worldData.features.filter(function (d) {
    return d.properties.name !== "Antarctica";
  });

  let mouseOver = function (d) {
    d3.selectAll(".Country")
      .transition()
      .duration(100)
      .style("opacity", 0.5);

    d3.select(this)
      .transition()
      .duration(50)
      .style("opacity", 1)
      .style("stroke", "black");

    var iqData = IQLevelData.find((iq) => iq.country === d.properties.name);

    // Remove highlighting from the corresponding bar in the bar chart
    var bar = svgBar.select(".myRect[data-country='" + d.properties.name + "']");
      if (bar) {
          bar.transition().style("opacity", 0.2);
      }
      
      var isNotInTop20 = top20Data.findIndex((item) => item.country === d.properties.name) === -1;
      var top = [...top20Data];

      if (isNotInTop20) {
        console.log("asd")
        // Replace the last country in the bar chart with the current country
        top[0] = iqData
        console.log(top20Data)

        y.domain(top.map(function (d) { return d.country; }));


        svgBar.select(".y-axis").transition().duration(1000).call(yAxis);

        var u = svgBar.selectAll(".myRect").data(top);
        // Update the existing bars
        // svgBar.selectAll(".myRect")
        //   .data(top20Data)
        //   .transition()
        //   .attr("y", function (d) {
        //       return y(d.country);
        //   })
        //   .attr("width", function (d) {
        //       return x(d.IQ);
        //   });


        svgBar.selectAll(".myRect[data-country='" + top20Data[0].country + "']")
          .data(top)
          .filter(function (d) {
              // Filter the selection based on the condition (e.g., matching the selected country)
              return top[0].country;
          })
          .transition()
          .attr("y", function (d) {
              return y(top[0].country);
          })
          .attr("width", function (d) {
              return x(top[0].IQ);
          });

    }


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
    var bar = svgBar.select(".myRect[data-country='" + d.properties.name + "']");
    if (bar) {
        bar.transition().style("opacity", 0.8);
    }
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", 1);

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
      return iqData ? colorScale(iqData.IQ) : "gray";
    })
    .style("stroke", "transparent")
    .attr("class", function (d) { return "Country" })
    .style("opacity", 0.8)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave);
  
}

var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

  



  