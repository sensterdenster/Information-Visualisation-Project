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

        let margin = {top: 19, bottom: 99,  left: 119, right: 19},
            svgBounds = statsActorDirector_Div.node().getBoundingClientRect(),
            height = 449 - margin.bottom - margin.top,
            width = svgBounds.width - margin.right - margin.left;

        let svg = d3.select("#plotTrend")
            .attr("height", 450 + margin.top + margin.bottom)
            .attr("width", svgBounds.width);

        let g = d3.select("#plotTrendGroup")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let xScale = d3.scaleBand()
            .domain((this.films).map(d => d["movie_title"]))
            .padding([1])
            .rangeRound([0, width]);

        let yScale = d3.scaleLinear()
            .domain(d3.extent(this.films, (d) => { return parseFloat(d[this.feature])}))
            .range([height, 0]);

        yScale.nice();

        //Add the y Axis
        d3.select("#yAxis")
            .transition()
            .duration(1500)
            .call(d3.axisLeft(yScale));

        //Add the y Axis label
        let yLabel = d3.select("#yLabel").selectAll("text")
            .data([this.feature]);

        let yLabelEnter = yLabel.enter().append("text");
        yLabel.exit().remove();
        yLabel = yLabel.merge(yLabelEnter)
            .attr("class", "font-weight-bold text-capitalize")
            .attr("fill", "#000")
            .style("opacity", 0)
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -width/10)
            .attr("text-anchor", "middle")
            .text((d) => { return d; })
            .transition()
            .duration(1500)
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

        let xLabelText = (this.directorOrActor) + " " + this.nameDirectorActor + "'s" + " movies";

        //Add the x Axis label
        let xLabel = d3.select("#xLabel").selectAll("text")
            .data([xLabelText]);

        let xLabelEnter = xLabel.enter().append("text");
        xLabel.exit().remove();
        xLabel = xLabel.merge(xLabelEnter)
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

        //Add the plot points
        let points = g.selectAll("circle")
            .data(this.films);

        //Initialize tooltip
        let tip = d3.tip().attr("class", "d3-tip-node").html((d) => {

            if(this.feature == "imdb_score")
                return d["movie_title"].trim() + ": " + parseFloat(d[this.feature]);
            else
                return d["movie_title"].trim() + ": " + parseInt(d[this.feature]).toLocaleString();
        });

        let pointsEnter = points.enter().append("circle");
        points.exit().remove();
        points = points.merge(pointsEnter);

        points
            .transition()
            .duration(1500)
            .attr("r", 4.5)
            .attr("cx", (d) => { return xScale(d["movie_title"]); })
            .attr("cy", (d) => { return yScale(d[this.feature]); });

        //Invoke the tip on the plot points
        points.call(tip)
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);

        //Add the line graph
        let lineGraph = d3.line()
            .x((d) => { return xScale(d["movie_title"]); })
            .y((d) => { return yScale(d[this.feature]); });

        let lines = g.selectAll(".line")
            .data([this.films]);

        let linesEnter = lines.enter().append("path");
        lines.exit().remove();
        lines = lines.merge(linesEnter)
            .attr("class", "line")
            .transition()
            .duration(1500)
            .attr("d", lineGraph);
    }
}