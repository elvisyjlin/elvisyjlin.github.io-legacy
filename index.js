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

    let elements = document.querySelectorAll('.say-hi');
    Array.prototype.map.call(elements, function(element) {
        element.addEventListener('mouseenter', function(e) {
            if(!e.target._said) {
                // console.log(element.offsetLeft);
                // console.log(element.offsetTop);
                // console.log(element.offsetWidth);
                // console.log(element.offsetHeight);
                let container = $('#header');
                let originX = element.offsetLeft + element.offsetWidth / 2;
                let originY = element.offsetTop + element.offsetHeight / 2;
                e.target._said = true;
                let sampled_angles = [];
                console.log(Math.PI*2/8);
                ['Hello', '你好', 'こんにちは', '안녕하세요'].forEach(function(text) {
                    let radius = Math.random() * 150 + 100;
                    let angle;
                    do {
                        angle = Math.random() * Math.PI*2;
                    } while(
                        between(angle, Math.PI/4, Math.PI/4*3) || 
                        sampled_angles.some((angle_) => { return angleDelta(angle, angle_) < Math.PI*2/8; })
                    )
                    sampled_angles.push(angle);
                    let dx = Math.cos(angle) * radius;
                    let dy = Math.sin(angle) * radius;
                    flyingText(text, container, originX, originY, originX+dx, originY+dy);
                });
                console.log(sampled_angles);
            }
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
    element._said = false;
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
        complete: function() {
            element._playing = false;
            element._said = false;
        }
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

function flyingText(text, container, fromX, fromY, toX, toY) {
    let sentence = $('<span>')
                   .css('position', 'absolute')
                   .css('visibility', 'hidden')
                   .appendTo(container);
    let innerWrap = $('<span>').appendTo(sentence);
    let innerText = $('<span>').text(text).appendTo(innerWrap);
    sentence.css('top', fromY - sentence.height() / 2)
            .css('left', fromX - sentence.width() / 2)
            .css('visibility', 'visible');
    dynamics.animate(sentence[0], {
        translateX: toX - fromX, 
        translateY: toY - fromY
    }, {
        type: dynamics.easeOut, 
        friction: 300, 
        duration: 1500, 
        delay: 0
    });
    dynamics.animate(innerWrap[0], {
        opacity: 0
    }, {
        type: dynamics.easeOut, 
        friction: 50, 
        duration: 1300, 
        delay: 700, 
        complete: function() {
            sentence.remove();
        }
    });
}

function between(x, a, b) {
    return x > a && x < b;
}

function angleDelta(a, b) {
    return Math.min((2*Math.PI) - Math.abs(a - b), Math.abs(a - b));
}