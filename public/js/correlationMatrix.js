class CorrelationMatrix {

    constructor(rows) {
        this.margin = {top: 29, right: 19, bottom: 29, left: 49};
        this.rows = rows;
        
        //Attains div element acces which is created for this plot and the element of the legend from HTML
        let tilesDiv = d3.select("#correlationMatrix")
        let boundsSVG = tilesDiv.node().getBoundingClientRect();

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

        //Loggind the data in console: console.log(data)
        let regionDomain = d3.set(data.map(function (d) {
                return d.x
            })).values();
        let y = d3.scaleOrdinal()
                .range([0, this.heightSVG])
                .domain(regionDomain),
            x = d3.scaleOrdinal()
                .range([0, this.widthSVG])
                .domain(regionDomain),

            xSpace = x.range()[1] - x.range()[0],
            ySpace = y.range()[1] - y.range()[0];
        //console.log(xSpace +"xspace-yspace"+ ySpace);
        let num = Math.sqrt(data.length);
        let colorScale = d3.scaleLinear()
                .domain([-1, 0, 1])
                .range(["#B22222", "#fff", "#000080"]);

        let cor = (this.svg).append("g").data(data)

        let rect = cor.selectAll('rect').data(data);
        let newrect= rect.enter().append("rect");

        rect.exit().remove;

        rect = newrect.merge(rect);
        //console.log(that.widthSVG)
        rect.attr('x', function (d) {
                return (that.widthSVG/(num+2))*d.col;
             })
            .attr('y', function (d) {
                //set default plot to row = 8, col = 1
                if(d.row === 8 && d.col === 1){
                    d3.select(this).classed("highlight-rect",true);
                    scPlot.plot(d.x, d.x, d.y, d.y);
                }
                    return (that.heightSVG / (num + 2)) * d.row;
            })
            .attr("width", function(d){
                //console.log(that.widthSVG/(num+1));
                    return that.widthSVG / (num + 2)
            })
            .attr("height", function(d){
                    return that.heightSVG/(num+2)
            })
            .attr("fill",function (d) {
                    return colorScale(d.value);
            })
            .call(toolTip)
            .on('mouseover', toolTip.show)
            .on('mouseout', toolTip.hide)
            .on("click", function(d){
                //console.log(this);
                rect.classed("highlight-rect",false);
                d3.select(this).classed("highlight-rect",true);
                // console.log(d.x);
                // console.log(d.y);
                scPlot.plot(d.x, d.x, d.y, d.y);
            });


        //Legend
        let aS = d3.scaleLinear()
            .range([0, this.heightSVG - this.margin.bottom])
            .domain([1, -1]);

        let yA = d3.axisRight(aS)
            .tickPadding(7);

        let aG = this.svg.append("g")
            // .attr("class", "y axis")
            .call(yA)
            .attr("transform", "translate(" + (this.widthSVG - (this.margin.right*2)) + " ,4)")

        let iR = d3.range(-1.0, 1.01, 0.01);
        let h = this.heightSVG / iR.length + 3;
        iR.forEach(function (d) {
            aG.append('rect')
                .style('fill', colorScale(d))
                .style('stroke-width', 0)
                .style('stoke', 'none')
                .attr('height', h)
                .attr('width', 10)
                .attr('x', 0)
                .attr('y', aS(d))
        });



    }//create()
}//class