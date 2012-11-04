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

}(jQuery))