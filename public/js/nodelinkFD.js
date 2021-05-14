/**
 * Created by Sen Thotawatte on 08/05/2021.
 */
class NodeLinkFD{

    constructor(films){
        //Selecting nodelink from d3 and setting its dimensions 
        this.nodeLink = d3.select("#nodeLink");
        this.dimensions = {top: 9, bottom: 29, right: 19, left: 39};

        //Selecting legend for nodelink from d3
        this.heightOfLegend = 60;
        this.legend = d3.select("#legend");

        //Retrieving bounds for svg
        this.boundsSVG = this.nodeLink.node().getBoundingClientRect();
        this.heightSVG = 549;
        this.widthSVG = (this.boundsSVG.width - this.dimensions.right);

        //Consturctor reference to border values of nodelink which are stored in array 
        this.borders = [];

        //Constructor reference to node values of nodelink which are stored in array
        this.nodes = [];

        //Constructor reference to films
        this.films = films;  

    }

    update(filmsSelected){

        //Link to constructor 
        let that = this;
        
        //Legend being created by selecting the legend reference in the constructor and setting the height and width 
        let legendSVG = this.legend.select("svg")
            .attr("height", this.heightOfLegend)
            .attr("width", this.widthSVG);

        //Appending  g the svg legend
        let graphLegend = legendSVG.append("g");


        //Text instruction on how to use node-link diagram displayed under it
        legendSVG.append("text").text(["To highlight the neighbours of a node, double click on one"])
            .attr("transform", "translate(" + this.dimensions.left*1.5 + ", 54)");

        //Assigning colors to circles for represent each aspect of a film:  Title, Actor, Director, Actor AND director
        let circleFill = [{"color": "blue" , "role" : "Movie"},{"color": "green", "role" : "Director"},
                        {"color": "purple" , "role" : "Actor"},{"color": "red", "role" : "Role: Actor and Director"}];

        //Drawing legend shapes as circles and importing the color to fit from above 
        let circlesLegend = graphLegend.selectAll("circle").data(circleFill)

        //Creating the circle to fill with color, give dimension, and other tweaks
        circlesLegend.
            enter().append("circle")
            .attr("fill", function (f) {
                return f.color;
            })

            .attr("cx", function (f,x) {
                return x * (that.widthSVG/7) + that.dimensions.left;    //CHANGE VALUE?
            })
            .attr("cy", "50%")          //CHANGE VALUE?
            .attr("class", "legend")
            .attr("r", 5);              //CHANGE VALUE?

        //Labels for node when selected
        let nodeLabels = graphLegend.selectAll("text").data(circleFill);

        //Creating the text label for each node with dimensions 
        nodeLabels.
            enter().append("text")
            .data(circleFill)
            .attr("x", function (d,i) {
                return i * (that.widthSVG/7) + that.dimensions.left*1.2;
            })
            
            .attr("y", "60%")
            .text(function (d) {
                return d.role;
            })
            .attr("class", "legend");


        //Condition if no film is selected then just showcase the default 100 list of movies set on the initial load page in node-link form
        if(!filmsSelected){
            filmsSelected = this.films.slice(0, 100) //default selection
        }

        //Film select function for when a film from a node is selected 
        filmsSelected.forEach(function(film) {
            let actorDirectorSame = 0;                                                  //DONT NEED?

            //function to check if a node exists and increment degree
            function existingNode(nodeName, group) {
                return (that.nodes).some(function(element) {
                    //Condition if someone is both a director AND actor from the list of nodes and if so assign it seperate group and color
                    if(element.id === nodeName && element.group != group){
                        element.color = "greenyellow";
                        element.degree++;
                        element.group = 4;
                        return true;
                    }
                    //Otherwise the node belongs to either an actor OR a director
                    else if(element.id === nodeName){
                            element.degree++;
                        return true;
                    }
                    else
                        return false;
                });
            }

            //Add actor to the node list if they dont exist 
            let degreeOfDirector = existingNode(film.director_name.trim(), 1);
            if(!degreeOfDirector){
                this.nodes.push({"id": film.director_name.trim(), "group": 1, "color":"green", "degree": 1});
            }

            //Add actor to the node list if they dont exist 
            let degreeOfActor1 = existingNode(film.actor_1_name.trim(), 2);
            if(!degreeOfActor1){
                this.nodes.push({"id": film.actor_1_name.trim(), "group": 2, "color":"purple", "degree": 1});
            }

            //Add actor to the node list if they dont exist 
            let degreeOfActor2 = existingNode(film.actor_2_name.trim(), 2);
            if(!degreeOfActor2){
                this.nodes.push({"id": film.actor_2_name.trim(), "group": 2, "color":"purple", "degree": 1});
            }

            //Add to the node list if the they dont exist 
            let degreeOfActor3 = existingNode(film.actor_3_name.trim(), 2);
            if(!degreeOfActor3){
                this.nodes.push({"id": film.actor_3_name.trim(), "group": 2, "color":"purple", "degree": 1});
            }

            //Borders for film to director
            this.borders.push({"source": film.movie_title.trim(), "target": film.director_name.trim()});

            //Borders for film to actor1
            this.borders.push({"source": film.movie_title.trim(), "target": film.actor_1_name.trim()});
            
            //Borders for film to actor2
            this.borders.push({"source": film.movie_title.trim(), "target": film.actor_2_name.trim()});

            //Borders for film to actor3
            this.borders.push({"source": film.movie_title.trim(), "target": film.actor_3_name.trim()});


            //Data for nodes in regards to director, title, and actors 1, 2, and 3
            this.nodes.push({"id": film.movie_title.trim(),  "group": 0, "color":"blue", "degree": 1});

            //check for this current film if actor and director is the same person and decrement their degree

            //Check if current chosen film has an actor AND director that is the same person and if so their degree will be decremented
            if(film.director_name.trim() === film.actor_1_name.trim() ||
                //If director name is equal to actor 1, 2, or 3 name then they are the same person 
                film.director_name.trim() === film.actor_2_name.trim() ||
                film.director_name.trim() === film.actor_3_name.trim()){
                    //Same person, hence value is set to 1 
                actorDirectorSame = 1;
                return (that.nodes).some(function(element){
                    if(element.id === film.director_name.trim()) {
                        element.degree = element.degree - 1;
                    }
                })
            }

        },this);


        //tipTool setting up
        let tipTool = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (f) {
                if(f.group != 0 && f.degree > 1){
                    return  f.id + ": Degree" + f.degree + "</span>";
                }
                else{
                    return  f.id + "</span>";
                }
            });

