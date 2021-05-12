class CorrelationMatrix {

    constructor(rows) {
        //Margin values set for correlation matrix along with rows being initialised
        this.margin = {top: 29, right: 19, bottom: 29, left: 49};
        this.rows = rows;
        
        //Attains div element acces which is created for this plot and the element of the legend from HTML
        let tilesDiv = d3.select("#correlationMatrix")
        let boundsSVG = tilesDiv.node().getBoundingClientRect();

        //Height and width of SVG bounds set for margin scale
        this.widthSVG = boundsSVG.width - this.margin.left - this.margin.right;
        this.heightSVG = this.widthSVG;

        //SVG elements here are created within the div
        this.svg = tilesDiv.append("svg")
            .attr("height",this.heightSVG)
            .attr("width",this.widthSVG)


    }

    //Creating and setting up tooltip
    create() {
        let toolTip = d3.tip()
            .offset([-10, 0])
            .attr('class', 'tip-different')
            .html(function (f) {
                let text = "";
                text = "<ul>";
                text +=  "<li> "+f.x + " vs " + f.y + "</li>";
                text +=  "<li> "+"Correlation: "+ f.value + "</li>";
                text += "</ul>";
                return text
            });

        let that = this;
        let data = [];
        let col = 0;
        let row
        (this.rows).forEach(function (f) {
                let x = f[""];
                delete f[""];
                row = 0;
            for (let prop in f) {
                    let y = prop,
                        value = f[prop];
                    data.push({
                        y: y,
                        x: x,
                        value: +(+value).toFixed(2), //2 decimal places rounded
                        col: col,
                        row: row
                    });
                    row += 1;
                }
                col += 1;
            },this);

        //Setting domain of the function and its scales for x and y axis 
        let regionDomain = d3.set(data.map(function (d) {
                return d.x
            })).values();
        let y = d3.scaleOrdinal()
                .range([0, this.heightSVG])
                .domain(regionDomain),
            x = d3.scaleOrdinal()
                .range([0, this.widthSVG])
                .domain(regionDomain),

        //xSpace and ySpace range setting 
            ySpace = y.range()[1] - y.range()[0],
            xSpace = x.range()[1] - x.range()[0];

        //Setting parameters and values for scale of function for with and height
        let colorScale = d3.scaleLinear()
                .domain([-1, 0, 1])
                .range(["#B22222", "#fff", "#000080"]);

        //Setting number for square root of data length to be used in value to get appropriate width
        let number = Math.sqrt(data.length);

        //Core variable to append all data 
        let core = (this.svg).append("g").data(data)

        //Rectangle variable selects all from cor variable data
        let rectangle = core.selectAll('rect').data(data);

        //Newrect variable appends the data from rect
        let newrect= rectangle.enter().append("rect");

        //Close rect
        rectangle.exit().remove;

        //Rect is merged with newrect
        rectangle = newrect.merge(rectangle);

        //Rectangle attribute set for x and y function 
        rectangle.attr('x', function (e) {
                return (that.widthSVG/(number+2))*e.col;
             })
             //If a category is selected for both actor/director and attribute then plot the graph
            .attr('y', function (g) {
                //set default plot to row = 8, col = 1
                if(g.row === 8 && g.col === 1){
                    d3.select(this).classed("highlight-rect",true);
                    scPlot.plot(g.x, g.x, g.y, g.y);
                }
                    return (that.heightSVG / (number + 2)) * g.row;
            })
            //Fill color for scale of function
            .attr("fill",function(j) {
                return colorScale(d.value);
            })
            //Height of svg function
            .attr("height", function(i){
                return that.heightSVG/(number+2)
            })
            //Width of svg function
            .attr("width", function(h){
                return that.widthSVG / (number + 2)
            })
            //Calling tootip so that the content is shown on click and mouse hover
            .call(toolTip)
            .on('mouseout', toolTip.hide)
            .on('mouseover', toolTip.show)
            .on("click", function(p){
                rectangle.classed("highlight-rect",false);
                d3.select(this).classed("highlight-rect",true);
                scPlot.plot(p.x, p.x, p.y, p.y);
            });

        //Scale linear function to meet height of SVG and margin bottom 
        let scaleLin = d3.scaleLinear()
            .range([0, this.heightSVG - this.margin.bottom])
            .domain([1, -1]);

        //Setting axis right to scale to scaleLin function
        let axisRight = d3.axisRight(scaleLin)
            .tickPadding(7);

        //AppendG function to append axis right and translate it to stretch widht of SVG
        let appendG = this.svg.append("g")
            .call(axisRight)
            .attr("transform", "translate(" + (this.widthSVG - (this.margin.right*2)) + " ,4)")

        //Info range function to set range of the plot and set height appropriate to this length
        let infoRange = d3.range(-1.0, 1.01, 0.01);
        let h = this.heightSVG / infoRange.length + 3;
        infoRange.forEach(function (q) {
            appendG.append('rect')
                .style('fill', colorScale(q))
                .style('stroke-width', 0)
                .style('stoke', 'none')
                .attr('height', h)
                .attr('width', 10)
                .attr('x', 0)
                .attr('y', scaleLin(q))
        });



    }//create()
}//class