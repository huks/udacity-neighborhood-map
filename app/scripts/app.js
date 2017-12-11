// Global map variables
var gMap;
var gInfoWindow;
// Constant variables
const FOURSQUARE_CLIENT_ID = 'SR3U4RKZ5LPPQBWVYVOVJFA54XIR3HHH0L5XV3P45EC2LZCA';
const FOURSQUARE_CLIENT_SECRET = 'UQM4AU1YV4YQB4ADXD4TQZPUNIFQRSI4OKXEACRYL3GR0XRI';
const FOURSQUARE_VERSION = '20171206';

/* Google Maps Styles */
// var MAP_STYLES = 'styles.js';

/**
 * @description Represent a single location item
 * @param data - ajaxLocations object
 */
function LocationItem(data) {
    console.log(data);
    var self = this;
    this.id = data.venue.id;
    this.name = data.venue.name;
    this.category = data.venue.categories[0].name;
    this.title = ko.observable(self.name + ' ' + self.category);
    this.location = ko.observable(data.venue.location);    

    // Create a marker for each location
    this.marker = new google.maps.Marker({
        map: gMap,
        position: self.location(),
        title: self.title(),
        animation: google.maps.Animation.DROP,
        id: self.id
    });

    // Create an onclick event per marker
    this.marker.addListener('click', function() {
        populateInfoWindow(self);
    });

    this.clickMarker = function() {
        google.maps.event.trigger(self.marker, 'click');
    };

    // Extend the boundaries of the map for each marker
    gMap.bounds.extend(self.marker.position);
    // and display the marker
    this.marker.setMap(gMap);    
}

/**
 * @description AppViewModel
 * @param data - Result from getForsquareVenues() ajax
 */
function AppViewModel(data) {
    var self = this;   

    // Prepare the items data
    var items = data.response.groups[0].items;

    // initialize the Snazzy Info Window
    var tempMarker = new google.maps.Marker({
        map: gMap,
        id: 0
    });
    gInfoWindow = new SnazzyInfoWindow({
        marker: tempMarker,
        showCloseButton: false,
        padding: '0px'
    });

    this.filter = ko.observable();

    this.locations = ko.observableArray(items.map(function(item) {
        return new LocationItem(item);
    }));
        
    // Filter feature cited from https://stackoverflow.com/questions/34584181/create-live-search-with-knockout
    this.filteredLocations = ko.computed(function() {
        return self.locations().filter(function(locItem) {
            var display = true;
            if (!self.filter() || locItem.title().toLowerCase().indexOf(self.filter().toLowerCase()) >= 0) {                
                display = true;
            } else {
                display = false;
            }            
            locItem.marker.setVisible(display);
            return display;
        });
    }, this);

    // Fit map to initialized bounds
    // Bounds are extended from each Location() function
    gMap.fitBounds(gMap.bounds);
}

/**
 * @description Disable the animation, close and reset the InfoWindow
 */
function resetMarkerInstance() {
    if (typeof gInfoWindow.marker !== 'undefined' && gInfoWindow.marker != null) {
        // Disable the bounce animation
        gInfoWindow.marker.setAnimation(null);
        // Close the InfoWindow
        gInfoWindow.close();
        // Make sure the maker property is cleared if the InfoWindow is closed.
        gInfoWindow.marker = null;            
    }
}

/**
 * @description Populates the InfoWindow when the marker is clicked
 * @param location 
 * @param infoWindow 
 */
