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

homeButton.onclick = () => renderCardinalityVisualization(data);

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
    renderVisualization(data[selectedCategory], selectedRankType, sliderValue, sorted);
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
        .range([height - margins.bottom, margins.top]);
    let colorScale = d3.scaleOrdinal().domain(categories)
        .range(["gold", "blue", "green", "yellow", "black", "grey", "cyan", "pink", "brown", "slateblue", "red", "orange"]);

    // Plot axes
    svg.append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(0, ${svg.attr("height") - margins.bottom})`)
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
            (height - margins.bottom + 40) + ")")
        .style("text-anchor", "middle")
        .text("Category");
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 35) //variables inverted due to rotation
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Quantity");
}

function renderVisualization(jsonData, rankType, rankRange, sorted) {
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
        .range([height - margins.bottom, margins.top]);

    // Plot axes
    svg.append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(0, ${svg.attr("height") - margins.bottom})`)
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
                return "darkred";
            } else {
                return "navy"
            }
        })
        .on('mouseover', tip.show)
        .on('mouseover', data => {
            console.log(rankType);
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
            (height - margins.bottom + 40) + ")")
        .style("text-anchor", "middle")
        .text("Advice");
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 35) //variables inverted due to rotation
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Quality");
}

