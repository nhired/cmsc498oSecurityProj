/* variables and data that is important to have */
const svg = d3.select("svg");
const textField = document.getElementById("textField");
const homeButton = document.getElementById("homeButton");
//const categoryDropdown = document.getElementById("category");
const rankTypeDropdown = document.getElementById("rankType");
//const slider = document.getElementById("rankRange");
const sortCheckbox = document.getElementById("sort");
//const sliderMax = document.getElementById("sliderMax");
const margins = { top: 50, bottom: 50, left: 100, right: 80 };
const width = svg.attr("width");
const height = svg.attr("height");

const rankingValues = new Map();
rankingValues.set("Account Security", {"Expert": 3.406779661016949, "User": 1.7796610169491525});
rankingValues.set("Antivirus", {"Expert": 3.0588235294117645, "User": 1.6470588235294117});
rankingValues.set("Browsers", {"Expert": 3.3559322033898304, "User": 2});
rankingValues.set("Data Storage", {"Expert": 3.3529411764705883, "User": 2.1176470588235294});
rankingValues.set("Device Security", {"Expert": 3.7142857142857144, "User": 2.0952380952380953});
rankingValues.set("Finance", {"Expert": 3.6875, "User": 2.1875});
rankingValues.set("General Security", {"Expert": 3.4871794871794872, "User": 2});
rankingValues.set("Incident Response", {"Expert": 3.4444444444444446, "User": 1.7777777777777777});
rankingValues.set("Network Security", {"Expert": 3.3333333333333335, "User": 2.0416666666666665});
rankingValues.set("Passwords", {"Expert": 3.1132075471698113, "User": 1.9444444444444444});
rankingValues.set("Privacy", {"Expert": 3.6842105263157894, "User": 2.1578947368421053});
rankingValues.set("Software", {"Expert": 3.176470588235294, "User": 1.9411764705882353});

let data, selectedCategory, selectedRankType, sliderValue, sorted;

window.onload = () => {
    data = processedJson;
    //console.log(data);
    //console.log(rankingValues.get("Account Security"))
    //selectedCategory = categoryDropdown.options[categoryDropdown.selectedIndex].value;
    selectedRankType = rankTypeDropdown.options[rankTypeDropdown.selectedIndex].value;
    //sliderValue = slider.value;
    sorted = sortCheckbox.checked;
    //calculateAvg(data, "Account Security", "Expert Ranking");
    renderCardinalityVisualization(data);
    document.getElementById("ui-div").style.visibility = "hidden";
    d3.select(".legendLinear").attr("visibility", "visible");
    d3.select(".legendLinear2").attr("visibility", "visible");
}

function calculateAvg(jsonData, category, rankType) {
    let sum = 0;
    let emptyCount = 0;
    let dataArray = jsonData[category];
    let array = Object.entries(dataArray);
    for (let i = 0; i < array.length; i++) {
        if (array[i][1][rankType] !== "") {
            sum += parseInt(array[i][1][rankType]);
        } else {
            emptyCount++
        }
    }
    console.log("AVG: " + sum/(array.length - emptyCount))
}

homeButton.onclick = () => { 
    renderCardinalityVisualization(data);
    document.getElementById("ui-div").style.visibility = "hidden";
    d3.select(".legendLinear").attr("visibility", "visible");
    d3.select(".legendLinear2").attr("visibility", "visible");
}

/*
categoryDropdown.onchange = () => {
    selectedCategory = categoryDropdown.options[categoryDropdown.selectedIndex].value;
    sliderMax.innerHTML = Object.entries(data[selectedCategory]).length;
    slider.max = Object.entries(data[selectedCategory]).length;
    slider.value = Object.entries(data[selectedCategory]).length;
    sliderValue = slider.value;
    renderVisualization(data[selectedCategory], selectedRankType, sliderValue, sorted);
};
*/

rankTypeDropdown.onchange = () => {
    selectedRankType = rankTypeDropdown.options[rankTypeDropdown.selectedIndex].value;
    if (selectedRankType === "Both") {
        renderBothVisualization(data[selectedCategory], "Expert Ranking", "User Ranking", sliderValue, sorted);
    } else {
        renderVisualization(data[selectedCategory], selectedRankType, sliderValue, sorted);
    }
};

