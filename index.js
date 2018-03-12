"use strict";

let windowWidth = document.body.clientWidth;
let windowHeight = document.body.clientHeight;

function setup() {
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

    let links = document.querySelectorAll('a.hover-glitch');

    function handleMouseOver(e) {
        let element = e.target;
        while(element && element.tagName.toLowerCase() !== 'a') {
            element = element.parentNode;
        }
        if(!element) {
            return;
        }
        let r = animate(element);
        let handleMouseOut = function(e) {
            element.removeEventListener('mouseout', handleMouseOut);
            r.stop();
        };
        element.addEventListener('mouseout', handleMouseOut);
    }

    function animate(element) {
        let animating = true;
        let box = element.getBoundingClientRect();

        let update = function() {
            let masks = createMasksWithStripes(3, box, 3);
            let clonedElements = [];

            for(let i=0; i<masks.length; i++) {
                let clonedElement = cloneAndStripeElement(element, masks[i], document.body);
                let childrenElements = Array.prototype.slice.apply(clonedElement.querySelectorAll('path'));
                childrenElements.push(clonedElement);
                for(let k=0; k<childrenElements.length; k++) {
                    let color= tinycolor('hsl(' + Math.round(Math.random() * 360) + ', 80%, 50%)').toRgbString();
                    // let color= tinycolor('hsl(' + Math.round(Math.random() * 360) + ', 80%, 65%)').toRgbString();
                    dynamics.css(childrenElements[k], {
                        color: color, 
                        fill: color
                    });
                }
                clonedElement.style.display = '';
                clonedElements.push(clonedElement);
            }

            clonedElements.map(function(clonedElement) {
                dynamics.css(clonedElement, {
                    translateX: Math.random() * 10 - 5
                });

                dynamics.setTimeout(function() {
                    dynamics.css(clonedElement, {
                        translateX: 0
                    });
                }, 50);

                dynamics.setTimeout(function() {
                    dynamics.css(clonedElement, {
                        translateX: Math.random() * 5 - 2.5
                    });
                }, 100);

                dynamics.setTimeout(function() {
                    document.body.removeChild(clonedElement);
                }, 150);
            });

            dynamics.setTimeout(function() {
                if(animating) {
                    update();
                }
                masks.map(function(mask) {
                    let maskElement = document.querySelector('#' + mask);
                    maskElement.parentNode.removeChild(maskElement);
                });
            }, Math.random() * 1000);
        };

        update();

        return {
            stop: function() {
                animating = false;
            }
        };
    }

    if(!('ontouchstart' in window)) {
        Array.prototype.map.call(links, function(link) {
            link.addEventListener('mouseover', handleMouseOver)
        })
    }
}

function cloneAndStripeElement(element, clipPathName, parent) {
    let box = element.getBoundingClientRect();
    let parentBox = parent.getBoundingClientRect();
    
    element = element.cloneNode(true);
    element.removeAttribute('id');
    box = {
        top: box.top - parentBox.top, 
        left: box.left - parentBox.left, 
        width: box.width, 
        height: box.height
    };

    let style = window.getComputedStyle(element);
    dynamics.css(element, {
        position: 'absolute', 
        left: Math.round(box.left + window.scrollX), 
        top: Math.round(box.top + window.scrollY), 
        width: Math.ceil(box.width), 
        height: Math.ceil(box.height),
        // left: box.left + window.scrollX, 
        // top: box.top + window.scrollY, 
        // width: box.width, 
        // height: box.height, 
        display: 'none', 
        pointerEvents: 'none', 
        // background: '#101214', 
        background: window.getComputedStyle(document.documentElement).getPropertyValue('--el-white'), 
        fontSize: style.fontSize, 
        fontFamily: style.fontFamily, 
        color: style.color, 
        textDecoration: style.textDecoration
    });
    parent.appendChild(element);
    element.style['clip-path'] = 'url(#' + clipPathName + ')';
    console.log(element.style['clip-path']);
    element.style['-webkit-clip-path'] = 'url(#' + clipPathName + ')';

    return element;
}

let totalMaskIdx = 0;
function createMasksWithStripes(count, box, averageHeight=10) {
    console.log(box);
    let masks = [];
    for(let i=0; i<count; i++)
        masks.push([]);
    let maskNames = Array.from({length: count}, (v, k) => 'clipPath' + (totalMaskIdx + k));
    totalMaskIdx += masks.length;
    let maskIdx = 0;
    let x = 0;
    let y = 0;
    let stripeHeight = averageHeight;
    while(true) {
        let w = Math.max(stripeHeight * 10, Math.round(Math.random() * box.width));
        console.log(w);
        console.log(maskIdx);
        console.log(masks[maskIdx]);
        masks[maskIdx++].push('M ' + x + ',' + y + ' L ' + (x+w) + ',' + y +' L ' + (x+w) + ',' + (y + stripeHeight) + ' L ' + x + ',' + (y+stripeHeight) + ' Z');
        if(maskIdx >= masks.length) {
            maskIdx = 0;
        }

        x += w;
        if(x > box.width) {
            x = 0;
            y += stripeHeight;
            stripeHeight = Math.round(Math.random() * averageHeight + averageHeight / 2);
        }
        if(y >= box.height) {
            break;
        }
    }
    console.log(maskIdx);
    console.log(masks[0]);
    console.log(masks[1]);
    console.log(masks[2]);

    masks.forEach(function(rects, i) {
        let element = createSvgElement('<clipPath id="' + maskNames[i] + '"><path d="' + rects.join(' ') + '" fill="white"></path></clipPath>');
        document.querySelector('#clip-paths g').appendChild(element);
    });

    // let a = document.querySelector('#'+maskNames[0]);
    // console.log(a);

    return maskNames;
}

function createElement(template) {
    let element = document.createElement('div');
    element.innerHTML = template.trim();
    return element.firstChild;
}

function createSvgElement(template) {
    let element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    element.innerHTML = template.trim();
    console.log(element.innerHTML);
    return element.firstChild;
}

function createSvgElementOld(template) {
    let element = createElement('\n<svg version"1.1" xmls="http://www.w3.org/2000/svg" xmls:xlink=http://www.w3.org/1999/xlink>' + template.trim() + '</svg>\n');
    return element;
}

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

setup();