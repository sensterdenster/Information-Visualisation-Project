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
        //Using d3 to set statsActorDirector for actors and directors 
        let statsActorDirector_Div = d3.select("#statsActorDirector");

        //Margin setting for graph 
        let margin = {top: 19, bottom: 99, left: 119, right: 19},
            boundsSVG = statsActorDirector_Div.node().getBoundingClientRect(),
            height = 449 - margin.bottom - margin.top,
            width = boundsSVG.width - margin.right - margin.left;
        
        //Setting height and width of plot
        let svg = d3.select("#plotTrend")
            .attr("width", boundsSVG.width)
            .attr("height", 449 + margin.bottom + margin.top);

        //Plotting trend group through d3 for transformations and translation
        let ptg = d3.select("#plotTrendGroup")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //Setting padding, width and domain of scale x of plot 
        let scaleX = d3.scaleBand()
            .padding([1])
            .rangeRound([0, width])
            .domain((this.films).map(d => d["movie_title"]));

        //Setting padding, width and domain of scale y of plot 
        let scaleY = d3.scaleLinear()
            .range([height, 0])
            .domain(d3.extent(this.films, (d) => { return parseFloat(d[this.feature])}));
        
        scaleY.nice();

        //Using d3 to add y-axis
        d3.select("#yAxis")
            .transition()
            .call(d3.axisLeft(scaleY))
            .duration(1500);

        //Y-axis label being added
        let Labely = d3.select("#yLabel").selectAll("text")
            .data([this.feature]);

        //Customising the y-axis label font, color, position, opacity, etc
        let EnterLabely = Labely.enter().append("text");
        Labely.exit().remove();
        Labely = Labely.merge(EnterLabely)
            .attr("text-anchor", "middle")
            .attr("x", -height/2)
            .attr("y", -width/10)
            .attr("class", "font-weight-bold text-capitalize")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .style("opacity", 0)
            .text((d) => { return d; })
            .transition()
            .duration(1500)
            .style("opacity", 1);

        //x-Axis being added 
        d3.select("#xAxis")
            .attr("transform", "translate(" + 0 + "," + height + ")")
            .transition()
            .duration(1500)
            .call(d3.axisBottom(scaleX))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-65)")
            .attr("dx", "-.8em")
            .attr("dy", ".15em");

        let textLabelx = (this.directorOrActor) + " " + this.nameDirectorActor + "'s" + " movies";

        // x-Axis Label being added using d3
        let Labelx = d3.select("#xLabel").selectAll("text")
            .data([textLabelx]);

        //Customising the x-axis label font, color, position opacity, etc
        let EnterLabelx = Labelx.enter().append("text");
        Labelx.exit().remove();
        Labelx = Labelx.merge(EnterLabelx)
            .style("opacity", 0)
            .attr("x", width/2)
            .attr("y", -7)
            .attr("class", "font-weight-bold")
            .attr("fill", "#000")
            .attr("text-anchor", "middle")
            .text((d) => { return d; })
            .transition()
            .duration(1500)
            .style("opacity", 1);

        //Plotpoints being added 
        let plotPoints = ptg.selectAll("circle")
            .data(this.films);

        //Tooltip being initialised
        let toolTip = d3.tip().attr("class", "d3-tip-node").html((d) => {

            if(this.feature == "imdb_score")
                return d["movie_title"].trim() + ": " + parseFloat(d[this.feature]);
            else
                return d["movie_title"].trim() + ": " + parseInt(d[this.feature]).toLocaleString();
        });

        let enterPoints = plotPoints.enter().append("circle");
        plotPoints.exit().remove();
        plotPoints = plotPoints.merge(enterPoints);
 
        //Points on the plot being set for transition and duration 
        plotPoints
            .transition()
            .duration(1500)
            .attr("r", 4.5)
            .attr("cy", (d) => { return scaleY(d[this.feature]); })
            .attr("cx", (d) => { return scaleX(d["movie_title"]); });

        //Tip on plot points being invoked
        plotPoints.call(toolTip)
            .on("mouseout", toolTip.hide)
            .on("mouseover", toolTip.show);

        //Line graph being added
        let lineGraph = d3.line()
            .y((d) => { return scaleY(d[this.feature]); })
            .x((d) => { return scaleX(d["movie_title"]); });

        //Selecting all plot lines for films when run
        let plotLines = ptg.selectAll(".line")
            .data([this.films]);

        //Setting transition and duration of plot lines 
        let enterLines = plotLines.enter().append("path");
        plotLines.exit().remove();
        plotLines = plotLines.merge(enterLines)
            .transition()
            .duration(1500)
            .attr("class", "line")
            .attr("d", lineGraph);
    }
}
