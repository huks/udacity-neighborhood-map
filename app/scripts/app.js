// Global map variables
var MAP;
var INFO_WINDOW;
// Constant variables
const FOURSQUARE_CLIENT_ID = 'SR3U4RKZ5LPPQBWVYVOVJFA54XIR3HHH0L5XV3P45EC2LZCA';
const FOURSQUARE_CLIENT_SECRET = 'UQM4AU1YV4YQB4ADXD4TQZPUNIFQRSI4OKXEACRYL3GR0XRI';
const FOURSQUARE_VERSION = '20171206';

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
    this.location = ko.observable(data.location);

    // Marker feature cited from...

    // Create a marker for each location
    this.marker = new google.maps.Marker({
        position: this.location(),
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
// Cited from Udacity course: Project_Code_13_DevilInTheDetailsPlacesDetails.html
function populateInfoWindow(location, infoWindow) {
    var marker = location.marker;
    var latLng = location.location().lat+','+location.location().lng;

    // Animate to the marker
    MAP.panTo(marker.position);

    if (infoWindow.marker != marker) {
        // Clear the InfoWindow content to give the streetview time to load.
        // infoWindow.setContent('');
        infoWindow.marker = marker;
        // Make sure the marker property is cleared if the InfoWindow is closed.
        infoWindow.addListener('closeclick', function() {
            infoWindow.marker = null;
        });

        searchForVenue(latLng);
    }

    /**
     * Search for Venue(s)
     * Foursquare API: Returns a list of venues near the current location,
     * optinally matching a search term.
     */   
    function searchForVenue(latLng) {
        var ll = latLng;
        return $.ajax({
            url: 'https://api.foursquare.com/v2/venues/search',
            dataType: 'json',
            data: {
                'client_id': FOURSQUARE_CLIENT_ID,
                'client_secret': FOURSQUARE_CLIENT_SECRET,            
                'll': ll,
                'v': FOURSQUARE_VERSION,
                'limit': 1
            }
        })
        .then(getVenuePhoto)
        .done(function() {
            console.log('venue success');
            // When both searchForVenue and getVenuePhoto are done          
            infoWindow.open(MAP, marker);  
        })
        .fail(function() {
            console.log('venue error');
            // No InfoWindow shown
        })
        .always(function() {
            console.log('venue complete');
            // it should be called at 'last'           
        });
    }

    /**
     * Get a Venue's Photo(s)
     * Foursquare API: Returns a photos for a specific venue.
     * Dependence chain of searchForVenue Ajax request
     */
    function getVenuePhoto(data) {
        var venueId = data.response.venues[0].id;
        var venueName = data.response.venues[0].name;
        return $.ajax({
            url: 'https://api.foursquare.com/v2/venues/'+venueId+'/photos',
            dataType: 'json',
            data: {
                'client_id': FOURSQUARE_CLIENT_ID,
                'client_secret': FOURSQUARE_CLIENT_SECRET,
                'v': FOURSQUARE_VERSION,
                'limit': 1
            }
        })
        .done(function(result) {
            console.log('photo success');
            var photoCount = result.response.photos.count;
            if (photoCount > 0) {
                var prefix = result.response.photos.items[0].prefix;
                var size = 'height200';
                var suffix = result.response.photos.items[0].suffix;
                var photoURL = prefix + size + suffix;

                // Draw InfoWindow at once
                infoWindow.setContent(`
                    <div>${venueName}</div>
                    <div>
                        <img src=${photoURL}>
                    </div>
                `);
            } else {
                infoWindow.setContent(`
                    <div>${venueName}</div>
                `);
            }   
        })
        .fail(function() {
            console.log('photo error');
            // If getVenuePhoto Ajax call fails, searchForVenue Ajax fails too.
        })
        .always(function() {
            console.log('photo complete');
            // getVenuePhoto complete               
        });
    }
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}