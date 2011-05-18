/*
 *  	Zoomy 1.2 - jQuery plugin

 *	http://redeyeops.com/plugins/zoomy
 *
 *	Copyright (c) 2010 Jacob Lowe (http://redeyeoperations.com)
 *	Dual licensed under the MIT (MIT-LICENSE.txt)
 *	and GPL (GPL-LICENSE.txt) licenses.
 *
 *	Built for jQuery library
 *	http://jquery.com
 *
 *  	Addition fixes and modifications done by Larry Battle ( blarry@bateru.com )
 *	# code has been refactored and the logic has been corrected.
 *
 */
(function($){
        
// global zoomys state, Indexed, 0 = no zoom, 1 = zoom;    

var ZoomyState = [];


    jQuery.fn.zoomy = function(event, options) {

	//defaults
	var defaults = {
	    zoomSize: 200,
	    round: true,
	    glare: true,
	    zoomText: 'default',
	    clickable: false
	}, defaultEvent = 'click';
	
	if(typeof(event) === 'object' && options === undefined){
	    options = event;
	    event = defaultEvent;
	}else if(event === undefined){
	    event = defaultEvent;
	}
	options = $.extend(defaults, options);
    
	// add Zoomy
	
	var addZoomy = function(ele, i) {
	    ZoomyState.push(0);
	    var image = ele.attr('href'),
	     cursor = function(){
		if($.browser.mozilla){
		    return '-moz-zoom-in';
		}else if($.browser.webkit){
		    return '-webkit-zoom-in';
		}else{
		    return 'cell';
		}
	    };
	    

    
	    ele.css({'position': 'relative', 'cursor': cursor}).append('<div class="zoomy zoom-obj-'+i+'" rel="'+i+'"><img id="tmp"/></div>');
	    var zoom = $('.zoom-obj-'+i);
	    zoomParams(ele, zoom);
	    // load zoom image after params are set
	    loadImage(ele, image, zoom);
	    
	    var eventHandler = function(){
		var zoomDefaultText = function(x){
		    if(options.zoomText === defaults.zoomText){
			    options.zoomText = x;
		    };
		    return true;
		},
		clickablity = function(){
		    if(!options.clickable){
			    ele.bind('click',function(){return false;});
		    }
		};
		switch(event){
		    case 'dblclick' :
			clickablity();
			zoomDefaultText('Double click to Zoom in');
			break;
		    case 'mouseover' || 'mouseenter' :
			clickablity();
			zoomDefaultText('Mouse over to Zoom in');
			zoomBarEnter(ele);
			break;
		    default:
			clickablity();
			zoomDefaultText('Click to Zoom in');
			break;
		}
		// Bind Event
		ele.bind(event, function(){
		    if(ZoomyState[i] === 0){
			zoom.css({opacity: 1}).addClass('cursorHide').show();
			ZoomyState[i] = 1;
			zoomBarLeave(ele, zoom);
			    
			
    
			    setTimeout(function () {
				if (!zoom.find('img').length) {
				    zoomEnter(ele, zoom, image);
				}
				if(event === 'mouseover' || event === 'mouseenter'){
				    ele.unbind(event);
				}
				
				
			    }, 150);
		    }else{
			zoom.css({opacity: 0}).removeClass('cursorHide');
			ZoomyState[i] = 0;
		    }
		    toggleClasses(ele);
		    return false;
		});
		
		
	    }
	    
	    eventHandler();
	    
	    //TODO Fix issue with mouse over and mouse enter conflict with this hover statment
	    
	    ele.hover(function () {

		if(ZoomyState[i] === 0){
		    zoomBarEnter(ele);
		}else{
		    zoomEnter(ele, zoom, image);
		}

	    }, function (){

		if(ZoomyState[i] === 0){
		    zoomBarLeave(ele);
		}else{
		    zoomLeave(ele, zoom);
		}

	    });
	},

	zoomBarEnter = function(ele){
	    var zb = ele.find('.zoomBar');
	    if(zb.length ===0){
		ele.append('<span class="zoomBar">'+options.zoomText+'</span>');
	    }else{
		zb.html(options.zoomText);
	    }
	},

	zoomBarLeave = function(ele){
		ele.find('.zoombar').html(options.zoomText);
	},

	zoomEnter = function(ele, zoom, image){
	    var isIdBrokeZoomy = (zoom.attr('id') === 'brokeZoomy');
		if ( !isIdBrokeZoomy ) {
		    
		    //resetZoom(ele, zoom);
		    startZoom(ele, zoom);

		    toggleClasses(ele);
		}
	},
	toggleClasses = function(ele){
	    var img = ele.find('img');
	    if(ZoomyState[ele.find('.zoomy').attr('rel')] === 0){
		ele.removeClass('inactive');
	    }else{
		ele.addClass('inactive');
	    }
	},

	zoomLeave = function(ele, zoom){
	    if (zoom.attr('id') !== 'brokeZoomy' && !zoom.find('img').length ) {
		setTimeout(function () {
			zoom.hide();
		},100);
	    }
	},

	// Start Zoom
	//includes mouse move event
	startZoom = function(ele, zoom) {
	    var ratio = function(x, y){
		var z = x/y;
		return z;
	    },
	    l = ele.offset(),
	    zoomImgX = parseInt(ele.attr('x'), 10),
	    zoomImgY = parseInt(ele.attr('y'), 10),
	    tnImgX = ele.width(),
	    tnImgY = ele.height(),
	    zoomSize = options.zoomSize,
	    halfSize = zoomSize / 2,
	    ratioX = ratio(tnImgX,zoomImgX),
	    ratioY = ratio(tnImgY,zoomImgY),
	    stop = Math.round(halfSize - (halfSize * ratioX)),
	    stopPos = function(x){
		var p = (x - zoomSize) + stop;
		return p;
	    },
	    rightStop = stopPos(tnImgX),
	    bottomStop = stopPos(tnImgY),
	    zoomY = zoomImgY - zoomSize,
	    zoomX = zoomImgX - zoomSize,
	    mousePos = function(x,y){
		var p = x-y-halfSize;	
		return p;
	    },
	    zoomPos = function(x,y,z){
		var p = Math.round((x - y) / z)-halfSize;
		return p;
	    },
	    cdCreate = function(a,b,c,d,e,f){
		var bgPos = a+b+'px '+c+d+'px',
		o = {
		    backgroundPosition: bgPos,
		    left: e,
		    top: f
		};
		return o;
	    };
	    
	    // mouse move event
	    
	    ele.mousemove(function (e) {

		if(ZoomyState[zoom.attr('rel')] === 1){
		    var posX = mousePos(e.pageX,l.left),
		    posY = mousePos(e.pageY,l.top),
		    leftX = zoomPos(e.pageX,l.left,ratioX),
		    topY = zoomPos(e.pageY,l.top,ratioY),
		    arrPosb = [
			['-', leftX,'-',topY,posX,posY],
			['',0,'-',topY,-stop,posY],
			['',0,'',0,-stop,-stop],
			['',0,'-',zoomY,-stop,bottomStop],
			['-',leftX,'',0,posX,-stop],
			['-',zoomX,'',0,rightStop,-stop],
			['-',zoomX,'-',topY,rightStop,posY],
			['-',zoomX,'-',zoomY,rightStop,bottomStop],
			['-',leftX,'-',zoomY,posX,bottomStop]
		    ],
		    cssArrOfObj = function(){
			var ar = [];
			for ( i=0; i < arrPosb.length; i++) {
			    var ap = arrPosb[i],
			    posb = cdCreate(ap[0],ap[1],ap[2],ap[3],ap[4],ap[5]);
			    ar.push(posb);
			}
			return ar;
		    },	
		    a = -stop <= posX,
		    e2 = -stop > posX,
		    b = -stop <= posY,
		    f = -stop > posY,
		    d = bottomStop > posY,
		    g = bottomStop <= posY,
		    c = rightStop > posX,
		    j = rightStop <= posX,
		    cssArrIndex = ( a && b && c && d ) ? 0 : ( e2 ) ? ( b && d ) ? 1 : ( f ) ? 2 : ( g ) ? 3 : null : ( f ) ? (c) ? 4 : 5 : ( j ) ? ( d ) ? 6 : 7 : ( g ) ? 8 : null;
		    zoom.show().css( cssArrOfObj()[ cssArrIndex ] || {} );
		}
	    });
	},
	
	
	// Load Zoom Image
	
	loadImage = function(ele, image, zoom) {
	    var y = ele.children('img').height(),
		x = ele.children('img').width(),
		zS = options.zoomSize / 2;
		//Move the Zoomy out of the screen view while loading img
		zoom.show('').css({top:'-999999px',left:'-999999px'});
    
	    if (zoom.find('img').attr('src') !== image) {
		zoom.find('img').attr('src', image).load(function(){
		    
		    ele.attr({
			'x': zoom.find('img').width(),
			'y': zoom.find('img').height()
		    });
		    if (options.glare) {
			zoom.html('<span/>').css({
			    'background-image': 'url(' + image + ')'
			});
			setTimeout(function () {
			    setGlare(zoom);
			}, 100);
		    } else {
			zoom.html('').css({
			    'background-image': 'url(' + image + ')'
			});
		    }
		}).each(function(){
		if(this.complete || (jQuery.browser.msie && parseInt(jQuery.browser.version, 10) === 6)){
		    $(this).trigger("load");
		}
	    });

	    }
	},

	resetZoom = function(ele, zoom, x , y) {
	    var img = ele.children('img');
	    var mid = options.zoomSize/2;
	    if(!x){x=0;}
	    if(!y){y=0;}
	    zoom.css({
		left: x-mid+'px',
		top: y-mid+'px'
	    }).parent('a').css({
		height: img.height(),
		width: img.width()
	    });
	},

	zoomParams = function(ele, zoom) {
	    var img = ele.children('img'),
	    margin = img.css('margin-left'),
	    namePick = function(img){
		var f = img.css('float');
		    if(f){
			if(f === 'none'){
			    var inline = img.attr('style');
			    if(inline){
				var inCSS = inline.split(';');
				for(i = 0; i<= inCSS.length; i++){
				    if(inCSS[i]) var style = inCSS[i].split(':');
				    else var style = [0,0];
				    if(style[0]==='float'){
					return(style[1]);
				    }
				}
			    }else{
				return f;
			    }

			}else{

			    return f;

			}
		    }else{
			if(img.parent('*').css('text-align') === 'center'){
			    return 'center';
			}else{
			    return 'unknown';
			}
		    }
	    }
	    
	    zoom.css({
		height: options.zoomSize,
		width: options.zoomSize
	    }).css( getBorderRadiusCSSObj() );

	    if( !options.glare ){
		zoom.children('span').css({
		    height: options.zoomSize - 10,
		    width: options.zoomSize - 10
		});
	    }


	    if(margin === undefined || margin === ''){margin = '5px';}
    
    
	    var cssObj = { 
		'left':[{
			'margin': margin,
			'float': 'left'
		}],
		'right':[{
			'margin': margin,
			'float': 'right'
		}],
		'center':[{
			'margin': margin+' auto',
			'display': 'block'
		}],
		'unknown' : [{
			'margin' : margin,
			'display': 'block'
		}],
		'none' : [{
			'margin': margin,
			'display': 'block'
		}]
	    },

	    cssNamePick = namePick(img);

		    img.css('margin', '0px');
		    ele.css( cssObj[ cssNamePick ][0]);


	    img.one("load",function(){
		ele.css({
			'display': 'block',
			height: img.height(),
			width: img.width(),
			'cursor': 'normal'
		    });
	    }).each(function(){
		if(this.complete || (jQuery.browser.msie && parseInt(jQuery.browser.version, 10) === 6)){
		    $(this).trigger("load");
		}
	    });

	},

	getBorderRadiusCSSObj = function(x){
		    if( !options.round ){
			return "";
		    }else{
			var cssObj = {};
			if(x === undefined){
			    cssObj['-webkit-border-radius'] = cssObj['-moz-border-radius'] = cssObj[ 'border-radius' ] = options.zoomSize / 2 + 'px';
			}else{
			    cssObj['-webkit-border-radius'] = cssObj['-moz-border-radius'] = cssObj[ 'border-radius' ] = options.zoomSize / 2 + 'px '+options.zoomSize / 2 + 'px 0px 0px';
			}
			
			if(jQuery.browser.msie && parseInt(jQuery.browser.version, 10) === 9){$('.zoomy').find('span').css('margin', '0');}
			
			return cssObj;

		    }
	},
	setGlare = function(zoom) {
		    zoom.children('span').css({
			    height: options.zoomSize/2,
			    width: options.zoomSize - 10
		    }).css( getBorderRadiusCSSObj(0) );
	};

	$(this).each(function() {
	    addZoomy($(this), ZoomyState.length);
	});
    };
    
    
}(jQuery));