// We'll only allow one InfoWindow which will open at the marker that is clicked,
// and populate based on that markers position.
// Cited from Udacity course: Project_Code_13_DevilInTheDetailsPlacesDetails.html
function populateInfoWindow(locItem) {
    console.log(locItem.id);
    console.log(gInfoWindow._marker.id);    

    var newId = locItem.id;
    var oldId = gInfoWindow._marker.id;

    if (newId != oldId) {
        gMap.panTo(locItem.marker.position);
        getVenuePhoto(locItem.id).done(createInfoWindow);
    }

    function createInfoWindow(data) {
        console.log('createInfoWindow');
        var photoCount = data.response.photos.count;
        // If there is a photo, least one
        if (photoCount > 0) {
            var prefix = data.response.photos.items[0].prefix;
            /**
             * size can be one of the following, where XX or YY is one of 36, 100, 300, or 500.
             *  - XXxYY
             *  - original: the original photo’s size
             *  - capXX: cap the photo with a width or height of XX. (whichever is larger). Scales the other, smaller dimension proportionally
             *  - widthXX: forces the width to be XX and scales the height proportionally
             *  - heightYY: forces the height to be YY and scales the width proportionally
             */
            var size = 'width300';
            var suffix = data.response.photos.items[0].suffix;
            var photoURL = prefix + size + suffix;            

            gInfoWindow.setContent(
                '<img src='+photoURL+'>' +
                '<div id="info-window">' +
                '<dl class="row">' +
                '<dt class="col-sm-4">NAME</dt>' +
                '<dd class="col-sm-8">'+locItem.name+'</dd>' +
                '<dt class="col-sm-4">CATEGORY</dt>' +
                '<dd class="col-sm-8">'+locItem.category+'</dd>' +
                '</dl>' +
                '</div>'
            );
        } else {
            gInfoWindow.setContent(
                '<div id="info-window">' +
                '<dl class="row">' +
                '<dt class="col-sm-4">NAME</dt>' +
                '<dd class="col-sm-8">'+locItem.name+'</dd>' +
                '<dt class="col-sm-4">CATEGORY</dt>' +
                '<dd class="col-sm-8">'+locItem.category+'</dd>' +
                '</dl>' +
                '</div>'
            );
        }

        gInfoWindow.setPosition(
            locItem.location()
        );
        gInfoWindow.open();

    }
}

/**
 * @description Get a Venue's Photo(s)
 *  - Foursquare API: Returns a photos for a specific venue.
 */
function getVenuePhoto(venueId) {
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
    .done(function() {
        console.log('getVenuePhoto done');
    });
}

/**
 * @description Search for Venue(s)
 *  - Foursquare API: Returns a list of venues near the current location,
 *    optinally matching a search term.
 */   
function searchForVenue(latLng, infoWindow, marker) {
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
    .done(function(result) {
        console.log('venue success');
        getVenuePhoto(result, infoWindow, marker);        
    })
    .fail(function() {
        console.log('venue error');
        // No negative repercussions to the UI
    })
    .always(function() {
        console.log('venue complete');         
    });
}

function startApp() {
    // Current location variables for Foursquare ll
    var locKorea = {lat: 37.54, lng: 126.94};
    var locAustralia = {lat:-27.49, lng: 153.01}; // for English users

    // initMap()
    gMap = new google.maps.Map(document.getElementById('map'), {
        center: locAustralia,
        zoom: 13,
        mapTypeControl: false
    });

    // initialize bounds variable
    gMap.bounds = new google.maps.LatLngBounds();

    /**
     * @description: getFoursquareVenues() - Get Venue Recommendations
     *  - Foursquare API: Returns a list of recommended venues near the current location.
     */
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/explore',
        dataType: 'json',
        data: {
            'client_id': FOURSQUARE_CLIENT_ID,
            'client_secret': FOURSQUARE_CLIENT_SECRET,            
            'll': locAustralia.lat+','+locAustralia.lng,
            'v': FOURSQUARE_VERSION,
            'limit': 20
        }
    })
    .done(function(result) {
        // console.log('done getFoursquareVenues');        
        ko.applyBindings(new AppViewModel(result));       
    })
    .fail(function() {
        console.log('fail getFoursquareVenues');
        $('#map').addClass('expand');
        $('#list-bar').addClass('collapse');
    })
    .always(function() {
        // console.log('always getFoursquareVenues ');        
    });    
}