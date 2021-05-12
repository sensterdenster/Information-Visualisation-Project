
class Filters {


    //Constructor used for creating the year slider on movie explorer page
    constructor(){

        // Setting the margin values for the chart
        this.margin = {top: 9, bottom: 29, left: 49, right: 19};
        
        //Filtering variable to filter through select genres
        let filtering = d3.select("#filters");

        //fetch the svg bounds
        this.boundsSVG = filtering.node().getBoundingClientRect();

        //Height and width set for boundaries of year section
        this.heightSVG = 75;
        this.widthSVG = (this.boundsSVG.width/2 - this.margin.left - this.margin.right);

        //Sifting through IMDB ratings and pushing them
        this.IMDBratings = [];
        for(let i = 1.6; i<9.5; i = i+0.1){
            this.IMDBratings.push(i);
        }
        //Sifting through years of when movies are created (lowest - 1916, latest - 2016) and pushing them
        this.years = [];
        for(let i=1916;i<2016; i = i+1){
            this.years.push(i);
        }
    };



    /**
     * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
     */
    create () {
        let variable = this;

        // setup range for sliderYear
        let yearX = d3.scaleLinear()
            .range([0, this.widthSVG])
            .domain([1916, 2016])
            .clamp(true);

        //creating svg for year slider
        let SVGyears = d3.select("#sliderYear").append("svg")
            .attr("height", this.heightSVG+10)
            .attr("width", this.widthSVG + this.margin.right*2)
            
        //creating group for sliderYear
        let sliderYear = SVGyears.append("g")
            .attr("transform", "translate(" + this.margin.left/2 + ", 5 )")
            .attr("class", "slider");

        // Setting slider to move along x axis when controlled and setting this frame
        sliderYear.append("g")
            .attr("transform", "translate(0, 40)")
            .attr("class", "axis axis--x")
            .call(d3.axisBottom(yearX).tickFormat(d3.format("d"))
            );

        //Brush set for year with width value given and start and end to which it can move between
        let brushYear = d3.brushX()
            .on("start end", moveBrushFunction)
            .extent([[0, 0], [this.widthSVG, 35]]);

        //Setting the gap between the two sliders when moved together
        let gBrushYear = sliderYear.append("g")
            .attr("transform", "translate(0,6)")
            .attr("class", "brush")
            .call(brushYear);

        //Handle for brush slider and customising the theme (fill, opacity, stroke width, etc)
        let settingHandle = gBrushYear.selectAll(".handle--custom")
            .data([{type: "w"}, {type: "e"}])
            .enter().append("path")
            .attr("fill", "#F5F5DC")
            .attr("class", "handle--custom")
            .attr("cursor", "ew-resize")
            .attr("fill-opacity", 0.7)
            .attr("stroke-width", 1.4)
            .attr("stroke", "#F5F5DC");

        //Calling this function to allow the brush to move for the year slider
        gBrushYear.call(brushYear.move)

        //Movement of brush function 
        function moveBrushFunction() {
            let t = d3.event.selection;
            if (t == null) {
                let xMouse = d3.mouse(this)[0];
                //Setting initial loading of the page to display range of movies from the year 2000 - 2010 
                if(isNaN(xMouse)){
                    gBrushYear.call(brushYear.move, [yearX(2000) , yearX(2010)]);
                    let end = 2010;
                    let start = 2000;
                    yearSelected = [];
                    yearSelected.push({start,end});
                    textYearsUpdated(start, end);
                }
                //Else statement if the selection appears is null (no results)
                else{
                    gBrushYear.call(brushYear.move, [xMouse, xMouse + 0.00000000001]);
                }
            //Else if the event selection is empty, (no filters selected)
            } else {
                let end = Math.round(yearX.invert(t[1]));
                let start = Math.round(yearX.invert(t[0]));
                yearSelected = [];
                yearSelected.push({start, end});
                textYearsUpdated(start, end);
                settingHandle.attr("display", null).attr("transform", function(d, i) { return "translate(" + t[i] + "," + variable.heightSVG /4 + ")"; });
            }
        }
        
        //Function for updating the text for selected years
        function textYearsUpdated(start, end) {
            let textYears = document.getElementById("yearSelected");

            //If selected year is just one year where (start = end) just display the starting year, else if a range is selected display the start to the ending year
            if(start == end)
                textYears.innerText = "Year(s) Selected: " + start;
            else
                textYears.innerText = "Year(s) Selected: " + start + " to " + end;
        }

        //Rating slider - adjusting range, domain and scale for the rating slider 
        let xrating = d3.scaleLinear()
            .range([0, this.widthSVG])
            .domain(d3.extent(this.IMDBratings))
            .clamp(true);

        //Creating element of SVG for the slider
        let ratingsvg = d3.select("#sliderRating").append("svg")
            .attr("width", this.widthSVG + this.margin.right*2)
            .attr("height", this.heightSVG+10)

        //Creating slider year group so that the slider moves together when dragging in the middle 
        let sliderRating = ratingsvg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + this.margin.left/2 + ", 5 )");

