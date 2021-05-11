class StatsActorDirector{
    
    constructor(directorOrActor, nameDirectorActor, films, feature)
    {
        this.films = films;                   //Director or Actor's films
        this.feature = feature;                 //Feature (attributes) for movie
        this.nameDirectorActor = nameDirectorActor; //Director or Actor's name
        this.directorOrActor = directorOrActor; //Indicates the entity whose stats are being plotted

    }

    plot()
    {
        let statsActorDirector_Div = d3.select("#statsActorDirector");

        let ptg = d3.select("#plotTrendGroup")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let margin = {top: 19, right: 19, bottom: 99, left: 119},
        svgBounds = statsActorDirector_Div.node().getBoundingClientRect(),
        height = 449 - margin.top - margin.bottom,
        width = svgBounds.width - margin.right - margin.left;
            
        let svg = d3.select("#plotTrend")
            .attr("height", 449 + margin.bottom + margin.top)
            .attr("width", svgBounds.width);

        let yScale = d3.scaleLinear()
        .range([height, 0])
        .domain(d3.extent(this.films, (d) => { return parseFloat(d[this.feature])}));

        let xScale = d3.scaleBand()
            .rangeRound([0, width])
            .padding([1])
            .domain((this.films).map(d => d["movie_title"]));

      
        yScale.nice();

        //Using d3 to add y-axis
        d3.select("#yAxis")
            .transition()
            .duration(1500)
            .call(d3.axisLeft(yScale));

        //Y-axis label being added
        let yLabel = d3.select("#yLabel").selectAll("text")
            .data([this.feature]);

        //Customising the y-axis label font, color, position, opacity, etc
        let yLabelEnter = yLabel.enter().append("text");
        yLabel.exit().remove();
        yLabel = yLabel.merge(yLabelEnter)
            .style("opacity", 0)
            .attr("transform", "rotate(-90)")
            .attr("fill", "#000")
            .attr("x", -height/2)
            .attr("y", -width/10)
            .attr("text-anchor", "middle")
            .attr("class", "font-weight-bold text-capitalize")
            .text((d) => { return d; })
            .duration(1500)
            .transition()
            .style("opacity", 1);

        //Add the x Axis
        d3.select("#xAxis")
            .transition()
            .duration(1500)
            .selectAll("text")
            .call(d3.axisBottom(xScale))
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)")
            .attr("transform", "translate(" + 0 + "," + height + ")");


        let textLabelx = (this.directorOrActor) + " " + this.nameDirectorActor + "'s" + " films";

        //Add the x Axis label
        let Labelx = d3.select("#xLabel").selectAll("text")
            .data([textLabelx]);

        //Customising the x-axis label font, color, position opacity, etc
        let EnterLabelx = Labelx.enter().append("text");
        xLabel.exit().remove();
        xLabel = xLabel.merge(EnterLabelx)
            .attr("fill", "#000")
            .style("opacity", 0)
            .attr("class", "font-weight-bold")
            .attr("y", -7)
            .attr("x", width/2)
            .transition()
            .attr("text-anchor", "middle")
            .duration(1500)
            .text((d) => { return d; })
            .style("opacity", 1);

        //Plotpoints being added 
        let plotPoints = ptg.selectAll("circle")
            .data(this.films);

        //Initialize tooltip
        let tip = d3.tip().attr("class", "d3-tip-node").html((d) => {

            if(this.feature == "imdb_score")
                return d["movie_title"].trim() + ": " + parseFloat(d[this.feature]);
            else
                return d["movie_title"].trim() + ": " + parseInt(d[this.feature]).toLocaleString();
        });

        let enterPoints = plotPoints.enter().append("circle");
        plotPoints.exit().remove();
        plotPoints = plotPoints.merge(enterPoints);

        plotPoints
            .duration(1500)
            .transition()
            .attr("cx", (d) => { return xScale(d["movie_title"]); })
            .attr("r", 4.5)
            .attr("cy", (d) => { return yScale(d[this.feature]); });

        //Invoke the tip on the plot points
        plotPoints.call(tip)
            .on("mouseout", tip.hide)
            .on("mouseover", tip.show);

        //Add the line graph
        let lineGraph = d3.line()
            .y((d) => { return yScale(d[this.feature]); })
            .x((d) => { return xScale(d["movie_title"]); });

        let plotLines = ptg.selectAll(".line")
            .data([this.films]);

        let enterLines = plotLines.enter().append("path");
        plotLines.exit().remove();
        plotLines = plotLines.merge(enterLines)
            .attr("class", "line")
            .transition()
            .duration(1500)
            .attr("d", lineGraph);
    }
}