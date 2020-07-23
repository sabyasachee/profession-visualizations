// frequency plot variables
var freq_plot_x;
var freq_plot_y;
var freq_plot_svg;
var freq_plot_line;
var freq_plot_width;

function initialize_frequency_plot() {

    const total_width = 700
    const total_height = 350
    const margin = {left: 60, top: 60, right: 80, bottom: 30}

    var width = total_width - margin.left - margin.right;
    var height = total_height - margin.top - margin.bottom;
    freq_plot_width = width;

    freq_plot_svg = d3.select("#plot").append("svg").attr("width", total_width).attr("height", total_height)
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    freq_plot_svg.append("g").append("text").style("opacity", 1).attr("text-anchor", "center").attr("alignment-baseline", "middle").attr("font-size", 20).attr("x", width/3).attr("y", 0).html("Frequency vs Time");

    freq_plot_svg.append("g").append("text").attr("text-anchor", "center").attr("alignment-baseline", "middle").attr("id","freq_pho").attr("font-size", 15).attr("x", width/3).attr("y", 20)

    freq_plot_x = d3.scaleLinear().domain([1948, 2018]).range([0, width]);
    var xAxis = d3.axisBottom(freq_plot_x).tickFormat(d3.format("d"));
    freq_plot_svg.append("g").style("font", "15px times").attr("transform", "translate(0," + height + ")").attr("class", "xaxis").call(xAxis);

    freq_plot_y = d3.scaleLinear().range([height, 0]);
    freq_plot_svg.append("g").style("font", "15px times").attr("class", "yaxis");

    freq_plot_svg.append("rect").style("fill", "none").style("pointer-events", "all").attr("width", width).attr("height", height).attr("id","freq_rect");

    freq_plot_line = freq_plot_svg.append("g").append("path").attr("id","freq_line");
}

function update_frequency_plot(title) {

    var max_yvalue = d3.max(freq_data, function(d) {return +d[title]});
    var min_yvalue = d3.min(freq_data, function(d) {return +d[title]});

    freq_plot_y.domain([min_yvalue, max_yvalue]);
    var yAxis = d3.axisLeft().scale(freq_plot_y).tickFormat(d3.format(".2e"));
    freq_plot_svg.selectAll(".yaxis").transition().duration(1000).call(yAxis);

    if (stat_data[title]["freq"] > 0) {
        d3.select("#freq_pho").html("freq vs time &rho; = " + stat_data[title]["freq"].toFixed(2)).style("fill", "green");
    }
    else if (stat_data[title]["freq"] < 0) {
        d3.select("#freq_pho").html("freq vs time &rho; = " + stat_data[title]["freq"].toFixed(2)).style("fill", "red");
    }
    else {
        d3.select("#freq_pho").html("");
    }

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