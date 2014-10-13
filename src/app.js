var inherits = require('inherits');
var Component = require('../vendor/component');
var dom = require('../vendor/dom');
var Player = require('./player');
var Route = require('./route');

var App = function(config) {

    this.config = config;
    mapboxgl.accessToken = config.MAPBOX_API_TOKEN;

    this._player = null;

    this._geocoder = new google.maps.Geocoder();

    this._directionsService = new google.maps.DirectionsService()

    this._endPoints = window.localStorage.getItem('route');
    if (this._endPoints) {
        console.log(this._endPoints)
        this._endPoints = JSON.parse(this._endPoints);
    } else {
        this._endPoints = [];
    }

    Component.call(this);
    this.render();

    this.on({
        'load:start': this.showPreloader,
        'load:end': this.hidePreloader,
        'coords:ready': this.onCoordsRetrieved
    });

    this.init();
};
inherits(App, Component);

App.prototype.createDom = function() {
    this.element = dom.create('div', {
        'class': 'app',
        'html': '<div class="route-map" id="route-map"></div>'
    });
};

App.prototype.init = function() {
    this.fire('load:start');

    this.createPlayer();
    if (this._endPoints.length === 0) {
        this.geocodeEndPoints();
    } else {
        this.onCoordsRetrieved();
    }
};

App.prototype.geocodeEndPoints = function() {
    this._geocoder.geocode({
        'address': this.config.START_ADDR
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            this._endPoints.push([
                results[0].geometry.location.lat(),
                results[0].geometry.location.lng()
            ]);
            this._geocoder.geocode({
                address: this.config.FINISH_ADDR
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    this._endPoints.push([
                        results[0].geometry.location.lat(),
                        results[0].geometry.location.lng()
                    ]);
                    window.localStorage.setItem('route',
                        JSON.stringify(this._endPoints));

                    this.fire('coords:ready');
                }
            }.bind(this))
        }
    }.bind(this));
};

App.prototype.createPlayer = function() {
    this._player = new Player(this.config.player, this.element);
};

App.prototype.onCoordsRetrieved = function() {
    this.fire('load:end');
    console.log(this._endPoints);
    this.createRouteMap();
};

App.prototype.createRouteMap = function() {
    var bounds = new mapboxgl.LatLngBounds(this._endPoints[0], this._endPoints[1]);
    console.log(bounds);
    mapboxgl.util.getJSON('https://www.mapbox.com/mapbox-gl-styles/styles/outdoors-v4.json', function(err, style) {
        style.layers.push({
            "id": "route",
            "source": "route",
            "render": {
                "$type": "LineString",
                "line-join": "round",
                "line-cap": "round"
            },
            "style": {
                "line-color": "#888",
                "line-width": 8
            },
            "type": "line"
        });
        this._routeMap = new mapboxgl.Map({
            container: dom.getElement(this.element, '.route-map'),
            style: style,
            zoom: 16,
            center: bounds.getCenter()
        });
        this._bounds = bounds;
        //this._routeMap.fitBounds(bounds);
        // this._directionsRenderer =
        //     new google.maps.DirectionsRenderer({
        //         map: this._routeMap,
        //     });

        this.getRoute();
    }.bind(this));
};

App.prototype.getRoute = function getDirection() {
    this.fire('load:start');
    this._directionsService.route({
        origin: new google.maps.LatLng(
            this._endPoints[0][0], this._endPoints[0][1]),
        destination: new google.maps.LatLng(
            this._endPoints[1][0], this._endPoints[1][1]),
        travelMode: google.maps.DirectionsTravelMode.WALKING
    }, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            this._route = response;
            this.onRouteCalculated();
        } else {
            console.log(response)
        }
        this.fire('load:end');
    }.bind(this));
}

App.prototype.onRouteCalculated = function() {
    this._routeMap.fitBounds(this._bounds);
    this._route = new Route(this._route.routes[0].overview_path).densify(5);
    var route = new mapboxgl.GeoJSONSource({
        data: this._route.toGeoJSON()
    });
    this._routeMap.addSource('route', route);

    this.retrieveImagery(this._route._points);
};

App.prototype.retrieveImagery = function(points) {
    console.log(points, this._route)
    this.fire('load:start');
    var imgs = [],
        bearing;

    for (var i = 1; i < points.length; i++) {
        bearing = this.computeHeading(points[i - 1], points[i]);
        imgs.push([
            "http://maps.googleapis.com/maps/api/streetview?size=600x300&location=" +
            points[i - 1][0] + "," +
            points[i - 1][1] + "&heading=" + bearing +
            "&pitch=-1.62&sensor=false&key=" + this.config.GOOGLE_MAPS_API_KEY,
            points[i - 1]
        ]);
    }

    imgs.push([
        "http://maps.googleapis.com/maps/api/streetview?size=600x300&location=" +
        points[i - 1][0] + "," +
        points[i - 1][1] + "&heading=" + bearing +
        "&pitch=-1.62&sensor=false&key=" + GOOGLE_MAPS_API_KEY, points[i - 1]
    ]);
    return imgs
}

App.prototype.showPreloader = function() {
    var opts = {
        lines: 13, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '50%', // Top position relative to parent
        left: '50%' // Left position relative to parent
    };
    if (!this._spinner) {
        this._spinner = new Spinner(opts).spin(this.element);
    } else {
        this._spinner.spin(this.element);
    }

    this._spinner._isStopped = false;
};

App.prototype.hidePreloader = function() {
    if (this._spinner) {
        this._spinner.stop();
        this._spinner._isStopped = true;
    }
};

module.exports = App;
