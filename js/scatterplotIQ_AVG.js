// Filter out data points where avg_income is null
var dataIQSC = JSON.parse(JSON.stringify(dataIQ_));
dataIQSC = dataIQSC.filter(function(d) {
    return d.avg_income !== null;
});

// Quantile normalization function
var normalizeQuantile = function (data, key) {
    var values = data.map(function(d) { return d[key]; });
    values.sort(function(a, b) { return a - b; });

    return data.map(function(d) {
        d[key] = d3.quantile(values, (values.indexOf(d[key]) + 0.5) / values.length);
        return d;
    });
};

dataSC = normalizeQuantile(dataIQSC, 'IQ');
dataSC = normalizeQuantile(dataIQSC, 'avg_income');

var margin = { top: 10, right: 30, bottom: 30, left: 60 };
var width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var svgScatterplot = d3.select("#dataviz_iqandavg")
    .append("svg")
    .attr("id", "dataviz_quantileNormalized")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var XxScale = d3.scaleLinear().domain([d3.min(dataSC, d => d.IQ) - 5, d3.max(dataSC, d => d.IQ) + 10]).range([0, width]);
var YyScale = d3.scaleLinear().domain([d3.min(dataSC, d => d.avg_income) - 5000, d3.max(dataSC, d => d.avg_income) + 5000]).range([height, 0]);

// Add X axis
var XxAxis = svgScatterplot.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(XxScale));

// Add Y axis
svgScatterplot.append("g")
    .call(d3.axisLeft(YyScale));

// Add axis labels
svgScatterplot.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
    .style("text-anchor", "middle")
    .text("IQ");

svgScatterplot.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 5)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Average Income");

var clip = svgScatterplot.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

// Add brushing
var brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on("end", updateChart);

var scatter = svgScatterplot.append('g')
    .attr("clip-path", "url(#clip)");


// Color scale: give me a specie name, I return a color
// var color = d3.scaleOrdinal()
//     .domain(["setosa", "versicolor", "virginica" ])
//     .range([ "#440154ff", "#21908dff", "#fde725ff"])

// Add circles
scatter
    .selectAll("circle")
    .data(dataSC)
    .enter()
    .append("circle")
    .transition()
    .delay(function(d,i){return(i*3)})
    .duration(2000)
    .attr("cx", function (d) { return XxScale(d.IQ); })
    .attr("cy", function (d) { return YyScale(d.avg_income); })
    .attr("r", 5)
    .style("fill", "green")
    // .style("fill", function (d) { return color(d.Species) } )
    .style("opacity", 0.5);

// Add country names above the circles
scatter
    .selectAll("text.country-label")
    .data(dataSC)
    .enter()
    .append("text")
    .attr("class", "country-label")
    .text(function(d) { return d.country; })
    .transition()
    .delay(function(d,i){return(i*3)})
    .duration(2000)
    .attr("x", function(d) { return XxScale(d.IQ); })
    .attr("y", function(d) { return YyScale(d.avg_income) - 12; }) 
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "black");

scatter
    .append("g")
    .attr("class", "brush")
    .call(brush);

var idleTimeout;

function idled() {
    idleTimeout = null;
}

function updateChart() {
    var extent = d3.event.selection;

    if (!extent) {
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
        XxScale.domain([d3.min(dataSC, d => d.IQ), d3.max(dataSC, d => d.IQ)]);
    } else {
        XxScale.domain([XxScale.invert(extent[0]), XxScale.invert(extent[1])]);
        scatter.select(".brush").call(brush.move, null);
    }

    XxAxis.transition().duration(1000).call(d3.axisBottom(XxScale));
    scatter
        .selectAll("circle")
        .transition().duration(1000)
        .attr("cx", function (d) { return XxScale(d.IQ); })
        .attr("cy", function (d) { return YyScale(d.avg_income); });

    // Update country names during zoom
    scatter
        .selectAll("text.country-label")
        .attr("x", function(d) { return XxScale(d.IQ); })
        .attr("y", function(d) { return YyScale(d.avg_income) - 12; });
}