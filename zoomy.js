/*
* Zoomy 1.4.4 - jQuery plugin
* http://redeyeops.com/plugins/zoomy
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


(function ($) {
    
  // @object ZoomyS Object - Holds alot of data for each instance of Zoomy
  'use strict';
  var ZoomyS = {
    count : [],
    pos: null
  };

  /** @method     zoomy   Function    - Plugin for jQuery
   *  @param      event   String      - Event to initiate Zoomy
   *  @param      options object      - Options Object that holds optons for configuration
   */
  $.fn.zoomy = function (event, options) {

    
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
      //Test for touch
      touch = (typeof($.support.touch) === 'boolean') ? ($.support.touch) ? true : false : false,
      
      //Change default event on touch
      defaultEvent = (touch) ? 'touchstart' : 'click',
      

      /* @variable    utils   Object      - Set of utitlities needed for Zoomy
       * @method      pos     Object      - position utitlities
       *
       * @method      stop    Function    - Helper to calculate stops for crash detection
       * @param       x       Interger    - Thumnail images position
       * @param       z       Interger    - Size of the Zoom element
       * @param       o       Interger    - Size of border to offset it
       * @param       s       Interger    - Postion of Stop ^^
       *
       * @method      mouse   Function    - Mouse position relative to image
       * @param       x       Interger    - Offest from page
       * @param       y       Interger    - Offset from thumbnail
       * @param       h       Interger    - Half the size of the Zoom Element
       *
       * @method      zoom    Funtion     - Postion of Zoomy Element
       * @param       x       Interger    - Offset from page
       * @param       y       Interger    - Element positon
       * @param       z       Interger    - Ratio of Zoom
       * @param       h       Interger    - Half the size of Zoomt Element
       * @param       o       Interger    - Size of border to offset it
       *
       * TODO : Finish Docs!
       */
      utils = {
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
        }
      },
      
      change = {
      
        // Move Zoom Cursor
        move : function (ele, zoom, e) {
          // need to stop as many of these variable in data object to avoid recalulation of variables
          var id          = zoom.attr('rel'),
            l           = ele.offset(),
            theOffset   = ZoomyS[id].zoom.border,
            yOffset     = (touch) ? -70 : 0,
            zoomImgX    = ZoomyS[id].zoom.x,
            zoomImgY    = ZoomyS[id].zoom.y,
            tnImgX      = ZoomyS[id].css.width,
            tnImgY      = ZoomyS[id].css.height,
            zoomSize    = options.zoomSize + (theOffset * 2),
            halfSize    = zoomSize / 2,
            ratioX      = utils.ratio(tnImgX, zoomImgX),
            ratioY      = utils.ratio(tnImgY, zoomImgY),
            stop        = halfSize - (halfSize * ratioX) - (theOffset * ratioX) + theOffset,
            rightStop   = utils.pos.stop(tnImgX, zoomSize, theOffset, stop),
            bottomStop  = utils.pos.stop(tnImgY, zoomSize, theOffset, stop),
            zoomY       = zoomImgY - zoomSize,
            zoomX       = zoomImgX - zoomSize,
            posX        = utils.pos.mouse(e.pageX, l.left , halfSize),
            posY        = utils.pos.mouse(e.pageY + yOffset , l.top, halfSize),
            leftX       = utils.pos.zoom(e.pageX, l.left, ratioX, halfSize, theOffset),
            topY        = utils.pos.zoom(e.pageY + yOffset, l.top , ratioY, halfSize, theOffset),
            
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
            a   = -stop <= posX,
            e2  = -stop > posX,
            b   = -stop <= posY,
            f   = -stop > posY,
            d   = bottomStop > posY,
            g   = bottomStop <= posY,
            c   = rightStop > posX,
            j   = rightStop <= posX,
            
            // Results of collision
            cssArrIndex = (a && b && c && d) ? 0 : (e2) ? (b && d) ? 1 : (f) ? 2 : (g) ? 3 : null : (f) ? (c) ? 4 : 5 : (j) ? (d) ? 6 : 7 : (g) ? 8 : null,
            
            //Compile CSS object to move Zoomy
            move = utils.css(arrPosb[cssArrIndex]);
            //Uncomment to see Index number for collision type
            //console.log(cssArrIndex)
          // And Actual Call    
          zoom.css(move || {});
  
        },
        
        // Change classes for original image effect
        classes : function (ele) {
          var i = ele.find('.zoomy').attr('rel');
          if (ZoomyS[i].state === 0 || ZoomyS[i].state === null) {
            ele.removeClass('inactive');
          } else {
            ele.addClass('inactive');
          }
        },
        
        // Enter zoom area start up Zoom again
        enter : function (ele, zoom) {
          var i = zoom.attr('rel');
          ZoomyS[i].state = 1;
          zoom.css('visibility', 'visible');
          change.classes(ele);
        },
        
        // Leave zoom area
        leave : function (ele, zoom, x) {
          var i = zoom.attr('rel');
          if (x !== null) {
            ZoomyS[i].state = null;
          } else {
            ZoomyS[i].state = 0;
          }
          zoom.css('visibility', 'hidden');
          change.classes(ele);
        },
        
        // Callback handler (startZoom && stopZoom)
        callback : function (type, zoom) {
          var callbackFunc = type,
            zoomId = zoom.attr('rel');
        
          if (callbackFunc !== null && typeof callbackFunc === 'function') {
            
            callbackFunc($.extend({}, ZoomyS[zoomId], ZoomyS.pos));
            
          }
        
        }
      
      
      },
      
      // Styling Object, holds pretty much all styling except for some minor tweeks
      style = {

        //getting border-radius
        round : function (x, y) {
          return (!options.round) ? 0 : ( x === undefined) ?  '100%'  :  options.zoomSize / 2 + 'px ' +  options.zoomSize  / 2 + 'px 0px 0px';
        },

        //setting glare
        glare : function (zoom) {
          zoom
            .children('span')
            .css({
              height          : options.zoomSize / 2,
              width           : options.zoomSize - 10,
              margin          : ($.browser.msie && parseInt($.browser.version, 10) === 9) ? 0 : '5px auto',
              'border-radius' : style.round(0)
          });
        },
        
        //getting border
        border: function (zoom) {
        
          var borderRaw   = options.border.replace(/^\s*|\s*$/g,''),
            borderArr   = borderRaw.split(' '),
            interger    = parseFloat(borderArr[0]),
            size        = (borderArr.length > 2 && interger * 1 === interger ) ? interger : 0;
            
          return [borderRaw, size];
        },

        // styling element appropiatly
        params : function (ele, zoom) {
          var img             = ele.children('img'),
          
            // TODO: Create function to filter out percents
            border          = style.border(zoom),
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
              var textAlign = ele.parent('*:first').css('text-align');
              if (textAlign === 'center') {
                margin.marginRight  = 'auto';
                margin.marginLeft   = 'auto';
              }
  
            },
            id  = zoom.attr('rel'),
            css = {};
                
          if (floats['float'] === 'none') {
            parentCenter();
          }
          
          $.extend(css, margin, floats, zoomMin);
          
          ZoomyS[id].css = css;
      
          if (!options.glare) {
            zoom.children('span').css({
              height  : options.zoomSize - 10,
              width   : options.zoomSize - 10
            });
          }

          zoom.css({
            height          : options.zoomSize,
            width           : options.zoomSize,
            'border-radius' : style.round(undefined, border[1]),
            border          : border[0]
          });

          img.css('margin', '0px');
          img.one("load", function () {
          
            ele.css(ZoomyS[id].css);

            if(ele.parent('.zoomy-wrap').length){
              ele.parent('.zoomy-wrap').css(ZoomyS[id].css);
            }

          }).each(function () {
            if (this.complete || ($.browser.msie && parseInt($.browser.version, 10) === 6)) {
              $(this).trigger("load");
            }
          });
      
        }
      
      },
      
      // Build Object, Elements are added to the DOM here 
      build = {
      
        // Load Zoom Image
        image : function (image, zoom) {
          var id = zoom.attr('rel');

          //Move the Zoomy out of the screen view while loading img
          zoom.show().css({top: '-999999px', left: '-999999px'});
      
          if (zoom.find('img').attr('src') !== image) {
            zoom.find('img').attr('src', image).load(function () {
            
              var assets  = (options.glare) ?  '<span/>' : '',
              border      = style.border(zoom);

            
              ZoomyS[id].zoom = {
                'x'     : zoom.find('img').width(),
                'y'     : zoom.find('img').height(),
                'border': border[1]
              };
  
              zoom.append(assets)
                .css({
                  'background-image': 'url(' + image + ')'
                })
                .find('img')
                .remove();
              
              style.glare(zoom);
              
            }).each(function () {
            
              if (this.complete || ($.browser.msie && parseInt($.browser.version, 10) === 6)) {
              
                $(this).trigger("load");
                
              }
            });
      
          }
        },

        // Add zoom element to page
        zoom : function (ele, i) {
        
          //Adding Initial State   
          ZoomyS[i] = {
            state: null,
            index : i
          };
          
          ZoomyS.count.push(0);
          
          // Picking from the right attibute  
          var image = (typeof (ele.attr(options.attr)) === 'string' && options.attr !== 'href') ?  ele.attr(options.attr) : ele.attr('href'),
            zoom = null,
            initCallback = options.zoomInit,
            eventHandler = function () {
              var eventlist = [], //List of Actual Events
                //User Interface Device filter for touch and mouse
                uid = {
                move    : (touch) ? 'touchmove' : 'mousemove',
                begin   : (touch) ? 'touchstart' : 'mouseover',
                end     : (touch) ? 'touchend' : 'mouseleave',
                quick   : (touch) ? 'tap' : 'click'
                },
                zoomMove = function (e, originalEvent) {

                  e = (touch) ? (originalEvent) ? originalEvent.touches[0] || originalEvent.changedTouches[0] : e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] : e;
                  
                  change.move(ele, zoom, e);
                
                },
                zoomStart = function () {
                  change.enter(ele, zoom);
                  
                  ele.bind(uid.move, zoomMove);
                      
                  /* Start Zoom Callback */
                  change.callback(options.zoomStart, zoom);
                },
                zoomStop = function (x) {
                
                  change.leave(ele, zoom, x);
                  
                  ele.unbind(uid.move, zoomMove);
                      
                  /* Start Zoom Callback */  
                  change.callback(options.zoomStop, zoom);
                },
                //New handle to hold start
                 startHandle = function(e, originalEvent){
                  
                   e = (touch) ? (originalEvent) ? originalEvent.touches[0] || originalEvent.changedTouches[0] : e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] : e;
                   
                   ZoomyS.pos = e;
                   
                   if (ZoomyS[i].state === 0) {
                     zoomStart();
                   }
                   
                 },
                 
                 //New handle to hold stop
                 stopHandle = function(e){
                   
                   ZoomyS.pos = e;
                 
                   if (ZoomyS[i].state === 1) {
                     
                     zoomStop(null);
                       
                   }
                   
                 },
                //List of Possible Events
                events = {      
                  event: function (e) {
                  
                    ZoomyS.pos = e;
                  
                    if (!options.clickable) {
                      e.preventDefault();
                    }
                  
                    if (ZoomyS[i].state === 0 || ZoomyS[i].state === null) {
                       
                      zoomStart();
                      
                      //Fix on click show and positioning issues
                      e = (touch && typeof e.originalEvent === 'object' ) ? e.originalEvent.changedTouches[0] || e.originalEvent.touches[0] : e;
                      
                      change.move(ele, zoom, e);
                    
                    } else if (ZoomyS[i].state === 1 && event !== 'mouseover' && event !== 'mouseenter') {
                      
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
              if (event === 'mouseover' || event === 'touchstart') {
                eventlist[event] = events.event;
              } else {
                eventlist[event] = events.event;
                eventlist[uid.begin] = events[uid.begin];
              }
              
              if (!options.clickable && event !== 'click') {
                eventlist.click = events.click;
              }
              eventlist[uid.end] = events[uid.end];

              // Binding Events to element
              if(touch){

                // Handling Events a bit differntly
                var btn = $('.zoomy-btn-' + i),
                    wrp = btn.parent('div'),
                    touchTimer = setTimeout(),
                    addEvents = function(e){
                      ele.bind(eventlist);
                      ele.trigger('touchstart', e.originalEvent);
                      ele.trigger('touchmove', e.originalEvent);
                      wrp.addClass('active');
                    },
                    removeEvents = function(){
                      wrp.removeClass('active');
                      ele.trigger('touchend');
                      ele.unbind(eventlist);
                    },
                    moving = function(){

                    };

                // TODO setup events so that the image cannot be clicked
                    
                btn.bind({
                  'touchstart': addEvents, 
                  'touchmove': function(e){
                    e.preventDefault();
                    ele.trigger('touchmove', e.originalEvent);
                  },'touchend': removeEvents
                });

              
              }else{
              
                ele.bind(eventlist);
                
              }
              
              $(window).resize(function(){
              
                ele
                .attr('style', '')
                .parent('.zoomy-wrap')
                .attr('style', '');
                
                window.setTimeout(function(){
                
                style.params(ele, zoom);
                
                }, 100);
                
              
              });
              
            },
            //Add Button if  is touch
            button = (touch) ? ['<div class="zoomy-wrap" />', '<div class=" zoomy-btn zoomy-btn-' + i + '"></div>'] : ['', ''];
      
          //Creating Zoomy Element
          ele
            .addClass('parent-zoom')
            .wrap(button[0])
            .append('<div class="zoomy zoom-obj-' + i + '" rel="' + i + '"><img id="tmp"/></div>' )
            .after(button[1]);
          
          //Setting the Zoom Variable towards the right zoom object
          zoom = $('.zoom-obj-' + i);
          
          eventHandler();
            
          
          if (initCallback !== null && typeof initCallback === 'function') {
            initCallback(ele);
          }
          
          // Set basic parameters
          style.params(ele, zoom);
          
          // Load zoom image 
          build.image(image, zoom);
        
        },
        
        // Initialize element to add to page, check for initial image to be loaded 
        init : function (ele, img) {

          //Programmically make an img to have better results with loading
          var nImg = $('<img />').attr('src', img.attr('src'));
          
          // listen for a load
          nImg.one("load", function () {
          
            // Ready to build zoom
            build.zoom(ele, ZoomyS.count.length);
        
          }).each(function () {
      
            if (this.complete || ($.browser.msie && parseInt($.browser.version, 10) === 6)) {
        
              $(this).trigger("load");
          
            }
          });
        }
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
    
      var ele = $(this),
        img = ele.find('img');
       
      // Start Building Zoom
      build.init(ele, img);
     
    });
  };
}(jQuery));