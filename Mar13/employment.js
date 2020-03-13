// employment plot variables
var emp_plot_x;
var emp_plot_y;
var emp_plot_svg;
var emp_plot_line;

function initialize_employment_plot() {
    const total_width = 700
    const total_height = 350
    const margin = {left: 50, top: 20, right: 80, bottom: 30}

    var width = total_width - margin.left - margin.right
    var height = total_height - margin.top - margin.bottom

    emp_plot_svg = d3.select("#plot").append("svg").attr("width", total_width).attr("height", total_height)
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    emp_plot_x = d3.scaleLinear().domain([1999, 2018]).range([0, width]);
    var xAxis = d3.axisBottom(emp_plot_x).tickFormat(d3.format("d"));
    emp_plot_svg.append("g").style("font", "15px times").attr("transform", "translate(0," + height + ")").attr("class", "xaxis").call(xAxis);

    emp_plot_y = d3.scaleLinear().range([height, 0]);
    emp_plot_svg.append("g").style("font", "15px times").attr("class", "yaxis");

    emp_plot_svg.append("rect").style("fill", "none").style("pointer-events", "all").attr("width", width).attr("height", height)
    .on("mouseover", emp_mouseover).on("mousemove", emp_mousemove).on("mouseout", emp_mouseout).attr("id","emp_rect");

    emp_plot_line = emp_plot_svg.append("g").append("path").attr("id","emp_line");

    emp_plot_svg.append("g").append("circle").style("fill", "black").attr("stroke", "black").attr("r", 2).style("opacity", 0).attr("id","emp_focus");

    emp_plot_svg.append("g").append("text").style("opacity", 0).attr("text-anchor", "left").attr("alignment-baseline", "middle").attr("font-size", 15).attr("id","emp_year");

    emp_plot_svg.append("g").append("text").style("opacity", 0).attr("text-anchor", "left").attr("alignment-baseline", "middle").attr("font-size", 15).attr("id","emp_measure");
}

function emp_mouseover() {
    d3.select("#emp_focus").style("opacity", 1);
    d3.select("#emp_year").style("opacity", 1);
    d3.select("#emp_measure").style("opacity", 1);
}

function emp_mouseout() {
    d3.select("#emp_focus").style("opacity", 0);
    d3.select("#emp_year").style("opacity", 0);
    d3.select("#emp_measure").style("opacity", 0);
}

function emp_mousemove() {
    var x0 = emp_plot_x.invert(d3.mouse(this)[0]);
    var bisect = d3.bisector(function (d) { return d.year; }).left;
    var i = bisect(emp_data, x0, 1)

    row = emp_data[i]
    measure_text = "emp"
    d3.select("#emp_focus").attr("cx", emp_plot_x(row.year)).attr("cy", emp_plot_y(+row[cur_title]));
    d3.select("#emp_year").attr("x", emp_plot_x(row.year)).attr("y", emp_plot_y(+row[cur_title]) + 5).html("year : " + row.year);
    
    var measure_score = Number.parseFloat(+row[cur_title]).toExponential(2)
    d3.select("#emp_measure").attr("x", emp_plot_x(row.year)).attr("y", emp_plot_y(+row[cur_title]) + 25).html(measure_text + " : " + measure_score);
}

function update_employment_plot(title) {

    var max_yvalue = d3.max(emp_data, function(d) {return +d[title]});
    var min_yvalue = d3.min(emp_data, function(d) {return +d[title]});

    emp_plot_y.domain([min_yvalue, max_yvalue]);
    var yAxis = d3.axisLeft().scale(emp_plot_y).tickFormat(d3.format(".0e"));
    emp_plot_svg.selectAll(".yaxis").transition().duration(1000).call(yAxis);

    emp_plot_line.datum(emp_data)
    .transition()
    .duration(1000)
    .attr(
        "d", d3.line()
        .x(function(d) {return emp_plot_x(+d.year)})
        .y(function(d) {return emp_plot_y(+d[title])})
        .curve(d3.curveBasis)
    )
    .attr("stroke", title_to_color[title])
    .style("stroke-width", 3)
    .style("fill", "none");
    
}