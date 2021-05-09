
class Filters {

    /**
     * Constructor for the Year Chart
     *
     * @param

     */
    constructor () {

        // Initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};
        let filters = d3.select("#filters");

        //fetch the svg bounds
        this.svgBounds = filters.node().getBoundingClientRect();
        //this.svgWidth = (this.svgBounds.width - this.margin.left - this.margin.right);
        this.svgWidth = (this.svgBounds.width/2 - this.margin.left - this.margin.right);
        this.svgHeight = 75;

        //add the svg to the div
        // this.svg = slider.append("svg")
        //     .attr("width", this.svgWidth)
        //     .attr("height", this.svgHeight)

        this.years = [];
        for(let i=1916;i<2016; i = i+1){
            this.years.push(i);
        }
        this.ratings = [];
        for(let i = 1.6; i<9.5; i = i+0.1){
            this.ratings.push(i);
        }


    };



    /**
     * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
     */
    create () {
        let that = this;

        //creating svg for year slider
        let yearsvg = d3.select("#yearSlider").append("svg")
            .attr("width", this.svgWidth + this.margin.right*2)
            .attr("height", this.svgHeight+10)

        // setup range for yearslider
        let xyear = d3.scaleLinear()
            .domain([1916, 2016])
            .range([0, this.svgWidth])
            .clamp(true);


        //creating group for yearslider
        let yearslider = yearsvg.append("g")
            .attr("class", "slider")
            //.attr("transform", "translate(" + this.margin.left/2 + "," + this.svgHeight/4  + ")");
            .attr("transform", "translate(" + this.margin.left/2 + ", 5 )");


        // axis
        yearslider.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0, 40)")
            // .attr("transform", "translate(0," + this.svgHeight/4 + ")")
            .call(d3.axisBottom(xyear).tickFormat(d3.format("d"))
            );


        //creating year slider/line
        let yearbrush = d3.brushX()
            .extent([[0, 0], [this.svgWidth, 35]])
            .on("start end", brushmoved);

        //.on("start brush end", brushmoved);


        let yearRect = yearslider.append("rect")
            .attr("width", xyear.range()[1] - xyear.range()[0])
            .attr("height", 25)
            .attr("rx",15,"ry",15)
            .attr("class","rangeSlider")
            .attr("transform", "translate(0,10)")
            //.attr("transform", "translate(0," + this.svgHeight/10 + ")")


        let gYearBrush = yearslider.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(0,6)")
            .call(yearbrush);

