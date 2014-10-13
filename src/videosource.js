var Video = function(key, width, height, pitch, bearing) {
    this.options = {
        key: key,
        width: width || 600,
        height: height || 600,
        bearing: this.getBearing(),
        pitch: pitch || 1.92
    }
    Component.call(this);
    this.render(container);
};
inherits(Video, Component);

Video.prototype.createDom = function() {
    this.element = dom.create('div', {
        'class': 'video'
        'html': '<div class="images-pile"></div>' +
            '<video class="vide-player"></video>'
    });
};

VideoSource.prototype.load = function(points) {
    var imgs = this.getUrls(points),
        i = 0;


};

Video.prototype.loadImage = function(url, callback) {
    var img = new Image();
    dom.on({
        'load': callback,
        'error': function() {
            callback({
                error: true
            });
        }
    });
    img.src = url;
};

VideoSource.prototype.computeHeading = function(pt1, pt2) {
    return google.maps.geometry.spherical.computeHeading(
        new google.maps.LatLng(pt1[0], pt1[1]),
        new google.maps.LatLng(pt2[0], pt2[1]))
};

VideoSource.prototype.getUrls = function(points) {
    var imgs = [],
        bearing;

    for (var i = 1; i < points.length; i++) {
        bearing = this.computeHeading(points[i - 1], points[i]);
        imgs.push([
            "http://maps.googleapis.com/maps/api/streetview?size=" + width +
            "x" + height + "&location=" +
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
    return imgs;
};
