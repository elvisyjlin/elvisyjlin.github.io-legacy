/*
 *  mv.js
 *
 *  Inspired from Michael Villar's website (http://www.michaelvillar.com).
 *  I rewrote the hover glitch effects myself.
 */

 "use strict";

let windowWidth = document.body.clientWidth;
let windowHeight = document.body.clientHeight;

function createElement(template) {
    let element = document.createElement('div');
    element.innerHTML = template.trim();
    return element.firstChild;
}

function createSvgElement(template) {
    let element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    element.innerHTML = template.trim();
    return element.firstChild;
}

function createSvgElementOld(template) {
    let element = createElement('\n<svg version"1.1" xmls="http://www.w3.org/2000/svg" xmls:xlink=http://www.w3.org/1999/xlink>' + template.trim() + '</svg>\n');
    return element;
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
        background: window.getComputedStyle(document.documentElement).getPropertyValue('--el-white'), 
        fontSize: style.fontSize, 
        fontFamily: style.fontFamily, 
        color: style.color, 
        textDecoration: style.textDecoration
    });
    parent.appendChild(element);
    element.style['clip-path'] = 'url(#' + clipPathName + ')';
    element.style['-webkit-clip-path'] = 'url(#' + clipPathName + ')';

    return element;
}

let totalMaskIdx = 0;
function createMasksWithStripes(count, box, averageHeight=10) {
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

    masks.forEach(function(rects, i) {
        let element = createSvgElement('<clipPath id="' + maskNames[i] + '"><path d="' + rects.join(' ') + '" fill="white"></path></clipPath>');
        document.querySelector('#clip-paths g').appendChild(element);
    });

    return maskNames;
}

/* setup */
(function() {
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
})();