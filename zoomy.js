/*
* Zoomy 1.3 - jQuery plugin
* http://redeyeops.com/plugins/zoomy
*
* Copyright (c) 2010 Jacob Lowe (http://redeyeoperations.com)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* Built for jQuery library
* http://jquery.com
*
* Addition fixes and modifications done by Larry Battle ( blarry@bateru.com )
* Code has been refactored and the logic has been corrected.
*
*/
(function ($) {
        
// global zoomys state, Indexed, 0 = no zoom, 1 = zoom;    
    var ZoomyS = {
	count : []
	};


    $.fn.zoomy = function (event, options) {

	//defaults && option list
	    var defaults = {
		    zoomSize: 200,
		    round: true,
		    glare: true,
		    clickable: false,
		    attr: 'href',
		    zoomInit: null,  //callback for when zoom initializes
		    zoomStart: null, // callback for when zoom starts
		    zoomStop: null // callback for when the zoom ends
	    },
		    defaultEvent = 'click',
		    
		    // Start Zoom

		    startZoom = function (ele, zoom, e) {
			    var ratio = function (x, y) {
				    var z = x / y;
				    return z;
				},
				    id = zoom.attr('rel'),
				    l = ele.offset(),
				    zoomImgX = ZoomyS[id].zoom.x,
				    zoomImgY = ZoomyS[id].zoom.y,
				    tnImgX = ZoomyS[id].css.width,
				    tnImgY = ZoomyS[id].css.height,
				    zoomSize = options.zoomSize,
				    halfSize = zoomSize / 2,
				    ratioX = ratio(tnImgX, zoomImgX),
				    ratioY = ratio(tnImgY, zoomImgY),
				    stop = Math.round(halfSize - (halfSize * ratioX)),
				    stopPos = function (x) {
					    var p = (x - zoomSize) + stop;
					    return p;
				    },
				    rightStop = stopPos(tnImgX),
				    bottomStop = stopPos(tnImgY),
				    zoomY = zoomImgY - zoomSize,
				    zoomX = zoomImgX - zoomSize,
				    mousePos = function (x, y) {
					    var p = x - y - halfSize;	
					    return p;
				    },
				    zoomPos = function (x, y, z) {
					    var p = Math.round((x - y) / z) - halfSize;
					    return p;
				    },
				    cdCreate = function (a, b, c, d) {
					    var bgPos = '-' + a + 'px ' + '-' + b + 'px',
						    o = {
							    backgroundPosition: bgPos,
							    left: c,
							    top: d
						    };
					    return o;
				    },
				    posX = mousePos(e.pageX, l.left),
				    posY = mousePos(e.pageY, l.top),
				    leftX = zoomPos(e.pageX, l.left, ratioX),
				    topY = zoomPos(e.pageY, l.top, ratioY),
				    
				    // Collision Detection Possiblities
				    
				    arrPosb = {
					
					// In the Center
					
					    0 : [leftX, topY, posX, posY],
					    
					// On Left Side
					
					    1 : [0, topY, -stop, posY],
					    
					// On the Top Left Corner
					
					    2 : [0, 0, -stop, -stop],
					    
					//On the Bottom Left Corner
					
					    3 : [0, zoomY, -stop, bottomStop],
					    
					// On the Top
					
					    4 : [leftX, 0, posX, -stop],
					    
					//On the Top Right Corner
					
					    5 : [zoomX, 0, rightStop, -stop],
					    
					//On the Right Side
					    
					    6 : [zoomX, topY, rightStop, posY],
					    
					
					//On the Bottom Right Corner
					
					    7 : [zoomX, zoomY, rightStop, bottomStop],
					    
					//On the Bottom    
					
    					    8 : [leftX, zoomY, posX, bottomStop]
				    },
				    
				    // Test for collisions
				    
				    a = -stop <= posX,
				    e2 = -stop > posX,
				    b = -stop <= posY,
				    f = -stop > posY,
				    d = bottomStop > posY,
				    g = bottomStop <= posY,
				    c = rightStop > posX,
				    j = rightStop <= posX,
				    
				    
				    // Results
				    
				    cssArrIndex = (a && b && c && d) ? 0 : (e2) ? (b && d) ? 1 : (f) ? 2 : (g) ? 3 : null : (f) ? (c) ? 4 : 5 : (j) ? (d) ? 6 : 7 : (g) ? 8 : null;
				    
				    //Create CSS object to move Zoomy
				    
				    ZoomyS[id].collision = arrPosb;
				    
				    var move = cdCreate(arrPosb[cssArrIndex][0], arrPosb[cssArrIndex][1], arrPosb[cssArrIndex][2], arrPosb[cssArrIndex][3], arrPosb[cssArrIndex][4], arrPosb[cssArrIndex][5]);
				    
				    
				    //Uncomment to see Index number for collision type
				    //console.log(cssArrIndex)
				    
			// And Actual Call
				    
			    zoom.css(move || {});

		    },
		    
		    toggleClasses = function (ele) {
			    var i = ele.find('.zoomy').attr('rel');
			    if (ZoomyS[i].state === 0 || ZoomyS[i].state === null ) {
				    ele.removeClass('inactive');
			    } else {
				    ele.addClass('inactive');
			    }
		    },
    
		    zoomEnter = function (ele, zoom) {
			    var i = zoom.attr('rel');
			    ZoomyS[i].state = 1;
			    zoom.css('visibility', 'visible');
			    toggleClasses(ele);
		    },
		    
		    zoomLeave = function (ele, zoom, x) {
			    var i = zoom.attr('rel');
			    if (x !== null) {
				    ZoomyS[i].state = null;
			    } else {
				    ZoomyS[i].state = 0;
			    }
			    zoom.css('visibility', 'hidden');
			    toggleClasses(ele);
		    },
		
		    setGlare = function (zoom) {
			    zoom.children('span').css({
				    height: options.zoomSize / 2,
				    width: options.zoomSize - 10
			    }).css(getBorderRadiusCSSObj(0));
		    },
	    
		    // Load Zoom Image
		    
		    loadImage = function (ele, image, zoom) {
			    var y = ele.children('img').height(),
				    x = ele.children('img').width(),
				    zS = options.zoomSize / 2,
				    id = zoom.attr('rel');
			    //Move the Zoomy out of the screen view while loading img
			    zoom.show('').css({top: '-999999px', left: '-999999px'});
		
			    if (zoom.find('img').attr('src') !== image) {
				    zoom.find('img').attr('src', image).load(function () {
					    ZoomyS[id].zoom = {
						    'x': zoom.find('img').width(),
						    'y': zoom.find('img').height()
					    };

					    if (options.glare) {
						
							zoom.append('<span/>')
								.css({
									'background-image': 'url(' + image + ')'
								})
								.find('img')
								.remove();
							
							setGlare(zoom);
							
					    } else {
							
							zoom.css({
								'background-image': 'url(' + image + ')'
							})
							    .find('img')
							    .remove();
					    }
					    
				    }).each(function () {
					
					    if (this.complete || ($.browser.msie && parseInt($.browser.version, 10) === 6)) {
						
						    $(this).trigger("load");
						    
					    }
				    });
		
			    }
		    },
		    
		    getBorderRadiusCSSObj = function (x) {
				if (!options.round) {
					return "";
				} else {
					var cssObj = {};
					if (x === undefined) {
						cssObj['-webkit-border-radius'] = cssObj['-moz-border-radius'] = cssObj['border-radius'] = options.zoomSize / 2 + 'px';
					} else {
						cssObj['-webkit-border-radius'] = cssObj['-moz-border-radius'] = cssObj['border-radius'] = options.zoomSize / 2 + 'px ' + options.zoomSize / 2 + 'px 0px 0px';
					}
					
					if ($.browser.msie && parseInt($.browser.version, 10) === 9) {
						$('.zoomy').find('span').css('margin', '0');
					}
					
					return cssObj;
	    
				}
		    },
		    
		    zoomParams = function (ele, zoom) {
			    var img = ele.children('img'),
			    
				    // TODO: Create function to filter out percents
				    
				    margin = {
						'marginTop': img.css('margin-top'),
						'marginRight': img.css('margin-right'),
						'marginBottom': img.css('margin-bottom'),
						'marginLeft': img.css('margin-left')
				    },
					
				    floats = {
					'float': img.css('float')
				    },
				    
				    //Zoomy needs these to work
				    
				    zoomMin = {
					    'display': 'block',
					    height: img.height(),
					    width: img.width(),
					    'position': 'relative'
					
				    },
				    
				    //A lil bit of geneology o.0
				    
				    parentCenter = function(){
					    
					    //Checking for parent text-align center
					    
					    var textAlign = ele.parent('*:first').css('text-align');
					    if(textAlign === 'center'){
						    margin.marginRight = 'auto';
						    margin.marginLeft = 'auto';
						
					    }

				    },
				    id = zoom.attr('rel');
				    
			    
			    
			    if(floats.float === 'none'){
				    parentCenter()
			    }
			    
			    var css = $.extend({}, margin, floats, zoomMin);
			    
			    ZoomyS[id].css = css;
		
			    if (!options.glare) {
				    zoom.children('span').css({
					    height: options.zoomSize - 10,
					    width: options.zoomSize - 10
				    });
			    }
		
			    
			    zoom.css({
				    height: options.zoomSize,
				    width: options.zoomSize
			    }).css(getBorderRadiusCSSObj());
		    
		
		
			    img.css('margin', '0px');
		
		
			    img.one("load", function () {
				    ele.css(ZoomyS[id].css);
			    }).each(function () {
				    if (this.complete || ($.browser.msie && parseInt($.browser.version, 10) === 6)) {
					    $(this).trigger("load");
				    }
			    });
	    
		    },
		    callback = function (type, ele, zoom) {
			    var callbackFunc = type,
				    zoomId = zoom.attr('rel');
			
			    if (callbackFunc !== null && typeof callbackFunc === 'function') {
				    
				    callbackFunc(ZoomyS[zoomId]);
				    
			    }
			
		    },
	
		    //Initiate Zoomy & add to page
	
		    addZoomy = function (ele, i) {
			
			    //Adding Initial State  
			    
			    ZoomyS[i] = {
				    state: null,
				    index : i
			    };
			    
			    ZoomyS.count.push(0);
			    
			    // Picking from the right attibute
			    
			    var attribute = function () {
				    if (typeof (ele.attr(options.attr)) === 'string' && options.attr !== 'href') {
					    return ele.attr(options.attr);
				    } else {
					    return ele.attr('href');
				    }
			    },
			    
				    image = attribute(),
				    zoom = null,
				    initCallback = options.zoomInit,
				    eventHandler = (function () {
					    var zoomDefaultText = function (x) {
							if (options.zoomText === defaults.zoomText) {
								options.zoomText = x;
							}
							return true;
					    },
						    hoverEvent = null,
						    eventlist = [],	//List of Actual Events
						    zoomStart = function () {
							    zoomEnter(ele, zoom);
									    
							    /* Start Zoom Callback */
									
							    callback(options.zoomStart, ele, zoom);
						    },
						    zoomStop = function (x) {
							    zoomLeave(ele, zoom, x);
									    
							    /* Start Zoom Callback */
									
							    callback(options.zoomStop, ele, zoom);
						    },
						    events = {		//List of Possible Events
							    event: function (e) {
								
								    if (!options.clickable) {
									    e.preventDefault();
								    }
								
								    if (ZoomyS[i].state === 0 || ZoomyS[i].state === null) {
								       
									    zoomStart();
									    
									    //Fix on click show and positioning issues
									    
									    startZoom(ele, zoom, e);
									
								    } else if (ZoomyS[i].state === 1 && event !== 'mouseover' && event !== 'mouseenter') {
									    
									    zoomStop(0);
									
								    }
								    
								    
								    
							    },
							    'mouseover': function () {
								    if (ZoomyS[i].state === 0) {
									    zoomStart();
								    }
							
							    },
							    'mouseleave': function () {
							
								    if (ZoomyS[i].state === 1) {
									
									    zoomStop(null);
										    
								    }
								
							    },
							    'mousemove': function (e) {
								    if(ZoomyS[i].state !== 0 && ZoomyS[i].state !== null){
								    
									startZoom(ele, zoom, e);
								    
								    }
								
							    },
							    'click': function () {
								return false;
							    }
						    };
					    
					    
					    
					    
					    // Making sure there is only one mouse over event & Click returns false when it suppose to
					    
					    if (event === 'mouseover' ) {
						    eventlist[event] = events.event;
					    } else {
						    eventlist[event] = events.event;
						    eventlist.mouseover = events.mouseover;
					    }
					    
					    if (!options.clickable && event !== 'click') {
						    eventlist.click = events.click;
					    }
					    eventlist.mousemove = events.mousemove;
					    eventlist.mouseleave = events.mouseleave;
					    
					    
					    
					    // Binding Events to element
					    
					    ele.bind(eventlist);
					
				    }());
				
			    //Creating Zoomy Element
			    ele.addClass('parent-zoom').append('<div class="zoomy zoom-obj-' + i + '" rel="' + i + '"><img id="tmp"/></div>');
			    
			    
			    //Setting the Zoom Variable towards the right zoom object
			    
			    zoom = $('.zoom-obj-' + i);
				    
			    
			    if (initCallback !== null && typeof initCallback === 'function') {
				    initCallback(ele);
			    }
			    
			    // Set basic parameters
			    
			    zoomParams(ele, zoom);
			    
			    // Load zoom image 
			    
			    loadImage(ele, image, zoom);
			    
			    //Event Handler added 1.2
			    
			    
			
		    };
		    
		    
		    
		    
	    //Fallback if there is no event but there are options
	
	    if (typeof (event) === 'object' && options === undefined) {
		
		    options = event;

		    event = defaultEvent;
		    
	    } else if (event === undefined) {
		
		    event = defaultEvent;
		    
	    }
	
	    //overriding defaults with options
	
	    options = $.extend(defaults, options);
	    

	    $(this).each(function () {
		    addZoomy($(this), ZoomyS.count.length);
	    });
	    
	    
    

    };
    
    
}(jQuery));