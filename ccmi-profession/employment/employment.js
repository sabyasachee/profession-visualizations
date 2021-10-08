// dimensions and margin of the svg
const width = 840
const height = 400
const margin = {left: 100, top: 50, right: 100, bottom: 100}

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

        // there are two y-axes: lefty and righty
        // lefty is for media frequency, righty is for employment
        // lefty transform, partially defined because domain changes dynamically
        var lefty = d3.scaleLinear().range([g_height, 0]);
        var righty = d3.scaleLinear().range([g_height, 0]);

        // add y axes, note that y transforms are not called
        svg.append("g")
            .style("font", "15px times")
            .attr("class", "yaxis")
            .attr("id","lefty");
        
        svg.append("g")
            .style("font", "15px times")
            .attr("transform", "translate(" + g_width + ",0)")
            .attr("class", "yaxis")
            .attr("id","righty");

        // add y labels
        svg.append("g")
            .append("text")
            .attr("class", "y label")
            .attr("text-anchor", "center")
            .attr("x", -g_height-5)
            .attr("y", -75)
            .attr("transform", "rotate(-90)")
            .text("Frequency of mentions in subtitles");

        svg.append("g")
            .append("text")
            .attr("class", "y label")
            .attr("text-anchor", "center")
            .attr("x", -g_height+15)
            .attr("y", g_width + 80)
            .attr("transform", "rotate(-90)")
            .text("Employment proportion");

        // add line graphs
        var leftyplot = svg.append("g")
                    .append("path")
                    .attr("id","leftyplot");

        var rightyplot = svg.append("g")
                    .append("path")
                    .attr("id","rightyplot");

        // update is called when option is changed in select button
        // it draws the line graph for selected soc
        function update(selected_soc) {

            // find the maximum and minimum y values
            var leftmin_y = d3.min(mdata, function(d) {return +d[selected_soc]});
            var leftmax_y = d3.max(mdata, function(d) {return +d[selected_soc]});
            var rightmin_y = d3.min(edata, function(d) {return +d[selected_soc]});
            var rightmax_y = d3.max(edata, function(d) {return +d[selected_soc]});

            // update domain of y transforms
            lefty.domain([leftmin_y, leftmax_y]);
            righty.domain([rightmin_y, rightmax_y]);
            
            // update y axes
            const lefty_axis = d3.axisLeft(lefty).tickFormat(d3.format(".2e"));
            const righty_axis = d3.axisRight(righty).tickFormat(d3.format(".2e"));
            
            svg.select("#lefty")
                .transition()
                .duration(1000)
                .call(lefty_axis);

            svg.select("#righty")
                .transition()
                .duration(1000)
                .call(righty_axis);
            
            // plot line graphs
            leftyplot.datum(mdata)
            .transition()
            .duration(1000)
            .attr(
                "d", d3.line()
                .x(function(d) {return x(+d.year)})
                .y(function(d) {return lefty(+d[selected_soc])})
                .curve(d3.curveBasis)
            )
            .attr("stroke", colors(selected_soc))
            .style("stroke-width", 3)
            .style("fill", "none");

            rightyplot.datum(edata)
            .transition()
            .duration(1000)
            .attr(
                "d", d3.line()
                .x(function(d) {return x(+d.year)})
                .y(function(d) {return righty(+d[selected_soc])})
                .curve(d3.curveBasis)
            )
            .attr("stroke", colors(selected_soc))
            .style("stroke-width", 3)
            .style("stroke-dasharray", ("3, 3"))
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
    