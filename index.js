/*
 *  index.js
 *
 *  My Javascript
 */

"use strict";

/* setup */
(function() {
    let texts = document.querySelectorAll('.h-bouncing-text');
    Array.prototype.map.call(texts, function(text) {
        text = wrapContent(text);
        text._playing = false;
        text._force = false;
        text.addEventListener('mouseenter', function(e) {
            if(e.target._force || !e.target._playing) horizontalBounce(text);
        });
    });

    texts = document.querySelectorAll('.v-bouncing-text');
    Array.prototype.map.call(texts, function(text) {
        text = wrapContent(text);
        text._playing = false;
        text._force = false;
        text.addEventListener('mouseenter', function(e) {
            if(e.target._force || !e.target._playing) verticalBounce(text);
        });
    });

    let images = document.querySelectorAll('.v-bouncing-image');
    Array.prototype.map.call(images, function(image) {
        let image1 = wrapItself(image);
        let image2 = wrapItself(image1);
        image._playing = false;
        image._force = false;
        image.addEventListener('mouseenter', function(e) {
            if(e.target._force || !e.target._playing) verticalBounce(image1, image2, image);
        });
    });

    let icons = document.querySelectorAll('.sensitive-icon');
    Array.prototype.map.call(icons, function(icon) {
        icon = wrapItself(icon);
        icon._playing = false;
        icon._force = true;
        icon.addEventListener('mouseenter', function(e) {
            if(e.target._force || !e.target._playing) inExpand(icon);
        });
    });
})();

function wrapItself(element, tag='span') {
    let parent = element.parentNode;
    let wrapper = document.createElement(tag);
    parent.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
}

function wrapContent(element, tag='span') {
    let wrapper = document.createElement(tag);
    wrapper.innerHTML = element.innerHTML;
    element.innerHTML = "";
    element.appendChild(wrapper);
    return wrapper;
}

function horizontalBounce(element) {
    element.style = "display: inline-block;";
    element._playing = true;
    dynamics.animate(element, {
        translateX: 200
    }, {
        type: dynamics.bounce, 
        complete: function() { element._playing = false; }
    });
}

function verticalBounce(element1, element2, element) {
    element1.style = "display: inline-block;";
    element2.style = "display: inline-block;";
    element._playing = true;
    dynamics.animate(element1, {
        scaleY: 0.8
    }, {
        type: dynamics.bounce, 
        duration: 800, 
        bounciness: 0
    })
    dynamics.animate(element2, {
        translateY: -50
    }, {
        type: dynamics.forceWithGravity, 
        bounciness: 0, 
        duration: 450, 
        delay: 50
    });
    dynamics.animate(element1, {
        scaleY: 0.8
    }, {
        type: dynamics.bounce, 
        duration: 800, 
        bounciness: 600, 
        delay: 500
    });
    dynamics.animate(element2, {
        translateY: 10
    }, {
        type: dynamics.bounce, 
        bounciness: 600, 
        duration: 800, 
        delay: 500, 
        complete: function() { element._playing = false; }
    });
}

function inExpand(element) {
    element.style = "display: inline-block;";
    element._playing = true;
    dynamics.animate(element, {
        scaleX: 2, 
        scaleY: 2
    }, {
        type: dynamics.bounce, 
        frequency: 150, 
        complete: function() { element._playing = false; }
    });
}