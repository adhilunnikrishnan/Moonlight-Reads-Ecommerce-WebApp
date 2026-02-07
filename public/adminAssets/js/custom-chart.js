(function ($) {
  "use strict";

  /*Men women last year sales statistics Chart*/
  if ($("#myChart").length) {
   const canvas = document.getElementById("myChart");
    const ctx = canvas.getContext("2d");

    const mangaData = JSON.parse(canvas.getAttribute("data-manga"));
    const comicsData = JSON.parse(canvas.getAttribute("data-comics"));

    var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: "line",

      // The data for our dataset
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: "Manga",
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(44, 120, 220, 0.2)",
            borderColor: "rgba(44, 120, 220)",
            data: mangaData,
          },

          {
            label: "Comics",
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(380, 200, 230, 0.2)",
            borderColor: "rgb(380, 200, 230)",
            data: comicsData,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
      },
    });
  } //End if

  /*Sale statistics Chart*/
   if ($("#myChart2").length) {
    var canvas = document.getElementById("myChart2");

    var donutLabels = JSON.parse(canvas.getAttribute("data-labels"));
    var donutData = JSON.parse(canvas.getAttribute("data-values"));

    // Map each status to a specific color
    const statusColors = {
      Delivered: "#7bcf86", 
      Pending: "#ffcd56", 
      Shipped: "#5897fb", 
      "Out for Delivery": "#d595e5", 
      Cancelled: "#ff6b6b", 
      Processing: "#f39c12",
    };

    // Generate colors dynamically
    const backgroundColors = donutLabels.map(
      (label) => statusColors[label] || "#9b59b6"
    );

    var ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: donutLabels,
        datasets: [
          {
            data: donutData,
            backgroundColor: backgroundColors,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true } },
        },
        responsive: true,
      },
    });
  }
})(jQuery);
