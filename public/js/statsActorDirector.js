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
            width = svgBounds.width - margin.left - margin.right;

        let svg = d3.select("#plotTrend")
            .attr("height", 449 + margin.bottom + margin.top)
            .attr("width", svgBounds.width);

        let ptg = d3.select("#plotTrendGroup")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let scaleX = d3.scaleBand()
            .padding([1])
            .domain((this.films).map(d => d["movie_title"]))
            .rangeRound([0, width]);

        let scaleY = d3.scaleLinear()
            .domain(d3.extent(this.films, (d) => { return parseFloat(d[this.feature])}))
            .range([height, 0]);

        scaleY.nice();

        //Using d3 to add y-axis
        d3.select("#yAxis")
            .duration(1500)
            .transition()
            .call(d3.axisLeft(scaleY));

        //Y-axis label being added
        let Labely = d3.select("#yLabel").selectAll("text")
            .data([this.feature]);

        //Customising the y-axis label font, color, position, opacity, etc
        let EnterLabely = Labely.enter().append("text");
        Labely.exit().remove();
        Labely = Labely.merge(EnterLabely)
            .text((d) => { return d; })
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -width/10)
            .attr("text-anchor", "middle")
            .attr("fill", "#000")
            .attr("class", "font-weight-bold text-capitalize")
            .duration(1500)
            .style("opacity", 0)
            .style("opacity", 1)
            .transition();

        //Add the x Axis
        d3.select("#xAxis")
            .call(d3.axisBottom(scaleX))
            .selectAll("text")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "translate(" + 0 + "," + height + ")")
            .attr("transform", "rotate(-65)")
            .duration(1500)
            .style("text-anchor", "end")
            .transition();

        let textLabelx = (this.directorOrActor) + " " + this.nameDirectorActor + "'s" + " films";

        //Add the x Axis label
        let Labelx = d3.select("#xLabel").selectAll("text")
            .data([textLabelx]);

        //Customising the x-axis label font, color, position opacity, etc
        let EnterLabelx = Labelx.enter().append("text");
        Labelx.exit().remove();
        Labelx = Labelx.merge(EnterLabelx)
            .text((d) => { return d; })
            .attr("fill", "#000")
            .attr("class", "font-weight-bold")
            .attr("x", width/2)
            .attr("y", -7)
            .attr("text-anchor", "middle")
            .duration(1500)
            .style("opacity", 0)
            .style("opacity", 1)
            .transition();

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
            .attr("cy", (d) => { return scaleY(d[this.feature]); })
            .attr("cx", (d) => { return scaleX(d["movie_title"]); })
            .attr("r", 4.5);

        //Invoke the tip on the plot points
        plotPoints.call(tip)
            .on("mouseout", tip.hide)
            .on("mouseover", tip.show);

        //Add the line graph
        let lineGraph = d3.line()
            .y((d) => { return scaleY(d[this.feature]); })
            .x((d) => { return scaleX(d["movie_title"]); });

        let plotLines = ptg.selectAll(".line")
            .data([this.films]);

        let enterLines = plotLines.enter().append("path");
        plotLines.exit().remove();
        plotLines = plotLines.merge(enterLines)
            .duration(1500)
            .transition()
            .attr("class", "line")
            .attr("d", lineGraph);
    }
}