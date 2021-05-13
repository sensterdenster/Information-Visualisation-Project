d3.csv("data/movie_metadata.csv", function (error, films) {
    if (error) throw error;

    //Variable to store films from csv file
    window.filmsExcel = films;

    //Creating variable to call funtion for retrieving genres 
    window.genresForAll = genresRetrieved();

    //Array for years selected
    window.yearSelected = [];

    //Array for ratings selected
    window.ratingSelected = [];

    //Array for genres selected 
    window.genresSelected = [];


    //Alter the filtersettings which are linked to the node-link diagram and films table 
    let filterObj = new Filters();
    filterObj.produce();

    //Call function to retrieve initial films and stores it in filmsInitial variable
    let filmsInitial = retrieveFilteredFilms();

    //Rendering the 50 arbitrary films from the node-link diagram which is initially loaded on the page
    let diagramNodeLink = new NodeLinkFD(filmsInitial.slice(0, 100));
    diagramNodeLink.update();

    //Rendering the 50 arbitrary films into the table for the initial loaded page 
    window.filmsTable = new TableFilms(filmsInitial.slice(0, 100));
    filmsTable.produce();
    filmsTable.update();
});


//Retrieves all the genres in a sorted alphabetical order 
function genresRetrieved() {

    //Setting genres as a new interface set
    let setGenres = new Set();

    //Seperating genres 
    filmsExcel.forEach((films) => {
        let genresFilms = films["genres"].split("|");
        genresFilms.forEach((genre) => {
        setGenres.add(genre);
        })
    });

    //Sort the genres
    setGenres = new Set(Array.from(setGenres).sort());

    return setGenres;
}

/**
 *  Select/deselect all genre checkboxes
 */

function selectAll()
{
    if(document.getElementById("selectAll").checked == true) //Select all genres
    {
        genresForAll.forEach((genre) => {
            let currentGenre = document.getElementById(genre);
            currentGenre.checked = true;
        });
    }
    else    //Deselect all genres
    {
        genresForAll.forEach((genre) => {
            let currentGenre = document.getElementById(genre);
            currentGenre.checked = false;
        });
    }
}

/**
 *  Update the films table & node-link diagram based on filter selection
 */


function filterProcess() {

    let matchingMovies = retrieveFilteredFilms();
    let errorMessage = "";
    let headerMessage = document.getElementById("headerMessage");
    let bodyMessage = document.getElementById("bodyMessage");

    if(matchingMovies.length > 100)
    {
        headerMessage.innerText = "Note";
        headerMessage.setAttribute("class", "text-info");
        errorMessage = "Matching films exceeded 100 - results trimmed";
    }
    else if(matchingMovies.length == 0)
    {
        headerMessage.innerText = "Error";
        headerMessage.setAttribute("class", "text-danger");
        errorMessage = "No matching films found for the selected filters";
    }

    if(errorMessage)
    {
        bodyMessage.innerText = errorMessage;
        $('#modalError').modal('show');
    }

    if(matchingMovies.length > 0)
    {
        filmsTable = new FilmsTable(matchingMovies.slice(0, 100));  //Limiting films matching search criteria to 100
        filmsTable.produce();
        filmsTable.update();

        let diagramNodeLink = new NodeLinkFD(matchingMovies.slice(0, 100));  //Limiting films matching search criteria to 100
        diagramNodeLink.update();
    }
}


//Retrieves films which match the specific criteria of rating, genre, and year for filters
function retrieveFilteredFilms() {

    genresSelected = [];

    genresForAll.forEach((genre) => {
        let currentGenre = document.getElementById(genre);

        if(currentGenre.checked)
            genresSelected.push(currentGenre.getAttribute("value"));
    });

    let isYearFilterSet = (yearSelected.length > 0);
    let isRatingFilterSet = (ratingSelected.length > 0);
    let isGenreFilterSet = (genresSelected.length > 0);

    let matchingMovies = [];
    let matchingMovies_set = new Set();

    if(isYearFilterSet || isRatingFilterSet || isGenreFilterSet)    //If at least one filter has been set by user
    {
        filmsExcel.forEach((film) => {

            let yearMatches = true;

            if(isYearFilterSet)
            {
                let currentMovieYear = parseInt(film["title_year"]);
                let startYear = yearSelected[0].start;
                let endYear = yearSelected[0].end;

                if(!isNaN(currentMovieYear))
                {
                    if(!(currentMovieYear >= startYear && currentMovieYear <= endYear))
                        yearMatches = false;
                }
                else
                    yearMatches = false;
            }

            let ratingMatches = true;

            if(isRatingFilterSet)
            {
                let currentMovieRating = parseFloat(film["imdb_score"]);
                let startRating = ratingSelected[0].start;
                let endRating = ratingSelected[0].end;

                if(!isNaN(currentMovieRating))
                {
                    if(!(currentMovieRating >= startRating && currentMovieRating <= endRating))
                        ratingMatches = false;
                }
                else
                    ratingMatches = false;
            }

            let genresMatch = false;

            if(isGenreFilterSet)
            {
                for(let genreIndex = 0; genreIndex < genresSelected.length; genreIndex++)
                {
                    if(film["genres"].includes(genresSelected[genreIndex]))
                    {
                        genresMatch = true;
                        break;
                    }
                }
            }
            else
                genresMatch = true;

            if(yearMatches && ratingMatches && genresMatch)
            {
                if(!matchingMovies_set.has(film["movie_title"]))   //Avoid film duplication using set
                {
                    matchingMovies_set.add(film["movie_title"]);
                    matchingMovies.push(film);
                }
            }
        })
    }

    return matchingMovies;
}