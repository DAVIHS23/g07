var selectedChoose = "IQ"
function update(selectedVar) {
  selectedChoose = selectedVar
  d3.json("https://raw.githubusercontent.com/DAVIHS23/g07/main/data/IQ_level.json", function (data) {
    data.sort(function (a, b) {
      const diff = b[selectedChoose] - a[selectedChoose];

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

    var domainValues = d3.range(minValue, maxValue, Math.round((maxValue - minValue) / 8));
    if (selectedChoose == "IQ") {
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
    }).attr("height", y.bandwidth()).attr("fill", "#6baed6")
      .attr("data-country", function (d) {
        return d.country;
      })
      ;
    updateLegend();
  });
}

function updateScatterplot(countryName) {
  d3.csv("https://raw.githubusercontent.com/DAVIHS23/g07/main/data/merge_output.csv", function (data) {

    var countryData = data.filter(function (d) {
      return d.Country === countryName;
    });

    var xValues = countryData.map(function (d) { return +d.Year; });
    var yValues = countryData.map(function (d) { return +d.Value; });

    var x = d3.scaleLinear().domain([d3.min(xValues), d3.max(xValues)]).range([0, width]);
    var y = d3.scaleLinear().domain([d3.min(yValues), d3.max(yValues)]).range([height, 0]);

    Svg.select(".x-axis").remove();
    Svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    Svg.select(".y-axis").remove();
    Svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).tickFormat(d3.format(".2f")));

    Svg.select(".x-axis-label").remove();
    Svg.append("text")
      .attr("class", "x-axis-label")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Year");

    Svg.select(".y-axis-label").remove();
    Svg.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Value");

    var circles = Svg.selectAll("circle")
      .data(countryData);

    circles.exit().remove();

    circles.enter()
      .append("circle")
      .merge(circles)
      .attr("cx", function (d) { return x(+d.Year); })
      .attr("cy", function (d) { return y(+d.Value); })
      .attr("r", 8)
      .style("fill", "blue")
      .style("opacity", 0.5);

    var brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("end", brushended);

    Svg.select(".brush").remove();
    Svg.append("g")
      .attr("class", "brush")
      .call(brush);

    function brushended() {
      var selection = d3.event.selection;
      if (!selection) return;

      var [x0, y0] = selection[0];
      var [x1, y1] = selection[1];

      var brushedData = countryData.filter(function (d) {
        var cx = x(+d.Year);
        var cy = y(+d.Value);
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
      });

      updateScatterplot(brushedData);
    }

    function updateScatterplot(brushedData) {
      circles.data(brushedData)
        .transition().duration(1000)
        .attr("cx", function (d) { return x(+d.Year); })
        .attr("cy", function (d) { return y(+d.Value); });
    }
  });

}


function updateLegend() {
  let valueOfInfo = "undefined";

  switch (selectedChoose) {
    case "IQ":
      valueOfInfo = " IQ";
      break;
    case "education_expenditure":
      valueOfInfo = " $";
      break;
    case "avg_income":
      valueOfInfo = " $";
      break;
    case "avg_temp":
      valueOfInfo = " °C";
      break;
  }

  legendSvg.selectAll("*").remove();

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
    .text(function (d) { return d + valueOfInfo; });
}