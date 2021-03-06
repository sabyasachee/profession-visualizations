// Set the dimensions and margins of the diagram
var margin = {top: 20, right: 20, bottom: 30, left: 200},
width = 5000 - margin.left - margin.right,
height = 1000 - margin.top - margin.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg").attr("width", width + margin.right + margin.left).
attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var i = 0, duration = 750, root;

// Tooltip div
var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 1e-6);

// SVG Tooltip
// var tmargin = {top: 10, left: 10, right: 20, bottom: 20}
// var twidth = 200 - tmargin.left - tmargin.right
// var theight = 80 - tmargin.top - tmargin.bottom
// var svgtooltip = d3.select("body").append("svg").attr("width", twidth + tmargin.left + tmargin.right).attr("height", theight + tmargin.top + tmargin.bottom).append("g").attr("transform", "translate(" + tmargin.left + "," + tmargin.top + ")");

// const group_labels = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11", "G12", "G13", "G14", "G15", "G16", "G17", "G18", "G19", "G20", "G21", "G22", "G23"]



// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

d3.json("data/taxonomy.json", function(error, treeData) {
    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function(d) { return d.children; });
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);

    update(root);
});

// Collapse the node and all it's children
function collapse(d) {
    if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
    }
}

function update(source) {

    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

    // Compute the new tree layout.
    var nodes = treeData.descendants(), links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function(d){ d.y = d.depth * 300});

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = svg.selectAll('g.node').data(nodes, function(d) {return d.id || (d.id = ++i); });

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    });

    // Add Circle for the nodes
    nodeEnter.append('circle')
    .attr('class', 'node')
    .attr('r', 1e-6)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .style("stroke", function(d) { 
        if (d.data.type === "soc") {
            return "lightseagreen";
        }
        if (d.data.type === "exp") {
            return "lightcoral";
        }
    })
    .style("stroke-width", "3")
    .on('click', click);
    // .on("mouseover", function(d){mouseover(d);})
    // .on("mouseout", mouseout);

    // Add labels for the nodes
    nodeEnter.append('text')
    .attr("dy", ".35em")
    .attr("x", function(d) {
        return d.children || d._children ? -13 : 13;
    })
    .attr("text-anchor", function(d) {
        return d.children || d._children ? "end" : "start";
    })
    .text(function(d) { return d.data.name; });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) { 
        return "translate(" + d.y + "," + d.x + ")";
    });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .style("stroke", function(d) { 
        if (d.data.type === "soc") {
            return "lightseagreen";
        }
        if (d.data.type === "exp") {
            return "lightcoral";
        }
    })
    .attr('cursor', 'pointer');


    // Remove any exiting nodes
    var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
    .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
    .style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    var link = svg.selectAll('path.link')
    .data(links, function(d) { return d.id; });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
    .attr("class", "link")
    .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
    });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
    .duration(duration)
    .attr('d', function(d){ return diagonal(d, d.parent) });

    // Remove any exiting links
    var linkExit = link.exit().transition()
    .duration(duration)
    .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
    })
    .remove();

    // Store the old positions for transition.
    nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}`

    return path
    }

    // Toggle children on click.
    function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
    }

    function mouseover(d) {
        div.transition().duration(200).text(d.data.array + "\nsize = " + d.data.size + ", ngroups = " + d.data.ngroups).style("opacity", 1).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");
    }
    
    // function mousemove(d) {
        
    //     console.log(d3.mouse);
    // }
    
    function mouseout() {
        div.transition().duration(500).style("opacity", 1e-6);
    }
}