/**
 * Created by Sen Thotawatte on 08/05/2021.
 */
 d3.csv("data/movie_metadata.csv", function (error, films) {
    if (error) throw error;

    //Window to display films actors and directors 
    window.filmsExcel = films;
    window.directorsAll = directorsRetrieved();
    window.actorsAll = actorsRetrieved();

    //Default actor/director values for search values initialised 
    searchFilterUpdated("actor");

    //Plot for default set actor rendered
    window.statsActorDirector = new StatsActorDirector("Actor", "Alan Ford", retrieveFilmsFor("actor", "Alan Ford"), "imdb_score");
    statsActorDirector.plot();

    //Importing data from correlation matrix csv folder to display trend 
    d3.csv("data/correlation_matrix.csv", function (error, rows) {
        if (error) throw error;
        let matrixCorr = new matrixCorrelation(rows);
        matrixCorr.create();

    });


    //Data preparation for plotting scatter graph           (NOT SURE IF NEEDED?)
    let plotMovies = films.map((f) => {
        return {"imdb_score": f["imdb_score"], "gross": f["gross"], "num_user_for_reviews": f["num_user_for_reviews"]};
    });
});


/**
 *  Returns a sorted set of all (unique) actors
 */
function actorsRetrieved() {
    //Retrieving actor 1 
    let namesActor1 = filmsExcel.map(d => d["actor_1_name"]);

    //Retrieving actor 2
    let namesActor2 = filmsExcel.map(d => d["actor_2_name"]);
    
    //Retrieving actor 3
    let namesActor3 = filmsExcel.map(d => d["actor_3_name"]);

    //All actors merged and sorted 
    let namesActors123 = namesActor1.concat(namesActor2, namesActor3).sort();

    //Initialising actors in a set 
    let setActors = new Set();

    //Chosen actor is set to the array index 0 of all actors so it can be used
    let actorChosen = namesActors123[0];

    //Chosen actor counter to cycle through actors
    let actorChosenCounter = 0;

    //For loop to cycle through actors 
    for(let indexForActors = 0; indexForActors < namesActors123.length; indexForActors++)
    {
        //Condition if chosen actors is equal to any of the actors123 to include these actors
        if(actorChosen == namesActors123[indexForActors])
        {
            //Increase counter for chosen actor
            actorChosenCounter++;

            //Actor included if they are involved in at least 2 films
            if(actorChosenCounter == 2)  
                setActors.add(actorChosen)
        }
        else
        {
            //Else chosen actors are not included and counter value is changed
            actorChosen = namesActors123[indexForActors];
            actorChosenCounter = 1;
        }
    }

    //Remove any undefined values
    setActors.delete(undefined);

    //Return these set initialised actors
    return setActors;
}

/**
 *  Function to return the set of all unique directors in sorted form 
 */
function directorsRetrieved() {

    //Get all directors
    let namesDirector = filmsExcel.map(d => d["director_name"]);

    //Sorting diretors names
    let sortedDirectorNames = namesDirector.sort();    

    //Initialising directors in new set 
    let setDirectors = new Set();

    //Sorting director name index 0 or array in variable first
    let directorChosen = sortedDirectorNames[0];

    //Chosen director count set to 0 
    let directorChosenCount = 0;


    //For loop to iterate through directors
    for(let indexDirector = 0; indexDirector < sortedDirectorNames.length; indexDirector++)
    {
        //Condition if the chosen director is equal to one of the sorted directors in the array 
        if(directorChosen == sortedDirectorNames[indexDirector])
        {
            //Increase counter for director
            directorChosenCount++;

            //Director included if they are involved in at least 2 films
            if(directorChosenCount == 2)  
                setDirectors.add(directorChosen)
        }
        else
        {
            //Else chosen directors are not included and counter value is changed back
            directorChosen = sortedDirectorNames[indexDirector];
            directorChosenCount = 1;
        }
    }

    //Removed undefined values for directors
    setDirectors.delete(undefined);

    //Return set of directors 
    return setDirectors;
}

/**
 *  Retrieves all the films which are associated for a chosen director/actor sorting by year
 */
function retrieveFilmsFor(directorOrActor, name) {

    let films = [];
    let set_films = new Set();

    //If direcotr or actor is set to be an actor
    if(directorOrActor == "actor")
    {
        //Select and import all films which involve chosen actor
        filmsExcel.forEach((film) => {

            //Avoiding film duplication using the set films variable
            if(!set_films.has(film["movie_title"]))   
            {
                //If involving either actor 1,2, or 3 names, push these films and years for these respective acotrs
                if(film["actor_1_name"] == name || film["actor_2_name"] == name || film["actor_3_name"] == name)
                {
                    if(!isNaN(parseInt(film["title_year"])))
                    {
                        set_films.add(film["movie_title"]);
                        films.push(film);
                    }
                }
            }
        });
    }
    else
    {
        //Select and import films which involve chosen director 
        filmsExcel.forEach((film) => {

            //Avoiding film duplication using the set films variable
            if(!set_films.has(film["movie_title"]))  
            {
                //If involving director name push these films and years for this director
                if(film["director_name"] == name)
                {
                    if(!isNaN(parseInt(film["title_year"])))
                    {
                        set_films.add(film["movie_title"]);
                        films.push(film);
                    }
                }
            }
        });
    }

    //Sorting the films by their year
    films = (films).slice().sort(function (film1, film2) {

        //If year of film 1 is less than year of film 2 dont return value
        if(parseInt(film1["title_year"]) < parseInt(film2["title_year"]))
            return -1;
        //Else if year of film 1 is greater than year of film 2 return value
        else if(parseInt(film1["title_year"]) > parseInt(film2["title_year"]))
            return 1;
        //Else return nothing
        else
            return 0;
    });

    //Return films
    return films;
}

