/**
 * Created by Sen Thotawatte on 08/05/2021.
 */
 class CloudWord{
    //Constuctor to subset 15 films 
    constructor(films){
        this.films = films.slice(0,15);

    }

//Update function to update frequency list array 
update(){
    let listFrequency = [];

    //Function to check if a worst exists 
    function existingWord(existingWord) {
        return (listFrequency).some(function(element) {
            //If the element input texts matches an existing word increase the element size
            if(element.text == existingWord){
                element.size++;
                return true;
            }
            else{
                return false;
            }
        })
    }

        //Processing data and retrieving similar matching words for films
        this.films.forEach((film) => {
                //Keywordsplotted variable to store plotted words and separate them
                let keyWordsPlotted = film["plot_keywords"].split("|");

                //Trimming these words if they match
                keyWordsPlotted.forEach(function (wordPlotted) {
                    let listContainingWord = existingWord(wordPlotted.trim())
                    if(!listContainingWord){
                        listFrequency.push({"text": wordPlotted.trim(),"size": 1});
                    }
                })
            });
    
    //Logging frequency list in console 
    console.log(frequency_list)


    //Color variable storing scale color of trend function
    let color = d3v3.scale.linear()
        .domain([0,1,2,3,4,5,6,10,15,20])
        .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333"]);

    //Cloud size storing the words 
    d3v3.layout.cloud().size([799, 299])
        .words(listFrequency)
        .rotate(0)
        .fontSize(function(f) { 
            return f.size*4; 
        })
        .on("end", draw)
        .start();

    //Draw function to draw word on trend screen 
    function draw(cloudWords) {
        d3v3.select("#wordcanvas")
            .attr("class", "cloudword")
            .attr("height", 350)
            .attr("width", 850)
            .append("g")
            .attr("transform", "translate(200,200)")
            .selectAll("text")
            .data(cloudWords)
            .enter().append("text")
            .style("font-size", function(f) { 
                return f.size*3 + "px"; 
            })
            .style("fill", function(f, q) { 
                return color(q); 
            })
            .attr("transform", function(f) {
                return "translate(" + [f.x, f.y] + ")rotate(" + f.rotate + ")";
            })
            .text(function(f) { 
                return f.text; 
            });
    }
}
}
