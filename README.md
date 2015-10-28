Media Fragments URIs 2.0
========================
This are my thoughts an some basic implementations of how media fragment URIs could be 
extended in the future. The extensions are inspired by discussions at the WWW conference
2015, preparation work from Tom Steiner and Olivier Aubert.

Why
---
TODO but: it is necessary

Additional shapes
-----------------
Inspired by SVG Basic Shapes I recommend to allow the following shapes in addition to *xywh*:

* `rect=x,y,w,h(,rx,ry)?`
* `circle=cx,cy,r`
* `ellipse=cx,cy,rx,ry`
* `polygon=x1,y1(,x2,y2)*`

```
http://example.org/image.png#circle=100,100,50
```
Like for *xywh* also pixel and percent prefixes are allowed:

```
http://example.org/image.png#ellipse=percent:50,50,10,20
```
IMHO there is no necessity for 'open shapes' so I skipped *line* and *polyline*. I would 
favor this extensions to a single *shape* (as proposed by Olivier A.) extension because 
it is simpler and such will most probably cause less confusion. The existing shape `xywh=x,y,w,h`
can be substituted to `rect=x,y,w,h`.

Transformation
--------------
Like the basic shapes I got inspired by SVG here. To keep it simple we allow only the
following transformation:

* `translate=tx(,ty)?`
* `scale=sx(,sy)?`
* `rotate=a,(,cx,cy)?`
* `skew=ax(,ay)?`

Also for transformation pixel and percent prefixes are supported:

```
http://example.org/image.png#rect=100,100,50,50&rotate=45
```
Transformation are only evaluated if one and just one shape exists.

Animate Transformation
----------------------
Some kind of a mixture from Toms S. idea and SVG. To keep urls shorter we just use the prefix a + the transformation name:

* `aTranslate=d1,tx1(,ty1)(;d2,tx2(,ty2))*`
* `aScale=d1,sx1(,sy1)?(;d2,sx2(,sy2)?)*`
* `aRotate=d1,a1,(,cx1,cy1)?(;d2,a2,(,cx2,cy2)?)*`
* `aSkew=d,ax1(,ay1)(;d,ax2(,ay2))*`

```
http://example.org/video.mp4#circle=100,100,50&aScale=0.9,50;0.1,0&t=10,20
```
*d* is defined as duration as may be defined in percent (for videos) or milliseconds (for images). That allows
to define animations also for images. The percentage refers to a time fragment od a video or (if absent) the whole video.
