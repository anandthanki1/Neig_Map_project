// Global Variables

var map;

var bounceTimer;

var markers = [];

var gmapsTimeout = setTimeout(function() {

    if(!map) {
        alert("Google Maps are not available. Please try again later!!!");
        return;
    }

}, 8000);


function init() {


    map = new google.maps.Map(document.getElementById('gmap'), {
        center: { lat: 40.730610, lng: -73.935242},
        zoom: 10
    });

    clearTimeout(gmapsTimeout);


    // Search box code

    var searchBox = new google.maps.places.SearchBox(document.getElementById('schAdd'));

    var input = document.getElementById('pac-input');

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

    searchBox.setBounds(map.getBounds());

    // When user selects any prediction from the Picklist

    searchBox.addListener('schAdd', function() {

        searchPlaces(this);
    });

    // After selecting the prediction user clicks GO button

    document.getElementById('letsgo').addEventListener('click', nearByPlaces);

}


var locArray = [

    {
            title: 'Central Park',
            location: {lat: 40.785091 ,lng: -73.968285 },
            id: 'ChIJ4zGFAZpYwokRGUGph3Mf37k',
            no: 1
        },
        {
            title: 'Empire State Building',
            location: {lat: 40.748817, lng: -73.985428},
            id: 'ChIJaXQRs6lZwokRY6EFpJnhNNE',
            no: 2
        },
        {
            title: 'Statue of Liberty',
            location: {lat: 40.689247,lng: -74.044502},
            id: 'ChIJPTacEpBQwokRKwIlDXelxkA',
            no: 1
        },
        {
            title: 'Rockefeller Center',
            location: {lat: 40.758438,lng: -73.978912},
            id: 'ChIJ9U1mz_5YwokRosza1aAk0jM',
            no: 2
        },
        {
            title: 'Grand Central Station',
            location: {lat: 40.752998,lng: -73.977056},
            id: 'ChIJhRwB-yFawokRi0AhGH87UTc',
            no: 3
        }

    ];


var Location = function(data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
    this.locId = ko.observable(data.id);
    this.locNo = ko.observable(data.no);

    this.filterList = ko.observable(true);
}


// Knockout ViewModel code which includes wikipedia api

var ViewModel = function() {

    var self = this;

    this.locList = ko.observableArray([]);

    locArray.forEach(function(loc) {
        self.locList.push( new Location(loc) );
    });

    this.currentLocation = ko.observable( this.locList()[0] );

    this.setLocation = function(clickedLoc) {
        self.currentLocation(clickedLoc);

    }

    touristAtt = function() {
        var length = self.locList().length;
        for (var i = 0; i < length; i++) {
            if (self.locList()[i].no === 1) {
                self.locList()[i].filterlist(true);
                buttonMarkers(self.locList()[i]);
            }
        }
    };

    businessPlace = function() {
        var length = self.locList().length;
        for (var i = 0; i < length; i++) {
            if (self.locList()[i].no === 2) {
                self.locList()[i].filterlist(true);
            }
        }
    };

    transPort = function() {
        var length = self.locList().length;
        for (var i = 0; i < length; i++) {
            if (self.locList()[i].no === 3) {
                self.locList()[i].filterlist(true);
            }
        }
    }

    all = function() {
        var length = self.locList().length;
        for (var i = 0; i < length; i++) {
                self.locList()[i].filterlist(true);
        }
    }

    getWiki = function() {

           // Wikipedia Api code
           var wikiTitle = document.getElementById('schAdd').value;

           var wikiurl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + wikiTitle + '&format=json&callback=wikiCallback';

                $.ajax({
                url: wikiurl,
                dataType: 'jsonp',
                }).done(function(response) {
                var wikiInfo = response[1];
                var wikiStore = wikiInfo[0];
                var url = 'http://en.wikipedia.org/wiki/' + wikiStore;
                $('.wiki-links').append('<li><a href="' + url + '">' + wikiStore + '</a></li>');
                }).error(function() {
                    wikiRequestTimeout = setTimeout(function() {
                      alert("Failed to get wikipedia resources!!1");
                 }, 8000);

                });

    };


};


