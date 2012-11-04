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
