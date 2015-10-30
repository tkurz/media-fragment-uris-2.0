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
            .filter(function(property){return _.contains(transforms, property)})
            .value();

        var shapeUnitIsPercent = properties[shape].indexOf('percent') == 0;

        function shapeProperties() {

            var split = shapeUnitIsPercent ? properties[shape].substring(8).split(',') : properties[shape].split(',');

            switch(shape) {
                case 'rect': return split.length == 4 ? _.object(['x','y','w','h'],split) : _.object(['x','y','w','h','rx','ry'],split);
                case 'circle': return _.object(['x','y','r'],split);
                case 'ellipse': return _.object(['cx','cy','rx','ry'],split);
                case 'polygon': throw new Error("Not yet implemented");
            }
        }

        function transformProperties() {
            var result = [];

            _.each(transform,function(trans){
                if(properties[trans]) {
                    //todo support pixel and percent
                    var split = properties[trans].split(',');

                    var transformProperties;

                    switch(trans) {
                        case 'rotate': transformProperties = split.length == 1 ? _.object(['r'],split) : _.object(['r','cx','cy'],split);break;
                        case 'aTranslate': transformProperties = _.object(['d1','x1','y1','d2','x2','y2'],split);break; //TODO
                        case 'aScale': transformProperties = _.object(['d1','x1','d1','x1','y1'],split);break; //TODO
                    }

                    if(transformProperties) result.push({type:trans,properties:transformProperties});
                }
            });
            console.log(result);
            return result;
        }

        var time = properties.t ? properties.t.split(',') : undefined;

        return {
            timeFragment : time ? {start:parseFloat(time[0]),end:parseFloat(time[1])} : undefined,
            spatialFragment : shape ? {type:shape,unit:shapeUnitIsPercent?'percent':'pixel',properties:shapeProperties(),transform:transformProperties()} : undefined
        }

    },

    draw: function(type,element,fragment) {

        var attributes = { stroke: 'red', 'strokeWidth': 2, 'fill':'none'};

        function drawImage() {

            //get image position
            var _width = element.width(); //to get clean with client and natural width and height
            var _height = element.height();
            var _top = element.offset().top;
            var _left = element.offset().left;

            var box = $('<div>').css({position:'absolute',left:_left,top:_top,width:_width,height:_height}).appendTo(MediaFragments.DOM_CONTAINER);
            var svg = $('<svg height="100%" width="100%">').appendTo(box);
            var s = Snap(svg.get(0));

            var fragmentObject = undefined;

            if(fragment.spatialFragment) {

                //calculate percent
                if(fragment.spatialFragment.unit == 'percent') {
                    //todo do this for all types
                    switch (fragment.spatialFragment.type) {
                        case 'ellipse':
                            fragment.spatialFragment.properties.cx = Math.floor(_width * fragment.spatialFragment.properties.cx / 100);
                            fragment.spatialFragment.properties.cy = Math.floor(_height * fragment.spatialFragment.properties.cy / 100);
                            fragment.spatialFragment.properties.rx = Math.floor(_width * fragment.spatialFragment.properties.rx / 100);
                            fragment.spatialFragment.properties.ry = Math.floor(_height * fragment.spatialFragment.properties.ry / 100);
                            break;
                    }

                }

                switch(fragment.spatialFragment.type) {
                    case 'circle': fragmentObject = s.circle(fragment.spatialFragment.properties.x,fragment.spatialFragment.properties.y,fragment.spatialFragment.properties.r).attr(attributes); break;
                    case 'ellipse': fragmentObject = s.ellipse(fragment.spatialFragment.properties.cx,fragment.spatialFragment.properties.cy,fragment.spatialFragment.properties.rx,fragment.spatialFragment.properties.ry).attr(attributes); break;
                    case 'rect': fragmentObject = s.rect(fragment.spatialFragment.properties.x,fragment.spatialFragment.properties.y,fragment.spatialFragment.properties.w,fragment.spatialFragment.properties.h).attr(attributes); break;
                }

                if(fragmentObject && fragment.spatialFragment.transform.length>0) {

                    var transform = fragment.spatialFragment.transform[0];

                    switch(transform.type) {
                        case 'rotate': fragmentObject.transform(sprintf("r%s",transform.properties.r));break;
                        case 'aTranslate':
                            var onClickAnimate = function(){
                                fragmentObject.transform('');   // reset the animation, may not be needed
                                fragmentObject.animate({ transform: sprintf('t%s,%s',transform.properties.x1,transform.properties.y1) }, parseInt(transform.properties.d1) ) ;
                            };
                            svg.click(onClickAnimate);
                            break;
                    }
                }
            }
        }

        function VideoTimeupdateWrapper(video, interval) {
            var listeners = [];

            this.addListener = function(listener) {
                listeners.push(listener);
            };

            var lastTime;
            element.get(0).addEventListener('timeupdate', function() {
                lastTime = video.currentTime;
            });

            var checker = undefined;

            function setChecker(timecheck) {
                if(lastTime != video.currentTime || timecheck) {
                    if(checker) return;
                    checker = setInterval(function(){
                        if(lastTime != video.currentTime) {
                            for(var i in listeners) {
                                listeners[i](video.currentTime);
                            }
                        }
                    },interval);
                } else {
                    clearInterval(checker);
                    checker = undefined;
                }
            }

            setInterval(function(){
                setChecker();
            },500);

            //add additonal listener to start earlier

            video.addEventListener('play', function() {
                setChecker(true);
            });
        }

        function drawVideo() {
            var _width = element.width(); //to get clean with client and natural width and height
            var _height = element.height();
            var _top = element.offset().top;
            var _left = element.offset().left;

            var box = $('<div>').css({position:'absolute',left:_left,top:_top,width:_width,height:_height,pointerEvents:'none'}).appendTo(MediaFragments.DOM_CONTAINER);
            var svg = $('<svg height="100%" width="100%">').appendTo(box);
            var s = Snap(svg.get(0));

            var videoTimeUpdateWrapper = new VideoTimeupdateWrapper(element.get(0),33);

            var duration = fragment.timeFragment.end - fragment.timeFragment.start;

            var fragmentObject;

            switch(fragment.spatialFragment.type) {
                case 'circle': fragmentObject = s.circle(fragment.spatialFragment.properties.x,fragment.spatialFragment.properties.y,fragment.spatialFragment.properties.r).attr(attributes); break;
                case 'ellipse': fragmentObject = s.ellipse(fragment.spatialFragment.properties.cx,fragment.spatialFragment.properties.cy,fragment.spatialFragment.properties.rx,fragment.spatialFragment.properties.ry).attr(attributes); break;
                case 'rect': fragmentObject = s.rect(fragment.spatialFragment.properties.x,fragment.spatialFragment.properties.y,fragment.spatialFragment.properties.w,fragment.spatialFragment.properties.h).attr(attributes); break;
            }

            fragmentObject.attr('display','none');

            //parse animation timeslots and add listeners TODO

            videoTimeUpdateWrapper.addListener(function(time){
                if(fragment.timeFragment.start < time && time < fragment.timeFragment.end) {
                    var startTime = fragment.timeFragment.start + 0.45*duration;
                    var endTime = fragment.timeFragment.start+0.45*duration+0.1*duration;
                    if(time < startTime) {
                        fragmentObject.transform('t0,0s1');
                    }
                    if( startTime < time && time < endTime) {
                        var dur = endTime-startTime;
                        var percent = (time-startTime)/dur;
                        fragmentObject.transform(sprintf("t%s,%ss%s",-50*percent,50*percent,1-(0.3*percent)));
                    }

                    fragmentObject.attr('display','');
                } else {
                    fragmentObject.attr('display','none');
                    fragmentObject.transform('');
                }
            })
        }

        type == 'img' ? drawImage() : drawVideo();
    }

};

$(window).load(function(){

    MediaFragments.DOM_CONTAINER = $('<div>').css({position:'absolute',top:0,left:0,zIndex:10000}).appendTo('body');

    $.each($('img'), function(i, img) {
        var fragment = MediaFragments.parse(img.src);
        MediaFragments.draw('img',$(img),fragment);
    });

    $.each($('video'), function(i, video) {
        var fragment = MediaFragments.parse(video.currentSrc);
        MediaFragments.draw('video',$(video),fragment);
    });

});