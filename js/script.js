function update(selectedVar) {
  d3.json("https://raw.githubusercontent.com/DAVIHS23/g07/main/data/IQ_level.json", function (data) {
    data.sort(function (a, b) {
      return b[selectedVar] - a[selectedVar];
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

        var domainValues = d3.range(minValue, maxValue, (maxValue - minValue) / 7);
        console.log(domainValues);
        var colorScale = d3.scaleThreshold()
            .domain(domainValues)
            .range(d3.schemeGreens[8]);
            
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
    }).attr("height", y.bandwidth()).attr("fill", "#69b3a2");
  });
}
