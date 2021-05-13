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

    let filmsInitial = getMoviesForFilters();

    //Render the initial node-link diagram with 50 arbitrary films
    let nodelinkfd = new NodeLinkFD(filmsInitial.slice(0, 100));
    nodelinkfd.update();

    //Render the initial films table with 50 arbitrary films
    window.movieTable = new MovieTable(filmsInitial.slice(0, 100));
    movieTable.produce();
    movieTable.update();
});


/**
 *  Returns a sorted set of all (unique) genres
 */
function genresRetrieved() {

    let genres_set = new Set();

    filmsExcel.forEach((films) => {
        let movieGenres = films["genres"].split("|");
        movieGenres.forEach((genre) => {
            genres_set.add(genre);
        })
    });

    //Sort the genres
    genres_set = new Set(Array.from(genres_set).sort());

    return genres_set;
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

    let matchingMovies = getMoviesForFilters();
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
        movieTable = new MovieTable(matchingMovies.slice(0, 100));  //Limiting films matching search criteria to 100
        movieTable.produce();
        movieTable.update();

        let nodelinkfd = new NodeLinkFD(matchingMovies.slice(0, 100));  //Limiting films matching search criteria to 100
        nodelinkfd.update();
    }
}

/**
 *  Return matching films for the selected year, rating and genre filter values
 */
function getMoviesForFilters() {

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