/**
 * Created by Sen Thotawatte on 08/05/2021.
 */
class ScatterPlot
{
    constructor()
    {
        //Selecting scatter plot using d3
        this.plotDiv = d3.select("#scatterPlot");

        //Excel films 
        this.films = filmsExcel;

        //Dimensions for scatter plot
        this.dimensions = {top: 19, bottom: 49, right: 19,  left: 109};

        //SVG bounds for plot
        let boundsSVG = this.plotDiv.node().getBoundingClientRect();

        //Height and width for svg
        this.height = 450 - this.dimensions.top - this.dimensions.bottom;
        this.width = boundsSVG.width - this.dimensions.left - this.dimensions.right;

        //Appending svg plot and setting width and bound to dimensions
        this.svg = this.plotDiv.append("svg")
            .attr("width", boundsSVG.width)
            .attr("height", 450 + this.dimensions.top + this.dimensions.bottom);

    }

    //Plotting scatter graph
    plot(labelX, labelY, attributeY, attributeX)
    {
        //Setting up the tip tool
        let tipTool = d3.tip()
            .attr('class', 'tip-different')
            .offset([-10, 0])
            .html(function (f) {
                let script = "";
                script="<ul>";
                script+="<li> "+f.xaxis +": "+f.cx.toLocaleString() + "</li>";
                script+="<li> "+ d.yaxis +": "+ f.crossY.toLocaleString() + "</li>";
                script+="<li> "+ "Movie: "+ f.title + "</li>";
                script+="</ul>";
                return script
            });

        //Plotting points for console 
        let plotPoints = [];

        //Variables for attributes to plot 
        let crossX, crossY, title, xaxis, yaxis;
        
        //Films for each attribute 
        (this.films).forEach((film) => {
            crossX = +(film[attributeX]);
            crossY = +(film[attributeY]);
            title = film["movie_title"].trim();
            xaxis = attributeX;
            yaxis = attributeY;
            if(!isNaN(crossX) && !isNaN(crossY) && (crossX != 0) && (crossY != 0))
                plotPoints.push({ "crossX": crossX, "crossY": crossY, "title": title, "xaxis": xaxis, "yaxis": yaxis}); //Extract and store the points to be plotted
        });

        let xScale = d3.scaleLinear()
            .domain(d3.extent(plotPoints, (d) => { return d.crossX}))
            .range([0, this.width]);

        xScale.nice();

        let yScale = d3.scaleLinear()
            .domain(d3.extent(plotPoints, (d) => { return d.crossY}))
            .range([this.height, 0]);

        yScale.nice();
       
        this.svg.selectAll("g").remove();
        let g = this.svg.append("g").attr("transform", "translate(" + this.dimensions.left + "," + this.dimensions.top + ")");
        //let g = this.svg.append("g").attr("transform", "translate(" + "0" + "," + this.dimensions.top + ")");

        g.append("g")
        .call(d3.axisLeft(yScale));
     

        this.svg.append("g").append("text")
            .attr("class", "font-weight-bold")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height/2)
            .attr("dy", "1.50em")
            .attr("text-anchor", "middle")
            .text(labelY.replace(/[^a-zA-Z]/g, " "));

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
            .text(labelX.replace(/[^a-zA-Z0-9]/g, " "));
            //.text(labelX.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi," "));


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
            .attr("crossX", (d) => { return xScale(d.crossX); })
            .attr("crossY", (d) => { return yScale(d.crossY); })
            .call(tipTool)
            .on('mouseover', tipTool.show)
            .on('mouseout', tipTool.hide);
    }
}