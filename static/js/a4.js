window.onload = function (event) {
    event.preventDefault();
    d3.json("http://localhost:8080/diversity.json")
        .then(data => {
            return data;
        })
        .then(jsonTuples => {
            renderVisualization(jsonTuples);
        });
};

/* variables and data that is important to have */
var margins = { tp: 50, btm: 50, lft: 100, rt: 80 };
var width = 700;
var height = 600;

/** ADDED TOOLTIPS FOR BAR CHART*/
var tooltip = d3.select(".tooltip");

function renderVisualization(jsonTuples) {
    d3.select("#vis").html("");

    /** variables needed for visualization */
    var objKeys = Object.keys(jsonTuples[0]);
    var nonMinority = objKeys[7];
    var black_alone = objKeys[8];
    var native_alone = objKeys[9];
    var asian_alone = objKeys[10];
    var native_hawaiian_pacific_islander = objKeys[11];
    var hispanic_or_latino = objKeys[12];
    var county_name = objKeys[13];
    var metro_area = objKeys[14];
    var year = objKeys[15];

    var filteredByMetro = [];
    jsonTuples.forEach(function (d) {
        if (d[metro_area] === ("Washington-Arlington-Alexandria")) {
            filteredByMetro.push(d);
        }
    });

    var occur = [];
    var filteredJson = [];
    filteredByMetro.map(function (d) {
        var res = d[county_name].concat(d[year]);
        if (!occur.includes(res)) {
            occur.push(res)
            filteredJson.push(d);
        }
    });

    var yearSet = [...new Set(filteredJson.map(d => d[year]))];
    var countySet = [...new Set(filteredJson.map(d => d[county_name]))];
    var demoOptions = ["All", nonMinority, black_alone, native_alone, asian_alone, native_hawaiian_pacific_islander, hispanic_or_latino];
    var demo = [nonMinority, black_alone, native_alone, asian_alone, native_hawaiian_pacific_islander, hispanic_or_latino];

    var options = d3.select("#year").selectAll("option")
        .data(yearSet)
        .enter().append("option")
        .text(d => d);

    var ethnicities = d3.select("#ethnicity").selectAll("option")
        .data(demoOptions)
        .enter().append("option")
        .text(d => d);

    /** Plot Axes */
    var xBand = d3.scaleBand()
        .range([margins.lft, width])
        .padding(0.1);

    var yBand = d3.scaleLinear()
        .rangeRound([height - 50 - margins.btm, margins.tp]);

    d3.select("#vis").append("g").attr("transform", `translate(0,${height - 50 - margins.btm})`)
        .attr("class", "xAxis")

    d3.select("#vis").append("g")
        .attr("transform", `translate(${margins.lft},0)`)
        .attr("class", "yAxis")
    /** END of Plot Axes */

    /** Text Labels */
    d3.select("#vis").append("text")
        .attr("x", width / 2)
        .attr("y", height)
        .style("text-anchor", "middle")
        .text("Region of Washington-Arlington-Alexandria");

    d3.select("#vis").append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margins.lft - 70)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Residents");
    /** END of Text Labels  */

    var colors = d3.scaleOrdinal()
        .range(["#B0E0E6", "#87CEFA", "#00BFFF", "#4682B4", "#0000FF", "#7B68EE"])
        .domain(demo);

    update(d3.select("#year").property("value"), 0);

    function update(input1, speed) {
        var data = filteredJson.filter(d => d[year] == d3.select("#year").property("value"));
        var input2 = d3.select("#ethnicity").property("value");

        if (input2 !== "All") {
            demo = [input2];
            data.forEach(function (d) {
                d.total = d3.sum(demo, k => +d[k])
                return d
            })
        } else {
            demo = [nonMinority, black_alone, native_alone, asian_alone, native_hawaiian_pacific_islander, hispanic_or_latino];
            data.forEach(function (d) {
                d.total = d3.sum(demo, k => +d[k])
                return d
            })
        }

        yBand.domain([0, d3.max(data, d => d3.sum(demo, k => +d[k]))]).nice();

        d3.select("#vis").selectAll(".yAxis").transition().duration(speed)
            .call(d3.axisLeft(yBand).ticks(null, "s"))

        data.sort(d3.select("#sort").property("checked")
            ? (a, b) => b.total - a.total
            : (a, b) => countySet.indexOf(a[county_name]) - countySet.indexOf(b[county_name]))

        xBand.domain(data.map(d => d[county_name]));

        d3.select("#vis").selectAll(".xAxis").transition().duration(speed)
            .call(d3.axisBottom(xBand).tickSizeOuter(0))

        d3.select("#vis").selectAll(".xAxis").selectAll("text")
            .attr("class", "xAxisText")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function (d) {
                return "rotate(-45)"
            });

        d3.select("#vis").selectAll(".yAxis").selectAll("text")
            .attr("class", "yAxisText")

        var demoStat = d3.stack().keys(demo)(data);

        var group = d3.select("#vis").selectAll("g.layer")
            .data(demoStat, d => d.key);

        group.exit().remove();

        group.enter().append("g")
            .classed("layer", true)
            .attr("fill", d => colors(d.key));


        var bars = d3.select("#vis").selectAll("g.layer").selectAll("rect")
            .data(d => d, e => e.data.key);

        bars.exit().remove()

        bars.enter().append("rect")
            .attr("width", xBand.bandwidth())
            .merge(bars)
            .attr("x", d => xBand(d.data.county_name))
            .attr("y", d => yBand(d[1]))
            .attr("height", d => yBand(d[0]) - yBand(d[1]))
            .on("mouseover", function (d) {
                tooltip.attr("visibility", "visible");
                var xPos = d3.event.pageX - 15;
                var yPos = d3.event.pageY - 25;
                tooltip.attr("left", d3.select(this).attr("x") + "px");
                tooltip.attr("top", d3.select(this).attr("y") + "px");
                tooltip.style("opacity", 0.5);
                d3.select(this).style("stroke", "black");
                tooltip.html("County: " + d.data.county_name + "\r\nPopulation: " + d[1]);
            })
            .on("mouseout", function () {
                tooltip.attr("visibility", "hidden");
                d3.select
            })
            .on("mouseleave", function (d) {
                d3.select(this).style("stroke", "none");
                tooltip.style("opacity", 0);
            })



        /** ADDED LEGEND FOR BAR CHART */
        var legend = d3.legendColor()
            .shape("rect")
            .shapeWidth(height / 6)
            .shapePadding(10)
            .orient('horizontal')
            .scale(colors);
        d3.select("#vis")
            .append("g")
            .attr("class", "legendLinear")
            .attr("transform", `translate(0, ${height + 50})`)
            .call(legend);

    }

    renderVisualization.update = update;

    /** DROPDOWN & CHECKBOX LISTENERS FOR VISUALIZATIONS */
    var selectY = d3.select("#year")
        .on("change", function () {
            update(this.value, 750)
        })

    var checkbox = d3.select("#sort")
        .on("click", function () {
            update(selectY.property("value"), 750)
        })

    var selectE = d3.select("#ethnicity")
        .on("change", function () {
            update(this.value, 750)
        })

}