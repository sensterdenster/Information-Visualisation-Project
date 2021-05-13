/**
 * Created by Sen Thotawatte on 08/05/2021.
 */
class TableFilms
{
    constructor(films)
    {
        // Counters at the top header of each column which can be clicked to sort 
        this.sortColumnOrder = [ 0, 0, 0, 0, 0];  

        //Headers of the table with reference to the CSV file name headers
        this.headersForTable = ["title_year", "movie_title", "director_name", "imdb_score", "budget"];

        //This films reference so constructor can be called when used
        this.films = films;
    }

    //Create function to generate table for movies
    create()
    {
        //Setting name of headers for table head 
        let thead = d3.select("#tableMovies").select("thead");

        //Selecting all headers in table head and setting the correct data to each column
        let columnsTableHead = thead.selectAll("th")
            .data(this.headersForTable);

        //Sorting function added to each column
        columnsTableHead
            .on("click", (p, q) => {

                
                if(this.sortColumnOrder[q] % 2 == 0)
                {
                    // For each even click on a column's header, sort all row-values for that column in ascending order
                    this.films = (this.films).slice().sort(function (x, y) {
                        if(x[p] < y[p])
                            return -1;
                        else if(x[p] > y[p])
                            return 1;
                        else
                            return 0;
                    });
                }
                else    
                {
                    //Else, for every odd click on a column's header the row-values for that column should be sorted in descending order 
                    this.films = (this.films).slice().sort(function (x, y) {
                        if(x[p] > y[p])
                            return -1;
                        else if(x[p] < y[p])
                            return 1;
                        else
                            return 0;
                    });
                }

                //Column sort order array updated and update funtion called to sort data for table with new sort
                this.sortColumnOrder[q] += 1;
                this.update()   
            });
    }

    //Update function updates the values for the table and displays them
    update()
    {
        //Setting names of values for body of table from csv file
        let tbody = d3.select("#tableMovies").select("tbody");

        //Selecting all values in table body and setting correct values accordingly
        let topRowsBody = tbody.selectAll("tr")
            .data(this.films);

        //Appending values from selected values accordingly, removing old ones and mergeing new ones to fit the sorted list
        let topRowsBodyEnter = topRowsBody.enter().append("tr");
        topRowsBody.exit().remove();
        topRowsBody = topRowsBody.merge(topRowsBodyEnter);

        //Selecting all data from rows and columns and filtering the right data for each of the headers
        let topColumnsBody = topRowsBody.selectAll("td")
            .data( (p) => {
                return [
                    p["title_year"], p["movie_title"], p["director_name"], p["imdb_score"], p["budget"]
                ]
            } );

        //Appending these new values and removing the old one 
        let topColumnsBodyEnter = topColumnsBody.enter().append("td");
        topColumnsBody.exit().remove();

        //Mergeing this with the new columns after sorting
        topColumnsBody = topColumnsBody.merge(topColumnsBodyEnter)
            .style("opacity", 0)
            .text( (p, q) => {
                if(!p)
                    return "N/A";

                if(q == 4)  //Column for budget as some values are 'N/A' (strings)
                    return parseInt(p).toLocaleString();

                return p;
            })
            .transition()
            .duration(500)
            .style("opacity", 1);
    }
}