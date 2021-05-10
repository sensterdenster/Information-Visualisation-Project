
class StatsActorDirector{
    constructor(directorOrActor, name, movies, attribute)
    {
        this.directorOrActor = directorOrActor; //Indicates the entity whose stats are being plotted
        this.name = name;                       //Actor or director's name
        this.movies = movies;                   //Actor or director's movies
        this.attribute = attribute;             //Movie attribute to plot
    }

    plot()
    {
        let statsActorDirector_Div = d3.select("#statsActorDirector");

        let margin = {top: 20, right: 20, bottom: 100, left: 120},
            svgBounds = statsActorDirector_Div.node().getBoundingClientRect(),
            width = svgBounds.width - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;

        let svg = d3.select("#plotTrend")
            .attr("width", svgBounds.width)
            .attr("height", 450 + margin.top + margin.bottom);

        let g = d3.select("#plotTrendGroup")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let xScale = d3.scaleBand()
            .domain((this.movies).map(d => d["movie_title"]))
            .padding([1])
            .rangeRound([0, width]);

        let yScale = d3.scaleLinear()
            .domain(d3.extent(this.movies, (d) => { return parseFloat(d[this.attribute])}))
            .range([height, 0]);

        yScale.nice();

        //Add the y Axis
        d3.select("#yAxis")
            .transition()
            .duration(1500)
            .call(d3.axisLeft(yScale));

        //Add the y Axis label
        let yLabel = d3.select("#yLabel").selectAll("text")
            .data([this.attribute]);

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

        let xLabelText = (this.directorOrActor) + " " + this.name + "'s" + " movies";

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
            .data(this.movies);

        //Initialize tooltip
        let tip = d3.tip().attr("class", "d3-tip-node").html((d) => {

            if(this.attribute == "imdb_score")
                return d["movie_title"].trim() + ": " + parseFloat(d[this.attribute]);
            else
                return d["movie_title"].trim() + ": " + parseInt(d[this.attribute]).toLocaleString();
        });

        let pointsEnter = points.enter().append("circle");
        points.exit().remove();
        points = points.merge(pointsEnter);

        points
            .transition()
            .duration(1500)
            .attr("r", 4.5)
            .attr("cx", (d) => { return xScale(d["movie_title"]); })
            .attr("cy", (d) => { return yScale(d[this.attribute]); });

        //Invoke the tip on the plot points
        points.call(tip)
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);

        //Add the line graph
        let lineGraph = d3.line()
            .x((d) => { return xScale(d["movie_title"]); })
            .y((d) => { return yScale(d[this.attribute]); });

        let lines = g.selectAll(".line")
            .data([this.movies]);

        let linesEnter = lines.enter().append("path");
        lines.exit().remove();
        lines = lines.merge(linesEnter)
            .attr("class", "line")
            .transition()
            .duration(1500)
            .attr("d", lineGraph);
    }
}