/* variables and data that is important to have */
const svg = d3.select("svg");
const textField = document.getElementById("textField");
const homeButton = document.getElementById("homeButton");
//const categoryDropdown = document.getElementById("category");
const rankTypeDropdown = document.getElementById("rankType");
const submitBothBtn = document.getElementById("bothBtn");
const slider = document.getElementById("rankRange");
const submitRankBtn = document.getElementById("rankBtn");
const sortCheckbox = document.getElementById("sort");
const sliderMax = document.getElementById("sliderMax");
const margins = { top: 50, bottom: 50, left: 100, right: 80 };
const width = svg.attr("width");
const height = svg.attr("height");
var filtered = false;

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
    document.getElementById("homeButton").style.visibility = "hidden";
    data = processedJson;
    selectedRankType = rankTypeDropdown.options[rankTypeDropdown.selectedIndex].value;
   // sliderValue = slider.value;
    sorted = sortCheckbox.checked;
    renderCardinalityVisualization(data);
    document.getElementById("ui-div").style.visibility = "hidden";

   // alert("Note to User: The lower the ranking Number the Better!")
}

homeButton.onclick = () => { 
    renderCardinalityVisualization(data);
    document.getElementById("ui-div").style.visibility = "hidden";
    //d3.select(".legendLinear").attr("visibility", "visible");
    //d3.select(".legendLinear2").attr("visibility", "visible");
    document.getElementById("homeButton").style.visibility = "hidden";
    document.getElementById("bothView").style.visibility = "hidden";
}


submitRankBtn.onclick = () => { 
    const minRank = document.getElementById("minRank").value;
    const maxRank = document.getElementById("maxRank").value;
    
    let dataArray = Object.entries(data[selectedCategory]);

    let rankingArr = dataArray.filter(function(d) {
        var jsonObj = d[1];
        var ranking = Number(jsonObj[selectedRankType])
        return ranking <= Number(maxRank) && ranking >= Number(minRank);

    });

    var json = {};
    rankingArr.forEach(function(d){
        json[d[0]] = d[1];
    });
    renderVisualization(json, selectedRankType, sorted);
    renderBothVisualization(json, "Expert Ranking", "User Ranking", sorted, selectedCategory);
}


rankTypeDropdown.onchange = () => {
    selectedRankType = rankTypeDropdown.options[rankTypeDropdown.selectedIndex].value;
    if (selectedRankType === "Both") {
        console.log("here");
        renderBothVisualization(data[selectedCategory], "Expert Ranking", "User Ranking", sorted, selectedCategory);
        document.getElementById("bothView").style.visibility = "visible";
    } else {
        renderVisualization(data[selectedCategory], selectedRankType, sorted, selectedCategory);
    }
};

submitBothBtn.onclick = () => {
    if (selectedRankType === "Both") { 
        if (document.getElementById("scatter").checked) {
            renderScatter(data[selectedCategory], selectedCategory)
        } else {
            renderBothVisualization(data[selectedCategory], "Expert Ranking", "User Ranking", sorted, selectedCategory);
        }
    }

}


sortCheckbox.onchange = () => {
    sorted = sortCheckbox.checked;
    if (selectedRankType === "Both") {
        renderBothVisualization(data[selectedCategory], "Expert Ranking", "User Ranking", sorted, selectedCategory);
    } else {
        renderVisualization(data[selectedCategory], selectedRankType, sorted, selectedCategory);
    }
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
        .call(d3.axisBottom(xScale));

    svg.selectAll("#xAxis").selectAll("text")
        .attr("class", "xAxisText")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function (d) {
            return "rotate(-45)"
        });

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
            if (selectedRankType === "Both") {
                renderBothVisualization(jsonData[entry[0]], "Expert Ranking", "User Ranking", sorted,  entry[0]);
            } else {
                renderVisualization(jsonData[entry[0]], selectedRankType, sorted,  entry[0]);
            }
           // renderVisualization(jsonData[entry[0]], selectedRankType, sorted, entry[0]);
            document.getElementById("ui-div").style.visibility = "visible";
            d3.event.stopPropagation();
        })
        .attr("class", "homeRect")
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
        .attr("id", "categoryText")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height - margins.bottom - 15) + ")")
        .style("text-anchor", "middle")
        .text("Categories of Security Advice");
    svg.append("text")
        .attr("id", "recordsText")
        .attr("transform", "rotate(-90)")
        .attr("y", 35) //variables inverted due to rotation
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Advice in Each Category");

}

