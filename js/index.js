/* variables and data that is important to have */
const svg = d3.select("svg");
const categoryDropdown = document.getElementById("category");
const rankTypeDropdown = document.getElementById("rankType");
const slider = document.getElementById("rankView");
const sortCheckbox = document.getElementById("sort");
const sliderMax = document.getElementById("sliderMax");
const margins = { top: 50, bottom: 50, left: 100, right: 80 };
const width = 700;
const height = 500;

let data, selectedCategory, selectedRankType, sliderValue, sorted;

window.onload = function() {
    data = processedJson;
    selectedCategory = categoryDropdown.options[categoryDropdown.selectedIndex].value;
    selectedRankType = rankTypeDropdown.options[rankTypeDropdown.selectedIndex].value;
    sliderValue = slider.value;
    sorted = sortCheckbox.checked;
    renderVisualization(data[selectedCategory], selectedRankType, sliderValue, sorted);
}

categoryDropdown.onchange = () => {
    selectedCategory = categoryDropdown.options[categoryDropdown.selectedIndex].value;
    sliderMax.innerHTML = Object.entries(data[selectedCategory]).length
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

// //this function runs on startup of the HTML page
// function processData() {
//   getJsonData()
//   .then(data => {
//     var jsonData = data[0];
//     var expertData = data[1];
//     var userData = data[2];
//
//     insertRankings(jsonData, userData, "user");
//     insertRankings(jsonData, expertData, "expert");
//     data = jsonData;
//     return jsonData;
//   })
//   .then(jsonData => {
//     console.log(jsonData)
//     renderVisualization(jsonData);
//   })
//   .catch(e => console.log(e));
// }

//Retreieves all 3 promises that contain the JSONout-cast file, the expert and nonexpert html files
// function getJsonData() {
//   return Promise.all([
//     fetch("http://localhost:8080/").then(req => req.json()),
//     fetch("http://localhost:8080/expert").then(req => req.text()),
//     fetch("http://localhost:8080/user").then(req => req.text())
//   ])
// }


// function insertRankings(jsonData, data, boolean) {
//   for( let prop in jsonData ){
//     var securityField = jsonData[prop];
//
//     //arr contains all string advice keys in the security field json block
//     var arr = Object.keys(securityField);
//     var len = arr.length;
//     var rating = 0;
//
//     //get the rating for that advice string
//     for(i = 0; i < len; i++) {
//
//       var key = arr[i];
//       //for each advice key get the associated rating for it
//       rating = parseHTML(arr[i], data);
//
//       var adviceKey = securityField[key];
//       if(boolean.localeCompare("expert") == 0) {
//         if(adviceKey != null) {
//          // add new key value pair to the adviceKey string
//           adviceKey["Expert Ranking"] = rating;
//           adviceKey["name"] = key;
//         }
//       } else {
//         if(adviceKey != null) {
//           // add new key value pair to the adviceKey string
//           adviceKey["User Ranking"] = rating;
//           adviceKey["name"] = key;
//         }
//       }
//     }
//   }
// }


// function parseHTML(advice, data) {
//   var htmlArr = data.split('\n');
//   var rating = "";
//
//   for(let li in htmlArr) {
//
//     var str = htmlArr[li];
//     //get rid of li element within string
//     str = str.replace("<li>", "");
//     str = str.replace("</li>", "");
//
//     //get phrase + number from strnig
//     var index = str.lastIndexOf(',');
//     var adviceStr = str.substring(0, index);
//     var ratingStr = str.substring(index + 2, str.length);
//
//
//     if(advice.localeCompare(adviceStr.toLowerCase()) === 0) {
//       //console.log("here + " + adviceStr);
//       rating = ratingStr;
//     }
//
//   }
//
//   return rating;
// }



function renderVisualization(jsonData, rankType, rankRange, sorted) {
    /** FOR ALL VISUALIZATION STUFF */
    svg.selectAll("*").remove();
    let dataArray = Object.entries(jsonData);
    console.log(dataArray.length)
    let advice = dataArray.map((entry) => entry[0]);
    let rankings = dataArray.map((entry) => entry[1][rankType]);
    /** Plot Axes */
    let xScale = d3.scaleBand()
        .domain(advice)
        .range([margins.left, width])
        .padding(0.1);
    let yScale = d3.scaleLinear()
        .domain([d3.min(rankings), d3.max(rankings)])
        .range([height - margins.bottom, margins.top]);

    svg.append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(0, ${svg.attr("height") - margins.bottom})`)
        .call(d3.axisBottom(xScale));
    svg.append("g")
        .attr("id", "yAxis")
        .attr("transform", `translate(${margins.left}, 0)`)
        .call(d3.axisLeft(yScale));
    /** END of Plot Axes */

    // Create rectangles
    let minY = d3.min(rankings);
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
        });

    /** update purposes on svg */
    // function update(input, speed) {
    //   /** handling UI changes */
    //   var attr = d3.select("#category").property("value");
    //   var data = jsonData[attr];
    //
    //   /** USE THIS TO GET RANKING
    //    * if both, show both expert and user
    //    * if user, show user
    //    * if expert, show expert
    //    */
    //   var viewInput = d3.select('#rankType').property("value");
    //   // TODO: check if both, this is where the double bars will come in
    //
    //   /** TOGGLE SORT for VIS */
    //   var adviceSet = Object.keys(data);
    //  /*if (viewInput !== "Both") {
    //     data.sort(d3.select("#sort").property("checked")
    //           ? (a, b) => b.viewInput - a.viewInput
    //           : (a, b) => adviceSet.indexOf(a[name]) - adviceSet.indexOf(b[name]))
    //   }*/
    //   /** TODO: d3 goes here!!! */
    // }
}

