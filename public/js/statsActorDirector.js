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

            let ptg = d3.select("#plotTrendGroup")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        let svg = d3.select("#plotTrend")
            .attr("width", svgBounds.width)
            .attr("height", 449 + margin.bottom + margin.top);

        let scaleX = d3.scaleBand()
            .padding([1])
            .rangeRound([0, width])
            .domain((this.films).map(d => d["film_title"]));

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

        //Add the x Axis
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

        //Add the x Axis label
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

        //Initialize tooltip
        let tip = d3.tip().attr("class", "d3-tip-node").html((d) => {

            if(this.feature == "imdb_score")
                return d["film_title"].trim() + ": " + parseFloat(d[this.feature]);
            else
                return d["film_title"].trim() + ": " + parseInt(d[this.feature]).toLocaleString();
        });

        let enterPoints = plotPoints.enter().append("circle");
        plotPoints.exit().remove();
        plotPoints = plotPoints.merge(enterPoints);
 
        plotPoints
            .transition()
            .duration(1500)
            .attr("r", 4.5)
            .attr("cy", (d) => { return scaleY(d[this.feature]); })
            .attr("cx", (d) => { return scaleX(d["film_title"]); });

        //Invoke the tip on the plot points
        plotPoints.call(tip)
            .on("mouseout", tip.hide)
            .on("mouseover", tip.show);

        //Add the line graph
        let lineGraph = d3.line()
            .y((d) => { return scaleY(d[this.feature]); })
            .x((d) => { return scaleX(d["film_title"]); });

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