function renderVisualization(jsonData, rankType, sorted, selectedCategory) {
    document.getElementById("homeButton").style.visibility = "visible";

    document.getElementById("bothView").style.visibility = "hidden";
    document.getElementById("sortDiv").style.display = "block";
    document.getElementById("rankingDiv").style.display = "block";
    /** FOR ALL VISUALIZATION STUFF */
    svg.selectAll("*").remove();

    let dataArray = Object.entries(jsonData);
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
        .attr('class', 'inner-tip')
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
            document.getElementById("sidetext-div").style.visibility = "visible";
            var confidence = data[1]["Actionability"][0].split(':')
            var time = data[1]["Actionability"][1].split(':')
            var disruptive = data[1]["Actionability"][2].split(':') 
            var difficulty = data[1]["Actionability"][3].split(':')
            var accuracy = data[1]["Accuracy"][0].split(':')
            var advice = data[0].toUpperCase();

            textField.innerHTML = "<b>" + advice + "</b>" + "<br>" + "<br>" +
                "<b>" + rankType + ": </b>" + (data[1][rankType]) +  "<br>"
                + "<b> Example: </b>" + data[1]["Examples"][0] + "<br>"
               + "<b>" + accuracy[0] + ": " + "</b>"+ accuracy[1] + "<br>"
                + "<b>" + confidence[0] + ": " + "</b>"+ confidence[1] + "<br>"
                + "<b>" + time[0] + ": " + "</b>"+ time[1] + "<br>"
                + "<b>" + disruptive[0] + ": " + "</b>"+ disruptive[1] + "<br>"
                + "<b>" + difficulty[0] + ": " + "</b>"+ difficulty[1] + "<br>"
                ;
            d3.event.stopPropagation();
        })
        .on('mouseout', () => {
            document.getElementById("sidetext-div").style.visibility = "hidden";
            tip.hide
            textField.innerHTML = ""
            d3.event.stopPropagation();
        });

    svg.append("text")
        .attr("id", "adviceTxt")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height - margins.bottom - 20) + ")")
        .style("text-anchor", "middle")
        .text("Advice for " + selectedCategory);
    svg.append("text")
        .attr("id", "qualityTxt")
        .attr("transform", "rotate(-90)")
        .attr("y", 35) //variables inverted due to rotation
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(rankType + " Advice Rankings");

        svg.append("text")
        .attr("id", "noteTxt")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height  - 40) + ")")
        .style("text-anchor", "middle")
        .text("Note to User: Lower The Ranking Number The Better!" );
 }

function renderBothVisualization(jsonData, expertRank, userRank, sorted, selectedCategory) {
    document.getElementById("homeButton").style.visibility = "visible";
    document.getElementById("bothView").style.visibility = "visible";
    document.getElementById("sortDiv").style.display = "block";
    document.getElementById("rankingDiv").style.display = "block";
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
    let userRankings = dataArray.map((entry) => entry[1][userRank]);
    let expertRankings =  dataArray.map((entry) => entry[1][expertRank]);
    let maxRank = [d3.max(userRankings), d3.max(expertRankings)];
    let minRank = [d3.min(userRankings), d3.min(expertRankings)];


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
        .domain([0, d3.max(dataArray, d => d3.sum(rankTypes, k => +d[1][k]))]).nice()
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
        .attr('class', 'inner-tip')
        .offset([-10, 0])
        .html((data) => data[0] + "<br>" +
        "Ranking: <span class='tooltip'>" + (data[1][rankType]) + "</span><br>");

    svg.call(tip);

    let data = dataArray.map(d => {
        d[1][expertRank] = parseFloat(d[1][expertRank]);
        d[1][userRank] = parseFloat(d[1][userRank]);
        return d

    })

    var rankStat = d3.stack().keys(rankTypes)(data.map(d => d[1]));

    var colors = d3.scaleOrdinal()
        .range(["#FE9092", "#208EA3"])
        .domain(rankTypes);

    var group = d3.select("#vis").selectAll("g.layer")
    .data(rankStat, d => d.key);

    group.exit().remove();

    group.enter().append("g")
        .classed("layer", true)
            .attr("fill", d => colors(d.key));

    var bars = d3.select("#vis").selectAll("g.layer").selectAll("rect")
        .data(d => d, e => e.data[0]);

    bars.exit().remove()

    // Create rectangles
    let minY = d3.min(minRank) - minBuffer;
    bars.enter().append("rect")
        .merge(bars)
        .attr("x", entry => xScale(entry["data"]["name"]))
        .attr("y", entry => yScale(entry[1]))
        .attr("width", xScale.bandwidth())
        .attr("height",entry => yScale(entry[0]) - yScale(entry[1]))
        .on('mouseover', tip.show)
        .on('mouseover', data => {
            console.log(data["data"]["Actionability"][0]);
            document.getElementById("sidetext-div").style.visibility = "visible";
            let confidence = data["data"]["Actionability"][0].split(':')
            let time = data["data"]["Actionability"][1].split(':')
            let disruptive = data["data"]["Actionability"][2].split(':')
            let difficulty = data["data"]["Actionability"][3].split(':')
            let accuracy = data["data"]["Accuracy"][0].split(':')
            let advice = data["data"]["name"].toUpperCase();
            textField.innerHTML = `<b>${advice}</b><br><br>
                <b>User Ranking: </b>${data[1]["User Ranking"]}<br>
                <b>Expert Ranking: </b>${data[1]["Expert Ranking"]}<br>
                <b> Example: </b>${data["data"]["Examples"][0]}<br>
                <b>${accuracy[0]}: </b>${accuracy[1]}<br>
                <b>${confidence[0]}: </b>${confidence[1]}<br>
                <b>${time[0]}: </b>${time[1]}<br>
                <b>${disruptive[0]}: </b>${disruptive[1]}<br>
                <b>${difficulty[0]}: </b>${difficulty[1]}<br>`
            ;
            d3.event.stopPropagation();
        })
        .on('mouseout', () => {
            document.getElementById("sidetext-div").style.visibility = "hidden";
            tip.hide
            textField.innerHTML = ""
            d3.event.stopPropagation();
        });

    svg.append("text")
        .attr("id", "adviceTxt")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height - margins.bottom - 70) + ")")
        .style("text-anchor", "middle")
        .text("Advice for " + selectedCategory);
    svg.append("text")
        .attr("id", "qualityTxt")
        .attr("transform", "rotate(-90)")
        .attr("y", 35) //variables inverted due to rotation
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Advice Rankings");

    svg.append("text")
        .attr("id", "noteTxt")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height  - 40) + ")")
        .style("text-anchor", "middle")
        .text("Note to User: Lower The Ranking Number The Better!" );

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

