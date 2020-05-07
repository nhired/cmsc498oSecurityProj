/* variables and data that is important to have */
const svg = d3.select("svg");
const homeButton = document.getElementById("homeButton");
const categoryDropdown = document.getElementById("category");
const rankTypeDropdown = document.getElementById("rankType");
const slider = document.getElementById("rankRange");
const sortCheckbox = document.getElementById("sort");
const sliderMax = document.getElementById("sliderMax");
const margins = { top: 50, bottom: 50, left: 100, right: 80 };
const width = svg.attr("width");
const height = svg.attr("height");

let data, selectedCategory, selectedRankType, sliderValue, sorted;

window.onload = () => {
    data = processedJson;
    selectedCategory = categoryDropdown.options[categoryDropdown.selectedIndex].value;
    selectedRankType = rankTypeDropdown.options[rankTypeDropdown.selectedIndex].value;
    sliderValue = slider.value;
    sorted = sortCheckbox.checked;
    renderCardinalityVisualization(data);
}

homeButton.onclick = () => renderCardinalityVisualization(data);


categoryDropdown.onchange = () => {
    selectedCategory = categoryDropdown.options[categoryDropdown.selectedIndex].value;
    sliderMax.innerHTML = Object.entries(data[selectedCategory]).length;
    slider.max = Object.entries(data[selectedCategory]).length;
    slider.value = Object.entries(data[selectedCategory]).length;
    sliderValue = slider.value;
    renderVisualization(data[selectedCategory], selectedRankType, sliderValue, sorted);
};

rankTypeDropdown.onchange = () => {
    selectedRankType = rankTypeDropdown.options[rankTypeDropdown.selectedIndex].value;
    renderVisualization(data[selectedCategory], selectedRankType, sliderValue, sorted);
};

slider.oninput = () => {
    sliderValue = slider.value;
    renderVisualization(data[selectedCategory], selectedRankType, sliderValue, sorted);
}

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
        .html((data) => data[0]);

    svg.call(tip);

    // Create rectangles
    let minY = d3.min(counts) - minBuffer;
    d3.select("svg").selectAll("rect")
        .data(dataArray)
        .enter()
        .append("rect")
        .attr("x", entry => xScale(entry[0]))
        .attr("y", entry => yScale(Object.keys(jsonData[entry[0]]).length))
        .attr("width", xScale.bandwidth())
        .attr("height", entry => {
            let number = Object.keys(jsonData[entry[0]]).length;
            return yScale(minY) - yScale(number);
        })
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
    dataArray = dataArray.slice(0, ++rankRange);
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
        .html((data) => data[0]);

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
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

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

