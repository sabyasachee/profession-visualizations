// sentiment plot variables
var senti_plot_x;
var senti_plot_y;
var senti_plot_svg;
const senti_plot_colors = {"neu":"#e66c74", "pos":"#377eb8", "neg":"#4daf4a"};
var senti_plot_stack;

function initialize_sentiment_plot(title) {
    const total_width = 1130
    const total_height = 350
    const margin = {left: 50, top: 50, right: 200, bottom: 30}

    var width = total_width - margin.left - margin.right
    var height = total_height - margin.top - margin.bottom

    senti_plot_svg = d3.select("#plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    senti_plot_svg.append("g").append("text").style("opacity", 1).attr("text-anchor", "center").attr("alignment-baseline", "middle").attr("font-size", 20).attr("x", width/3).attr("y", -15).html("Sentiment vs Time (red=neutral, blue=pos, green=neg)");

    senti_plot_svg.append("g").append("text").attr("text-anchor", "center").attr("alignment-baseline", "middle").attr("id","senti_pos_pho").attr("font-size", 15).attr("x", width + 10).attr("y", height/2 - 20);

    senti_plot_svg.append("g").append("text").attr("text-anchor", "center").attr("alignment-baseline", "middle").attr("id","senti_neg_pho").attr("font-size", 15).attr("x", width + 10).attr("y", height/2);

    senti_plot_x = d3.scaleLinear().domain([1948, 2018]).range([0, width]);
    var xAxis = d3.axisBottom(senti_plot_x).tickFormat(d3.format("d"));
    senti_plot_svg.append("g").style("font", "15px times").attr("transform", "translate(0," + height + ")").attr("class", "xaxis").call(xAxis);

    senti_plot_y = d3.scaleLinear().domain([0, 1]).range([height, 0 ]);
    var yAxis = d3.axisLeft(senti_plot_y).tickFormat(d3.format(".2f"));
    senti_plot_svg.append("g").style("font", "15px times").attr("class", "yaxis").call(yAxis);

    d3.csv("data/sentiment/" + title + ".csv", function(data) {
        var stackedData = d3.stack().keys(senti_groups)(data);

        senti_plot_stack = senti_plot_svg.append("g").attr("id","senti_plot")
        .selectAll("g").data(stackedData).enter().append("g")
        .attr("fill", function(d) { return  senti_plot_colors[d.key]; })
        .selectAll("rect").data(function(d) {return d; }).enter().append("rect")
        .attr("x", function(d) { return senti_plot_x(d.data.year); })
        .attr("y", function(d) { return senti_plot_y(d[1]); })
        .attr("height", function(d) { return senti_plot_y(d[0]) - senti_plot_y(d[1]); })
        .attr("width", 12);
    })
}

function update_sentiment_plot(title) {

    d3.csv("data/sentiment/" + title + ".csv", function(data) {
        if (stat_data[title]["pos"] > 0) {
            d3.select("#senti_pos_pho").html("pos sentiment vs time &rho; = " + stat_data[title]["pos"].toFixed(2)).style("fill", "green");
        }
        else if (stat_data[title]["pos"] < 0) {
            d3.select("#senti_pos_pho").html("pos sentiment vs time &rho; = " + stat_data[title]["pos"].toFixed(2)).style("fill", "red");
        }
        else {
            d3.select("#senti_pos_pho").html("");
        }

        if (stat_data[title]["neg"] > 0) {
            d3.select("#senti_neg_pho").html("neg sentiment vs time &rho; = " + stat_data[title]["neg"].toFixed(2)).style("fill", "green");
        }
        else if (stat_data[title]["neg"] < 0) {
            d3.select("#senti_neg_pho").html("neg sentiment vs time &rho; = " + stat_data[title]["neg"].toFixed(2)).style("fill", "red");
        }
        else {
            d3.select("#senti_neg_pho").html("");
        }

        var stackedData = d3.stack().keys(senti_groups)(data);

        var state = d3.select("#senti_plot").selectAll("g").data(stackedData);

        state = state.selectAll("rect")
        .data(function(d) {return d; })
        .transition()
        .duration(1000)
        .attr("x", function(d) { return senti_plot_x(d.data.year); })
        .attr("y", function(d) { return senti_plot_y(d[1]); })
        .attr("height", function(d) { return senti_plot_y(d[0]) - senti_plot_y(d[1]); });
    })

}