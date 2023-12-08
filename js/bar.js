var margin = { top: 20, right: 30, bottom: 40, left: 90 },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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

  x.domain([0, d3.max(top20Data, function (d) { return d.IQ; })]);
  y.domain(top20Data.map(function (d) { return d.country; })).padding(0.2);

  svgBar.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

  svgBar.append("g").attr("class", "x-axis").attr("transform", "translate(0," + height + ")").call(xAxis);

  svgBar
    .selectAll(".myRect")
    .data(top20Data)
    .enter()
    .append("rect")
    .attr("class", "myRect") 
    .attr("x", 0)
    .attr("data-country", function (d) {
      return d.country;
    })
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

  svgBar.select(".x-axis")
    .attr("transform", "translate(0," + (height + 5) + ")")
    .call(xAxis);




