/*
* Zoomy 1.4.6 - jQuery plugin
* http://zoomy.me
*
* Copyright (c) 2012 Jacob Lowe (http://redeyeoperations.com)
* Licensed under the MIT (MIT-LICENSE.txt)

*
* Built for jQuery library
* http://jquery.com
*
* Addition fixes and modifications done by Larry Battle ( blarry@bateru.com )
* Code has been refactored and the logic has been corrected.
*
*/


(function($){

  //Zoomy Constuctor

  var Zoomy = function(ele, options, event){
      this.ele = ele;
      this.options = options;
      this.event = event;
      this.image = ele.find('img');
  };

  Zoomy.prototype.touch = touch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) ? true : false;

  Zoomy.prototype.Helpers = function(helper){
    var that = this,
    _fn = {
      pos: {
        stop    : function (x , z, o, s) {
          return (x - z - o) + s;
        },
        mouse   : function (x, y, h) {
          return x - y - h;     
        },
        zoom    : function (x, y, z, h, o) {
          return ((x - y) / z) - h + o;
        }
      },
      /* @method  css   Function  - Compiles and Object of Css properties
       */
      css: function(a){
        return (typeof a !== 'undefined' && a.length > 0) ? {
          backgroundPosition  : '-' + a[0] + 'px ' + '-' + a[1] + 'px',
          left                : a[2],
          top                 : a[3]
        } : {} ;
      },
      //asspect ratio
      ratio: function(x, y){
        return x / y;   
      },
      setParams: function(){
        that.size         = {};
        that.size.full    = that.options.zoomSize + (that.zoom.border * 2);
        that.size.half    = that.size.full / 2;
        that.size.ratioX  = that.Helpers('ratio')(that.css.width, that.zoom.x);
        that.size.ratioY  = that.Helpers('ratio')(that.css.height, that.zoom.y);
        that.size.zoomX   = that.zoom.x - that.size.full; 
        that.size.zoomY   = that.zoom.y - that.size.full;

        that.stop         = {};
        that.stop.main    = that.size.half - (that.size.half * that.size.ratioX) - (that.zoom.border * that.size.ratioX) + that.zoom.border;
        that.stop.right   = that.Helpers('pos').stop(that.css.width, that.size.full, that.zoom.border, that.stop.main);
        that.stop.bottom  = that.Helpers('pos').stop(that.css.height, that.size.full, that.zoom.border, that.stop.main);
      }
    };

    return _fn[helper];

  };

  $.fn.zoomy = function(event, options){

    // @variable defaults Object - Is overwritten by options Object
    var defaults = {
      zoomSize    : 200,
      round       : true,
      glare       : true,
      clickable   : false,
      attr        : 'href',
      border      : '5px solid #999',
      zoomInit    : null,  //callback for when zoom initializes
      zoomStart   : null, // callback for when zoom starts
      zoomStop    : null // callback for when the zoom ends
    },
    
    //Change default event on touch
    defaultEvent = (touch) ? 'touchstart' : 'click';

    //Fallback if there is no event but there are options 
    if (typeof (event) === 'object' && options === undefined) {
    
      options = event;

      event = defaultEvent;
      
    } else if (event === undefined) {
    
      event = defaultEvent;
      
    }

    //overriding defaults with options
    options = $.extend({}, defaults, options);

    $(this).each(function () {
    
      var ele = $(this);

      var zoom = new Zoomy(ele, options, event);
      // Start Building Zoom
      zoom.Build('init')();
     
    });
  };
  window.Zoomy = Zoomy;
}(jQuery));