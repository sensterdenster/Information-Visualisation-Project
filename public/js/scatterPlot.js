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
                script+="<li> "+f.axisX +": "+f.crossX.toLocaleString() + "</li>";
                script+="<li> "+ f.axisY +": "+ f.crossY.toLocaleString() + "</li>";
                script+="<li> "+ "Movie: "+ f.title + "</li>";
                script+="</ul>";
                return script
            });

        //Plotting points for console 
        let pointsToPlot = [];

        //Variables for attributes to plot 
        let crossX, crossY, title, axisX, axisY;
        
        //Films for each attribute 
        (this.films).forEach((film) => {
            crossX = +(film[attributeX]);
            crossY = +(film[attributeY]);
            title = film["movie_title"].trim();
            axisX = attributeX;
            axisY = attributeY;

            //Condition to extract and store the points to be plotted
            if(!isNaN(crossX) && !isNaN(crossY) && (crossX != 0) && (crossY != 0))
                pointsToPlot.push({ "crossX": crossX, "crossY": crossY, "title": title, "axisX": axisX, "axisY": axisY}); 
        });

        //Setting scale for x axis 
        let xScale = d3.scaleLinear()
            .range([0, this.width])
            .domain(d3.extent(pointsToPlot, (d) => { return d.crossX}));

        //Scale for x axis initialised
        xScale.nice();

        //Settings scale for y axis
        let yScale = d3.scaleLinear()
            .range([this.height, 0])
            .domain(d3.extent(pointsToPlot, (d) => { return d.crossY}));

        //Initialising y axis
        yScale.nice();
       
        //Removing any current svg plot  
        this.svg.selectAll("g").remove();

        //Appending new plot with transofmation and translation 
        let g = this.svg.append("g").attr("transform", "translate(" + this.dimensions.left + "," + this.dimensions.top + ")");
    
        //Appending new plot
        g.append("g")
        .call(d3.axisLeft(yScale));
     

        //Setting font text, opacity, style etc
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
            .data(pointsToPlot);

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