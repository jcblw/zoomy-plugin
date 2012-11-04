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
                
          if (floats['float'] === 'none') {
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