        let handle = gYearBrush.selectAll(".handle--custom")
            .data([{type: "w"}, {type: "e"}])
            .enter().append("path")
            .attr("class", "handle--custom")
            .attr("fill", "#666")
            .attr("fill-opacity", 0.8)
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5)
            .attr("cursor", "ew-resize");

        gYearBrush.call(yearbrush.move)//, [0.3, 0.5].map(xyear));

        function brushmoved() {
            let s = d3.event.selection;
            if (s == null) {
                //handle.attr("display", "none");
                let mousex = d3.mouse(this)[0];
                //with initial load of page set year to a range of 2000 to 2016
                if(isNaN(mousex)){
                    //let gend = gYearBrush.node().getBoundingClientRect()
                    //console.log(xyear(2010));
                    gYearBrush.call(yearbrush.move, [xyear(2000) , xyear(2016)]);
                    let start = 2000;
                    let end = 2016;
                    selectedYears = [];
                    selectedYears.push({start,end});
                    updateYearsText(start, end);
                }
                //if selection == null
                else{
                    gYearBrush.call(yearbrush.move, [mousex, mousex+0.0000000000001]);
                }
            } else {
                //let sx = s.map(xyear.invert);
                let start = Math.round(xyear.invert(s[0]));
                let end = Math.round(xyear.invert(s[1]));
                selectedYears = [];
                selectedYears.push({start, end});
                updateYearsText(start, end);
                handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + s[i] + "," + that.svgHeight /4 + ")"; });
            }
        }
        
        function updateYearsText(start, end) {
            let yearsText = document.getElementById("selectedYears");

            if(start == end)
                yearsText.innerText = "Selected Year(s): " + start;
            else
                yearsText.innerText = "Selected Year(s): " + start + " to " + end;
        }

        //ratings slider
        //setup scale for rating slider
        let xrating = d3.scaleLinear()
            .domain(d3.extent(this.ratings))
            .range([0, this.svgWidth])
            .clamp(true);

        //create svg element for rating slider
        let ratingsvg = d3.select("#ratingSlider").append("svg")
            .attr("width", this.svgWidth + this.margin.right*2)
            .attr("height", this.svgHeight+10)

        //creating group for yearslider
        let ratingSlider = ratingsvg.append("g")
            .attr("class", "slider")
            // .attr("transform", "translate(" + this.margin.left/2 + "," + this.svgHeight/4  + ")");
            .attr("transform", "translate(" + this.margin.left/2 + ", 5 )");

        // //initial load of page
        //var mousex = ratingSlider.node().getBoundingClientRect().x ;
        // console.log(ratingSlider.node().getBoundingClientRect())

        // axis
        ratingSlider.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0, 40)")
            // .attr("transform", "translate(0," + this.svgHeight/4 + ")")
            .call(d3.axisBottom(xrating));


        //creating year slider/line
        let ratingBrush = d3.brushX()
            .extent([[0, 0], [this.svgWidth,35]])
            //.handleSize([4])
            .on("start end", ratingBrushMoved);


        let ratingRect = ratingSlider.append("rect")
            .attr("width", xrating.range()[1] - xyear.range()[0])
            .attr("height", 25)
            .attr("rx",15,"ry",15)
            .attr("class","rangeSlider")
            .attr("transform", "translate(0,10)")
        //.attr("transform", "translate(0," + this.svgHeight/10 + ")")


        let gRatingBrush = ratingSlider.append("g")
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

        gRatingBrush.call(ratingBrush.move)//, [0.3, 0.5].map(xyear));

        function ratingBrushMoved() {
            let s = d3.event.selection;

            if (s == null) {
                //ratingHandle.attr("display", "none");
                //circle.classed("active", false);
                var mousex = d3.mouse(this)[0];

                //with initial load of page set rating to a range of 7 to 8
                if(isNaN(mousex)){
                    //gRatingBrush.call(ratingBrush.move, [417.33331298828136 , 495.33331298828125]);
                    gRatingBrush.call(ratingBrush.move, [xrating(8.2) , xrating(9.5)]);
                    let start = 8.2;
                    let end = 9.5;
                    selectedRatings = []
                    selectedRatings.push({start , end});
                    updateRatingsText(start, end);
                }
                //if selection == null
                else{
                    gRatingBrush.call(ratingBrush.move, [mousex, mousex+0.0000000000001]);
                }
                //console.log(mousex);
                //console.log(isNaN(mousex))
            }
            else{
                let start = Math.round(xrating.invert(s[0]) * 10) / 10;
                let end = Math.round(xrating.invert(s[1]) * 10) / 10;
                selectedRatings = []
                selectedRatings.push({start, end});
                updateRatingsText(start, end);
                ratingHandle.attr("display", null).attr("transform", function(d, i) { return "translate(" + s[i] + "," + that.svgHeight /4 + ")"; });
            }
        }

        function updateRatingsText(start, end) {
            let yearsText = document.getElementById("selectedRatings");

            if(start == end)
                yearsText.innerText = "Selected Rating(s): " + start;
            else
                yearsText.innerText = "Selected Rating(s): " + start + " to " + end;
        }

        //---------------//genre checkboxes //---------------//
        let genresvg = d3.select("#genreCheckBox").append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight*2.5);

        let genreg = genresvg.append("g");
        //.attr("transform", "translate(0, 5)");

        // .attr("transform", "translate(" + this.margin.left/2 + "," + this.svgHeight/4  + ")");

        let genrelist = Array.from(allGenres);
        let checkBox = genreg.selectAll("foreignObject");

        let currentX = 0;
        let currentY = 0;

        checkBox
            .data(genrelist).enter()
            .append("foreignObject")
            .attr('x', function(d,i){
                if(i != 0 && i % 6 == 0){
                    currentX = currentX + (that.svgWidth/5);
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
                    currentX = currentX + (that.svgWidth/5);
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