ko.applyBindings(new ViewModel());



    function buttonMarkers(loc) {
            var infoWindow = new google.maps.InfoWindow();

            var position = loc.location;
            var title = loc.title;
            var locId = loc.id;

            var marker = new google.maps.Marker({
                map: map,
                title: title,
                animation: google.maps.Animation.DROP,
                position: position,
                id: locId
            });

                toggleBounce(marker);
                viewInfoWindow(marker, infoWindow);

    }




    // Hard coded locations info window details.


    function viewInfoWindow(marker, infowindow) {
        if(infowindow.marker != marker) {
            infowindow.marker = marker;
            getPlaces(marker, infowindow);
        }
    }

    function toggleBounce(marker) {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }


   // This function will loop through the listings and hide all of them

    function hideMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    // This function fires when the user selects a searchbox picklist item.

    function searchPlaces(searchBox) {
        hideMarkers(markers);
        var places = searchBox.getPlaces();

        //For each place, get icon, name and location
        if(places.length === 0) {
            window.alert('We did not find any places matching that search');
        } else {
            showMarkers(places);
        }
    }


    // This function fire when user selects GO on places search.
    // It will do a nearby search using the entered query string or place.

    function nearByPlaces() {
        var bounds = map.getBounds();
        hideMarkers(markers);

        var placesService = new google.maps.places.PlacesService(map);
        placesService.textSearch({
            query: document.getElementById("schAdd").value,
            bounds: bounds
        }, function(results, status) {
            if(status === google.maps.places.PlacesServiceStatus.OK) {
                showMarkers(results);
            }
        });
    }

    // Function specially for search box entered locations
    // This function create markers for each place found in either places search

    function showMarkers(places) {
        var bounds = new google.maps.LatLngBounds();
        for(var i= 0; i < places.length; i++) {
            var place = places[i];
            var icon = {
                url: place.icon,
                size: new google.maps.Size(40, 40),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(15, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place

            var marker = new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                animation: google.maps.Animation.DROP,
                position: place.geometry.location,
                id: place.place_id
            });

            google.maps.event.addListener(marker, 'mouseover', function() {
                if (this.getAnimation() === null || typeof this.getAnimation() === undefined) {
                    clearTimeout(bounceTimer);

                    var that = this;

                    bounceTimer = setTimeout(function() {
                        that.setAnimation(google.maps.Animation.BOUNCE);
                    },
                    1);
                }
            });

            google.maps.event.addListener(marker, 'mouseout', function() {

                if (this.getAnimation() !== null) {
                    this.setAnimation(null);
                }
                clearTimeout(bounceTimer);
            });


// Single infowindow for place details

    var infoWindow = new google.maps.InfoWindow();

// if a marker is clicked, show place details

    marker.addListener('click', function() {
        if(infoWindow.marker == this) {
            console.log("This Infowindow already is on this marker!");
        } else {
            getPlaces(this, infoWindow);
        }
    });
            markers.push(marker);
            if(place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        }
        map.fitBounds(bounds);
     }

    // Place details search function - which is executed when marker is selected
    // for more details for user

     function getPlaces(marker, infowindow) {
        var service = new google.maps.places.PlacesService(map);
        service.getDetails({
            placeId: marker.id
        }, function(place, status) {
            if(status === google.maps.places.PlacesServiceStatus.OK) {

                // Set marker property on this infowindow

                infowindow.marker = marker;

                var contentString = '<div>' + '<strong>' + place.name + '</strong>' + '<br>' + place.formatted_address +
                                    '<br>' + 'Phone Number: ' + place.international_phone_number + '<br>' + 'Place Rating: ' + place.rating +'/5' +
                                    '<br><br><img src="' + place.photos[0].getUrl({ maxHeight: 100, maxWidth: 200}) + '">' + '<br>' + 'WikiLink:' + '<br><a href="http://en.wikipedia.org/wiki/' + place.name + '">' + place.name +  '</a></div>';

                infowindow.setContent(contentString);
                infowindow.open(map, marker);
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });
            }
        });
     }
