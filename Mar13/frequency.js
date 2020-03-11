function initialization() {

    var colors;

    d3.csv("data/frequency.csv", function(freq_data) {

        var titles = freq_data.columns.slice(1);
        colors = d3.scaleOrdinal().domain(titles).range(d3.schemeSet2);

        d3.select("#select_title").selectAll("option").data(titles).enter().append("option")
        .text(function (d) {return d})
        .attr("value", function (d) {return d});

        d3.select("#select_title").on("change", function (d) {
            var selected_title = d3.select(this).property("value");
            update_plots(selected_title);
        });

    })

    return colors;

}

function update_plots(selected_title) {
    console.log(selected_title);
}

function frequency() {

    const total_width = 800
    const total_height = 400

    var margin = {left: 50, top: 20, right: 80, bottom: 30}

    var width = total_width - margin.left - margin.right
    var height = total_height - margin.top - margin.bottom

    var svg = d3.select("#frequency").append("svg").attr("width", total_width).attr("height", total_height)
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().domain([1948, 2018]).range([0, width]);
    var xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
    svg.append("g").style("font", "15px times").attr("transform", "translate(0," + height + ")").attr("class", "xaxis").call(xAxis)

    var y = d3.scaleLinear().range([height, 0]);
    var yAxis = d3.axisLeft().scale(y).tickFormat(d3.format(".0e"));
    svg.append("g").style("font", "15px times").attr("class", "yaxis")

    var cur_title = "p1";

    var focus = svg.append("g").append("circle").style("fill", "black").attr("stroke", "black").attr("r", 2).style("opacity", 0);

    d3.csv("data/frequency.csv", function(freq_data) {

        var titles = freq_data.columns.slice(1);
        var colors = d3.scaleOrdinal().domain(titles).range(d3.schemeSet2);

        d3.select("#select_title").selectAll("option").data(titles).enter().append("option").text(function (d) {return d}).attr("value", function (d) {return d});

        svg.append("rect").style("fill", "none").style("pointer-events", "all").attr("width", width).attr("height", height)
        .on("mouseover", mouseover).on("mousemove", mousemove).on("mouseout", mouseout);

        var bisect = d3.bisector(function (d) { return d.year; }).left;

        d3.select("#select_title").on("change", function (d) {
            var selected_title = d3.select(this).property("value");
            cur_title = selected_title;
            update_plot(cur_title);
        });

        var max_yvalue = d3.max(freq_data, function(d) {return +d[cur_title]});
        var min_yvalue = d3.min(freq_data, function(d) {return +d[cur_title]});

        y.domain([min_yvalue, max_yvalue]);
        svg.selectAll(".yaxis").call(yAxis);

        var line = svg.append("g").append("path").datum(freq_data)
        .attr(
            "d", d3.line()
            .x(function(d) {return x(+d.year)})
            .y(function(d) {return y(+d[cur_title])})
            .curve(d3.curveBasis)
        )
        .attr("stroke", colors(cur_title))
        .style("stroke-width", 3)
        .style("fill", "none");

        var row_index = freq_data.findIndex(function (row) {return row.title == cur_title});
        var row = freq_data[row_index];
        
        var yearText = svg.append("g").append("text").style("opacity", 0).attr("text-anchor", "left").attr("alignment-baseline", "middle").attr("font-size", 15);
        var measureText = svg.append("g").append("text").style("opacity", 0).attr("text-anchor", "left").attr("alignment-baseline", "middle").attr("font-size", 15);

        function update_plot(title) {

            var max_yvalue = d3.max(freq_data, function(d) {return +d[title]});
            var min_yvalue = d3.min(freq_data, function(d) {return +d[title]});
            y.domain([min_yvalue, max_yvalue]);
            svg.selectAll(".yaxis").transition().duration(2000).call(yAxis);

            line.datum(freq_data)
            .transition()
            .duration(2000)
            .attr(
                "d", d3.line()
                .x(function(d) {return x(+d.year)})
                .y(function(d) {return y(+d[title])})
                .curve(d3.curveBasis)
            )
            .attr("stroke", colors(title))
            .style("stroke-width", 3)
            .style("fill", "none");

            
        }

        function mouseover() {
            // focus.style("opacity", 1);
            yearText.style("opacity", 1);
            measureText.style("opacity", 1);
        }

        function mouseout() {
            // focus.style("opacity", 0);
            yearText.style("opacity", 0);
            measureText.style("opacity", 0);
        }

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]);
            var i = bisect(freq_data, x0, 1)
            row = freq_data[i]
            measure_text = "freq"
            // focus.attr("cx", x(row.year)).attr("cy", y(+row[cur_title]));
            yearText.attr("x", x(row.year)).attr("y", y(+row[cur_title]) + 5).html("year : " + row.year);
            var measure_score = Number.parseFloat(+row[cur_title]).toExponential(2)
            measureText.attr("x", x(row.year)).attr("y", y(+row[cur_title]) + 25).html(measure_text + " : " + measure_score);
        }

    })

}

// window.frequency();
colors = window.initialization();
console.log(colors);