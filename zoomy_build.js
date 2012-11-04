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

(function($){

  Zoomy.prototype.Change = function(method){

    var that = this,
    _fn = {

      // Move Zoom Cursor
      move : function (e) {
        //debugger;
     
        // need to stop as many of these variable in data object to avoid recalulation of variables
          var l       = that.ele.offset(),
          yOffset     = (that.touch) ? -70 : 0,
          // only dynamic variables
          posX        = that.Helpers('pos').mouse(e.pageX, l.left , that.size.half),
          posY        = that.Helpers('pos').mouse(e.pageY + yOffset , l.top, that.size.half),
          leftX       = that.Helpers('pos').zoom(e.pageX, l.left, that.size.ratioX, that.size.half, that.zoom.border),
          topY        = that.Helpers('pos').zoom(e.pageY + yOffset, l.top , that.size.ratioY, that.size.half, that.zoom.border),
          
          // Collision Detection Possiblities
          arrPosb = {
          
          // In the Center       
            0 : [leftX, topY, posX, posY],
            
          // On Left Side
            1 : [0, topY, -that.stop.main, posY],

          // On the Top Left Corner
            2 : [0, 0, -that.stop.main, -that.stop.main],
            
          //On the Bottom Left Corner
            3 : [0, that.size.zoomY, -that.stop.main, that.stop.bottom],
            
          // On the Top
            4 : [leftX, 0, posX, -that.stop.main],
            
          //On the Top Right Corner
            5 : [that.size.zoomX, 0, that.stop.right, -that.stop.main],
            
          //On the Right Side
            6 : [that.size.zoomX, topY, that.stop.right, posY],
                       
          //On the Bottom Right Corner
            7 : [that.size.zoomX, that.size.zoomY, that.stop.right, that.stop.bottom],
            
          //On the Bottom    
            8 : [leftX, that.size.zoomY, posX, that.stop.bottom]
          },
          
          // Test for collisions
          a   = -that.stop.main <= posX,
          e2  = -that.stop.main > posX,
          b   = -that.stop.main <= posY,
          f   = -that.stop.main > posY,
          d   = that.stop.bottom > posY,
          g   = that.stop.bottom <= posY,
          c   = that.stop.right > posX,
          j   = that.stop.right <= posX,
          
          // Results of collision
          cssArrIndex = (a && b && c && d) ? 0 : (e2) ? (b && d) ? 1 : (f) ? 2 : (g) ? 3 : null : (f) ? (c) ? 4 : 5 : (j) ? (d) ? 6 : 7 : (g) ? 8 : null,
          
          //Compile CSS object to move Zoomy
          move = that.Helpers('css')(arrPosb[cssArrIndex]);
          //Uncomment to see Index number for collision type
          //console.log(cssArrIndex)
        // And Actual Call    
        that.zoomy.css(move || {});

      },
      
      // Change classes for original image effect
      classes : function () {
        if (that.state === 0 || that.state === null) {
          that.ele.removeClass('inactive');
        } else {
          that.ele.addClass('inactive');
        }
      },
      
      // Enter zoom area start up Zoom again
      enter : function (){
        that.state = 1;
        that.zoomy.css('visibility', 'visible');
        that.Change('classes');
      },
      
      // Leave zoom area
      leave : function (x) {
        var i = that.zoomy.attr('rel');
        if (x !== null) {
          that.state = null;
        } else {
          that.state = 0;
        }
        that.zoomy.css('visibility', 'hidden');
        that.Change('classes');
      },
      
      // Callback handler (startZoom && stopZoom)
      callback : function (callback) {
        if (callback !== null && typeof callbacl === 'function') {
          callback(that.pos);
        }
      }
    };

    return _fn[method];
  };

}(jQuery));


