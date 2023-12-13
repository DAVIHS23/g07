var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = window.innerWidth - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var Svg = d3
  .select("#dataviz_underweightbyCountry")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv(
  "https://raw.githubusercontent.com/DAVIHS23/g07/main/data/merge_output.csv",
  function (data) {
    var scatterData = data;

    var x = d3.scaleLinear().range([0, width]);
    var xAxis = Svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(d3.timeYear.every(10)).tickFormat(d3.format("d")));

    scatterData.forEach(function (d) {
      d.Year = +d.Year;
    });


    x.domain([
      d3.min(scatterData, function (d) { return +d.Year; }),
      d3.max(scatterData, function (d) { return +d.Year; })
    ]).nice();

    var y = d3.scaleLinear().range([height, 0]);

    y.domain([
      d3.min(scatterData, function (d) { return +d.Value; }),
      d3.max(scatterData, function (d) { return +d.Value; })
    ]).nice();

    Svg.append("g").call(d3.axisLeft(y));

    var clip = Svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);

    var color = d3.scaleOrdinal().range(["#440154ff", "#21908dff", "#fde725ff"]);

    var brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("end", updateChart);

    var scatter = Svg.append('g')
      .attr("clip-path", "url(#clip)");

    Svg.append("g")
      .attr("class", "brush")
      .call(brush);

    var idleTimeout;

    function idled() {
      idleTimeout = null;
    }

    function updateChart() {
      extent = d3.event.selection;

      if (!extent) {
        if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
        x.domain([
          d3.min(scatterData, function (d) { return +d.Year; }),
          d3.max(scatterData, function (d) { return +d.Year; })
        ]).nice();
      } else {
        x.domain([x.invert(extent[0]), x.invert(extent[1])]);
        Svg.select(".brush").call(brush.move, null);
      }

      xAxis.call(d3.axisBottom(x).ticks(d3.timeYear.every(10)).tickFormat(d3.format("d")));

      scatter
        .selectAll("circle")
        .attr("cx", function (d) {
          return x(d.Year);
        })
        .attr("cy", function (d) {
          return y(d.Value);
        });
    }

    var selectedCountry = "Japan";
    updateScatterplotForCountry(selectedCountry);

    function updateScatterplotForCountry(country) {
      var selectedCountryData = scatterData.filter(function (d) {
        return d.Country === country;
      });

      if (selectedCountryData.length > 0) {
        x.domain(d3.extent(scatterData, function (d) {
          return +d.Year;
        })).nice();

        y.domain(d3.extent(scatterData, function (d) {
          return +d.Value;
        })).nice();

        xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(d3.timeYear.every(10)).tickFormat(d3.format("d")));

        Svg.select("g.axisY").transition().duration(1000).call(d3.axisLeft(y));

        var scatterSelection = scatter.selectAll("circle").data(selectedCountryData);

        scatterSelection
          .transition()
          .duration(1000)
          .attr("cx", function (d) {
            return x(+d.Year);
          })
          .attr("cy", function (d) {
            return y(+d.Value);
          });

        scatterSelection
          .enter()
          .append("circle")
          .attr("cx", function (d) {
            return x(+d.Year);
          })
          .attr("cy", function (d) {
            return y(+d.Value);
          })
          .attr("r", 8)
          .style("fill", function (d) {
            return color(d.Country);
          });

        scatterSelection.exit().remove();
      } else {
        console.error("Daten für das ausgewählte Land nicht gefunden:", country);
      }
    }
  }
);
