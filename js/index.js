//this function runs on startup of the HTML page 
function processData() {
  getJsonData()
  .then(data => {
    var jsonData = data[0];
    var expertData = data[1];
    var userData = data[2];

    insertRankings(jsonData, userData, "user");
    insertRankings(jsonData, expertData, "expert");

    console.log(jsonData["Account Security"]);
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
        }
      } else {
        if(adviceKey != null) {
          // add new key value pair to the adviceKey string 
          adviceKey["User Ranking"] = rating;
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
