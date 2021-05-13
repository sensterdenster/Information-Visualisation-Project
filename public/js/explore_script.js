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
    filterObj.create();

    //Call function to retrieve initial films and stores it in filmsInitial variable
    let filmsInitial = getMoviesForFilters();

    //Rendering the 50 arbitrary films from the node-link diagram which is initially loaded on the page
    let nodelinkfd = new NodeLinkFD(filmsInitial.slice(0, 100));
    nodelinkfd.update();

    //Rendering the 50 arbitrary films into the table for the initial loaded page 
    window.tableFilms = new TableFilms(filmsInitial.slice(0, 100));
    tableFilms.create();
    tableFilms.update();
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

    //Sorting genres
    setGenres = new Set(Array.from(setGenres).sort());

    return setGenres;
}


//Function to select or deselect all checkboxes
function selectAll()
{
    //If select all box is checked then select all genre checkboxes
    if(document.getElementById("selectAll").checked == true) //Select all genres
    {
        genresForAll.forEach((genre)=>{
            let genreChosen = document.getElementById(genre);
            genreChosen.checked = true;
        });
    }
    //Otherwise all genres should be deselected
    else  
    {
        genresForAll.forEach((genre)=>{
            let genreChosen = document.getElementById(genre);
            genreChosen.checked = false;
        });
    }
}

/**
 *  Update the films table & node-link diagram based on filter selection
 */

//Function to apply films table and node-link diagram in regards to the filters selected
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
        tableFilms = new TableFilms(matchingMovies.slice(0, 100));  //Limiting films matching search criteria to 100
        tableFilms.create();
        tableFilms.update();

        let nodelinkfd = new NodeLinkFD(matchingMovies.slice(0, 100));  //Limiting films matching search criteria to 100
        nodelinkfd.update();
    }
}


//Retrieves films which match the specific criteria of rating, genre, and year for filters
function getMoviesForFilters() {

    genresSelected = [];

    genresForAll.forEach((genre) => {
        let genreChosen = document.getElementById(genre);

        if(genreChosen.checked)
            genresSelected.push(genreChosen.getAttribute("value"));
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