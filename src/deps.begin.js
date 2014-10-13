(function(sources) {
    if (window) {
        var html = '',
            resources;

        // localhost or xip.io dynamic DNS
        if (/localhost|xip\.io/g.test(window.location.host)) {
            sources.push('config.dev.js');
            resources = '/';
        } else {
            sources.push('config.stage.js');
            resources = '';
        }

        for (var i = 0, len = sources.length; i < len; i++) {
            html += '<script type="text/javascript" src="' +
                (i < len - 1 ? resources : '') + sources[i] + '"></script>';
        }
        document.write(html);
    } else {
        return sources;
    }
})([
