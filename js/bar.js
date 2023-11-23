var margin = {top: 20, right: 30, bottom: 40, left: 90},
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var svgBar = d3.select("#barChart")
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.json("https://raw.githubusercontent.com/DAVIHS23/g07/main/data/IQ_level.json", function(data) {

  // data.sort(function(a, b) {
  //   return a.IQ - b.IQ;
  // });
  
  var top20Data = data.slice(0, 20);

  top20Data.reverse()

  // Add Y axis
  var y = d3.scaleBand()
    .range([height, 0])
    .domain(top20Data.map(function (d) { return d.country; }))
    .padding(0.1);
  svgBar.append("g")
    .call(d3.axisLeft(y))

  // X axis
  var x = d3.scaleLinear()
    .domain([0, d3.max(top20Data, function (d) { return d.IQ; })])
    .range([0, width]);
  svgBar.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

    let mouseOver = function (d) {
      svgBar.selectAll("rect")
        .transition()
        .style("opacity", 0.5);
  
      d3.select(this)
        .transition()
        .style("opacity", 1)

      var tooltipContent = `
        <strong>${d.country}</strong><br>
        Rank: ${d.rank}<br>
        IQ: ${d.IQ}<br>
      `;

      tooltip.html(tooltipContent)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 30) + "px")
        .style("opacity", 1);
      
    };
  
    let mouseLeave = function (d) {
      svgBar.selectAll("rect")
        .transition()
        .style("opacity", 0.8);
  
      d3.select(this)
        .transition()
  
      tooltip.style("opacity", 0);
      
    };

  svgBar.selectAll("myRect")
    .data(top20Data)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function (d) { return y(d.country); })
    .attr("width", function (d) { return x(d.IQ); })
    .attr("height", y.bandwidth())
    .attr("fill", "#69b3a2")
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave)
});