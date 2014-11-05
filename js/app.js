'use strict';

//Create an angular module
var parkFinder = angular.module('parkFinder',[]);

parkFinder.controller('ParkFinderCtrl', ['$scope', '$http', '$q', function ($scope, $http, $q) {

    //Initialize the map
    var map = L.map('map', {
        center: [35.5951125,-82.5511088], 
        zoom : 12,
        maxZoom : 22,
    });

    //L.control.layers(baseMaps).addTo(map);
    // L.tileLayer("http://gis.ashevillenc.gov/tiles/basemapbw/{z}/{x}/{y}.png",{
    //     attribution:'&copy; The City of Asheville',
    //     maxZoom : 22,
    //     tms : true
    // }).addTo(map);
    
     L.tileLayer("http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png",{
        attribution:'&copy; <p>Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png"></p>',
        maxZoom : 22
    }).addTo(map);

    //Object to hold the parks geojson
    var parksDataGeoJson = {};

    //Global variable to hold the park's location markers
    var parksMarkers;

    //Leaflet Awesome markers style (uses font awesome icons)
    var parkMarker = L.AwesomeMarkers.icon({
        icon: 'tree',
        prefix: 'fa',
        iconColor :'white',
        markerColor: 'green',
      });

    //URL to the ArcGIS feature service for the parks data
    var url = "http://services.arcgis.com/aJ16ENn1AaqdFlqx/arcgis/rest/services/ParkAssetPoints1/FeatureServer/0/query?where=parkname=parkname&outFields=*&f=json";

    //
    $scope.parkOptions = parkOptions;

    $scope.typeOfParksShowing = '';


    //Makes HTTP request to get data from a url
    var getData = function(url){
        var q = $q.defer();
        var url = url;
        $http({method : 'GET', url : url, cache : false})
            .success(function(data, status, headers, config){
                q.resolve(data);
            })
            .error(function(error){
              //Do nothing   
            });
        return q.promise
    }

    //Creates GeoJson from an ArcGIS Feature Service
    //The geometry coordinates property is set using POINT_X and POINT_Y from the feature's attributes 
    var createGeoJsonFromArcGisFeatureService = function(featureService){
        var geoJson = {
            'type' : 'FeatureCollection',
            'features' : []
        };

        for (var i = 0; i < featureService.features.length; i++) {
            var temp = {
                'type':'Feature',
                'geometry' : {
                    'type': 'Point', 
                    'coordinates': [featureService.features[i].attributes.POINT_X, featureService.features[i].attributes.POINT_Y]
                },
                'properties': featureService.features[i].attributes
            };
            geoJson.features.push(temp);
        };
        return geoJson;
    };

    var createGeoJsonMarkers = function(data){
        return L.geoJson(data, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: parkMarker}).addTo(map);    
            },
            onEachFeature: function (feature, layer) {
                layer.on('click', function(){

                    $scope.getParkDetails(feature.properties);
                    $scope.$apply();
                    
                })
            }
        });
    }; 

    
    $scope.onChangeFilterParks = function(parkOption){
        var filteredParksDataGeoJson = {
            'type' : "FeatureCollection",
            'features' : []
        };
        if(parkOption.value !== 'all'){
           for (var i = 0; i < parksDataGeoJson.features.length; i++) {
                if(parksDataGeoJson.features[i].properties[parkOption.value] === 'Yes'){
                    filteredParksDataGeoJson.features.push(parksDataGeoJson.features[i]);
                }
            }; 
            $scope.typeOfParksShowing = "Showing parks with " + parkOption.label + ".";
        }else{
            $scope.typeOfParksShowing = "";
            
            filteredParksDataGeoJson.features = parksDataGeoJson.features;
        }
        $('#findAParkModal').modal('hide')
        map.removeLayer(parksMarkers);
        parksMarkers = createGeoJsonMarkers(filteredParksDataGeoJson);
        parksMarkers.addTo(map);
    };

    $scope.getParkDetails = function(parkProperties){
        console.log(parkProperties);
        $scope.parkName = parkProperties.parkname;
        $scope.parkAddress = parkProperties.Address
        $scope.googleAddress = "http://maps.google.com/maps?daddr="+parkProperties.Address+"+Asheville,+NC";
        var parkAmenities = [];
        for (var prop in parkProperties) {
            if(parkProperties[prop] === 'Yes'){
                for (var i = 0; i < parkOptions.length; i++) {
                    if(prop == parkOptions[i].value){
                        parkAmenities.push(parkOptions[i]);
                    }
                };
            }
        };
        $scope.parkAmenitiesColumn1 = parkAmenities.splice(0, Math.floor(parkAmenities.length/2));
        $scope.parkAmenitiesColumn2 = parkAmenities.splice(Math.floor(parkAmenities.length/2), parkAmenities.length);
        $('#parkDetailsModal').modal();
    }
    $scope.onClickOpenFindAParkModal = function(){
        $('#findAParkModal').modal();
    }

    //Starts everything 
    getData(url)
        .then(function(data){
            console.log(data);
            var parksData = data;
            parksDataGeoJson = createGeoJsonFromArcGisFeatureService(data);
            parksMarkers = createGeoJsonMarkers(parksDataGeoJson);
            parksMarkers.addTo(map);
            
        });

}]);
