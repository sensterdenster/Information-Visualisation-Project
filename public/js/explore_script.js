d3.csv("data/movie_metadata.csv", function (error, films) {
    
    //Error catch
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
    let filmsInitial = retrieveFilmsFiltered();

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
    let genres_set = new Set();

    //Seperating genres 
    filmsExcel.forEach((film) => {
        let genresFilms = film["genres"].split("|");
        genresFilms.forEach((genre) => {
        genres_set.add(genre);
        })
    });

    //Sorting genres
    genres_set = new Set(Array.from(genres_set).sort());

    return genres_set;
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



//Function to apply films table and node-link diagram in regards to the filters selected
function processFilters() {
    //Messages for header and body if number of films exceed 100 as this would be too much  as error messages if no films found
    let filmsMatching = retrieveFilmsFiltered();
    let errorMessage = "";
    let messageHeader = document.getElementById("messageHeader");
    let messageBody = document.getElementById("messageBody");

    //If number of films are geater than 100, display following prompt text 
    if(filmsMatching.length > 100)
    {
        messageHeader.innerText = "Note";
        messageHeader.setAttribute("class", "text-info");
        errorMessage = "Matching movies exceeded 100 - results trimmed";
    }
    //Else if no films match criteria, display error message as shown below
    else if(filmsMatching.length == 0)
    {
        messageHeader.innerText = "Error";
        messageHeader.setAttribute("class", "text-danger");
        errorMessage = "No matching movies found for the selected filters";
    }

    //If error message, show the body of the message in the form of a modal 
    if(errorMessage)
    {
        messageBody.innerText = errorMessage;
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


/**
 * Retrieves films which match the specific criteria of rating, genre, and year for filters
*/
function retrieveFilmsFiltered() {

    //Array to store selected genres 
    genresSelected = [];

    //For each genre assign the element id from the csv file to genrechosen variable
    genresForAll.forEach((genre) => {
        let genreChosen = document.getElementById(genre);

        //If a specific genre box is chosen, push the values (in this case - films) under this genre into the array 
        if(genreChosen.checked)
            genresSelected.push(genreChosen.getAttribute("value"));
    });

    //Filtering selected length for each table header respectively 
    let filterSetYear = (yearSelected.length > 0);
    let filterSetRating = (ratingSelected.length > 0);
    let filterSetGenre = (genresSelected.length > 0);


    //Arrary to store films which fit the specified criteria, as well as creating a new interface to display this 
    let filmsMatching = [];
    let matchingMovies_set = new Set();

    //Condition for if at least one filter has been chosen for the three categories and applied
    if(filterSetYear || filterSetRating || filterSetGenre)    
    {
        //For each film in the csv file 
        filmsExcel.forEach((film) => {

            //Matching year for filter set to true
            let matchingYear = true;

            //Filtering films by chosen year for starting year and ending year
            if(filterSetYear)
            {
                let filmChosenYear = parseInt(film["title_year"]);
                let yearBeginning = yearSelected[0].start;
                let yearEnding = yearSelected[0].end;

                //Ordering descending/ascending years for films
                if(!isNaN(filmChosenYear))
                {
                    if(!(filmChosenYear >= yearBeginning && filmChosenYear <= yearEnding))
                        matchingYear = false;
                }
                else
                    matchingYear = false;
            }
             
            //Matching ratings for filter set to true
            let matchingRating = true;

            //Filtering films by year 
            if(filterSetRating)
            {
                let filmChosenRating = parseFloat(film["imdb_score"]);
                let ratingBeginning = ratingSelected[0].start;
                let ratingEnding = ratingSelected[0].end;

                //Ordering descending/ascending ratings for films
                if(!isNaN(filmChosenRating))
                {
                    if(!(filmChosenRating >= ratingBeginning && filmChosenRating <= ratingEnding))
                        matchingRating = false;
                }
                else
                    matchingRating = false;
            }

            //Boolean for genres that match/dont match
            let matchingGenres = false;

            //For number of films filterd by genre
            if(filterSetGenre)
            {
                //Looping through array of films filtered by genre and matching the films with the same genre
                for(let indexOfGenre = 0; indexOfGenre < genresSelected.length; indexOfGenre++)
                {
                    if(film["genres"].includes(genresSelected[indexOfGenre]))
                    {
                        matchingGenres = true;
                        break;
                    }
                }
            }
            //Else avoid entering for loop if all films have been filtered already
            else
                matchingGenres = true;

            //If all has been sorted and filtered accordingly for genre, year, and rating
            if(matchingYear && matchingRating && matchingGenres)
            {
                //Condition to avoid film being duplicated 
                if(!matchingMovies_set.has(film["movie_title"]))   
                {
                    matchingMovies_set.add(film["movie_title"]);
                    filmsMatching.push(film);
                }
            }
        })
    }
    return filmsMatching;
}