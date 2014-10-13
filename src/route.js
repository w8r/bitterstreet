var Route = function(points) {
    this._points = points.map(function(ll) {
        return [ll.lat(), ll.lng()];
    });
};

Route.interpolate = function(start, end, ratio) {
    start = new google.maps.LatLng(start[0], start[1]);
    end = new google.maps.LatLng(end[0], end[1]);
    var res = google.maps.geometry.spherical.interpolate(
        start,
        end,
        ratio);
    return [res.lat(), res.lng()];
};

Route.prototype.densify = function(factor) {
    var res = [],
        pt;
    for (var i = 1, len = this._points.length; i < len; i++) {
        var npoints = [];
        for (var j = 0; j < factor; j++) {
            res.push(Route.interpolate(
                this._points[i - 1],
                this._points[i],
                j / factor));
        }
    }
    this._points = res;
    return this;
};

Route.prototype.toGeoJSON = function() {
    return {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "LineString",
            "coordinates": this._points.map(function(ll) {
                return ll.reverse();
            })
        }
    };
};

module.exports = Route;
