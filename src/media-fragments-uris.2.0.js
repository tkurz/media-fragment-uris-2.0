'use strict';
var MediaFragments = (function(window) {

    function MediaFragmentURI() {

    }

    function createNameValuePairs(s) {
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = window.location.search.substring(1);

        var nvp = {};
        while (match = search.exec(query))
            nvp[decode(match[1])] = decode(match[2]);
        return nvp;
    }

    function parseFragmentURI(uri_string) {

        var url = new URI(uri_string);

        var nvp;

        if(url.fragment()) {
            nvp = createNameValuePairs(url.fragment)
        } else if(url.query()) {
            nvp = createNameValuePairs(url.query())
        } else

        if(nvp) {

        }

        return {

        }
    }

    return {
        parse: parseFragmentURI
    }

});