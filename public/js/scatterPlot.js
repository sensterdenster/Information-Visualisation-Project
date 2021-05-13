
class ScatterPlot
{
    constructor()
    {
        // this.films = movies;
        this.films = filmsExcel;
        this.plotDiv = d3.select("#scatterPlot");

        this.margin = {top: 20, right: 20, bottom: 50, left: 110};
        let boundsSVG = this.plotDiv.node().getBoundingClientRect();
        this.width = boundsSVG.width - this.margin.left - this.margin.right;
        this.height = 450 - this.margin.top - this.margin.bottom;

        this.svg = this.plotDiv.append("svg")
            .attr("width", boundsSVG.width)
            .attr("height", 450 + this.margin.top + this.margin.bottom);

    }

    plot(yAttribute, yLabel, xAttribute, xLabel)
    {
        //Set up tooltip
        let toolTip = d3.tip()
            .attr('class', 'tip-different')
            .offset([-10, 0])
            .html(function (d) {
                let text = "";
                text = "<ul>";
                text +=  "<li> "+d.xaxis +": "+d.cx.toLocaleString() + "</li>";
                text +=  "<li> "+ d.yaxis +": "+ d.cy.toLocaleString() + "</li>";
                text +=  "<li> "+ "Movie: "+ d.title + "</li>";
                text += "</ul>";
                return text

                // return   d.xaxis +": "+d.cx.toLocaleString() + d.yaxis +": "+ d.cy.toLocaleString() +"Movie: "+ d.title;
            });

        //console.log(xAttribute+": "+yAttribute)
        let plotPoints = [];
        let cx, cy, title, xaxis, yaxis;
        (this.films).forEach((movie) => {
            cx = +(movie[xAttribute]);
            cy = +(movie[yAttribute]);
            title = movie["movie_title"].trim();
            xaxis = xAttribute;
            yaxis = yAttribute;
            if(!isNaN(cx) && !isNaN(cy) && (cx != 0) && (cy != 0))
                plotPoints.push({ "cx": cx, "cy": cy, "title": title, "xaxis": xaxis, "yaxis": yaxis}); //Extract and store the points to be plotted
        });
        /* Debugging
        let count = 0
        plotPoints.forEach(function(data){
           if(count < 10) {
               console.log(data);
           }
            count++;
        });
        */
        let xScale = d3.scaleLinear()
            .domain(d3.extent(plotPoints, (d) => { return d.cx}))
            .range([0, this.width]);

        xScale.nice();

        let yScale = d3.scaleLinear()
            .domain(d3.extent(plotPoints, (d) => { return d.cy}))
            .range([this.height, 0]);

        yScale.nice();
        /*
        //Select
         let g = this.svg.selectAll("gplot").data(plotPoints);
         //enter
         let gEnter = this.svg.enter().append("g");
         //exit
         g.exit().remove();
         //merge
         g = gEnter.merge(g);
         //shift right
         g.attr("class","gplot")
             .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        */
        this.svg.selectAll("g").remove();
        let g = this.svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        //let g = this.svg.append("g").attr("transform", "translate(" + "0" + "," + this.margin.top + ")");

        g.append("g")
        .call(d3.axisLeft(yScale));
        // .transition()
        // .attr("opacity", 0)
        // .duration(1000)
        // .attr("opacity", 1)


        //Add the y Axis
        /*
         .transition()
         .attr("opacity", 0)
         .duration(2000)
         .attr("opacity", 1)
         */



        this.svg.append("g").append("text")
            .attr("class", "font-weight-bold")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height/2)
            .attr("dy", "1.50em")
            .attr("text-anchor", "middle")
            .text(yLabel.replace(/[^a-zA-Z]/g, " "));

        //Add the x Axis
        g.append("g")
            .attr("transform", "translate(" + 0 + "," + this.height + ")")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");


        this.svg.append("g").append("text")
            .attr("class", "font-weight-bold")
            .attr("fill", "#000")
            .attr("x", this.width/1.5)
            .attr("y", this.height*1.3)
            //.attr("dy", "3.50em")
            .attr("text-anchor", "middle")
            .text(xLabel.replace(/[^a-zA-Z0-9]/g, " "));
            //.text(xLabel.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi," "));


        let points = g.selectAll("circle")
            .data(plotPoints);

        let pointsEnter = points
            .enter().append("circle");

        points.exit().remove();

        points = pointsEnter.merge(points);

        points
            .attr("transform", "translate(" + (3) + "," + (-3) + ")")
            .attr("fill", "#000")
            .attr("opacity", 0.5)
            .attr("r", 4)
            .attr("cx", (d) => { return xScale(d.cx); })
            .attr("cy", (d) => { return yScale(d.cy); })
            .call(toolTip)
            .on('mouseover', toolTip.show)
            .on('mouseout', toolTip.hide);




    }
}