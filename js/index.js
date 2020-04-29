//this function runs on startup of the HTML page 
function processData() {
  getJsonData()
  .then(data => {
    var jsonData = data[0];
    var expertData = data[1];
    var userData = data[2];

    insertRankings(jsonData, userData, "user");
    insertRankings(jsonData, expertData, "expert");
    return jsonData;
  })
  .then(jsonData => {
    renderVisualization(jsonData);
  })
  .catch(e => console.log(e));
}

//Retreieves all 3 promises that contain the JSONout-cast file, the expert and nonexpert html files
function getJsonData() {  
  return Promise.all([
    fetch("http://localhost:8080/").then(req => req.json()),
    fetch("http://localhost:8080/expert").then(req => req.text()),
    fetch("http://localhost:8080/user").then(req => req.text())
  ])
}


function insertRankings(jsonData, data, boolean) {

  for( let prop in jsonData ){
    var securityField = jsonData[prop];

    //arr contains all string advice keys in the security field json block 
    var arr = Object.keys(securityField);
    var len = arr.length;
    var rating = 0;

    //get the rating for that advice string 
    for(i = 0; i < len; i++) {

      var key = arr[i];
      //for each advice key get the associated rating for it 
      rating = parseHTML(arr[i], data); 

      var adviceKey = securityField[key];
      if(boolean.localeCompare("expert") == 0) {
        if(adviceKey != null) {
         // add new key value pair to the adviceKey string 
          adviceKey["Expert Ranking"] = rating;
          adviceKey["name"] = key;
        }
      } else {
        if(adviceKey != null) {
          // add new key value pair to the adviceKey string 
          adviceKey["User Ranking"] = rating;
          adviceKey["name"] = key;
        }
      }
    }
  }
}


function parseHTML(advice, data) {
  var htmlArr = data.split('\n');
  var rating = "";

  for(let li in htmlArr) {

    var str = htmlArr[li];
    //get rid of li element within string
    str = str.replace("<li>", "");
    str = str.replace("</li>", "");

    //get phrase + number from strnig 
    var index = str.lastIndexOf(',');
    var adviceStr = str.substring(0, index);
    var ratingStr = str.substring(index + 2, str.length);


    if(advice.localeCompare(adviceStr.toLowerCase()) === 0) {
      //console.log("here + " + adviceStr);
      rating = ratingStr;
    }

  }

  return rating;
}

/* variables and data that is important to have */
var margins = { top: 50, bottom: 50, left: 100, right: 80 };
var width = 700;
var height = 500;

function renderVisualization(jsonData) {
  /** FOR ALL VISUALIZATION STUFF */
  let svg = d3.select("svg");
  svg.html("");

  var catSet = [];
  for (let prop in jsonData) {
    catSet.push(prop);
  }

  var rankSet = ["Both", "Expert Ranking", "User Ranking"];

  var categories = d3.select("#category").selectAll("option")
      .data(catSet)
      .enter().append("option")
      .text(d => d);

  var rankType = d3.select("#rankType").selectAll("option")
  .data(rankSet)
  .enter().append("option")
  .text(d => d);
  
  /** Plot Axes */
  var xScale = d3.scaleBand()
  .range([margins.left, width])
  .padding(0.1);

  var yScale = d3.scaleLinear()
  .rangeRound([height - 50 - margins.bottom, margins.top]);

  svg.append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0, ${svg.attr("height") - margins.bottom})`)
      .call(d3.axisBottom(xScale));
  svg.append("g")
      .attr("id", "yAxis")
      .attr("transform", `translate(${margins.left}, ${margins.top})`)
      .call(d3.axisLeft(yScale));
  /** END of Plot Axes */

  
  /** updates based on info given */
  update(d3.select("#category").property("value"), 0);

  /** update purposes on svg */
  function update(input, speed) {
    
    /** handling UI changes */
    var attr = d3.select("#category").property("value");
    var data = jsonData[attr];

    /** USE THIS TO GET RANKING
     * if both, show both expert and user
     * if user, show user
     * if expert, show expert
     */
    var viewInput = d3.select('#rankType').property("value");
    // TODO: check if both, this is where the double bars will come in
    
    /** TOGGLE SORT for VIS */
    var adviceSet = Object.keys(data);
   /*if (viewInput !== "Both") {
      data.sort(d3.select("#sort").property("checked")
            ? (a, b) => b.viewInput - a.viewInput
            : (a, b) => adviceSet.indexOf(a[name]) - adviceSet.indexOf(b[name]))
    }*/
    /** TODO: d3 goes here!!! */
    let minY = d3.min(adviceSet.map(advice => data[advice]["User Ranking"]));
    svg.selectAll("rect")
        .data(slice)
        .enter()
        .append("rect")
        .attr("x", entry => xScale(entry["name"]))
        .attr("y", entry => yScale(entry["User Ranking"]))
        .attr("width", xScale.bandwidth())
        .attr("height", entry => {
          let number = entry["User Ranking"];
          return yScale(minY) - yScale(number);
        })

  }
  
  /** UPDATES VISUALIZATION EVERY TIME UI CHANGES */
  renderVisualization.update = update;

  /** DROPDOWN & CHECKBOX LISTENERS FOR VISUALIZATIONS */
  d3.select("#category")
    .on("change", function () {
        update(this.value, 750)
    });
  d3.select("#sort")
    .on("click", function () {
        update(selectCat.property("value"), 750)
    });
  d3.select("#rankType")
      .on("change", function () {
        update(this.value, 750)
      });
  d3.select("#rankRange")
    .on("change", function () {
        update(this.value, 750)
    });
}

