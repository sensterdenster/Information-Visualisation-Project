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

        let margin = {top: 19, right: 19, bottom: 99, left: 119},
            svgBounds = statsActorDirector_Div.node().getBoundingClientRect(),
            height = 449 - margin.top - margin.bottom,
            width = svgBounds.width - margin.right - margin.left;

        let svg = d3.select("#plotTrend")
            .attr("height", 449 + margin.bottom + margin.top)
            .attr("width", svgBounds.width);

        let ptg = d3.select("#plotTrendGroup")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let xScale = d3.scaleBand()
            .rangeRound([0, width])
            .padding([1])
            .domain((this.films).map(d => d["movie_title"]));

        let yScale = d3.scaleLinear()
            .range([height, 0])
            .domain(d3.extent(this.films, (d) => { return parseFloat(d[this.feature])}));

        yScale.nice();

        //Using d3 to add y-axis
        d3.select("#yAxis")
            .duration(1500)
            .call(d3.axisLeft(yScale))
            .transition();

        //Y-axis label being added
        let yLabel = d3.select("#yLabel").selectAll("text")
            .data([this.feature]);

        //Customising the y-axis label font, color, position, opacity, etc
        let yLabelEnter = yLabel.enter().append("text");
        yLabel.exit().remove();
        yLabel = yLabel.merge(yLabelEnter)
            .style("opacity", 0)
            .text((d) => { return d; })
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -width/10)
            .attr("text-anchor", "middle")
            .attr("fill", "#000")
            .attr("class", "font-weight-bold text-capitalize")
            .duration(1500)
            .transition()
            .style("opacity", 1);

        //Add the x Axis
        d3.select("#xAxis")
            .attr("transform", "translate(" + 0 + "," + height + ")")
            .transition()
            .duration(1500)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");


        let textLabelx = (this.directorOrActor) + " " + this.nameDirectorActor + "'s" + " films";

        //Add the x Axis label
        let Labelx = d3.select("#xLabel").selectAll("text")
            .data([textLabelx]);

        //Customising the x-axis label font, color, position opacity, etc
        let EnterLabelx = Labelx.enter().append("text");
        Labelx.exit().remove();
        Labelx = Labelx.merge(EnterLabelx)
            .attr("class", "font-weight-bold")
            .attr("fill", "#000")
            .style("opacity", 0)
            .attr("x", width/2)
            .attr("y", -7)
            .text((d) => { return d; })
            .attr("text-anchor", "middle")
            .transition()
            .duration(1500)
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
            .transition()
            .duration(1500)
            .attr("r", 4.5)
            .attr("cx", (d) => { return xScale(d["movie_title"]); })
            .attr("cy", (d) => { return yScale(d[this.feature]); });

        //Invoke the tip on the plot points
        plotPoints.call(tip)
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);

        //Add the line graph
        let lineGraph = d3.line()
            .x((d) => { return xScale(d["movie_title"]); })
            .y((d) => { return yScale(d[this.feature]); });

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