d3.csv("data/movie_metadata.csv", function (error, movies) {
    if (error) throw error;

    window.excelMovies = movies;
    window.allGenres = getGenres();

    window.yearSelected = [];
    window.ratingSelected = [];
    window.selectedGenres = [];

    //Render the filters associated with the movies table & node-link diagram
    let filters = new Filters();
    filters.create();

    let initialMovies = getMoviesForFilters();

    //Render the initial node-link diagram with 50 arbitrary movies
    let nodelinkfd = new NodeLinkFD(initialMovies.slice(0, 100));
    nodelinkfd.update();

    //Render the initial movies table with 50 arbitrary movies
    window.tableMovies = new TableMovies(initialMovies.slice(0, 100));
    tableMovies.create();
    tableMovies.update();
});


/**
 *  Returns a sorted set of all (unique) genres
 */
function getGenres() {

    let genres_set = new Set();

    excelMovies.forEach((movie) => {
        let movieGenres = movie["genres"].split("|");
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
        allGenres.forEach((genre) => {
            let currentGenre = document.getElementById(genre);
            currentGenre.checked = true;
        });
    }
    else    //Deselect all genres
    {
        allGenres.forEach((genre) => {
            let currentGenre = document.getElementById(genre);
            currentGenre.checked = false;
        });
    }
}

/**
 *  Update the movies table & node-link diagram based on filter selection
 */
function filterProcess() {

    let matchingMovies = getMoviesForFilters();
    let errorMessage = "";
    let messageHeader = document.getElementById("messageHeader");
    let messageBody = document.getElementById("messageBody");

    if(matchingMovies.length > 100)
    {
        messageHeader.innerText = "Note";
        messageHeader.setAttribute("class", "text-info");
        errorMessage = "Matching movies exceeded 100 - results trimmed";
    }
    else if(matchingMovies.length == 0)
    {
        messageHeader.innerText = "Error";
        messageHeader.setAttribute("class", "text-danger");
        errorMessage = "No matching movies found for the selected filters";
    }

    if(errorMessage)
    {
        messageBody.innerText = errorMessage;
        $('#errorModal').modal('show');
    }

    if(matchingMovies.length > 0)
    {
        tableMovies = new TableMovies(matchingMovies.slice(0, 100));  //Limiting movies matching search criteria to 100
        tableMovies.create();
        tableMovies.update();

        let nodelinkfd = new NodeLinkFD(matchingMovies.slice(0, 100));  //Limiting movies matching search criteria to 100
        nodelinkfd.update();
    }
}

/**
 *  Return matching movies for the selected year, rating and genre filter values
 */
function getMoviesForFilters() {

    selectedGenres = [];

    allGenres.forEach((genre) => {
        let currentGenre = document.getElementById(genre);

        if(currentGenre.checked)
            selectedGenres.push(currentGenre.getAttribute("value"));
    });

    let isYearFilterSet = (yearSelected.length > 0);
    let isRatingFilterSet = (ratingSelected.length > 0);
    let isGenreFilterSet = (selectedGenres.length > 0);

    let matchingMovies = [];
    let matchingMovies_set = new Set();

    if(isYearFilterSet || isRatingFilterSet || isGenreFilterSet)    //If at least one filter has been set by user
    {
        excelMovies.forEach((movie) => {

            let yearMatches = true;

            if(isYearFilterSet)
            {
                let currentMovieYear = parseInt(movie["title_year"]);
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
                let currentMovieRating = parseFloat(movie["imdb_score"]);
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
                for(let genreIndex = 0; genreIndex < selectedGenres.length; genreIndex++)
                {
                    if(movie["genres"].includes(selectedGenres[genreIndex]))
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
                if(!matchingMovies_set.has(movie["movie_title"]))   //Avoid movie duplication using set
                {
                    matchingMovies_set.add(movie["movie_title"]);
                    matchingMovies.push(movie);
                }
            }
        })
    }

    return matchingMovies;
}