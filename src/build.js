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
        var image = that.ele.attr('href'),
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