/**
 *  Function to change director/actor filter search to update the according director/actor using the update button
 */
function changeDirectorOrActor(selection) {

    searchFilterUpdated(selection.value);
    document.getElementById("updateDirectorOrActor").innerText = "Update " + selection.value;
}

/**
 *  Function to update director/actor filter search on basis of director/actor radio buttion selector 
 */
function searchFilterUpdated(directorOrActor) {
    
    //List and input for director/actor getting retrieved by element id from csv file
    let listDirectorActor = document.getElementById("namesDirectorOrActor");
    let inputDirectorActor = document.getElementById("nameDirectorOrActor");

    //Remove any existing values from these
    listDirectorActor.innerHTML = "";
    inputDirectorActor.value = "";


    //Frgment section taken from the document
    let section = document.createDocumentFragment();

    //If condition for actor is selected create option to select an actor from list of actors
    if(directorOrActor == "actor")
    {
        for (let actor of actorsAll)
        {
            //Choice variable to store option 
            let choice = document.createElement("option");

            //Text context for choice set to actor 
            choice.textContent = actor;

            //Value for choice set to actor 
            choice.value = actor;

            //Append choice to section
            section.appendChild(choice);
        }

        //Adding the actor names to the search filter
        document.getElementById("namesDirectorOrActor").appendChild(section);

        //Updating the input for the placeholder
        inputDirectorActor.setAttribute("placeholder", "Search Actor");
    }
    //Else condition for director to be selected for create option to selected director from list of directors
    else
    {
        for (let director of directorsAll)
        {
            //Choice variable to store option 
            let choice = document.createElement("option");

            //Text context for choice set to director 
            choice.textContent = director;

            //Value for choice set to director 
            choice.value = director;

            //Append choice to section
            section.appendChild(choice);
        }

        //Adding names of director to search filter
        document.getElementById("namesDirectorOrActor").appendChild(section);

        //Applying the update to input placeholder
        inputDirectorActor.setAttribute("placeholder", "Search Director");
    }
}

/**
 *  Function to apply trend to newly updated settings
 */
function applyTrend() {

    //Names varaibleto select actor/director names
    let nameDirectorOrActor = d3.select("#nameDirectorOrActor").node().value;

    //Attributes for the selected actor/director
    let attributeSelected = d3.select("#attributes").node().value;

    //Films array
    let films = [];

    //Message for an error
    let messageError = "";

    //Div error display of modal
    let divError = document.getElementsByClassName("modal-body")[0];


    //Condition for if the chosen radio button selected is "Actor"
    if(document.getElementsByName("directorOrActor")[0].checked)    
    {
        //If input for name is empty in field, extract the name from existing object
        if(!nameDirectorOrActor && statsActorDirector.directorOrActor == "Actor")  
        nameDirectorOrActor = statsActorDirector.name;


        if(actorsAll.has(nameDirectorOrActor)) 
        {

            //Retrieving films for the actor 
            films = retrieveFilmsFor("actor", nameDirectorOrActor).filter((film) => film[attributeSelected]);

            //Storing the stats of this actor in variable
            statsActorDirector = new StatsActorDirector("Actor", nameDirectorOrActor, films, attributeSelected);
            
            //Plotting the stats in trend graph
            statsActorDirector.plot();
        }
        //Otherwise display error message with modal for invalid actor name input
        else
        {
            //Message error text
            messageError = "Invalid Actor name";

            //Div error to display inner error message text
            divError.innerText = messageError;

            //Displaying modal of error
            $('#modalError').modal('show');
        }
    }
    //Else if chosen radio button is selected to Director
    else    
    {
        //If actor has name entered ensure that it correctly matches the actor name in file 
        if(directorsAll.has(nameDirectorOrActor))  
        {
            //Retrieving films for the director 
            films = retrieveFilmsFor("director", nameDirectorOrActor).filter((film) => film[attributeSelected]);
            
            //Storing the stats of this director in variable
            statsActorDirector = new StatsActorDirector("Director", nameDirectorOrActor, films, attributeSelected);
            
            //Plotting the stats in trend graph
            statsActorDirector.plot();
        }
        else
        {
            //Message error text
            messageError = "Invalid Director name";

            //Div error to display inner error message text
            divError.innerText = messageError;

            //Displaying modal of error
            $('#modalError').modal('show');
        }
    }
}

