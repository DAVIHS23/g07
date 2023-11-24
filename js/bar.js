var margin = { top: 20, right: 30, bottom: 40, left: 90 },
  width = 1000 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom;
  
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleBand().range([height, 0]).padding(0.1);

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

var svgBar = d3
  .select("#barChart")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("https://raw.githubusercontent.com/DAVIHS23/g07/main/data/IQ_level.json", function (data) {
  var top20Data = data.slice(0, 20);
  top20Data.reverse();

  x.domain([0, d3.max(top20Data, function (d) { return d.IQ; })]);
  y.domain(top20Data.map(function (d) { return d.country; }));

  svgBar.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

  svgBar.append("g").attr("class", "x-axis").attr("transform", "translate(0," + height + ")").call(xAxis);

  svgBar
    .selectAll(".myRect")
    .data(top20Data)
    .enter()
    .append("rect")
    .attr("class", "myRect") 
    .attr("x", 0)
    .attr("y", function (d) {
      return y(d.country);
    })
    .attr("width", function (d) {
      return x(d.IQ);
    })
    .attr("height", y.bandwidth())
    .attr("fill", "#69b3a2")
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave);

  function mouseOver(d) {
    svgBar.selectAll(".myRect") 
      .transition()
      .style("opacity", 0.5);

    d3.select(this)
      .transition()
      .style("opacity", 1);

    var tooltipContent = `
      <strong>${d.country}</strong><br>
      Rank: ${d.rank}<br>
      IQ: ${d.IQ}<br>
    `;

    tooltip
      .html(tooltipContent)
      .style("left", d3.event.pageX + 10 + "px")
      .style("top", d3.event.pageY - 30 + "px")
      .style("opacity", 1);
  }

  function mouseLeave(d) {
    svgBar.selectAll(".myRect")
      .transition()
      .style("opacity", 0.8);

    d3.select(this)
      .transition();

    tooltip.style("opacity", 0);
  }
});

function update(selectedVar) {
  d3.json("https://raw.githubusercontent.com/DAVIHS23/g07/main/data/IQ_level.json", function (data) {
    data.sort(function (a, b) {
      return b[selectedVar] - a[selectedVar];
    });

    var top20Data = data.slice(0, 20);

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

