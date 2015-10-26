/*! jQuery requestAnimationFrame - v0.1.3pre - 2014-02-07
* https://github.com/gnarf37/jquery-requestAnimationFrame
* Copyright (c) 2014 Corey Frang; Licensed MIT */

(function( jQuery ) {

// requestAnimationFrame polyfill adapted from Erik Möller
// fixes from Paul Irish and Tino Zijdel
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating


var animating,
    lastTime = 0,
    vendors = ['webkit', 'moz'],
    requestAnimationFrame = window.requestAnimationFrame,
    cancelAnimationFrame = window.cancelAnimationFrame;

for(; lastTime < vendors.length && !requestAnimationFrame; lastTime++) {
    requestAnimationFrame = window[ vendors[lastTime] + "RequestAnimationFrame" ];
    cancelAnimationFrame = cancelAnimationFrame ||
        window[ vendors[lastTime] + "CancelAnimationFrame" ] ||
        window[ vendors[lastTime] + "CancelRequestAnimationFrame" ];
}

function raf() {
    if ( animating ) {
        requestAnimationFrame( raf );
        jQuery.fx.tick();
    }
}

if ( requestAnimationFrame ) {
    // use rAF
    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;
    jQuery.fx.timer = function( timer ) {
        if ( timer() && jQuery.timers.push( timer ) && !animating ) {
            animating = true;
            raf();
        }
    };

    jQuery.fx.stop = function() {
        animating = false;
    };
} else {
    // polyfill
    window.requestAnimationFrame = function( callback, element ) {
        var currTime = new Date().getTime(),
            timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) ),
            id = window.setTimeout( function() {
                callback( currTime + timeToCall );
            }, timeToCall );
        lastTime = currTime + timeToCall;
        return id;
    };

    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };

}

}( jQuery ));







