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
    let filmNodeLink = new NodeLinkFD(filmsInitial.slice(0, 100));
    filmNodeLink.update();

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
    filmsExcel.forEach((film) => {
        let genresFilms = film["genres"].split("|");
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
function processFilters() {
    //Messages for header and body if number of films exceed 100 as this would be too much  as error messages if no films found
    let filmsMatching = retrieveFilmsFiltered();
    let errorMessage = "";
    let headerMessage = document.getElementById("headerMessage");
    let bodyMessage = document.getElementById("bodyMessage");

    //If number of films are greater than 100, display following prompt text 
    if(filmsMatching.length > 100)
    {
        headerMessage.innerText = "Note";
        headerMessage.setAttribute("class", "text-info");
        errorMessage = "Matching movies exceeded 100 - results trimmed";
    }
    //Else if no films match criteria, display error message as shown below
    else if(filmsMatching.length == 0)
    {
        headerMessage.innerText = "Error";
        headerMessage.setAttribute("class", "text-danger");
        errorMessage = "No matching movies found for the selected filters";
    }

    //If error message, show the body of the message in the form of a modal 
    if(errorMessage)
    {
        bodyMessage.innerText = errorMessage;
        $('#modalError').modal('show');
    }

    //If the filtered films are greater than 0, limit the max to 100 and display these in the film table as well as in the form of the node link
    if(filmsMatching.length > 0)
    {
        //Listing films up to 100 as the limit for the filter criteria and then creating it in the table
        tableFilms = new TableFilms(filmsMatching.slice(0, 100));  
        tableFilms.create();
        tableFilms.update();

        //Listing films up to 100 as the limit for the filter criteria and then creating it in the node-link diagram 
        let filmNodeLink = new NodeLinkFD(filmsMatching.slice(0, 100));  
        filmNodeLink.update();
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

    let filmsMatching = [];
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
                    filmsMatching.push(film);
                }
            }
        })
    }

    return filmsMatching;
}