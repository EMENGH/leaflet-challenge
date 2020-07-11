
// assign API endpoint to queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// GET request to the query URL
d3.json(queryUrl, function(data) {

  // On response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

//define function createFeatures passing earthquakeData
function createFeatures(earthquakeData) {

   // Define a function we want to run once for each feature in the features array and create popup
   function onEachFeature(feature, layer) {
     layer.bindPopup("<h3>" + feature.properties.place + "</h3>" +
                     "<h4>" + "Magnitude : " + (feature.properties.mag) + "</h4>" + 
                     "<hr><p>" + new Date(feature.properties.time) + "</p>");
   }

   function radiusSize(magnitude) {
    return magnitude * 15000;
  }

    // Define function to set the circle color based on the magnitude
   function circleColor(magnitude) {
      if (magnitude < 1) {
        return "aqua"
      }
      else if (magnitude < 2) {
        return "green"
      }
      else if (magnitude < 3) {
        return "yellow"
      }
      else if (magnitude < 4) {
        return "orange"
      }
      else if (magnitude < 5) {
        return "brown"
      }
      else {
        return "red"
      }
  }

   // Create GeoJSON layer with features array on the earthquakeData object
   // Run onEachFeature function once for each piece of data in the array
   var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: .5
      });
    },
      onEachFeature: onEachFeature
   });

   // triggering createMap function
   createMap(earthquakes);
}
// Defining createMap function
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.00, -95.00
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create layer control, pass in baseMaps and overlayMaps, and Add layer control to map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

// color function to be used when creating the legend
function getColor(d) {
  return d > 5  ? 'red' :
         d > 4  ? 'brown' :
         d > 3  ? 'orange' :
         d > 2  ? 'yellow' :
         d > 1  ? 'green' :
                  'aqua';
}
// Insert legend to map
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
   var div = L.DomUtil.create('div', 'info legend'),
       magnitude = [0, 1, 2, 3, 4, 5]  

   // loop through and generate a label with a colors for each magnitude interval
   for (var i = 0; i < magnitude.length; i++) {
       div.innerHTML += '<i style="background:' + getColor(magnitude[i] + 1) + '"></i> ' +
       magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
   }
   return div;
};

legend.addTo(myMap);

}
