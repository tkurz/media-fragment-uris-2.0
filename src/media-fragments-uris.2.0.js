'use strict';
var MediaFragments = {

    DOM_CONTAINER: undefined,

    parse: function(uri_string) {

        var shapes = ['rect','circle','ellipse','polygon'];
        var transforms = ['translate','scale','rotate','skew','aTranslate','aScale','aRotate','aSkew'];//TODO

        var hash = uri_string.substring(uri_string.indexOf('#') + 1);

        var properties = _.chain(hash.split("&"))
            .map(function(nvp){return nvp.split("=")})
            .object()
            .value();

        var shape = _.chain(properties)
            .keys()
            .find(function(property){return _.contains(shapes, property)})
            .value();

        var transform = _.chain(properties)
            .keys()
            .find(function(property){return _.contains(transform, property)})
            .value();

        var shapeUnitIsPercent = properties[shape].indexOf('percent') == 0;

        function shapeProperties() {

            var split = shapeUnitIsPercent ? properties[shape].substring(8).split(',') : properties[shape].split(',');

            switch(shape) {
                case 'rect': return split.length = 4 ? _.object(['x','y','w','h'],split) : _.object(['x','y','w','h','rx','ry'],split);
                case 'circle': return _.object(['x','y','r'],split);
                case 'ellipse': return _.object(['cx','cy','rx','ry'],split);
                case 'polygon': throw new Error("Not yet implemented");
            }
        }

        var time = properties.t ? properties.t.split(',') : undefined;

        return {
            timeFragment : time ? {start:time[0],end:time[1]} : undefined,
            spatialFragment : shape ? {type:shape,unit:shapeUnitIsPercent?'percent':'pixel',properties:shapeProperties()} : undefined
        }

    },

    draw: function(type,element,fragment) {

        //get image position
        var _width = element.width(); //to get clean with client and natural width and height
        var _height = element.height();
        var _top = element.offset().top;
        var _left = element.offset().left;


        var box = $('<div>').css({position:'absolute',left:_left,top:_top,width:_width,height:_height}).appendTo(MediaFragments.DOM_CONTAINER);
        var svg = $('<svg height="100%" width="100%">').appendTo(box);
        var s = Snap(svg.get(0));

        var attributes = { stroke: 'red', 'strokeWidth': 2, 'fill':'none'};

        if(fragment.spatialFragment) {
            switch(fragment.spatialFragment.type) {
                case 'circle': s.circle(fragment.spatialFragment.properties.x,fragment.spatialFragment.properties.y,fragment.spatialFragment.properties.r).attr(attributes); break;
                case 'ellipse': s.ellipse(fragment.spatialFragment.properties.cx,fragment.spatialFragment.properties.cy,fragment.spatialFragment.properties.rx,fragment.spatialFragment.properties.ry).attr(attributes); break;
            }
        }
    }

};

$(window).load(function(){

    MediaFragments.DOM_CONTAINER = $('<div>').css({position:'absolute',top:0,left:0,zIndex:10000}).appendTo('body');

    $.each($('img'), function(i, img) {
        var fragment = MediaFragments.parse(img.src);
        MediaFragments.draw('img',$(img),fragment);
    });

});