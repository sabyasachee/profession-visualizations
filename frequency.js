const total_width = 1300
const total_height = 700

var margin = {left: 100, top: 100, right: 200, bottom: 100}

var width = total_width - margin.left - margin.right
var height = total_height - margin.top - margin.bottom

var svg = d3.select("#plot").append("svg").attr("width", total_width).attr("height", total_height)
.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear().domain([1948, 2020]).range([0, width]);
var xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
svg.append("g").attr("transform", "translate(0," + height + ")").attr("class", "xaxis").call(xAxis)

var y = d3.scaleLinear().range([height, 0]);
var yAxis = d3.axisLeft().scale(y);
svg.append("g").attr("class", "yaxis")

var cur_title = "3", cur_measure = "per_word";

var focus = svg.append("g").append("circle").style("fill", "black").attr("stroke", "black").attr("r", 4).style("opacity", 0);

d3.csv("data/noccur_per_word.csv", function(freq1) { 
d3.csv("data/noccur_per_movie.csv", function(freq2) {
d3.csv("data/noccur_per_word_coeff.csv", function(coeff1) {
d3.csv("data/noccur_per_movie_coeff.csv", function(coeff2) {

    var titles = freq1.columns.slice(1);

    var colors = d3.scaleOrdinal().domain(titles).range(d3.schemeSet2);

    d3.select("#select_title").selectAll("option").data(titles).enter().append("option").text(function (d) {return d}).attr("value", function (d) {return d});

    svg.append("rect").style("fill", "none").style("pointer-events", "all").attr("width", width).attr("height", height)
    .on("mouseover", mouseover).on("mousemove", mousemove).on("mouseout", mouseout);

    var bisect = d3.bisector(function (d) { return d.year; }).left;

    d3.select("#select_title").on("change", function (d) {
        var selected_title = d3.select(this).property("value");
        cur_title = selected_title;
        update_plot(cur_title, cur_measure);
    });

    d3.select("#select_measure").on("change", function(d) {
        var selected_measure = d3.select(this).property("value");
        cur_measure = selected_measure;
        update_plot(cur_title, cur_measure);
    });

    var max_yvalue = d3.max(freq1, function(d) {return +d[cur_title]});
    var min_yvalue = d3.min(freq1, function(d) {return +d[cur_title]})
    y.domain([min_yvalue, max_yvalue]);
    svg.selectAll(".yaxis").call(yAxis);

    var line = svg.append("g").append("path").datum(freq1)
    .attr(
        "d", d3.line()
        .x(function(d) {return x(d.year)})
        .y(function(d) {return y(+d[cur_title])})
        .curve(d3.curveBasis)
    )
    .attr("stroke", colors(cur_title))
    .style("stroke-width", 4)
    .style("fill", "none");

    var row_index = coeff1.findIndex(function (row) {return row.title == cur_title});
    var row = coeff1[row_index];
    var y1 = Number(row.slope) * 1950 + Number(row.intercept), y2 = Number(row.slope) * 2017 + Number(row.intercept);

    var regression_line = svg.append("line").attr("class", "regression")
    .attr("x1", x(1950)).attr("x2", x(2017)).attr("y1", y(y1)).attr("y2", y(y2))
    .style("stroke", colors(cur_title)).style("stroke-width", 6).style("stroke-dasharray", ("5, 10"));

    var yearText = svg.append("g").append("text").style("opacity", 0).attr("text-anchor", "left").attr("alignment-baseline", "middle").attr("font-size", 20);
    var measureText = svg.append("g").append("text").style("opacity", 0).attr("text-anchor", "left").attr("alignment-baseline", "middle").attr("font-size", 20);

    function update_plot(title, measure) {
        if (measure == "per_word") {
            freq = freq1
            coeff = coeff1
        } else {
            freq = freq2
            coeff = coeff2
        }

        var max_yvalue = d3.max(freq, function(d) {return +d[title]});
        var min_yvalue = d3.min(freq, function(d) {return +d[title]});
        y.domain([min_yvalue, max_yvalue]);
        svg.selectAll(".yaxis").transition().duration(2000).call(yAxis);

        line.datum(freq)
        .transition()
        .duration(2000)
        .attr(
            "d", d3.line()
            .x(function(d) {return x(d.year)})
            .y(function(d) {return y(+d[title])})
            .curve(d3.curveBasis)
        )
        .attr("stroke", colors(title))
        .style("stroke-width", 4)
        .style("fill", "none");

        var row_index = coeff.findIndex(function (row) {return row.title == title});
        var row = coeff[row_index];
        var y1 = Number(row.slope) * 1950 + Number(row.intercept), y2 = Number(row.slope) * 2017 + Number(row.intercept);

        regression_line
        .transition().duration(2000)
        .attr("x1", x(1950)).attr("x2", x(2017)).attr("y1", y(y1)).attr("y2", y(y2))
        .style("stroke", colors(title)).style("stroke-width", 6).style("stroke-dasharray", ("5, 10"));
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
        var i = bisect(freq1, x0, 1)
        if (cur_measure == "per_word") {
            row = freq1[i]
            measure_text = "freq/word"
        } else {
            row = freq2[i]
            measure_text = "freq/movie"
        }
        // focus.attr("cx", x(row.year)).attr("cy", y(+row[cur_title]));
        yearText.attr("x", x(row.year)).attr("y", y(+row[cur_title]) + 5).html("year : " + row.year);
        var measure_score = Number.parseFloat(+row[cur_title]).toExponential(2)
        measureText.attr("x", x(row.year)).attr("y", y(+row[cur_title]) + 25).html(measure_text + " : " + measure_score);
    }

})
})
})
})