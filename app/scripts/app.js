// Global map variables
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
    // marker variable is...
    var marker = location.marker;

    // Animate to the marker
    MAP.panTo(marker.position);

    var latLng = location.location().lat+','+location.location().lng;
    console.log(latLng);

    // AJAX
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search',
        dataType: 'json',
        data: {
            'client_id': 'SR3U4RKZ5LPPQBWVYVOVJFA54XIR3HHH0L5XV3P45EC2LZCA',
            'client_secret': 'UQM4AU1YV4YQB4ADXD4TQZPUNIFQRSI4OKXEACRYL3GR0XRI',            
            'll': latLng,
            'v': 20171206,
            'limit': 1
        }
    })
    .done(handleResponse)
    .fail(function() {
        // error
    })
    .always(function() {
        // complete
    });

    function handleResponse(data) {
        console.log('the ajax request has finished!');
        console.log('id:', data.response.venues[0].id);
        console.log('name:', data.response.venues[0].name);

        var venueID = data.response.venues[0].id;

        // AJAX
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/'+venueID+'/photos',
            dataType: 'json',
            data: {
                'client_id': 'SR3U4RKZ5LPPQBWVYVOVJFA54XIR3HHH0L5XV3P45EC2LZCA',
                'client_secret': 'UQM4AU1YV4YQB4ADXD4TQZPUNIFQRSI4OKXEACRYL3GR0XRI',
                'v': 20171206,
                'limit': 1
            }
        })
        .done(function(result) {
            var photoCount = result.response.photos.count;
            if (photoCount > 0) {
                var prefix = result.response.photos.items[0].prefix;
                var size = 'height200';
                var suffix = result.response.photos.items[0].suffix;
                var photoURL = prefix + size + suffix;

                infoWindow.setContent(`
                    <div>${marker.title}</div>
                    <div>
                        <img src=${photoURL}>
                    </div>
                `);
            } else {
                infoWindow.setContent(`
                    <div>${marker.title}</div>
                `);
            }   
        })
        .fail(function() {
            // error
        })
        .always(function() {
            // complete
        });
    }

    // Check to make sure the InfoWindow is not already opened on this marker.
    if (infoWindow.marker != marker) {
        // Clear the InfoWindow content to give the streetview time to load.
        infoWindow.setContent('');
        infoWindow.marker = marker;
        // Make sure the marker property is cleared if the InfoWindow is closed.
        infoWindow.addListener('closeclick', function() {
            infoWindow.marker = null;
        });

        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;

        // In case the status is OK, which menas the pano was found,
        // compute the position of the streetview image,
        // then calculate the heading,
        // then get a panorama from that and set the options
        function getStreetView(data, status) {
            if (status === google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infoWindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        // streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the InfoWindow on the correct marker.
        infoWindow.open(MAP, marker);    
    }
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}