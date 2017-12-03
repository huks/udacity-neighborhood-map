/* Google Maps JavaScript */
var map;
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
    });

    var tribeca = {lat: 40.719526, lng: -74.0089934};
    var marker = new google.maps.Marker({
      position: tribeca,
      map: map,
      title: 'First Marker!'
    });
}

/* Knockout below */

// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {
    this.firstName = "Bert";
    this.lastName = "Bertington";
}

// Activates knockout.js
ko.applyBindings(new AppViewModel());