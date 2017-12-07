// Global map variables
var MAP;
var INFO_WINDOW;
// Constant variables
const FOURSQUARE_CLIENT_ID = 'SR3U4RKZ5LPPQBWVYVOVJFA54XIR3HHH0L5XV3P45EC2LZCA';
const FOURSQUARE_CLIENT_SECRET = 'UQM4AU1YV4YQB4ADXD4TQZPUNIFQRSI4OKXEACRYL3GR0XRI';
const FOURSQUARE_VERSION = '20171206';

/* The default location listings data - would come from the server */
// var DEFAULT_LOCATIONS = 'default-locations.js';

/* Google Maps Styles */
// var MAP_STYLES = 'styles.js';

/**
 * @description Represent a single location item
 * @param location
 */
function Location(data) {
    console.log(data);
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
function AppViewModel(data) {
    var self = this;

    // parse the data
    var ajaxLocations = [];
    var items = data.response.groups[0].items;
    for (item of items) {
        var title = item.venue.name + ' ' + item.venue.categories[0].name;
        var lat = item.venue.location.lat;
        var lng = item.venue.location.lng;
        ajaxLocations.push(
            {title: title, location: {lat: lat, lng: lng}}
        );
    }

    // initMap()
    MAP = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.541130, lng: 126.948995},
        zoom: 13,
        mapTypeControl: false
    });

    // initialize bounds variable
    MAP.bounds = new google.maps.LatLngBounds();

    // initialize InfoWindow
    INFO_WINDOW = new google.maps.InfoWindow();

    this.filter = ko.observable();

    this.locations = ko.observableArray(ajaxLocations.map(function(data) {
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
            resetMarkerInstance();         
            return display;
        });
    }, this);

    this.clickMarker = function(location) {
        populateInfoWindow(location, INFO_WINDOW);
    }

    // Fit map to initialized bounds
    MAP.fitBounds(MAP.bounds);
}

function resetMarkerInstance() {
    if (typeof INFO_WINDOW.marker !== 'undefined') {
        // No animation
        INFO_WINDOW.marker.setAnimation(null);
        // Close the InfoWindow
        INFO_WINDOW.close();
    }   
}

// This function populates the InfoWindow when the marker is clicked.
// We'll only allow one InfoWindow which will open at the marker that is clicked,
// and populate based on that markers position.
// Cited from Udacity course: Project_Code_13_DevilInTheDetailsPlacesDetails.html
function populateInfoWindow(location, infoWindow) {
    var marker = location.marker;
    var latLng = location.location().lat+','+location.location().lng;     

    if (infoWindow.marker != marker) {
        resetMarkerInstance();
        // Animate to the new marker
        MAP.panTo(marker.position);   
        // Clear the InfoWindow content to give the streetview time to load.
        // infoWindow.setContent('');
        // Now the marker is new!
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
            // then bounce
            marker.setAnimation(google.maps.Animation.BOUNCE);  
        })
        .fail(function() {
            console.log('venue error');
            // No negative repercussions to the UI
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
        // var venueName = data.response.venues[0].name;
        var venueName = location.title(); // to sync with the name in list
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
                /**
                 * size can be one of the following, where XX or YY is one of 36, 100, 300, or 500.
                 *   - XXxYY
                 *   - original: the original photo’s size
                 *   - capXX: cap the photo with a width or height of XX. (whichever is larger). Scales the other, smaller dimension proportionally
                 *   - widthXX: forces the width to be XX and scales the height proportionally
                 *   - heightYY: forces the height to be YY and scales the width proportionally
                 */
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
    var locKorea = '37.54,126.94';
    var locAustralia = '-27.49,153.01'; // for English users
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/explore',
        dataType: 'json',
        data: {
            'client_id': FOURSQUARE_CLIENT_ID,
            'client_secret': FOURSQUARE_CLIENT_SECRET,            
            'll': locAustralia,
            'v': FOURSQUARE_VERSION,
            'limit': 20
        }
    })
    .done(function(result) {
        console.log('ajax success');        
        ko.applyBindings(new AppViewModel(result));       
    })
    .fail(function() {
        console.log('ajax error');
    })
    .always(function() {
        console.log('ajax complete');        
    });    
}