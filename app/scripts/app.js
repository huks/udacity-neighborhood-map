/* Knockout scripts */
// The location listings data - would come from the server
var locations = [
    {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
    {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
    {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
    {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
];

/**
 * @description Knockout ViewModel
 * Filter feature cited from https://stackoverflow.com/questions/34584181/create-live-search-with-knockout
 */
var filteredLocations =[];
function ViewModel() {
    var self = this;
    this.filter = ko.observable();
    this.locations = ko.observableArray(locations);
    
    filteredLocations = ko.computed(function() {
        return this.locations().filter(function(location) {
            if(!self.filter() || location.title.toLowerCase().indexOf(self.filter().toLowerCase()) >= 0) {
                return location;
            }
        });
    }, this);
}

ko.applyBindings(new ViewModel());

/* Google Maps JavaScript */
var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13,
    mapTyoeControl: false
    });

    var largeInfowindow = new google.maps.InfoWindow();
    
    // The following group uses the location array to create an array of markers on initialize.
    for (var i=0; i<locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        // marker.addListener('click', function() {
        // populateInfoWindow(this, largeInfowindow);
        // });
    }
    showListings();
}

// This function will loop through the markers array and display them all.
function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i=0; i<markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// Filter the map
function filterMap() {
    for (var i=0; i<markers.length; i++) {
        // console.log(markers[i].title);
        console.log(filteredLocations[i]);
    }
}