/*
slider.oninput = () => {
    sliderValue = slider.value;
    renderVisualization(data[selectedCategory], selectedRankType, sliderValue, sorted);
}
*/

sortCheckbox.onchange = () => {
    sorted = sortCheckbox.checked;
    renderVisualization(data[selectedCategory], selectedRankType, sliderValue, sorted);
}

function renderCardinalityVisualization(jsonData) {
    svg.selectAll("*").remove();
    let dataArray = Object.entries(jsonData);
    let categories = dataArray.map(entry => entry[0]);
    let counts = dataArray.map(entry => Object.keys(jsonData[entry[0]]).length);
    let minBuffer = 1;

    let xScale = d3.scaleBand()
        .domain(categories)
        .range([margins.left, width - margins.right])
        .padding(0.1);
    let yScale = d3.scaleLinear()
        .domain([d3.min(counts) - minBuffer, d3.max(counts)])
        .range([height - 100 - margins.bottom, margins.top]);
    let colorScale = d3.scaleOrdinal().domain(categories)
        .range(["#4E4D5C", "#227C9D", "#1DA0A8", "#17C3B2", "#8BC795", "#C5C986", "#FFCB77", "#FFE2B3", "#FFCBB2", "#FEB3B1", "#FE6D73", "#712F79"]);

    // Plot axes
    svg.append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(0, ${svg.attr("height") - 100 - margins.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .remove();
    svg.append("g")
        .attr("id", "yAxis")
        .attr("transform", `translate(${margins.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Tooltips
    let tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html((data) => data[0] + "<br>" +
        "Total Records: <span class='tooltip'>" + Object.keys(data[1]).length + "</span><br>" +
        "Expert Ranking Average: <span class='tooltip'>" + (rankingValues.get(data[0]).Expert).toPrecision(4) + "</span><br>" +
        "User Ranking Average: <span class='tooltip'>" + (rankingValues.get(data[0]).User).toPrecision(4) + "</span><br>");

    svg.call(tip);

    // Create rectangles
    let minY = d3.min(counts) - minBuffer;
    d3.select("svg").selectAll("rect")
        .data(dataArray)
        .enter()
        .append("rect")
        .on("click", entry => {
            selectedCategory = entry[0];
            d3.selectAll(".d3-tip.n").remove();
            renderVisualization(jsonData[entry[0]], selectedRankType, sliderValue, sorted);
            document.getElementById("ui-div").style.visibility = "visible";
            d3.event.stopPropagation();
        })
        .attr("x", entry => xScale(entry[0]))
        .attr("y", entry => yScale(Object.keys(jsonData[entry[0]]).length))
        .attr("width", xScale.bandwidth())
        .attr("height", entry => {
            let number = Object.keys(jsonData[entry[0]]).length;
            return yScale(minY) - yScale(number);
        })
        .attr("fill", c => colorScale(c))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    // Create axis labels
    svg.append("text")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height - margins.bottom - 70) + ")")
        .style("text-anchor", "middle")
        .text("Category");
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 35) //variables inverted due to rotation
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Quantity");

    let cat1 = ["Account Security", "Antivirus", "Browsers", "Data Storage", "Device Security", "Finance"];
    let cat2 = ["General Security", "Incident Response", "Network Security", "Passwords", "Privacy", "Software"];
    let colorScale1 = d3.scaleOrdinal().domain(cat1)
        .range(["#4E4D5C", "#227C9D", "#1DA0A8", "#17C3B2", "#8BC795", "#C5C986"]);

    let colorScale2 = d3.scaleOrdinal().domain(cat2)
    .range([ "#FFCB77", "#FFE2B3", "#FFCBB2", "#FEB3B1", "#FE6D73", "#712F79"]);
     /** ADDED LEGEND FOR BAR CHART */
    var legend = d3.legendColor()
    .shape("rect")
    .shapeWidth(height / 6)
    .shapePadding(30)
    .orient('horizontal')
    .scale(colorScale1);
    d3.select("#vis")
    .append("g")
    .attr("class", "legendLinear")
    .attr("transform", `translate(100, 500)`)
    .call(legend);

    var legend2 = d3.legendColor()
    .shape("rect")
    .shapeWidth(height / 6)
    .shapePadding(30)
    .orient('horizontal')
    .scale(colorScale2);
d3.select("#vis")
    .append("g")
    .attr("class", "legendLinear2")
    .attr("transform", `translate(100, 550)`)
    .call(legend2);


}

function renderVisualization(jsonData, rankType, rankRange, sorted) {
    d3.select(".legendLinear").attr("visibility", "hidden");
    d3.select(".legendLinear2").attr("visibility", "hidden");
    /** FOR ALL VISUALIZATION STUFF */
    svg.selectAll("*").remove();

    let dataArray = Object.entries(jsonData);
    //dataArray = dataArray.slice(0, ++rankRange);
    let minBuffer = 0.05;
    if (sorted) {
      dataArray.sort(function(a, b) {
        let rankA = a[1][rankType];
        let rankB = b[1][rankType];
        if (rankA < rankB) {
            return -1;
        } else if (rankA > rankB) {
            return 1;
        } else {
            return 0;
        }
      });
    }

    let advice = dataArray.map((entry) => entry[0]);
    let rankings = dataArray.map((entry) => entry[1][rankType]);
    /** Plot Axes */
    let xScale = d3.scaleBand()
        .domain(advice)
        .range([margins.left, width - margins.right])
        .padding(0.1);
    let yScale = d3.scaleLinear()
        .domain([d3.min(rankings) - minBuffer, d3.max(rankings)])
        .range([height - 50 - margins.bottom, margins.top]);

    // Plot axes
    svg.append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(0, ${svg.attr("height") - 50 - margins.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .remove();
    svg.append("g")
        .attr("id", "yAxis")
        .attr("transform", `translate(${margins.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Tooltips
    let tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html((data) => data[0] + "<br>" +
        "Ranking: <span class='tooltip'>" + (data[1][rankType]) + "</span><br>");

    svg.call(tip);

    // Create rectangles
    let minY = d3.min(rankings) - minBuffer;
    d3.select("svg").selectAll("rect")
        .data(dataArray)
        .enter()
        .append("rect")
        .attr("x", entry => xScale(entry[0]))
        .attr("y", entry => yScale(entry[1][rankType]))
        .attr("width", xScale.bandwidth())
        .attr("height", entry => {
            let number = entry[1][rankType];
            return yScale(minY) - yScale(number);
        })
        .attr("fill", () => {
            if (rankType == "Expert Ranking") {
                return "#FE9092";
            } else {
                return "#208EA3"
            }
        })
        .on('mouseover', tip.show)
        .on('mouseover', data => {
            textField.innerHTML = "<b>Advice: </b>" + data[0] + "<br>" + 
                "<b>" + rankType + ": </b>" + (data[1][rankType]);
            d3.event.stopPropagation();
        })
        .on('mouseout', () => {
            tip.hide
            textField.innerHTML = ""
            d3.event.stopPropagation();
        });

    svg.append("text")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height - margins.bottom - 40) + ")")
        .style("text-anchor", "middle")
        .text("Advice");
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 35) //variables inverted due to rotation
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Quality of Advice");
 }

function renderBothVisualization(jsonData, expertRank, userRank, rankRange, sorted) {
    /** FOR ALL VISUALIZATION STUFF */
    svg.selectAll("*").remove();

    let dataArray = Object.entries(jsonData);
    //dataArray = dataArray.slice(0, ++rankRange);
    let minBuffer = 0.05;

    let rankTypes = [expertRank, userRank];
    
    dataArray.forEach(function (d) {
        d.total = d3.sum(rankTypes, k => +d[1][k])
        return d
    })

    let advice = dataArray.map((entry) => entry[0]);
    let urankings = dataArray.map((entry) => entry[1][userRank]);
    let erankings =  dataArray.map((entry) => entry[1][expertRank]);
    let maxRank = [d3.max(urankings), d3.max(erankings)];
    let minRank = [d3.min(urankings), d3.min(erankings)];


    if (sorted) {
        dataArray.sort(function(a, b) {
          let rankA = a.total;
          let rankB = b.total;
          if (rankA < rankB) {
              return -1;
          } else if (rankA > rankB) {
              return 1;
          } else {
              return 0;
          }
        });
      }


    /** Plot Axes */
    let xScale = d3.scaleBand()
        .domain(advice)
        .range([margins.left, width - margins.right])
        .padding(0.1);
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(dataArray, d => d3.sum(rankTypes, k => +d[1][k]))])
        .range([height - 100 - margins.bottom, margins.top]);

    // Plot axes
    svg.append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(0, ${svg.attr("height") - 100 - margins.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .remove();
    svg.append("g")
        .attr("id", "yAxis")
        .attr("transform", `translate(${margins.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Tooltips
    let tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html((data) => data[0] + "<br>" +
        "Ranking: <span class='tooltip'>" + (data[1][rankType]) + "</span><br>");

    svg.call(tip);

    var rankStat = d3.stack().keys(rankTypes)(dataArray);

    console.log(rankStat)

    var colors = d3.scaleOrdinal()
        .range(["#FE9092", "#208EA3"])
        .domain(rankTypes);

    /*
    var rects = d3.select("#vis").append("g")
      .attr("transform", "translate("+margins.left+","+margins.top+")")
      .selectAll("g").data(rankStat).enter()
        .append("g")
        .attr("fill", d => colors(d.key));


    let minY = d3.min(minRank) - minBuffer;
    rects.selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", (d, i) => xScale(d.data[0]))
        .attr("y", d=> yScale(d.data.total))
        .attr("height", d=> {
            let number = d.data[1];
            return yScale(minY) - yScale(number);
        })
        .attr("width", xScale.bandwidth())
        .on('mouseover', tip.show)
        .on('mouseover', data => {
            textField.innerHTML = "<b>Advice: </b>" + data["data"][0] + "<br>" + 
                "<b>" + expertRank + ": </b>" + (data["data"][1][expertRank]) + "<br>" + 
                "<b>" + userRank + ": </b>" + (data["data"][1][userRank]);
            d3.event.stopPropagation();
        })
        .on('mouseout', () => {
            tip.hide
            textField.innerHTML = ""
            d3.event.stopPropagation();
        });*/
    var group = d3.select("#vis").selectAll("g.layer")
    .data(rankStat, d => d.key);

    group.exit().remove();

    group.enter().append("g")
        .classed("layer", true)
            .attr("fill", d => colors(d.key));

    var bars = d3.select("#vis").selectAll("g.layer").selectAll("rect")
        .data(d => d, e => e.data.key);

    bars.exit().remove()

    // Create rectangles
    let minY = d3.min(minRank) - minBuffer;
    bars.enter().append("rect")
        .merge(bars)
        .attr("x", entry => xScale(entry["data"][0]))
        .attr("y", entry => {
            return yScale(entry["data"].total) }
        )
        .attr("width", xScale.bandwidth())
        .attr("height",entry => {
            /** THIS SECTION HAS ISSUE */
            var number = entry["data"][1];
            console.log(number)
            
            /** for (i=0; i < rankTypes.length; i++) {
             *  var number = entry["data"][1][i];
             * return yScale(entry[0]) - yScale(number);
             * } */

            return yScale(entry[0]) - yScale(number);
        
            //console.log(number)
            //return yScale(entry[0]) - yScale(number);
        })
        .on('mouseover', tip.show)
        .on('mouseover', data => {
            textField.innerHTML = "<b>Advice: </b>" + data["data"][0] + "<br>" + 
                "<b>" + expertRank + ": </b>" + (data["data"][1][expertRank]) + "<br>" + 
                "<b>" + userRank + ": </b>" + (data["data"][1][userRank]);
            d3.event.stopPropagation();
        })
        .on('mouseout', () => {
            tip.hide
            textField.innerHTML = ""
            d3.event.stopPropagation();
        });

    svg.append("text")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height - margins.bottom - 70) + ")")
        .style("text-anchor", "middle")
        .text("Advice");
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 35) //variables inverted due to rotation
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Quality of Advice");

    var legend = d3.legendColor()
    .shape("rect")
    .shapeWidth(height / 6)
    .shapePadding(10)
    .orient('horizontal')
    .scale(colors);
    d3.select("#vis")
    .append("g")
    .attr("class", "legendRank")
    .attr("transform", `translate(375, 500)`)
    .call(legend);
}