(function($){

  Zoomy.prototype.Style = function(method){

    var that = this,
    _fn = {
        //getting border-radius
        round : function(x, y) {
          return (!that.options.round) ? 0 : ( x === undefined) ?  '100%'  :  that.options.zoomSize / 2 + 'px ' +  that.options.zoomSize  / 2 + 'px 0px 0px';
        },
        //setting glare
        glare : function() {
          that.zoomy
            .children('span')
            .css({
              height          : that.options.zoomSize / 2,
              width           : that.options.zoomSize - 10,
              margin          : ($.browser.msie && parseInt($.browser.version, 10) === 9) ? 0 : '5px auto',
              'border-radius' : that.Style('round')(0)
          });
        },
        //getting border
        border: function() {
          var borderRaw = that.options.border.replace(/^\s*|\s*$/g,''),
            borderArr   = borderRaw.split(' '),
            interger    = parseFloat(borderArr[0]),
            size        = (borderArr.length > 2 && interger * 1 === interger ) ? interger : 0;
            
          return [borderRaw, size];
        },
        // styling element appropiatly
        params : function (ele, zoom) {
          var img             = that.ele.children('img'),
          
            // TODO: Create function to filter out percents
            border          = that.Style('border')(),
            //margining
            margin          = {
              'marginTop'     : img.css('margin-top'),
              'marginRight'   : img.css('margin-right'),
              'marginBottom'  : img.css('margin-bottom'),
              'marginLeft'    : img.css('margin-left')
            },
            //floats
            floats          = {
              'float': img.css('float')
            },
            
            //Zoomy needs these to work
            zoomMin         = {
              'display': 'block',
              height: img.height(),
              width: img.width(),
              'position': 'relative'
            },
            
            //Checking parent text align
            parentCenter    = function () {
          
              //Checking for parent text-align center
              var textAlign = that.ele.parent('*:first').css('text-align');
              if (textAlign === 'center') {
                margin.marginRight  = 'auto';
                margin.marginLeft   = 'auto';
              }
  
            },
            id  = that.zoomy.attr('rel'),
            css = {};
                
          if (floats.float === 'none') {
            parentCenter();
          }
          
          $.extend(css, margin, floats, zoomMin);
          
          that.css = css;
      
          if (!that.options.glare) {
            that.zoomy.children('span').css({
              height  : that.options.zoomSize - 10,
              width   : that.options.zoomSize - 10
            });
          }

          that.zoomy.css({
            height          : that.options.zoomSize,
            width           : that.options.zoomSize,
            'border-radius' : that.Style('round')(undefined, border[1]),
            border          : border[0]
          });

          that.image.css('margin', '0px');
          that.image.one("load", function () {
          
            that.ele.css(that.css);

            if(that.ele.parent('.zoomy-wrap').length){
              that.ele.parent('.zoomy-wrap').css(that.css);
            }

          }).each(function () {
            if (this.complete || ($.browser.msie && parseInt($.browser.version, 10) === 6)) {
              $(this).trigger("load");
            }
          });
      
        }
      
    };
    return _fn[method];
  };

}(jQuery));

(function($){

  Zoomy.prototype.Events = function(){
    var that = this,       
      eventlist = [], //List of Actual Events
      //User Interface Device filter for touch and mouse
      uid = {
      move    : (that.touch) ? 'touchmove' : 'mousemove',
      begin   : (that.touch) ? 'touchstart' : 'mouseover',
      end     : (that.touch) ? 'touchend' : 'mouseleave',
      quick   : (that.touch) ? 'tap' : 'click'
      },
      zoomMove = function (e, originalEvent) {

        e = (that.touch) ? (originalEvent) ? originalEvent.touches[0] || originalEvent.changedTouches[0] : e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] : e;
        
       that.Change('move')(e);
      
      },
      zoomStart = function () {
        that.Change('enter')();
        
        that.ele.bind(uid.move, zoomMove);
            
        /* Start Zoom Callback */
        that.Change('callback')(that.options.zoomStart, that.zoom);
      },
      zoomStop = function (x) {
      
        that.Change('leave')(x);
        
        that.ele.unbind(uid.move, zoomMove);
            
        /* Start Zoom Callback */  
        that.Change('callback')(that.options.zoomStop, that.zoom);
      },
      //New handle to hold start
       startHandle = function(e, originalEvent){
        
         e = (that.touch) ? (originalEvent) ? originalEvent.touches[0] || originalEvent.changedTouches[0] : e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] : e;
         
         that.pos = e;
         
         if (that.state === 0) {
           zoomStart();
         }
         
       },
       
       //New handle to hold stop
       stopHandle = function(e){
         
         that.pos = e;
       
         if (that.state === 1) {
           
           zoomStop(null);
             
         }
         
       },
      //List of Possible Events
      events = {      
        event: function (e) {
        
          that.pos = e;
        
          if (!that.options.clickable) {
            e.preventDefault();
          }
        
          if (that.state === 0 || that.state === null) {
             
            zoomStart();
            
            //Fix on click show and positioning issues
            e = (that.touch && typeof e.originalEvent === 'object' ) ? e.originalEvent.changedTouches[0] || e.originalEvent.touches[0] : e;
            
            that.Change('move')(e);
          
          } else if (that.state === 1 && that.event !== 'mouseover' && that.event !== 'mouseenter') {
            
            zoomStop(0);
          
          }
            
        },
        'mouseover' : startHandle,
        'mouseleave': stopHandle,
        
        //New Added Events for touch
        'touchstart': startHandle,
        'touchend'  : stopHandle,
        'click'     : function (e) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
     
    // Making sure there is only one mouse over event & Click returns false when it suppose to
    if (that.event === 'mouseover' || that.event === 'touchstart') {
      eventlist[that.event] = events.event;
    } else {
      eventlist[that.event] = events.event;
      eventlist[uid.begin] = events[uid.begin];
    }
    
    if (!that.options.clickable && that.event !== 'click') {
      eventlist.click = events.click;
    }
    eventlist[uid.end] = events[uid.end];

    // Binding Events to element

    if(that.touch){

      // Handling Events a bit differntly
      var btn = that.ele.siblings('.zoomy-btn'),
          wrp = btn.parent('div'),
          touchTimer = setTimeout(),
          addEvents = function(e){
            that.ele.bind(eventlist);
            that.ele.trigger('touchstart', e.originalEvent);
            that.ele.trigger('touchmove', e.originalEvent);
            wrp.addClass('active');
          },
          removeEvents = function(){
            wrp.removeClass('active');
            that.ele.trigger('touchend');
            that.ele.unbind(eventlist);
          },
          moving = function(){

          };

      // TODO setup events so that the image cannot be clicked
          
      btn.bind({
        'touchstart': addEvents, 
        'touchmove': function(e){
          e.preventDefault();
          that.ele.trigger('touchmove', e.originalEvent);
        },'touchend': removeEvents
      });

      //Disabling taphold
      document.oncontextmenu = function() {return false;};
      $(document).mousedown(function(e){
            if ( e.button == 2 ) 
                return false; 
            return true;
      });

    
    }else{
    
      that.ele.bind(eventlist);
      
    }
    
    $(window).resize(function(){
    
      that.ele
      .attr('style', '')
      .parent('.zoomy-wrap')
      .attr('style', '');
      
      window.setTimeout(function(){
        that.Style('params')();
      }, 100);
      
    
    });


  };

}(jQuery));

