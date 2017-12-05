// Creates a global map variable
var MAP;
var INFO_WINDOW;

// The default location listings data - would come from the server
var DEFAULT_LOCATIONS = [
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
function Location(data) {
    var self = this;
    this.title = ko.observable(data.title);
    self.location = ko.observable(data.location);

    // Marker feature cited from...

    // Create a marker for each location
    this.marker = new google.maps.Marker({
        position: self.location(),
        title: this.title(),
        animation: google.maps.Animation.DROP
    });

    // Create an onclick event per marker
    this.marker.addListener('click', function() {
        populateInfoWindow(self, INFO_WINDOW);
    });

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
    MAP = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 13,
        mapTypeControl: false
    });

    // initialize bounds variable
    MAP.bounds = new google.maps.LatLngBounds();

    // initialize InfoWindow
    INFO_WINDOW = new google.maps.InfoWindow();

    this.filter = ko.observable();
    this.locations = ko.observableArray(DEFAULT_LOCATIONS.map(function(data) {
        return new Location(data);
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

    this.clickMarker = function(location) {
        populateInfoWindow(location, INFO_WINDOW);
    }

    // Fit map to initialized bounds
    MAP.fitBounds(MAP.bounds);
}

// This function populates the InfoWindow when the marker is clicked.
// We'll only allow one InfoWindow which will open at the marker that is clicked,
// and populate based on that markers position.
function populateInfoWindow(data, infoWindow) {
    console.log(data.title());
    // Animate to the marker
    MAP.panTo(data.location());
    // Check to make sure the InfoWindow is not already opened on this marker.
    if (infoWindow.marker != data) {
        infoWindow.marker = data;
        infoWindow.setContent('<div>' + data.title() + '</div>');
        infoWindow.open(MAP, data.marker);
        // Make sure the marker property is cleared if the InfoWindow is closed.
        infoWindow.addListener('closeclick', function() {
            infoWindow.marker = null;
        });
    }
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}