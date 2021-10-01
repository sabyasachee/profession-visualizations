// dimensions and margin of the svg
const width = 800
const height = 500
const margin = {left: 100, top: 50, right: 60, bottom: 150}

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
// data is csv with professions in columns and media attributes in rows. 
// It is of shape 31 x 500. 31 media attributes and 500 professions
d3.csv("profession.csv", function(data) {

    // get professions from header
    const professions = data.columns.slice(1);

    // get media attributes from first column
    const attributes = data.map(function(row) {return row.attribute})

    // populate options for select button
    d3.select("#selectButton")
        .selectAll("option")
        .data(professions)
        .enter()
        .append("option")
        .text(function (d) {return d})
        .attr("value", function (d) {return d});
    
    // assign a color to attribute type
    const countries = ["Canada", "Japan", "UK", "US"]
    const colors = d3.scaleOrdinal().domain(["Country","Genre","Title","Year"]).range(d3.schemeSet2);

    // x transform
    const x = d3.scaleBand()
                .domain(attributes)
                .range([0, g_width ])
                .padding(0.3);
    
    // add x axis
    svg.append("g")
        .style("font", "15px times")
        .attr("transform", "translate(0," + g_height + ")")
        .attr("class", "xaxis")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-15,10)rotate(-90)")
        .style("text-anchor", "end")

    // add x label
    svg.append("g")
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "center")
        .attr("alignment-baseline", "middle")
        .attr("font-size", 20)
        .attr("x", g_width/3)
        .attr("y", g_height + 125)
        .text("Media Attributes");

    // y transform, partially defined because domain changes dynamically
    const y = d3.scaleLinear()
                .range([g_height, 0]);
    
    // add y axis, note that y transform is not called
    svg.append("g")
        .style("font", "15px times")
        .attr("class", "yaxis");

    // add y label
    svg.append("g")
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "center")
        .attr("x", -g_height+50)
        .attr("y", -70)
        .attr("transform", "rotate(-90)")
        .text("Effect on frequency");

    // draw y = 0
    svg.append("line")
        .attr("x1", 0)
        .attr("x2", g_width)
        .attr("y1", g_height/2)
        .attr("y2", g_height/2)
        .style("stroke", "black")

    // update is called when option is changed in select button
    // it draws the bar graph for selected profession
    function update(profession) {

        // find the maximum and minimum y values
        const v1 = Math.abs(d3.min(data, function(d) {return +d[profession]}));
        const v2 = d3.max(data, function(d) {return +d[profession]});
        const max_y = Math.max(v1, v2)

        // update domain of y transform
        y.domain([-max_y, max_y]);
        
        // update y axis
        const y_axis = d3.axisLeft(y).tickFormat(d3.format(".2f"));
        svg.selectAll(".yaxis")
            .transition()
            .duration(1000)
            .call(y_axis);
        
        // draw bars
        var u = svg.selectAll("rect")
            .data(data)

        u.enter()
            .append("rect")
            .merge(u)
            .transition()
            .duration(1000)
            .attr("x", function(d) { return x(d.attribute) })
            .attr("y", function(d) { 
                if (+d[profession] > 0) {
                    return y(+d[profession])
                } else {
                    return g_height/2
                }
             })
            .attr("width", x.bandwidth())
            .attr("height", function(d) {
                if (+d[profession] > 0) {
                    return g_height/2 - y(+d[profession])
                } else {
                    return y(+d[profession]) - g_height/2
                }
            })
            .attr("fill", function(d) {
                if (countries.includes(d.attribute)) {
                    return colors("Country")
                } else if (d.attribute == "movie-TV") {
                    return colors("Title")
                } else if (d.attribute == "year") {
                    return colors("Year")
                } else {
                  return colors("Genre")  
                }
            })

    }

    // call update when option is changed in select button
    d3.select("#selectButton")
    .on("change", function (d) {
        const profession = d3.select(this).property("value");
        update(profession);
    });

    // call update to draw inital bar plot
    update(d3.select("#selectButton").property("value"));

})