(function($){

  Zoomy.prototype.Build = function(method){

    var that = this,
    _fn = {
      // Load Zoom Image
      image : function (image) {

        //Move the Zoomy out of the screen view while loading img
        that.zoomy.show().css({top: '-999999px', left: '-999999px'});
    
        if (that.zoomy.find('img').attr('src') !== image) {
          that.zoomy.find('img').attr('src', image).load(function () {
          
            var assets  = (that.options.glare) ?  '<span/>' : '',
            border      = that.Style('border')();

          
            that.zoom = {
              'x'     : that.zoomy.find('img').width(),
              'y'     : that.zoomy.find('img').height(),
              'border': border[1]
            };

            that.zoomy.append(assets)
              .css({
                'background-image': 'url(' + image + ')'
              })
              .find('img')
              .remove();
            
            that.Style('glare')();
            that.Helpers('setParams')();
            
          }).each(function () {
          
            if (this.complete || ($.browser.msie && parseInt($.browser.version, 10) === 6)) {
            
              $(this).trigger("load");
              
            }
          });
    
        }
      },
      // Add zoom element to page
      zoom : function () {
        that.state = null;
        
        // Picking from the right attibute
        var image = that.ele.attr('href');
          initCallback = that.options.zoomInit,
          //Add Button if  is touch
          touchCallToAction = 'touch',
          magColor = '#efefef',
          icon = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 50 50" overflow="inherit" xml:space="preserve"><defs><filter id="drop-shadow"><feGaussianBlur in="SourceAlpha" result="blur-out" stdDeviation="1" /><feOffset in="blur-out" result="the-shadow" dx="0" dy="1"/><feBlend in="SourceGraphic" in2="the-shadow" mode="normal"/></filter></defs><path filter="url(#drop-shadow)" fill="' + magColor + '" d="M23.265,30.324l-9.887,9.887l-3.64-3.641l9.942-9.941c-2.687-4.42-2.134-10.246,1.668-14.049 c4.469-4.469,11.732-4.451,16.224,0.04c4.491,4.491,4.509,11.754,0.04,16.224C33.723,32.732,27.718,33.223,23.265,30.324z M24.601,15.833c-2.681,2.681-2.67,7.039,0.024,9.733s7.053,2.705,9.733,0.025c2.682-2.681,2.671-7.04-0.023-9.734 C31.641,13.162,27.282,13.152,24.601,15.833z"/></svg>' + touchCallToAction,

          button = (that.touch) ? ['<div class="zoomy-wrap" />', '<div class="zoomy-btn">' + icon + '</div>'] : ['', ''];
    
        //Creating Zoomy Element
        that.ele
          .addClass('parent-zoom')
          .wrap(button[0])
          .append('<div class="zoomy"><img id="tmp"/></div>' )
          .after(button[1]);
        
        //Setting the Zoom Variable towards the right zoom object
        that.zoomy = that.ele.find('.zoomy');
        
        setTimeout(that.Events(),100);
          
        
        if (initCallback !== null && typeof initCallback === 'function') {
          initCallback();
        }
        
        // Set basic parameters
        that.Style('params')();
        
        // Load zoom image
        that.Build('image')(image);
      },
      
      // Initialize element to add to page, check for initial image to be loaded
      init : function () {
        //Programmically make an img to have better results with loading
        var nImg = $('<img />').attr('src', that.image.attr('src'));
       // listen for a load
        nImg.one("load", function () {
        
          // Ready to build zoom
          that.Build('zoom')();
      
        }).each(function () {
    
          if (this.complete || ($.browser.msie && parseInt($.browser.version, 10) === 6)) {
      
            $(this).trigger("load");
        
          }
        });
      }
    };

    return _fn[method];
  };
}(jQuery));
