var selectedChoose = "IQ"
function update(selectedVar) {
  selectedChoose = selectedVar
  d3.json("https://raw.githubusercontent.com/DAVIHS23/g07/main/data/IQ_level.json", function (data) {
    data.sort(function (a, b) {
       // Compare based on the selected property
       const diff = b[selectedChoose] - a[selectedChoose];

       // If the selected property values are equal, compare based on the "country" property
       return diff !== 0 ? diff : a.country.localeCompare(b.country);
    });

    worldData.features.forEach(function (feature) {
        var iqData = data.find((iq) => iq.country === feature.properties.name);
        
        if (iqData) {
          feature.properties[selectedVar] = +iqData[selectedVar];
        } else {
          feature.properties[selectedVar] = null;
        }
      });
      
        var minValue = d3.min(data, d => +d[selectedVar]);
        var maxValue = d3.max(data, d => +d[selectedVar]);

        var domainValues = d3.range(minValue , maxValue,Math.round((maxValue - minValue) / 8));
        console.log(domainValues);
        if (selectedChoose == "IQ"){
          colorScale = d3.scaleThreshold()
            .domain(IQ_Domain)
            .range(d3.schemeBlues[8]);
        } else {
          colorScale = d3.scaleThreshold()
            .domain(domainValues)
            .range(d3.schemeBlues[8]);
        }
        
      

      svg.selectAll("path")
        .transition()
        .duration(1000)
        .attr("fill", function (d) {
          return d.properties[selectedVar] ? colorScale(d.properties[selectedVar]) : "gray";
        });

    var top20Data = data.slice(0, 20);
    top20Data.reverse();

    x.domain([0, d3.max(data, function (d) { return +d[selectedVar]; })]);
    y.domain(top20Data.map(function (d) { return d.country; }));

    svgBar.select(".x-axis").transition().duration(1000).call(xAxis);

    svgBar.select(".y-axis").transition().duration(1000).call(yAxis);

    var u = svgBar.selectAll(".myRect").data(top20Data);

    u.enter().append("rect").merge(u).transition().duration(1000).attr("x", 0).attr("y", function (d) {
      return y(d.country);
    }).attr("width", function (d) {
      return x(+d[selectedVar]);
    }).attr("height", y.bandwidth()).attr("fill", "#69b3a2")
    .attr("data-country", function (d) {
      return d.country;
    })
    ;
    updateLegend();
  });
}


// Function to create/update the legend
function updateLegend() {
  console.log(colorScale.range())
  // Remove existing legend items
  legendSvg.selectAll("*").remove();

  // Append rectangles and text for updated legend items
  legendSvg.selectAll("rect")
    .data(colorScale.range())
    .enter()
    .append("rect")
    .attr("x", 10)
    .attr("y", function (d, i) { return 20 * i; })
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", function (d) { return d; });

  legendSvg.selectAll("text")
    .data(colorScale.domain())
    .enter()
    .append("text")
    .attr("x", 40)
    .attr("y", function (d, i) { return 20 * i + 15; })
    .style("font-size", "12px")
    .text(function (d) { return d; });
}