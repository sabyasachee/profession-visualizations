// data variables
var titles;
var title_to_color = {};
var freq_data;
var emp_data;
var senti_groups = ["neu","pos","neg"];
var cur_title = "accountant";

function initialization() {

    d3.csv("data/employment.csv", function(edata) {
    d3.csv("data/frequency.csv", function(fdata) {
        freq_data = fdata;
        emp_data = edata;

        titles = fdata.columns.slice(1);
        var colors = d3.scaleOrdinal().domain(titles).range(d3.schemeSet2);

        for (let index = 0; index < titles.length; index++) {
            title_to_color[titles[index]] = colors(titles[index]);
        }

        d3.select("#select_title").selectAll("option").data(titles).enter().append("option")
        .text(function (d) {return d})
        .attr("value", function (d) {return d});

        d3.select("#select_title").on("change", function (d) {
            cur_title = d3.select(this).property("value");
            update_frequency_plot(cur_title);
            update_employment_plot(cur_title);
            update_sentiment_plot(cur_title);
        });

        initialize_frequency_plot();
        update_frequency_plot(cur_title);

        initialize_employment_plot();
        update_employment_plot(cur_title);

        initialize_sentiment_plot(cur_title);
    })
})
}

window.initialization();