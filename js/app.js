// Global Variables

var map;

var bounceTimer;

var markers = [];

function errorHandling() {

        alert("Google Maps are not available. Please try again later!!!");
    }


function init() {


    map = new google.maps.Map(document.getElementById('gmap'), {
        center: { lat: 40.730610, lng: -73.935242},
        zoom: 11
    });

    var infoWindow = new google.maps.InfoWindow();

    var length = locArray.length;

    for (var i = 0; i < length; i++) {
        var position = locArray[i].location;
        var title = locArray[i].title;
        var locId = locArray[i].id;

            var marker = new google.maps.Marker({
                map: map,
                title: title,
                animation: google.maps.Animation.DROP,
                position: position,
                id: locId
            });

            google.maps.event.addListener(marker, "click", function() {
                //Event listeners for animating the marker
                toggleBounce(this);
                viewInfoWindow(this, infoWindow);
            });


        markers.push(marker);

        //Event listeners for animating the marker

        function toggleBounce(marker) {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                        marker.setAnimation(null);
                }, 1800)
            }
        }
    }

}

var locArray = [

        {
            title: 'Central Park',
            location: {lat: 40.785091 ,lng: -73.968285 },
            id: 'ChIJ4zGFAZpYwokRGUGph3Mf37k',
            category: 'Tourist Attraction'
        },
        {
            title: 'Statue of Liberty',
            location: {lat: 40.689247,lng: -74.044502},
            id: 'ChIJPTacEpBQwokRKwIlDXelxkA',
            category: 'Tourist Attraction'
        },
        {
            title: 'Empire State Building',
            location: {lat: 40.748817, lng: -73.985428},
            id: 'ChIJaXQRs6lZwokRY6EFpJnhNNE',
            category: 'Business Places'
        },
        {
            title: 'Rockefeller Center',
            location: {lat: 40.758438,lng: -73.978912},
            id: 'ChIJ9U1mz_5YwokRosza1aAk0jM',
            category: 'Business Places'
        },
        {
            title: 'Grand Central Station',
            location: {lat: 40.752998,lng: -73.977056},
            id: 'ChIJhRwB-yFawokRi0AhGH87UTc',
            category: 'Transportation'
        }

    ];


var Location = function(data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
    this.locId = ko.observable(data.id);
    this.locNo = ko.observable(data.no);
}


// Knockout ViewModel code which includes wikipedia api

var ViewModel = function() {

    var self = this;

    query = ko.observable();

    locList = ko.observableArray(locArray);

    selectedOption = ko.observable('');

    // Filter Functionality

    locList.title = ko.observable();

    filterList = ko.observableArray([

    {
        category: 'Tourist Attraction'
    },
    {
        category: 'Business Places'
    },
    {
        category: 'Transportation'
    }

        ]);



    getCurrentLocations = function() {
        var selectedVal = this.selectedOption();

       if (!selectedVal)
            return this.locList;

       if (selectedVal) {
            return ko.utils.arrayFilter(this.filterList(), function(place) {
                var category = place.category;
                var match = this.locList().includes(category);
                return match;
           });
        }

            return this.locList().filter(function(f) {
                return f.id == selectedVal.id;
            });

    }

        this.details = ko.observable();

        title = ko.observable('');

        getMarkInfo = function() {

           // Wikipedia Api code
           var wikiTitle = this.title;

                   title = this.title;

                   var wikiurl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + wikiTitle + '&format=json&callback=wikiCallback';

              $.ajax({
                url: wikiurl,
                dataType: 'jsonp',
                }).done(function(response) {
                    var wikiInfo = response[1];
                    var wikiStore = wikiInfo[0];
                    var url = 'http://en.wikipedia.org/wiki/' + wikiStore;
                    var vm = ko.dataFor(document.body);
                    vm.details('<li><a href="' + url + '">' + wikiStore + '</a></li>');
                    }).fail(function() {
                             alert("Failed to get wikipedia resources!!1");
                   });

                    if (title === locArray[0].title) {
                        showMarkers(0);
                    }
                    if (title === locArray[1].title) {
                        showMarkers(1);
                    }
                    if (title === locArray[2].title) {
                        showMarkers(2);
                    }
                    if (title === locArray[3].title) {
                        showMarkers(3);
                    }
                    if (title === locArray[4].title) {
                        showMarkers(4);
                    }

    };


};


ko.applyBindings(new ViewModel());



    // Hard coded locations info window details.


    function viewInfoWindow(marker, infowindow) {
        if(infowindow.marker != marker) {
            infowindow.marker = marker;
            getPlaces(marker, infowindow);
        }
    }



   // This function will loop through the listings and hide all of them

    function hideMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }


    // This function create markers for each place clicked from list.

    function showMarkers(i) {
            if (markers[i].getAnimation() !== null) {
                markers[i].setAnimation(null);
            } else {
                markers[i].setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                 markers[i].setAnimation(null);
                }, 1800)
            }
            var infoWindow = new google.maps.InfoWindow();

                // if a marker is clicked, show place details
            getPlaces(markers[i], infoWindow);
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
                    marker.setAnimation(null);
                });
            }
            else {
                window.alert('We did not find any places matching that search');
            }
        });
     }
