// Combine datasets based on common country names
var combinedData = dataIQ_M.map(function(dIQ) {
    var matchingData = dataMalNutrition.find(function(dMalNutrition) {
      return dIQ.country.toUpperCase() === dMalNutrition.Country.toUpperCase();
    });

    if (matchingData) {
      return {
        country: dIQ.country,
        IQ: dIQ.IQ,
        Underweight: matchingData.Underweight
      };
    } else {
      return null; // Exclude countries with no match
    }
}).filter(Boolean);

// Filter out data points where IQ is null
// Filter out data points where IQ is nul
console.log(combinedData)


 // Set up the chart dimensions
 var margin = { top: 10, right: 30, bottom: 30, left: 60 };
 width = 700 - margin.left - margin.right,
 height = 400 - margin.top - margin.bottom;

// Create SVG container
var svgScatterplotMal = d3.select("#dataviz_iqandunderweight")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set up the scales
var xScaleMal = d3.scaleLinear().domain([50, 110]).range([0, width]);
var yScaleMal = d3.scaleLinear().domain([0, 45]).range([height, 0]);

// Add x-axis
var XxAxisMal = svgScatterplotMal.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScaleMal));

// Add Y axis
svgScatterplotMal.append("g")
    .call(d3.axisLeft(yScaleMal));

// Add axis labels
svgScatterplotMal.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
    .style("text-anchor", "middle")
    .text("IQ");

svgScatterplotMal.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 5)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Underweight (%)");

var clip = svgScatterplotMal.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

// Add brushing
var brushMal = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on("end", updateChartMal);

var scatterMal = svgScatterplotMal.append('g')
    .attr("clip-path", "url(#clip)");


// Color scale: give me a specie name, I return a color
// var color = d3.scaleOrdinal()
//     .domain(["setosa", "versicolor", "virginica" ])
//     .range([ "#440154ff", "#21908dff", "#fde725ff"])

// Add circles
scatterMal
    .selectAll("circle")
    .data(combinedData)
    .enter()
    .append("circle")
    .transition()
    .delay(function(d,i){return(i*3)})
    .duration(2000)
    .attr("cx", function (d) { return xScaleMal(d.IQ); })
    .attr("cy", function (d) { return yScaleMal(d.Underweight); })
    .attr("r", 5)
    .style("fill", "blue")
    // .style("fill", function (d) { return color(d.Species) } )
    .style("opacity", 0.5);

// Add country names above the circles
scatterMal
    .selectAll("text.country-label")
    .data(combinedData)
    .enter()
    .append("text")
    .attr("class", "country-label")
    .text(function(d) { return d.country; })
    .transition()
    .delay(function(d,i){return(i*3)})
    .duration(2000)
    .attr("x", function(d) { return xScaleMal(d.IQ); })
    .attr("y", function(d) { return yScaleMal(d.Underweight) - 12; }) 
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "black");

scatterMal
    .append("g")
    .attr("class", "brush")
    .call(brushMal);

var idleTimeoutMal;

function idledMal() {
    idleTimeoutMal = null;
}

function updateChartMal() {
    var extent = d3.event.selection;

    if (!extent) {
        if (!idleTimeoutMal) return idleTimeoutMal = setTimeout(idledMal, 350);
        xScaleMal.domain([d3.min(combinedData, d => d.IQ), d3.max(combinedData, d => d.IQ)]);
    } else {
        xScaleMal.domain([xScaleMal.invert(extent[0]), xScaleMal.invert(extent[1])]);
        scatterMal.select(".brush").call(brushMal.move, null);
    }

    XxAxisMal.transition().duration(1000).call(d3.axisBottom(xScaleMal));
    scatterMal
        .selectAll("circle")
        .transition().duration(1000)
        .attr("cx", function (d) { return xScaleMal(d.IQ); })
        .attr("cy", function (d) { return yScaleMal(d.Underweight); });

    // Update country names during zoom
    scatterMal
        .selectAll("text.country-label")
        .attr("x", function(d) { return xScaleMal(d.IQ); })
        .attr("y", function(d) { return yScaleMal(d.Underweight) - 12; });
}