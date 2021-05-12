
class MovieTable
{
    constructor(films)
    {
        // Counters at the top header of each column which can be clicked to sort 
        this.columnsSortOrder = [ 0, 0, 0, 0, 0];  

        //Headers of the table with reference to the CSV file name headers
        this.tableHeaders = ["title_year", "movie_title", "director_name", "imdb_score", "budget"];

        //This films reference so constructor can be called when used
        this.films = films;
    }

    //Create function to create table for movies
    create()
    {
        //Setting name of headers for table head 
        let tableHead = d3.select("#tableMovies").select("tableHead");

        //Selecting all headers in table head and setting the correct data to each column
        let columnsTableHead = tableHead.selectAll("th")
            .data(this.tableHeaders);

        //Sorting function added to each column
        columnsTableHead
            .on("click", (p, q) => {

                // For each click on a column's header, sort all value-rows for that column in ascending order
                if(this.columnsSortOrder[q] % 2 == 0)
                {
                    //Sort
                    this.films = (this.films).slice().sort(function (a, b) {

                        if(a[p] < b[p])
                            return -1;
                        else if(a[p] > b[p])
                            return 1;
                        else
                            return 0;
                    });
                }
                else    // Every odd click, sort all rows in descending order of the chosen column's values
                {
                    this.films = (this.films).slice().sort(function (a, b) {

                        if(a[p] > b[p])
                            return -1;
                        else if(a[p] < b[p])
                            return 1;
                        else
                            return 0;
                    });
                }

                this.columnsSortOrder[q] += 1;
                this.update()   //Update the table contents with sorted data
            });
    }

    update()
    {
        let tbody = d3.select("#tableMovies").select("tbody");

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