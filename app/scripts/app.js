// Creates a global map variable
var MAP;

// The default location listings data - would come from the server
var LOCATION_DATA = [
    {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
    {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
    {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
    {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
];

/**
 * @description Represent a single location item
 * @param location
 */
function Location(location) {
    var self = this;
    this.title = ko.observable(location.title);
    self.location = ko.observable(location.location);

    // Marker feature cited from...

    // Create a marker for each location
    this.marker = new google.maps.Marker({
        position: self.location(),
        title: this.title(),
        animation: google.maps.Animation.DROP
    });

    // Create an onclick event per marker
    this.marker.addListener('click', function() {
        // Animate when the map marker itself is selected
        MAP.panTo(self.location());
    })

    // Extend the boundaries of the map for each marker
    MAP.bounds.extend(this.marker.position);
    // and display the marker
    this.marker.setMap(MAP);    
}
/**
 * @description AppViewModel
 */
function AppViewModel() {
    var self = this;

    // initMap()
    MAP = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 13,
        mapTypeControl: false
    });

    // initialize bounds variable
    MAP.bounds = new google.maps.LatLngBounds();

    this.filter = ko.observable();
    this.locations = ko.observableArray(LOCATION_DATA.map(function(location) {
        return new Location(location);
    }));
    
    // Filter feature cited from https://stackoverflow.com/questions/34584181/create-live-search-with-knockout
    this.filteredLocations = ko.computed(function() {
        return this.locations().filter(function(location) {
            var display = true;
            if (!self.filter() || location.title().toLowerCase().indexOf(self.filter().toLowerCase()) >= 0) {
                display = true;
            } else {
                display = false;
            }            
            location.marker.setVisible(display);
            return display;
        });
    }, this);

    this.animateMarker = function(param) {
        MAP.panTo(param.location());
    }

    MAP.fitBounds(MAP.bounds);
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}