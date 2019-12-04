
mapOneVis = function(_parentElement, _dataShootings, _topoData) {
    this.parentElement = _parentElement;
    this.data = _dataShootings;
    this.topoData = _topoData;

    // call method initVis
    this.initVis();
};


mapOneVis.prototype.initVis = function() {
    let vis = this;

    vis.margin = {top: 30, right: 80, bottom: 50, left: 80};
    vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = $('#' + vis.parentElement).height() - margin.top - margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Append Div for tooltip to SVG
    vis.div = d3.select("#map1")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // initialize map
    vis.initMap();
};


// initialize map only once, we won't update anything
mapOneVis.prototype.initMap = function() {
    let vis = this;

    // we will use some basic math & transformations rather than a projection here;
    vis.viewpoint = {'width': 975, 'height': 610};
    vis.zoom = vis.width/vis.viewpoint.width;

    // adjust map position
    vis.map = vis.svg.append("g")
        .attr("class", "states")
        .attr('transform', `scale(${vis.zoom} ${vis.zoom})`);

    vis.path = d3.geoPath();

    vis.us = topojson.feature(vis.topoData, vis.topoData.objects.state).features;

    vis.map.selectAll("map1")
        .data(vis.us)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "black")
        .style("stroke", "#fff");

    vis.initCircles()
};

// initialize all Circles, we will then, later, grab them by class to play around with them
mapOneVis.prototype.initCircles = function() {
    let vis = this;

    // after the map has been draw, draw all the circles for the initial view;
    vis.data.forEach(d=>{
        d.Latitude = +d.Latitude;
        d.Longitude = +d.Longitude;
    });

    vis.circles = vis.map.selectAll(".mapOneCircle")
        .data(vis.data);

    // draw all the circles
    vis.circles.enter().append("circle")
        .attr("class", function(d){ /*console.log(d);*/ return `mapOneCircle ${d['age']} ${d['gender']} ${d['Type']}` })
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("r", 4)
        .attr("fill", "red")
        .attr("transform", function (d) {
            return "translate(" + projection([+d.Longitude, +d.Latitude]) + ")"
        })
        .on("mouseover", function(d) {
            vis.div.transition()
                .duration(200)
                .style("opacity", .9);
            vis.div.html(function () {
                if (d.name === "N/A"){
                    return "<strong> Incident location: </strong>" + d.Address
                }
                else{
                    return "<strong> Name: </strong>" + d.name + " <br> "
                        + "<strong> Incident location: </strong>" + d.Address
                }
            })
            //.text(d.ParticipantGender.charAt(0).toUpperCase() + d.ParticipantGender.substring(1)+ ", " +d.ParticipantAgeGroup)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })

        // fade out tooltip on mouse out
        .on("mouseout", function(d) {
            vis.div.transition()
                .duration(500)
                .style("opacity", 0);
        });
};

mapOneVis.prototype.updateVis = function() {
    let vis = this;

    console.log('got called');

    // get values - check out the values in the selection -> already providing the class names
    let selectedValueOne = d3.select("#ranking-type").property("value");
    let selectedValueTwo = d3.select("#gender").property("value");
    let selectedValueThree = d3.select("#age").property("value");

    // here's a log, showing the current selection
    console.log('current selection (classes):', selectedValueOne, selectedValueTwo, selectedValueThree);

    // now we only have to do two operations:

    // #1: hide all circles
    d3.selectAll('.mapOneCircle').transition().duration(500).attr('r', 0);

    // #2: show only selected circles;
    d3.selectAll('.mapOneCircle' + selectedValueOne + selectedValueTwo + selectedValueThree).transition().duration(500).attr('r', 4);
};



