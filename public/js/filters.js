
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
        this.ratings = [];
        for(let i = 1.6; i<9.5; i = i+0.1){
            this.ratings.push(i);
        }
        //Sifting through years of when movies are created and pushing them
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

        //May not need this check..
        let rectYear = sliderYear.append("rect")
            .attr("rx",15,"ry",15)
            .attr("height", 25)
            .attr("width", yearX.range()[1] - yearX.range()[0])
            .attr("transform", "translate(0,10)")
            .attr("class","rangeSlider")
        //May not need this 

        //Setting the gap between the two sliders when moved together
        let gBrushYear = sliderYear.append("g")
            .attr("transform", "translate(0,6)")
            .attr("class", "brush")
            .call(brushYear);

        //Handle for brush slider and customising the theme
        let settingHandle = gBrushYear.selectAll(".handle--custom")
            .data([{type: "w"}, {type: "e"}])
            .enter().append("path")
            .attr("fill", "#666")
            .attr("class", "handle--custom")
            .attr("cursor", "ew-resize")
            .attr("fill-opacity", 0.8)
            .attr("stroke-width", 1.5)
            .attr("stroke", "#000");

        //Calling this function to allow the brush to move for the year slider
        gBrushYear.call(brushYear.move)

        //Movement of brush function 
        function moveBrushFunction() {
            let t = d3.event.selection;
            if (t == null) {
                let xMouse = d3.mouse(this)[0];
                //Setting initial loading of the page to display range of movies from the year 2000 - 2016 
                if(isNaN(xMouse)){
                    gBrushYear.call(brushYear.move, [yearX(2000) , yearX(2016)]);
                    let end = 2016;
                    let start = 2000;
                    yearSelected = [];
                    yearSelected.push({start,end});
                    textYearsUpdated(start, end);
                }
                //Else statement if the selection appears is null (no results)
                else{
                    gBrushYear.call(brushYear.move, [xMouse, xMouse + 0.00000000001]);
                }
            //else if the event selection is empty, (no filters selected)
            } else {
                let end = Math.round(yearX.invert(t[1]));
                let start = Math.round(yearX.invert(t[0]));
                yearSelected = [];
                yearSelected.push({start, end});
                textYearsUpdated(start, end);
                settingHandle.attr("display", null).attr("transform", function(d, i) { return "translate(" + t[i] + "," + variable.heightSVG /4 + ")"; });
            }
        }
        
        function textYearsUpdated(start, end) {
            let yearsText = document.getElementById("yearSelected");

            if(start == end)
                yearsText.innerText = "Selected Year(s): " + start;
            else
                yearsText.innerText = "Selected Year(s): " + start + " to " + end;
        }

        //ratings slider
        //setup scale for rating slider
        let xrating = d3.scaleLinear()
            .domain(d3.extent(this.ratings))
            .range([0, this.widthSVG])
            .clamp(true);

        //create svg element for rating slider
        let ratingsvg = d3.select("#sliderRating").append("svg")
            .attr("width", this.widthSVG + this.margin.right*2)
            .attr("height", this.heightSVG+10)

        //creating group for sliderYear
        let sliderRating = ratingsvg.append("g")
            .attr("class", "slider")
            // .attr("transform", "translate(" + this.margin.left/2 + "," + this.heightSVG/4  + ")");
            .attr("transform", "translate(" + this.margin.left/2 + ", 5 )");

        // //initial load of page
        //var mousex = sliderRating.node().getBoundingClientRect().x ;
        // console.log(sliderRating.node().getBoundingClientRect())

        // axis
        sliderRating.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0, 40)")
            // .attr("transform", "translate(0," + this.heightSVG/4 + ")")
            .call(d3.axisBottom(xrating));


        //creating year slider/line
        let ratingBrush = d3.brushX()
            .extent([[0, 0], [this.widthSVG,35]])
            //.handleSize([4])
            .on("start end", ratingBrushMoved);


        let ratingRect = sliderRating.append("rect")
            .attr("width", xrating.range()[1] - yearX.range()[0])
            .attr("height", 25)
            .attr("rx",15,"ry",15)
            .attr("class","rangeSlider")
            .attr("transform", "translate(0,10)")
        //.attr("transform", "translate(0," + this.heightSVG/10 + ")")


        let gRatingBrush = sliderRating.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(0,6)")
            .call(ratingBrush);

        let ratingHandle = gRatingBrush.selectAll(".handle--custom")
            .data([{type: "w"}, {type: "e"}])
            .enter().append("path")
            .attr("class", "handle--custom")
            .attr("fill", "#666")
            .attr("fill-opacity", 0.8)
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5)
            .attr("cursor", "ew-resize");

        gRatingBrush.call(ratingBrush.move)

        function ratingBrushMoved() {
            let s = d3.event.selection;

            if (s == null) {
                //ratingHandle.attr("display", "none");
                //circle.classed("active", false);
                var xMouse = d3.mouse(this)[0];

                //with initial load of page set rating to a range of 7 to 8
                if(isNaN(xMouse)){
                    //gRatingBrush.call(ratingBrush.move, [417.33331298828136 , 495.33331298828125]);
                    gRatingBrush.call(ratingBrush.move, [xrating(8.2) , xrating(9.5)]);
                    let start = 8.2;
                    let end = 9.5;
                    ratingSelected = []
                    ratingSelected.push({start , end});
                    updateRatingsText(start, end);
                }
                //if selection == null
                else{
                    gRatingBrush.call(ratingBrush.move, [xMouse, xMouse+0.0000000000001]);
                }
                //console.log(mousex);
                //console.log(isNaN(mousex))
            }
            else{
                let start = Math.round(xrating.invert(s[0]) * 10) / 10;
                let end = Math.round(xrating.invert(s[1]) * 10) / 10;
                ratingSelected = []
                ratingSelected.push({start, end});
                updateRatingsText(start, end);
                ratingHandle.attr("display", null).attr("transform", function(d, i) { return "translate(" + s[i] + "," + variable.heightSVG /4 + ")"; });
            }
        }

        function updateRatingsText(start, end) {
            let yearsText = document.getElementById("ratingSelected");

            if(start == end)
                yearsText.innerText = "Selected Rating(s): " + start;
            else
                yearsText.innerText = "Selected Rating(s): " + start + " to " + end;
        }

        //---------------//genre checkboxes //---------------//
        let genresvg = d3.select("#checkBoxGenre").append("svg")
            .attr("width", this.widthSVG)
            .attr("height", this.heightSVG*2.5);

        let genreg = genresvg.append("g");
        //.attr("transform", "translate(0, 5)");

        // .attr("transform", "translate(" + this.margin.left/2 + "," + this.heightSVG/4  + ")");

        let genrelist = Array.from(allGenres);
        let checkBox = genreg.selectAll("foreignObject");

        let currentX = 0;
        let currentY = 0;

        checkBox
            .data(genrelist).enter()
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

        genreg.selectAll("text").data(genrelist).enter()
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