var featureParallaxEffect = function (param) {


        // ===============================================================
        // Set Up Elements
        // ===============================================================
        var
            widget                  = $(".feature"),
            widgetWrapper           = "featureWrapper";

        widget.wrap("<div class='"+widgetWrapper+"'></div>");
        widget.append("<div class='feature__parallax-background-image'></div>");


        // ===============================================================
        // Initial settings
        // ===============================================================

        var

            // Element properties
            widgetWidth             = 0,
            widgetHeight            = 0,
            widgetPosition          = 0,
            widgetBottomCoordinate  = 0,
            widgetViewportOverflow  = false;

            // Background element
            widgetBackground        = widget.find(".feature__parallax-background-image"),
            backgroundImage         = widget.find(".feature__background-image").css("background-image");

            // Background position setting
            backgroundPosition      = parseFloat( widget.find(".feature__background-image").css("background-position").split(' ')[1] ),
            bgScrollEffectThreshold = 90, // Allows background scroll effect only when background-position-y is set below this value

            // Window properties
            windowHeight            = 0,
            windowOffset            = $(window).scrollTop(),

            // Effects initial settings
            bgScrollEffectEnabled   = false,
            featureStuckEnabled     = true,
            fadeOutEffectEnabled    = true,

            // Scroll progress initial value
            scrollProgress          = 0,
            scrolling               = false,
            resizing                = false,
            resizeTimer             = 0;




        var calcDimension = function () {
            widget.removeClass("stuck");
            widget.css('top','0px');

            resizing = false;
            // Get dimensions
            widgetWidth             = $(".featureWrapper").width();
            widgetHeight            = widget.height();
            widgetPosition          = widget.offset();
            widgetBottomCoordinate  = widgetPosition.top + widgetHeight;
            windowHeight            = $(window).height();


            // Check if widget is taller than the viewport

            if ( widgetBottomCoordinate > windowHeight ) {
                widgetViewportOverflow = true;
            } else {
                widgetViewportOverflow = false;
            }

            // Set dimensions

            widget.width(widgetWidth);
            $("."+widgetWrapper).height(widgetHeight);




            console.log("widgetWidth: " + widgetWidth);
            console.log("widgetHeight: " + widgetHeight);
            console.log("widgetPosTop: " + widgetPosition.top );
            console.log("backgroundPosition: " + backgroundPosition );
            console.log("widgetBottomCoordinate: " + widgetBottomCoordinate);
            console.log("windowHeight: " + windowHeight);
            console.log("widgetViewportOverflow: " + widgetViewportOverflow);
            console.log("------------------------------------------------------------");



        };

        console.log(backgroundPosition);


        $(".feature__parallax-background-image").css({ 'background-image':  backgroundImage  });
        widgetBackground.css('background-position', '50%' + backgroundPosition +'%');


        calcDimension();





        // Set top position of background element holder, so it covers space occupied by the header
        widgetBackground.css({ top: -widgetPosition.top });

        // Check if background image can be moved further down
        if ( backgroundPosition < 100 && backgroundPosition < bgScrollEffectThreshold ) {

            bgScrollEffectEnabled = true;

        }



        // ===============================================================
        // Effects
        // ===============================================================


        // ===============================================================
        // Background Scroll Effect

        var backgroundScrollEffect = function (scrollProgress) {

            var bgPosition = - widgetHeight * scrollProgress * 0.3 ;

            widgetBackground.css('transform', 'translate3d(0px, ' + bgPosition +'px,0)');

        };

        // ===============================================================
        // Stuck Effect

        var stuckEffect = function (scrollProgress) {

            var positionOffset = 0;

            // When widget is taller than the viewport a negative top position will be set when stuck
            if ( widgetViewportOverflow ) {
                positionOffset = widgetBottomCoordinate - widgetPosition.top - windowHeight;
            }

            // Stuck it when bottom of the widget reached the bottom of the viewport
            // and when the top of the top of the widget passed above the viewport
            if ( featureStuckEnabled && windowOffset > widgetPosition.top && widgetViewportOverflow == true ) {
                widget.addClass("stuck");
                widget.css('top', -(Math.max(0, positionOffset)) +'px');

            } else if (featureStuckEnabled && widgetViewportOverflow == false) {
                widget.addClass("stuck");
                widget.css('top', widgetPosition.top +'px');
            }

            // Unstuck the widget
            else {
                widget.removeClass("stuck");
                widget.css('top','0px');
            }

        };


        // ===============================================================
        // Text Fade Out Effect

        var fadeOutEffect = function (scrollProgress) {

            opacity = Math.min(1, ( 1 - scrollProgress ).toFixed( 2 ) );
            widget.find(".content-inner-wrap").css('opacity', opacity);


        };



        // ===============================================================
        // When user scrolls
        // ===============================================================

        window.onscroll = function(e) {
            scrolling = true;
            windowOffset = Math.max(0, $(window).scrollTop() );
        };


        // ===============================================================
        // When viewport is resized
        // ===============================================================


        $(window).on('resize', function(e) {

              clearTimeout(resizeTimer);
              resizeTimer = setTimeout(function() {
                resizing = true;
                calcDimension();
                applyEffects();
              }, 250);

        });




        var animate = function () {

            requestAnimationFrame( animate );

            // Prevents code from running when widget is no longer visible

            if ( windowOffset < widgetBottomCoordinate && scrolling ) {
                applyEffects();
                requestAnimationFrame( animate );

            }


            scrolling = false;

        }


        // ===============================================================
        // Apply effects
        // ===============================================================

        var applyEffects = function () {


                var scrollProgressOffset = 0; // Can start scrollProgress immediately
                var scrollLength = widgetBottomCoordinate; // Effect last while scrolling the lenght of the widget

                // ===============================================================
                // When widget is taller than viewport

                if ( widgetViewportOverflow ) {
                    // Disable effects  untill bottom of the widget reaches the viewport
                    fadeOutEffectEnabled = false;
                    featureStuckEnabled = false;
                    bgScrollEffectEnabled = false;


                    // When bottom of the widget reaches the viewport

                    if ( windowOffset >= ( widgetBottomCoordinate  - windowHeight )  ) {
                        // Enable effects
                        featureStuckEnabled = true;
                        fadeOutEffectEnabled = true;
                        bgScrollEffectEnabled = true;

                        // Scroll effect ajdustments
                        scrollProgressOffset = widgetBottomCoordinate - windowHeight; // Remove scroll amount needed to reach the bottom of the widget
                        scrollLength = windowHeight; // Scroll effect last while scrolling the height of the viewport

                    }

                } else {
                    featureStuckEnabled = true;
                    fadeOutEffectEnabled = true;
                    bgScrollEffectEnabled = true;
                }

                // ===============================================================
                // Scroll progress, value 0 on the top, value 1 when bottom of the widget passed the viewport

                scrollProgress = Math.min( 1 , parseFloat( 0 + ( 1 / ( scrollLength ) * ( windowOffset -  scrollProgressOffset ) ) ).toFixed( 4 ) );


                // ===============================================================
                // Apply effects

                if ( bgScrollEffectEnabled && resizing == false ) {
                    backgroundScrollEffect(scrollProgress);
                }

                if ( resizing == false ) {
                stuckEffect(scrollProgress);
                }

                if ( fadeOutEffectEnabled && resizing == false ) {
                    fadeOutEffect(scrollProgress);
                }





            // ===============================================================
            // Demo Only
            // ===============================================================

            if ( param == "destroy" ) {
                widget.find(".content-inner-wrap").css('opacity', 1);
                widget.css('transform', 'translate(0px, 0px )');
                widgetBackground.css('background-position', '50%' + backgroundPosition +'%');
            }

        } // applyEffects


        requestAnimationFrame( animate );





}; //featureParallaxEffect






// ===============================================================
// Initialization
// ===============================================================

$(window).on("load",function(e){
    featureParallaxEffect();
});
