// frequency plot variables
var freq_plot_x;
var freq_plot_y;
var freq_plot_svg;
var freq_plot_line;
var freq_plot_width;

function initialize_frequency_plot() {

    const total_width = 700
    const total_height = 350
    const margin = {left: 50, top: 20, right: 80, bottom: 30}

    var width = total_width - margin.left - margin.right;
    var height = total_height - margin.top - margin.bottom;
    freq_plot_width = width;

    freq_plot_svg = d3.select("#plot").append("svg").attr("width", total_width).attr("height", total_height)
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    freq_plot_x = d3.scaleLinear().domain([1948, 2018]).range([0, width]);
    var xAxis = d3.axisBottom(freq_plot_x).tickFormat(d3.format("d"));
    freq_plot_svg.append("g").style("font", "15px times").attr("transform", "translate(0," + height + ")").attr("class", "xaxis").call(xAxis);

    freq_plot_y = d3.scaleLinear().range([height, 0]);
    freq_plot_svg.append("g").style("font", "15px times").attr("class", "yaxis");

    freq_plot_svg.append("rect").style("fill", "none").style("pointer-events", "all").attr("width", width).attr("height", height)
    .on("mouseover", freq_mouseover).on("mousemove", freq_mousemove).on("mouseout", freq_mouseout).attr("id","freq_rect");

    freq_plot_line = freq_plot_svg.append("g").append("path").attr("id","freq_line");

    freq_plot_svg.append("g").append("circle").style("fill", "black").attr("stroke", "black").attr("r", 2).style("opacity", 0).attr("id","freq_focus");

    freq_plot_svg.append("g").append("text").style("opacity", 0).attr("text-anchor", "left").attr("alignment-baseline", "middle").attr("font-size", 15).attr("id","freq_year");

    freq_plot_svg.append("g").append("text").style("opacity", 0).attr("text-anchor", "left").attr("alignment-baseline", "middle").attr("font-size", 15).attr("id","freq_measure");

}

function freq_mouseover() {
    d3.select("#freq_focus").style("opacity", 1);
    d3.select("#freq_year").style("opacity", 1);
    d3.select("#freq_measure").style("opacity", 1);
}

function freq_mouseout() {
    d3.select("#freq_focus").style("opacity", 0);
    d3.select("#freq_year").style("opacity", 0);
    d3.select("#freq_measure").style("opacity", 0);
}

function freq_mousemove() {
    var x  = d3.mouse(this)[0]
    var x0 = freq_plot_x.invert(x);
    var bisect = d3.bisector(function (d) { return d.year; }).left;
    var i = bisect(freq_data, x0, 1);

    var row = freq_data[i]
    var measure_text = "freq"

    line = document.getElementById("freq_line");
    var totlength = line.getTotalLength();
    var point = line.getPointAtLength((totlength*x)/freq_plot_width);
    var y = freq_plot_y.invert(point.y);

    // d3.select("#freq_focus").attr("cx", freq_plot_x(row.year)).attr("cy", freq_plot_y(+row[cur_title]));
    d3.select("#freq_focus").attr("cx", freq_plot_x(row.year)).attr("cy", freq_plot_y(y));
    d3.select("#freq_year").attr("x", freq_plot_x(row.year)).attr("y", freq_plot_y(+row[cur_title]) + 5).html("year : " + row.year);
    
    var measure_score = Number.parseFloat(+row[cur_title]).toExponential(2)
    d3.select("#freq_measure").attr("x", freq_plot_x(row.year)).attr("y", freq_plot_y(+row[cur_title]) + 25).html(measure_text + " : " + measure_score);
}

function update_frequency_plot(title) {

    var max_yvalue = d3.max(freq_data, function(d) {return +d[title]});
    var min_yvalue = d3.min(freq_data, function(d) {return +d[title]});

    freq_plot_y.domain([min_yvalue, max_yvalue]);
    var yAxis = d3.axisLeft().scale(freq_plot_y).tickFormat(d3.format(".0e"));
    freq_plot_svg.selectAll(".yaxis").transition().duration(1000).call(yAxis);

    freq_plot_line.datum(freq_data)
    .transition()
    .duration(1000)
    .attr(
        "d", d3.line()
        .x(function(d) {return freq_plot_x(+d.year)})
        .y(function(d) {return freq_plot_y(+d[title])})
        .curve(d3.curveBasis)
    )
    .attr("stroke", title_to_color[title])
    .style("stroke-width", 3)
    .style("fill", "none");
    
}