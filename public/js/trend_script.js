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
    window.statsActorDirector = new StatsActorDirector("Actor", "Alan Ford", getMoviesFor("actor", "Alan Ford"), "imdb_score");
    statsActorDirector.plot();

    //Importing data from correlation matrix csv folder to display trend 
    d3.csv("data/correlation_matrix.csv", function (error, rows) {
        if (error) throw error;
        let matrixCorr = new CorrelationMatrix(rows);
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

    //Get all actors
    let actor1names = filmsExcel.map(d => d["actor_1_name"]);
    let actor2names = filmsExcel.map(d => d["actor_2_name"]);
    let actor3names = filmsExcel.map(d => d["actor_3_name"]);

    //Merge all actors and sort
    let actor123names = actor1names.concat(actor2names, actor3names).sort();

    let actors_set = new Set();
    let currentActor = actor123names[0];
    let currentActorCount = 0;

    for(let actorIndex = 0; actorIndex < actor123names.length; actorIndex++)
    {
        if(currentActor == actor123names[actorIndex])
        {
            currentActorCount++;
            if(currentActorCount == 2)  //Include actor if involved in at least 2 movies
                actors_set.add(currentActor)
        }
        else
        {
            currentActor = actor123names[actorIndex];
            currentActorCount = 1;
        }
    }

    //Drop undefined value
    actors_set.delete(undefined);

    return actors_set;
}

/**
 *  Returns a sorted set of all (unique) directors
 */
function directorsRetrieved() {

    //Get all directors
    let directorNames = filmsExcel.map(d => d["director_name"]);
    let directorNames_sorted = directorNames.sort();    //Sort

    let directors_set = new Set();
    let currentDirector = directorNames_sorted[0];
    let currentDirectorCount = 0;

    for(let directorIndex = 0; directorIndex < directorNames_sorted.length; directorIndex++)
    {
        if(currentDirector == directorNames_sorted[directorIndex])
        {
            currentDirectorCount++;
            if(currentDirectorCount == 2)  //Include director if involved in at least 2 movies
                directors_set.add(currentDirector)
        }
        else
        {
            currentDirector = directorNames_sorted[directorIndex];
            currentDirectorCount = 1;
        }
    }

    //Drop undefined value
    directors_set.delete(undefined);

    return directors_set;
}

/**
 *  Returns all movies associated for a given actor/director sorted by year
 */
function getMoviesFor(directorOrActor, name) {

    let films = [];
    let set_films = new Set();

    if(directorOrActor == "actor")
    {
        //Extract movies which involve the selected actor
        filmsExcel.forEach((film) => {

            if(!set_films.has(film["movie_title"]))   //Avoid movie duplication using set
            {
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
        //Extract movies which involve the selected director
        filmsExcel.forEach((film) => {

            if(!set_films.has(film["movie_title"]))   //Avoid movie duplication using set
            {
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

    //Sort the movies by year
    films = (films).slice().sort(function (film1, film2) {

        if(parseInt(film1["title_year"]) < parseInt(film2["title_year"]))
            return -1;
        else if(parseInt(film1["title_year"]) > parseInt(film2["title_year"]))
            return 1;
        else
            return 0;
    });

    return films;
}

/**
 *  Call the actor/director search filter updater and update the actor/director update button
 */
function changeDirectorOrActor(choice) {

    searchFilterUpdated(choice.value);
    document.getElementById("updateDirectorOrActor").innerText = "Update " + choice.value;
}

/**
 *  Update the actor/director search filter based on actor/director radio button selection
 */
function searchFilterUpdated(directorOrActor) {

    let actorDirectorInput = document.getElementById("nameDirectorOrActor");
    let actorDirectorList = document.getElementById("namesDirectorOrActor");

    //Clear existing values
    actorDirectorInput.value = "";
    actorDirectorList.innerHTML = "";

    let frag = document.createDocumentFragment();

    if(directorOrActor == "actor")
    {
        for (let actor of actorsAll)
        {
            let option = document.createElement("option");
            option.textContent = actor;
            option.value = actor;
            frag.appendChild(option);
        }

        //Add actor names to search filter
        document.getElementById("namesDirectorOrActor").appendChild(frag);
        //Update the input placeholder
        actorDirectorInput.setAttribute("placeholder", "Search Actor");
    }
    else
    {
        for (let director of directorsAll)
        {
            let option = document.createElement("option");
            option.textContent = director;
            option.value = director;
            frag.appendChild(option);
        }

        //Add director names to search filter
        document.getElementById("namesDirectorOrActor").appendChild(frag);
        //Update the input placeholder
        actorDirectorInput.setAttribute("placeholder", "Search Director");
    }
}

/**
 *  Update the actor/director trend plot based on selected parameters
 */
function updateTrend() {

    let name = d3.select("#nameDirectorOrActor").node().value;
    let selectedAttribute = d3.select("#attributes").node().value;
    let films = [];
    let messageError = "";
    let errorDiv = document.getElementsByClassName("modal-body")[0];

    if(document.getElementsByName("directorOrActor")[0].checked)    //If current radio button selection is "Actor"
    {
        if(!name && statsActorDirector.directorOrActor == "Actor")  //If name input empty, retrieve name from existing object
            name = statsActorDirector.name;

        if(actorsAll.has(name)) //Ensure actor name passed is valid
        {
            films = getMoviesFor("actor", name).filter((film) => film[selectedAttribute]);
            statsActorDirector = new StatsActorDirector("Actor", name, films, selectedAttribute);
            statsActorDirector.plot();

            //let wordCloud = new WordCloud(movies);
            //wordCloud.update();
        }
        else
        {
            messageError = "Invalid Actor name";
            errorDiv.innerText = messageError;
            $('#modalError').modal('show');
        }
    }
    else    //If current radio button selection is "Director"
    {
        if(directorsAll.has(name))  //Ensure director name passed is valid
        {
            films = getMoviesFor("director", name).filter((film) => film[selectedAttribute]);
            statsActorDirector = new StatsActorDirector("Director", name, films, selectedAttribute);
            statsActorDirector.plot();

            //let wordCloud = new WordCloud(movies);
            //wordCloud.update();
        }
        else
        {
            messageError = "Invalid Director name";
            errorDiv.innerText = messageError;
            $('#modalError').modal('show');
        }
    }
}
