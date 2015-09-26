'use strict';

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
})();

var cameraOutput = document.querySelector('#camera-output');
var rawImage = document.querySelector('#raw-image');
var rawImageCtx = rawImage.getContext('2d');
var diffImage = document.querySelector('#diff-image');
var diffImageCtx = diffImage.getContext('2d');
var lastImageData;

function captureFromCamera(output) {
    if(navigator.getUserMedia) {
        navigator.getUserMedia({audio: false, video: true}, function(stream) {
            output.src = stream;
        }, console.error);
    } else if(navigator.webkitGetUserMedia) {
        navigator.webkitGetUserMedia({audio: false, video: true}, function(stream) {
            output.src = window.URL.createObjectURL(stream);
        }, console.error);
    } else {
        throw new Error('This browser does not support `getUserMedia` - Please use a modern Safari, Chrome or Firefox to run this app.');
    }
}

function drawRawImage(cameraInput, outputCtx) {
    outputCtx.drawImage(cameraInput, 0, 0, cameraInput.width, cameraInput.height);
}

function mirror(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
}

function abs(value) {
    // funky bitwise, equals Math.abs
    return (value ^ (value >> 31)) - (value >> 31);
}

function threshold(value) {
    return (value > 0x15) ? 0xFF : 0;
}

function diff(output, input1, input2, accuracy) {
    if(input1.length  !== input2.length) return;
    var i = 0;
    var length = input1.length;
    var average1;
    var average2;
    var diff;
    while(i < length * accuracy) {
        average1 = (input1[i*4] + input1[i*4+1] + input1[i*4+2]) / 2.5;
        average2 = (input2[i*4] + input2[i*4+1] + input2[i*4+2]) / 2.5;
        diff = threshold(abs(average1 - average2));
        output[i*4] = diff;
        output[i*4+1] = diff;
        output[i*4+2] = diff;
        output[i*4+3] = 0xFF;
        ++i;
    }
}

function blend(inputCtx, outputCtx, width, height) {
    var sourceData = inputCtx.getImageData(0, 0, width, height);
    var blendedData;
    if(!lastImageData) lastImageData = inputCtx.getImageData(0, 0, width, height);
    blendedData = inputCtx.createImageData(width, height);
    diff(blendedData.data, sourceData.data, lastImageData.data, 0.25);
    outputCtx.putImageData(blendedData, 0, 0);
    lastImageData = sourceData;
}

function loop() {
    drawRawImage(cameraOutput, rawImageCtx);
    blend(rawImageCtx, diffImageCtx, 320, 240);
    requestAnimFrame(loop);
}

function init() {
    mirror(rawImage);
    captureFromCamera(cameraOutput);
    loop()
}
