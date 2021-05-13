class MovieTable
{
    constructor(films)
    {
        //Headers of the table with reference to the CSV file name headers
        this.tableHeaders = ["title_year", "movie_title", "director_name", "imdb_score", "budget"];

        // Counters at the top header of each column which can be clicked to sort 
        this.columnsSortOrder = [ 0, 0, 0, 0, 0];  

        //This films reference so constructor can be called when used
        this.movies = films;
    }

    //Create function to create table for movies
    create()
    {
        //Setting name of headers for table head 
        let tableHead = d3.select("#tableMovies").select("thead");

        //Selecting all headers in table head and setting the correct data to each column
        let columnsTableHead = tableHead.selectAll("th")
            .data(this.tableHeaders);

        //Sorting function added to each column
        columnsTableHead
            .on("click", (d, i) => {

                
                if(this.columnsSortOrder[i] % 2 == 0)
                {
                    // For each even click on a column's header, sort all row-values for that column in ascending order
                    this.movies = (this.movies).slice().sort(function (a, b) {
                        if(a[d] < b[d])
                            return -1;
                        else if(a[d] > b[d])
                            return 1;
                        else
                            return 0;
                    });
                }
                else    
                {
                    //Else, for every odd click on a column's header the row-values for that column should be sorted in descending order 
                    this.movies = (this.movies).slice().sort(function (a, b) {
                        if(a[d] > b[d])
                            return -1;
                        else if(a[d] < b[d])
                            return 1;
                        else
                            return 0;
                    });
                }

                //Column sort order array updated and apply funtion called to sort data for table with new sort
                this.columnsSortOrder[i] += 1;
                this.apply()   
            });
    }

    //Apply function updates the values for the table and displays them
    apply()
    {
        //Setting names of values for body of table from csv file
        let topBody = d3.select("#tableMovies").select("tbody");

        //Selecting all values in table body and setting correct values accordingly
        let topRowsBody = topBody.selectAll("tr")
            .data(this.movies);

        //Appending values from selected values accordingly, removing old ones and mergeing new ones to fit the sorted list
        let topRowsBodyEnter = topRowsBody.enter().append("tr");
        topRowsBody.exit().remove();
        topRowsBody = topRowsBody.merge(topRowsBodyEnter);

        //Selecting all data from rows and columns and filtering the right data for each of the headers
        let topColumnsBody = topRowsBody.selectAll("td")
            .data( (d) => {
                return [
                    d["title_year"], d["movie_title"], d["director_name"], d["imdb_score"], d["budget"]
                ]
            } );

        //Appending these new values and removing the old one 
        let topColumnsBodyEnter = topColumnsBody.enter().append("td");
        topColumnsBody.exit().remove();

        //Mergeing this with the new columns after sorting
        topColumnsBody = topColumnsBody.merge(topColumnsBodyEnter)
            .style("opacity", 0)
            .text( (d, i) => {
                if(!d)
                    return "N/A";

                if(i == 4)  //Column for budget as some values are 'N/A' (strings)
                    return parseInt(d).toLocaleString();

                return d;
            })
            .transition()
            .duration(500)
            .style("opacity", 1);
    }
}