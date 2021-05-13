
class MovieTable
{
    constructor(films)
    {
        //Headers of the table with reference to the CSV file name headers
        this.tableHeaders = ["title_year", "movie_title", "director_name", "imdb_score", "budget"];

        // Counters at the top header of each column which can be clicked to sort 
        this.columnsSortOrder = [ 0, 0, 0, 0, 0];  

        //This films reference so constructor can be called when used
        this.films = films;
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
            .on("click", (p, q) => {

                
                if(this.columnsSortOrder[q] % 2 == 0)
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

                //Column sort order array updated and apply funtion called to sort data for table with new sort
                this.columnsSortOrder[q] += 1;
                this.apply()   
            });
    }

    //Apply function updates the values for the table and displays them
    apply()
    {
        //Setting names of values for body of table from csv file
        let tbody = d3.select("#tableMovies").select("tbody");

        //Selecting all values in table body and setting correct values accordingly
        let tbodyRows = tbody.selectAll("tr")
        .data(this.films);

        let tbodyRowsEnter = tbodyRows.enter().append("tr");
        tbodyRows.exit().remove();
        tbodyRows = tbodyRows.merge(tbodyRowsEnter);

        let tbodyColumns = tbodyRows.selectAll("td")
            .data( (d) => {
                return [
                    d["title_year"], d["movie_title"], d["director_name"], d["imdb_score"], d["budget"]
                ]
            } );

        let tbodyColumnsEnter = tbodyColumns.enter().append("td");
        tbodyColumns.exit().remove();

        tbodyColumns = tbodyColumns.merge(tbodyColumnsEnter)
            .style("opacity", 0)
            .text( (d, i) => {
                if(!d)
                    return "N/A";

                if(i == 4)  //Budget column
                    return parseInt(d).toLocaleString();

                return d;
            })
            .transition()
            .duration(500)
            .style("opacity", 1);
    }
}