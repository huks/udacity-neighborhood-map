/**
 * Knockout below
 * Cited from Live search with knockout.js
 * https://opensoul.org/2011/06/23/live-search-with-knockoutjs/
 */

// The location listings data - would come from the server
var locations = [
    {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
    {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
    {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
    {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
];

function ViewModel() {
    var self = this;
    this.filter = ko.observable();
    this.locations = ko.observableArray(locations);
    
    this.filteredLocations = ko.computed(function() {
        return this.locations().filter(function(location) {
            if(!self.filter() || location.title.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1) {
                return location;
            }
        });
    }, this);
}

ko.applyBindings(new ViewModel());
