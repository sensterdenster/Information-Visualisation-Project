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
            .attr("x", function (f,x) {
                return x * (that.widthSVG/7) + that.dimensions.left*1.2;
            })
            
            .attr("y", "60%")
            .text(function (f) {
                return f.role;
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
                        element.degree++;
                        element.color = "red";
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


        //Setting up tooltip
        let tipTool = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (f) {
                if(f.group != 0 && f.degree > 1){
                    return  f.id + ": Degree" + f.degree + "</span>";       //Change DEGREEE?
                }
                else{
                    return  f.id + "</span>";                                //Change span?
                }
            });

        //nodelinksvg set up using d3 to select canvas height and width  
        let nodeLinkSVG = d3.select('#canvas')
            .attr("height", this.heightSVG)
            .attr("width", this.widthSVG );

        //NodelinkSVG variable calls tooltip after selecting canvas
        nodeLinkSVG.call(tipTool);

        //Creating the animation of the node link when page is loaded/refreshed/updated to apply forces to all the node when this happens
        let animation = d3.forceSimulation()
        //Using D3's forcelink function enables a tensions to be created along each link in which connects the linking nodes together
            .force("nodelink", d3.forceLink()
                .id(function (f) {
                return f.id;
            }))

            //Using D3's forcemanybody() function produces a rippling force between each fo the nodes, ensuring that they are spaced apart clear enough to be identified 
            .force("rippleCharge", d3.forceManyBody().strength(-17))

            // forceCenter acts like gravity, keeping the whole visualization in the middle of the screen
            .force("forceCenter", d3.forceCenter(this.widthSVG / 2, this.heightSVG / 2))

            //Force for direction in the y-axis
            .force("yForce", d3.forceY())
            
            //Force for direction in the x-axis
            .force("xForce", d3.forceX())
            
            //Force for collision of nodes with each other
            .force("forceCollide",d3.forceCollide( function(f){
                return (f.degree + 6) })); 


        //Creating links between nodes for their own respective groups (title, actors, director) before being affiliated with other links where one of these attributes are in common
        nodeLinkSVG.selectAll(".links").remove();

        //Grouping the nodes in layers so that the circles will always be poistioned in front of the connecting links so they can be clearly seen 
        let layerForLinks = nodeLinkSVG.append("g")
            .attr("class", "links");

        //Creating the linked lines
        let nodeLinks = layerForLinks.selectAll("line")
            .data(this.borders)

        //Appending these linked lines 
        let enterLinks = nodeLinks.enter().append("line");

        //Revmoing the lined links
        nodeLinks.exit().remove();

        //Merging nodelinks
        nodeLinks = nodeLinks.merge(enterLinks);

        //Setting the links between the nodes equal to the intended nodes targeted
        nodeLinks.attr("stroke-width", function (f) {
            let outcome = (that.nodes).filter(function(node){
                return node.id == f.target;
            });
            return Math.sqrt(outcome[0].degree);
        });

        //Creating the layer for the nodes and the nodes wtihin it
        nodeLinkSVG.selectAll(".nodes").remove();

        //Node layer variable and appending these together
        let layerNode = nodeLinkSVG.append("g")
            .attr("class", "nodes");

        //Selecting all nodes within the node layer
        let nodes = layerNode.selectAll("circle")
            .data(this.nodes);

        //Appending these nodes 
        let nodesEnter = nodes.enter().append("circle");

        //Removing nodes
        nodes.exit().remove();

        //Merging linked nodes 
        nodes = nodes.merge(nodesEnter);

        nodes
            //Function attribute for labels of nodes which are actors
            .attr("r", function(d){
                return (4 + d.degree);
            })
            //Function to color nodes
            .attr("fill", function (f) {
                 return f.color;
            })
 

            //Adding event listeners to each of the nodes so that click-dragging them moves the specific node around by calling each of these functions 
            .call(d3.drag()
                .on("start", startDrag)
                .on("drag", dragging)
                .on("end", endDrag))
                .call(tipTool)
                .on('mouseover', tipTool.show)
                .on('mouseout', tipTool.hide)
                .on('dblclick', linkedNodes); //Added code;

        // Binding data, to the animation...
        animation.nodes(this.nodes);

        // The tension force (the forceLink that we named "link" above) also needs to know
        // about the link data that we finally have
        animation.force("nodelink")
            .links(this.borders)
            .distance(15);


        // Finally, let's tell the animation how to update the graphics
        animation.on("tick", function () {
            // Every "tick" of the animation will create / update each node's coordinates;
            // we need to use those coordinates to move the lines and circles into place
            nodeLinks
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

        function startDrag(d) {
        if (!d3.event.active) animation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

        function dragging(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

        function endDrag(d) {
        if (!d3.event.active) animation.alphaTarget(0);
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

        function linkedNodes() {

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

                nodeLinks.style("opacity", function (o) {
                    return ((d.index == o.source.index || d.index == o.target.index) ? 1 : 0.1);
                });
                flag = 1;
            } else {
                //Changing back to opacity=1
                nodes.style("opacity", 1);
                nodeLinks.style("opacity", 1);
                flag = 0;
            }
        }

        }// close update()

}//close class