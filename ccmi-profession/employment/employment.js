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
// edata, mdata is csv with years in rows and soc in columns. 
// It is of shape 19 x 22. 9 years and 22 SOC Groups
// mdata contains normalized frequency
// edata contains employment proportion
d3.csv("./employment.csv", function(edata) {
    d3.csv("./media.csv", function(mdata) {

        // get soc from colum
        const soc = edata.columns.slice(1);

        // populate options for select button
        d3.select("#selectButton")
            .selectAll("option")
            .data(soc)
            .enter()
            .append("option")
            .text(function (d) {return d})
            .attr("value", function (d) {return d});
        
        // assign a color to each soc
        const colors = d3.scaleOrdinal().domain(soc).range(d3.schemeSet2);

        // x transform
        const x = d3.scaleLinear().domain([1999, 2017]).range([0, g_width]);

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

        // y transform, partially defined because domain changes dynamically
        var y = d3.scaleLinear().range([g_height, 0]);

        // add y axis, note that y transform is not called
        svg.append("g")
            .style("font", "15px times")
            .attr("class", "yaxis");

        // add y label
        svg.append("g")
            .append("text")
            .attr("class", "y label")
            .attr("text-anchor", "center")
            .attr("x", -g_height-5)
            .attr("y", -75)
            .attr("transform", "rotate(-90)")
            .text("Frequency of mentions in subtitles");
        
        // add line graph
        var plot = svg.append("g")
                    .append("path")
                    .attr("id","plot");

        // update is called when option is changed in select button
        // it draws the line graph for selected soc
        function update(selected_soc) {

            // find the maximum and minimum y values
            var min_y = d3.min(mdata, function(d) {return +d[selected_soc]});
            var max_y = d3.max(mdata, function(d) {return +d[selected_soc]});

            // update domain of y transform
            y.domain([min_y, max_y]);
            
            // update y axis
            const y_axis = d3.axisLeft(y).tickFormat(d3.format(".2e"));
            svg.selectAll(".yaxis")
                .transition()
                .duration(1000)
                .call(y_axis);
            
            // plot line graph
            plot.datum(mdata)
            .transition()
            .duration(1000)
            .attr(
                "d", d3.line()
                .x(function(d) {return x(+d.year)})
                .y(function(d) {return y(+d[selected_soc])})
                .curve(d3.curveBasis)
            )
            .attr("stroke", colors(selected_soc))
            .style("stroke-width", 3)
            .style("fill", "none");
        }
        
        // call update when option is changed in select button
        d3.select("#selectButton")
        .on("change", function (d) {
            const selected_soc = d3.select(this).property("value");
            update(selected_soc);
        });

        // call update to draw inital line plot
        update(d3.select("#selectButton").property("value"));
    })
})
    