        //x-Axis translation ammendments
        sliderRating.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0, 40)")
            .call(d3.axisBottom(xrating));

        //Creating slider line for year which extends from both sides of range outwards towards each end 
        let brushRating = d3.brushX()
            .extent([[0, 0], [this.widthSVG,35]])
            .on("start end", ratingBrushMoved);
        
        //Rating brush translation 
        let gBrushRating = sliderRating.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(0,6)")
            .call(brushRating);

        //Handling rating brush customisation and theme (fill, opacity, stroke width, etc)
        let ratingHandle = gBrushRating.selectAll(".handle--custom")
            .data([{type: "w"}, {type: "e"}])
            .enter().append("path")
            .attr("fill-opacity", 0.7)
            .attr("class", "handle--custom")
            .attr("fill", "#F5F5DC")
            .attr("cursor", "ew-resize")
            .attr("stroke", "#F5F5DC")
            .attr("stroke-width", 1.4);

        //Calling rating brush
        gBrushRating.call(brushRating.move)

        //Function for moving rating brush 
        function ratingBrushMoved() {
            let q = d3.event.selection;

            //If the rating selection is null (not chosen manually)
            if (q == null) {
                var xMouse = d3.mouse(this)[0];

                //If conditions which sets initial loading page rating slider from 8.0 to 9.0 automatically
                if(isNaN(xMouse)){
                    gBrushRating.call(brushRating.move, [xrating(8) , xrating(9)]);
                    let end = 9;
                    let start = 8;
                    ratingSelected = []
                    ratingSelected.push({start , end});
                    textRatingsUpdate(start, end);
                }
                //If rating selection is null otherwise 
                else{
                    gBrushRating.call(brushRating.move, [xMouse, xMouse+0.00000000001]);
                }
  
            }
            //Otherwise if ratings selected are chosen manually, set end and start to values of mouse selection and push these values
            else{
                let end = Math.round(xrating.invert(q[1]) * 10) / 10;
                let start = Math.round(xrating.invert(q[0]) * 10) / 10;
                ratingSelected = []
                ratingSelected.push({start, end});
                textRatingsUpdate(start, end);
                ratingHandle.attr("display", null).attr("transform", function(d, i) { return "translate(" + q[i] + "," + variable.heightSVG /4 + ")"; });
            }
        }

        //Function to update the text of the
        function textRatingsUpdate(start, end) {
            let textRatings = document.getElementById("ratingSelected");
            if(start == end)
                textRatings.innerText = "Rating(s) Selected: " + start;
            else
                textRatings.innerText = "Rating(s) Selected: " + start + " to " + end;
        }

        //Setting checkboxes for genres (shown on the right side of the screen of index.html)
        let genresvg = d3.select("#checkBoxGenre").append("svg")
            .attr("width", this.widthSVG)
            .attr("height", this.heightSVG*2.5);

        //Appending genres
        let appGenre = genresvg.append("g");

        //Getting genre list as an array 
        let listGenre = Array.from(allGenres);

        //Settings checkboxes to each genre
        let checkBoxes = appGenre.selectAll("foreignObject");

        //Creating variables to adjust padding of checkboxes
        let currentY = 0;
        let currentX = 0;

        checkBoxes
            .data(listGenre).enter()
            .append("foreignObject")
            .attr('x', function(d,i){
                if(i != 0 && i % 6 == 0){
                    currentX = currentX + (variable.widthSVG/5);
                    return currentX;
                }
                return currentX;
            })
            .attr('y',  function(d,i){
                if(i % 6 == 0){
                    currentY = 0;
                    return currentY;
                }
                else
                {
                    currentY += 33;
                    return currentY;
                }
            })
            .attr('width', 30)
            .attr('height', 20)
            .append("xhtml:body")
            .html((d) => {return "<input type='checkbox' value = " + d + " id =" + d + ">"});

        currentX = 18;
        currentY = 0;

        appGenre.selectAll("text").data(listGenre).enter()
            .append('text')
            .attr('x', function(d,i){

                if(i != 0 && i % 6 == 0){
                    currentX = currentX + (variable.widthSVG/5);
                    return currentX;
                }
                return currentX;
            })
            .attr('y',  function(d,i){
                if(i % 6 == 0){
                    currentY = 15;
                    return currentY;
                }
                else
                {
                    currentY += 33;
                    return currentY;
                }
            })
            .text(function(d) { return d; });

        // var scalev3 = d3v3.scale.linear()
        //     .range([0, 5000])
        // console.log(scalev3(0.4))


     }; // close create

}