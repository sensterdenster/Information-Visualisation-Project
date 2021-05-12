class CorrelationMatrix {

    constructor(rows) {
        this.margin = {top: 29, right: 19, bottom: 29, left: 49};
        this.rows = rows;
        
        //Attains div element acces which is created for this plot and the element of the legend from HTML
        let tilesDiv = d3.select("#correlationMatrix")
        let svgBounds = tilesDiv.node().getBoundingClientRect();

        this.svgHeight = this.svgWidth;
        this.svgWidth = svgBounds.width - this.margin.left - this.margin.right;

        //creates svg elements within the div
        this.svg = tilesDiv.append("svg")
            .attr("width",this.svgWidth)
            .attr("height",this.svgHeight)
            //.attr("transform", "translate(" + this.margin.left/4 + ",0)")

    }

    create() {
        //Set up tooltip
        let tip = d3.tip()
            .attr('class', 'tip-different')
            .offset([-10, 0])
            .html(function (d) {
                let text = "";
                text = "<ul>";
                text +=  "<li> "+d.x + " vs " + d.y + "</li>";
                text +=  "<li> "+"Correlation: "+ d.value + "</li>";
                text += "</ul>";
                return text
            });

        let data = [];
        let that = this;
        let row
        let col = 0;
        (this.rows).forEach(function (d) {
                let x = d[""];
                delete d[""];
                row = 0;
            for (let prop in d) {
                    let y = prop,
                        value = d[prop];
                    data.push({
                        x: x,
                        y: y,
                        value: +(+value).toFixed(2), //rounding to two decimals
                        row: row,
                        col: col
                    });
                    row = row + 1;
                }
                col = col + 1;
            },this);

        //console.log(data);
        let domain = d3.set(data.map(function (d) {
                return d.x
            })).values();

        let x = d3.scaleOrdinal()
                .range([0, this.svgWidth])
                .domain(domain),
            y = d3.scaleOrdinal()
                .range([0, this.svgHeight])
                .domain(domain),
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
        //console.log(that.svgWidth)
        rect.attr('x', function (d) {
                return (that.svgWidth/(num+2))*d.col;
             })
            .attr('y', function (d) {
                //set default plot to row = 8, col = 1
                if(d.row === 8 && d.col === 1){
                    d3.select(this).classed("highlight-rect",true);
                    scPlot.plot(d.x, d.x, d.y, d.y);
                }
                    return (that.svgHeight / (num + 2)) * d.row;
            })
            .attr("width", function(d){
                //console.log(that.svgWidth/(num+1));
                    return that.svgWidth / (num + 2)
            })
            .attr("height", function(d){
                    return that.svgHeight/(num+2)
            })
            .attr("fill",function (d) {
                    return colorScale(d.value);
            })
            .call(tip)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
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
            .range([0, this.svgHeight - this.margin.bottom])
            .domain([1, -1]);

        let yA = d3.axisRight(aS)
            .tickPadding(7);

        let aG = this.svg.append("g")
            // .attr("class", "y axis")
            .call(yA)
            .attr("transform", "translate(" + (this.svgWidth - (this.margin.right*2)) + " ,4)")

        let iR = d3.range(-1.0, 1.01, 0.01);
        let h = this.svgHeight / iR.length + 3;
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