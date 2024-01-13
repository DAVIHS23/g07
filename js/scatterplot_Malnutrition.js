// Set up the chart dimensions
var margin = { top: 10, right: 30, bottom: 30, left: 60 };
var width = 700 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
var Svg = d3.select("#dataviz_underweightbyCountry")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Function to update chart based on selected country
function updateChart() {
    // Read the data dynamically or based on user interaction
    d3.csv("https://raw.githubusercontent.com/DAVIHS23/g07/main/data/merge_output.csv", function (data) {
        // var selectedCountry = document.getElementById("countryname").textContent;
        var selectedCountry = "Brunei Darussalam";
        
        var countryData = data.filter(function (d) {
            return d.Country === selectedCountry;
        });

        // Extract unique values for X and Y axes
        var xValues = countryData.map(function (d) { return +d.Year; });
        var yValues = countryData.map(function (d) { return +d.Value; });

        // Update X and Y domains
        var x = d3.scaleLinear().domain([d3.min(xValues), d3.max(xValues)]).range([0, width]);
        var y = d3.scaleLinear().domain([d3.min(yValues), d3.max(yValues)]).range([height, 0]);

        // Add X axis
        Svg.select(".x-axis").remove(); // Remove existing X axis to update
        Svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Format ticks as integers

        // Add Y axis
        Svg.select(".y-axis").remove(); // Remove existing Y axis to update
        Svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).tickFormat(d3.format(".2f"))); // Format ticks as two decimal places

        // Add X Axis Label
        Svg.select(".x-axis-label").remove(); // Remove existing X axis label to update
        Svg.append("text")
            .attr("class", "x-axis-label")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Year");

        // Add Y Axis Label
        Svg.select(".y-axis-label").remove(); // Remove existing Y axis label to update
        Svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Value");

        // Add circles
        var circles = Svg.selectAll("circle")
            .data(countryData);

        circles.exit().remove(); // Remove any extra circles if needed

        circles.enter()
            .append("circle")
            .merge(circles) // Update existing circles
            .attr("cx", function (d) { return x(+d.Year); })
            .attr("cy", function (d) { return y(+d.Value); })
            .attr("r", 8)
            .style("fill", "blue")
            .style("opacity", 0.5);

        // Add brush
        var brush = d3.brush()
            .extent([[0, 0], [width, height]])
            .on("end", brushended);

        Svg.select(".brush").remove(); // Remove existing brush to update
        Svg.append("g")
            .attr("class", "brush")
            .call(brush);

        function brushended() {
            var selection = d3.event.selection;
            if (!selection) return; // Ignore empty selections

            var [x0, y0] = selection[0];
            var [x1, y1] = selection[1];

            // Filter data based on the brush selection
            var brushedData = countryData.filter(function (d) {
                var cx = x(+d.Year);
                var cy = y(+d.Value);
                return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
            });

            // Update the scatterplot with the brushed data
            updateScatterplot(brushedData);
        }

        function updateScatterplot(brushedData) {
            // Update circles with the brushed data
            circles.data(brushedData)
                .transition().duration(1000)
                .attr("cx", function (d) { return x(+d.Year); })
                .attr("cy", function (d) { return y(+d.Value); });
        }
    });
}

// Initial chart setup
updateChart();