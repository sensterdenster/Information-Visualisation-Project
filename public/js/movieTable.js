
class MovieTable
{
    constructor(movies)
    {
        this.tableHeaders = ["movie_title", "director_name", "title_year", "imdb_score", "budget"];
        this.columnsSortOrder = [ 0, 0, 0, 0, 0];  // Click-counters for each of the 5 columns

        //Todo: List of movies passed needs to depend on the filter criteria specified by the user
        //this.movies = movies.slice(0, 11);  //Just taking 11 movies for now
        this.movies = movies;
    }

    create()
    {
        let thead = d3.select("#tableMovies").select("thead");

        let theadColumns = thead.selectAll("th")
            .data(this.tableHeaders);

        // Adding sorting functionality to each column
        theadColumns
            .on("click", (d, i) => {

                // Every even click, sort all rows in ascending order of the chosen column's values
                if(this.columnsSortOrder[i] % 2 == 0)
                {
                    this.movies = (this.movies).slice().sort(function (a, b) {

                        if(a[d] < b[d])
                            return -1;
                        else if(a[d] > b[d])
                            return 1;
                        else
                            return 0;
                    });
                }
                else    // Every odd click, sort all rows in descending order of the chosen column's values
                {
                    this.movies = (this.movies).slice().sort(function (a, b) {

                        if(a[d] > b[d])
                            return -1;
                        else if(a[d] < b[d])
                            return 1;
                        else
                            return 0;
                    });
                }

                this.columnsSortOrder[i] += 1;
                this.update()   //Update the table contents with sorted data
            });
    }

    update()
    {
        let tbody = d3.select("#tableMovies").select("tbody");

        let tbodyRows = tbody.selectAll("tr")
            .data(this.movies);

        let tbodyRowsEnter = tbodyRows.enter().append("tr");
        tbodyRows.exit().remove();
        tbodyRows = tbodyRows.merge(tbodyRowsEnter);

        let tbodyColumns = tbodyRows.selectAll("td")
            .data( (d) => {
                return [
                    d["movie_title"], d["director_name"], d["title_year"], d["imdb_score"], d["budget"]
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