function renderScatter(jsonData, category) {
    document.getElementById("homeButton").style.visibility = "visible";
    document.getElementById("bothView").style.visibility = "visible";
    document.getElementById("sortDiv").style.display = "none";
    document.getElementById("rankingDiv").style.display = "none";

    /** FOR ALL VISUALIZATION STUFF */
    svg.selectAll("*").remove();

    let dataArray = Object.entries(jsonData);
    let userRankings = dataArray.map((entry) => entry[1]["User Ranking"]);
    let expertRankings =  dataArray.map((entry) => entry[1]["Expert Ranking"]);

    // Set scales
    let xScale = d3.scaleLinear()
        .domain([d3.min(userRankings), d3.max(userRankings)]).nice()
        .range([margins.left, width - margins.right]);
    let yScale = d3.scaleLinear()
        .domain([d3.min(expertRankings), d3.max(expertRankings)]).nice()
        .range([height - 100 - margins.bottom, margins.top]);

    // Plot axes
    svg.append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(0, ${svg.attr("height") - 100 - margins.bottom})`)
        .call(d3.axisBottom(xScale))
    svg.append("g")
        .attr("id", "yAxis")
        .attr("transform", `translate(${margins.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Create axis labels
    svg.append("text")
        .attr("id", "categoryText")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height - margins.bottom - 40) + ")")
        .style("text-anchor", "middle")
        .text(`User Advice Ranking - ${category}`);
    svg.append("text")
        .attr("id", "recordsText")
        .attr("transform", "rotate(-90)")
        .attr("y", 35) //variables inverted due to rotation
        .attr("x",-(height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(`Expert Advice Ranking - ${category}`);

    let tip = d3.tip()
        .attr('class', 'inner-tip')
        .offset([-10, 0])
        .html((data) => data[0] + "<br>" +
            "Ranking: <span class='tooltip'>" + (data[1][rankType]) + "</span><br>");

    svg.call(tip);

    // Plot points
    svg.selectAll("circle")
        .data(dataArray)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("cx", entry => xScale(entry[1]["User Ranking"]))
        .attr("cy", entry => yScale(entry[1]["Expert Ranking"]))
        .on('mouseover', tip.show)
        .on('mouseover', data => {
            document.getElementById("sidetext-div").style.visibility = "visible";
            let confidence = data[1]["Actionability"][0].split(':')
            let time = data[1]["Actionability"][1].split(':')
            let disruptive = data[1]["Actionability"][2].split(':')
            let difficulty = data[1]["Actionability"][3].split(':')
            let accuracy = data[1]["Accuracy"][0].split(':')
            let advice = data[0].toUpperCase();

            textField.innerHTML = `<b>${advice}</b><br><br>
                <b>User Ranking: </b>${data[1]["User Ranking"]}<br>
                <b>Expert Ranking: </b>${data[1]["Expert Ranking"]}<br>
                <b> Example: </b>${data[1]["Examples"][0]}<br>
                <b>${accuracy[0]}: </b>${accuracy[1]}<br>
                <b>${confidence[0]}: </b>${confidence[1]}<br>
                <b>${time[0]}: </b>${time[1]}<br>
                <b>${disruptive[0]}: </b>${disruptive[1]}<br>
                <b>${difficulty[0]}: </b>${difficulty[1]}<br>`
            ;
            d3.event.stopPropagation();
        })
        .on('mouseout', () => {
            document.getElementById("sidetext-div").style.visibility = "hidden";
            tip.hide
            textField.innerHTML = ""
            d3.event.stopPropagation();
        });
}
