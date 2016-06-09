'use strict';

//Create an angular module
var parkFinder = angular.module('parkFinder',[]);

parkFinder.controller('ParkFinderCtrl', ['$scope', '$http', '$q', function ($scope, $http, $q) {

    //Initialize the map
    var map = L.map('map', {
        center: [35.5951125,-82.5511088], 
        zoom : 14,
        maxZoom : 22,
    });

    //L.control.layers(baseMaps).addTo(map);
    // L.tileLayer("http://gis.ashevillenc.gov/tiles/basemapbw/{z}/{x}/{y}.png",{
    //     attribution:'&copy; The City of Asheville',
    //     maxZoom : 22,
    //     tms : true
    // }).addTo(map);
    
     L.tileLayer("https://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png",{
        attribution:'&copy;Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="https://developer.mapquest.com/content/osm/mq_logo.png">',
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
    var url = "https://services.arcgis.com/aJ16ENn1AaqdFlqx/arcgis/rest/services/ParkAssetPoints1/FeatureServer/0/query?where=parkname=parkname&outFields=*&f=json";

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
                return L.marker(latlng, {icon: parkMarker}).bindLabel(feature.properties.parkname).addTo(map);    
            },
            onEachFeature: function (feature, layer) {
                layer.on('click', function(){

                    $scope.getParkDetails(feature.properties);
                    $scope.$apply();
                    
                })
            }
        });
    }; 

    var buildParkNameArray = function(geoJson){
        var tempArray = [{value : 'all', label : 'Choose an option'}];
        for (var i = 0; i < geoJson.features.length; i++) {
            var tempObj = {'value' :  geoJson.features[i].properties.parkname, 'label' :  geoJson.features[i].properties.parkname};
            tempArray.push(tempObj);  
        };
        return tempArray;
    }

    
    $scope.onChangeFilterParks = function(parkOption){
        var filteredParksDataGeoJson = {
            'type' : "FeatureCollection",
            'features' : []
        };
        if(parkOption.value !== 'all'){
           for (var i = 0; i < $scope.parksDataGeoJson.features.length; i++) {
                if($scope.parksDataGeoJson.features[i].properties[parkOption.value] === 'Yes'){
                    filteredParksDataGeoJson.features.push($scope.parksDataGeoJson.features[i]);
                }
            }; 
            $scope.typeOfParksShowing = "Showing parks with " + parkOption.label + ".";
        }else{
            $scope.typeOfParksShowing = "";
            
            filteredParksDataGeoJson.features = $scope.parksDataGeoJson.features;
        }
        $('#findAParkModal').modal('hide')
        map.removeLayer(parksMarkers);
        parksMarkers = createGeoJsonMarkers(filteredParksDataGeoJson);
        map.fitBounds(parksMarkers);
        if(filteredParksDataGeoJson.features.length === 1){
            map.setZoom(16);
        }
        parksMarkers.addTo(map);
    };

    $scope.onChangeFilterParksByName = function(parkName){
        var filteredParksDataGeoJson = {
            'type' : "FeatureCollection",
            'features' : []
        };
        if(parkName.value !== 'all'){
           for (var i = 0; i < $scope.parksDataGeoJson.features.length; i++) {
                if($scope.parksDataGeoJson.features[i].properties.parkname === parkName.value){
                    filteredParksDataGeoJson.features.push($scope.parksDataGeoJson.features[i]);
                }
            }; 
            $scope.typeOfParksShowing = "Showing " + parkName.label + ".";
        }else{
            $scope.typeOfParksShowing = "";
            
            filteredParksDataGeoJson.features = $scope.parksDataGeoJson.features;
        }
        $('#findAParkModal').modal('hide')
        map.removeLayer(parksMarkers);
        parksMarkers = createGeoJsonMarkers(filteredParksDataGeoJson);
        map.fitBounds(parksMarkers);
        map.setZoom(16);
        parksMarkers.addTo(map);
    };

    $scope.getParkDetails = function(parkProperties){
        $scope.parkName = parkProperties.parkname;
        $scope.parkAddress = parkProperties.Address;
        $scope.telephone = "Telephone Number";
        $scope.googleAddress = "https://maps.google.com/maps?daddr="+parkProperties.Address+"+Asheville,+NC";
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
            var parksData = data;
            $scope.parksDataGeoJson = createGeoJsonFromArcGisFeatureService(data);
            $scope.parkNames = buildParkNameArray($scope.parksDataGeoJson);
            parksMarkers = createGeoJsonMarkers($scope.parksDataGeoJson);
            parksMarkers.addTo(map);
            
        });

}]);