        //Setting up svg and selecting canvas to paint the job on 
        let nodeLinkSVG = d3.select('#canvas')
            .attr("height", this.heightSVG)
            .attr("width", this.widthSVG );

        //calling tool-tip
        nodeLinkSVG.call(tipTool);

        // Here we create our simulation, and give it some forces to update to all the nodes:
        let simulation = d3.forceSimulation()
        // forceLink creates tension along each link, keeping connected nodes together
            .force("link", d3.forceLink()
                .id(function (d) {
                return d.id;
            }))
            // forceManyBody creates a repulsive force between nodes, keeping them away from each other
            .force("charge", d3.forceManyBody().strength(-17))
            // forceCenter acts like gravity, keeping the whole visualization in the middle of the screen
            .force("center", d3.forceCenter(this.widthSVG / 2, this.heightSVG / 2))
            .force("forceX", d3.forceX())
            .force("forceY", d3.forceY())
            // .force("collide", d3.forceCollide([20]));
            // .force("collide", d3.forceCollide());
            .force("collide",d3.forceCollide( function(d){return (d.degree + 6) })); //.iterations(16)


        // First we create the links in their own group that comes before the node group;
        // using groups like layers, the circles will always be on top of the lines

        svgnodeLink.selectAll(".links").remove();

        let linkLayer = svgnodeLink.append("g")
            .attr("class", "links");

        // Now let's create the lines
        let links = linkLayer.selectAll("line")
            .data(this.borders)


        let linksEnter = links.enter().append("line");

        links.exit().remove();

        links = links.merge(linksEnter);

        links.attr("stroke-width", function (d) {
            // let sourcewt = that.nodes.getOwnProperty(d.source) ;
            // let targetwt = that.nodes.getOwnProperty(d.target) ;
            // sourcewt = (sourcewt > targetwt) ? sourcewt : targetwt;
            let result = (that.nodes).filter(function(node){
                //console.log(node.id + d.target);
                return node.id == d.target;
            });
            //console.log(result);
            return Math.sqrt(result[0].degree);
        });

        // Now we create the node layer, and the nodes inside it
        svgnodeLink.selectAll(".nodes").remove();

        let nodeLayer = svgnodeLink.append("g")
            .attr("class", "nodes");


        let nodes = nodeLayer.selectAll("circle")
            .data(this.nodes);

        let nodesEnter = nodes.enter().append("circle");

        nodes.exit().remove();

        nodes = nodes.merge(nodesEnter);

        nodes
            .attr("r", function(d){
                return (4 + d.degree);
            })
            .attr("fill", function (d) {
                //console.log(d)
                // return color(d.group);
                 return d.color;
            })
            // This part adds event listeners to each of the nodes; when you click,
            // move, and release the mouse on a node, each of these functions gets called
            // (we've defined them at the end of the file)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
                .call(tipTool)
                .on('mouseover', tipTool.show)
                .on('mouseout', tipTool.hide)
                .on('dblclick', connectedNodes); //Added code;

        // Binding data, to the simulation...
        simulation.nodes(this.nodes);

        // The tension force (the forceLink that we named "link" above) also needs to know
        // about the link data that we finally have
        simulation.force("link")
            .links(this.borders)
            .distance(15);


        // Finally, let's tell the simulation how to update the graphics
        simulation.on("tick", function () {
            // Every "tick" of the simulation will create / update each node's coordinates;
            // we need to use those coordinates to move the lines and circles into place
            links
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            nodes
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });
        });

        function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

        function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

        function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

        //---Insert-------

        //Toggle stores whether the highlighting is on
        let flag = 0;
        //Create a connections array
        let linkedByIndex = {};
        for (let i = 0; i < this.nodes.length; i++) {
            linkedByIndex[i + "," + i] = 1;
        };
        this.borders.forEach(function (d) {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
        });

        //This function looks up whether a pair are neighbours
        function isConnected(a, b) {
            return linkedByIndex[a.index + "," + b.index];
        }

        function connectedNodes() {

            if (flag == 0) {

                let d = d3.select(this).node().__data__;

                if(d["group"] == 0)   //If selected node is a film
                {
                    //console.log(d["id"]);
                }

                //Reduce the opacity of all nodes except the neighbouring nodes
                nodes.style("opacity", function (o) {
                    return ((isConnected(d, o) || isConnected(o, d)) ? 1 : 0.1);
                });

                links.style("opacity", function (o) {
                    return ((d.index == o.source.index || d.index == o.target.index) ? 1 : 0.1);
                });
                flag = 1;
            } else {
                //Changing back to opacity=1
                nodes.style("opacity", 1);
                links.style("opacity", 1);
                flag = 0;
            }
        }

        }// close update()

}//close class