// dimensions and margin of the svg
const width = 800
const height = 400
const margin = {left: 100, top: 50, right: 60, bottom: 100}

// dimensions of g inside svg
const g_width = width - margin.left - margin.right;
const g_height = height - margin.top - margin.bottom;

// add g to svg
var svg = d3.select("#viz")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// select data
// data is csv with professions in columns and years in rows. 
// It is of shape 68 x 500. 1950-2017 and 500 professions
d3.csv("sentiment.csv", function(data) {

    // get professions from colum
    const professions = data.columns.slice(1);

    // populate options for select button
    d3.select("#selectButton")
        .selectAll("option")
        .data(professions)
        .enter()
        .append("option")
        .text(function (d) {return d})
        .attr("value", function (d) {return d});
    
    // assign a color to each profession
    const colors = d3.scaleOrdinal().domain(professions).range(d3.schemeSet2);

    // x transform
    const x = d3.scaleLinear().domain([1948, 2018]).range([0, g_width]);

    // add x axis
    const x_axis = d3.axisBottom(x).tickFormat(d3.format("d"));
    svg.append("g")
        .style("font", "15px times")
        .attr("transform", "translate(0," + g_height + ")")
        .attr("class", "xaxis")
        .call(x_axis);

    // add x label
    svg.append("g")
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "center")
        .attr("alignment-baseline", "middle")
        .attr("font-size", 15)
        .attr("x", g_width/2)
        .attr("y", g_height + 50)
        .text("Year");

    // y transform
    const y = d3.scaleLinear().domain([0, 1]).range([g_height, 0]);

    // add y axis
    const y_axis = d3.axisLeft(y).tickFormat(d3.format(".1f"));
    svg.append("g")
        .style("font", "15px times")
        .attr("class", "yaxis")
        .call(y_axis);

    // add y label
    svg.append("g")
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "center")
        .attr("x", -g_height-5)
        .attr("y", -75)
        .attr("transform", "rotate(-90)")
        .text("Proportion of positive sentiment");
    
    // add line graph
    var plot = svg.append("g")
                .append("path")
                .attr("id","plot");

    // update is called when option is changed in select button
    // it draws the line graph for selected profession
    function update(profession) {
        
        // plot line graph
        plot.datum(data)
        .transition()
        .duration(1000)
        .attr(
            "d", d3.line()
            .x(function(d) {return x(+d.year)})
            .y(function(d) {return y(+d[profession])})
            .curve(d3.curveBasis)
        )
        .attr("stroke", colors(profession))
        .style("stroke-width", 3)
        .style("fill", "none");
    }
    
    // call update when option is changed in select button
    d3.select("#selectButton")
    .on("change", function (d) {
        const profession = d3.select(this).property("value");
        update(profession);
    });

    update(d3.select("#selectButton").property("value"));
})
    