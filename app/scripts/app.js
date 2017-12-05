/* Google Maps JavaScript */
var map;
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
function Location(location) {
    this.title = ko.observable(location.title);
    this.location = ko.observable(location.location);
    console.log(this.title(), this.location());
    this.visible = ko.observable(true);

    this.marker = new google.maps.Marker({
        position: this.location(),
        title: this.title()
    });
    
    this.marker.setMap(map);
}

function AppViewModel() {
    var self = this;

    // initMap()
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 13,
        mapTypeControl: false
    });

    this.filter = ko.observable();
    this.locations = ko.observableArray(locations.map(function(location) {
        return new Location(location);
    }));
    
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
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}