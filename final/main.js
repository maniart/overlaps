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
var grid = document.querySelector('#grid');
var gridCtx = grid.getContext('2d');
var GRID_RESOLUTION_X = 20;
var GRID_RESOLUTION_Y = 20;
var initialGridSideSize = grid.width;
var scaleFactor = window.innerHeight / grid.height;
var lastImageData;

function drawGrid(canvas, resolutionX, resolutionY) {
    var i = 0;
    var j = 0;
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var cellWidth = width / resolutionX;
    var cellHeight = height / resolutionY;
    ctx.lineWidth = 0.2;
    for(i; i < width; i += cellWidth) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.closePath();
        ctx.stroke();
    }
    for(j; j < width; j += cellHeight) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.closePath();
        ctx.stroke();
    }
}

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

function drawRawImage(cameraInput, output) {
    var ctx = output.getContext('2d');
    var smallInputSide = Math.min(cameraInput.width, cameraInput.height);
    ctx.drawImage(cameraInput, 0, 0, smallInputSide, smallInputSide, 0, 0, output.width, output.height);
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
    var _diff;
    while(i < length * accuracy) {
        average1 = (input1[i*4] + input1[i*4+1] + input1[i*4+2]) / 2.5;
        average2 = (input2[i*4] + input2[i*4+1] + input2[i*4+2]) / 2.5;
        _diff = threshold(abs(average1 - average2));
        output[i*4] = _diff;
        output[i*4+1] = _diff;
        output[i*4+2] = _diff;
        output[i*4+3] = 0xFF;
        ++i;
    }
}

function blend(inputCtx, outputCtx, width, height) {
    var sourceData = inputCtx.getImageData(0, 0, width, height);
    var blendedData;
    if(!lastImageData) lastImageData = inputCtx.getImageData(0, 0, width, height);
    blendedData = inputCtx.createImageData(width, height);
    diff(blendedData.data, sourceData.data, lastImageData.data, .25);
    outputCtx.putImageData(blendedData, 0, 0);
    lastImageData = sourceData;
}

function sweep(canvas, resolutionX, resolutionY, sensitivity) {
    var ctx = canvas.getContext('2d');
    var i;
    var j;
    var k = 0;
    var cellWidth = canvas.width / resolutionX;
    var cellHeight = canvas.height / resolutionY;
    var cellImageData;
    var average = 0;
    for(i = 0; i < 400; i += cellWidth) {
        for(j = 0; j < 400; j += cellHeight) {
            cellImageData = ctx.getImageData(i, j, cellWidth, cellHeight).data;
            while(k < cellImageData.length / 4) {
                average += (cellImageData[k*4] + cellImageData[k*4+1] + cellImageData[k*4+2]) / 3;
                ++k;
            }
            average = Math.round(average / (cellImageData.length / 4));
            gridCtx.beginPath();
            gridCtx.rect(i, j, cellWidth, cellHeight);
            if(average > sensitivity) {
                gridCtx.fillStyle = '#000000';
            } else {
                gridCtx.fillStyle = '#ffffff';
            }
            gridCtx.fill();
            gridCtx.closePath();
            average = 0;
            k = 0;
        }
    }

}

function scaleSquareCanvas(canvas, factor) {
    var size = canvas.width * factor;
    canvas.height = size;
    canvas.width = size;
    canvas.getContext('2d').scale(factor, factor);
}

function loop() {
    drawRawImage(cameraOutput, rawImage);
    blend(rawImageCtx, diffImageCtx, 400, 400);
    sweep(diffImage, GRID_RESOLUTION_X, GRID_RESOLUTION_Y, 10);
    requestAnimFrame(loop);
}

function init() {
    //drawGrid(grid, GRID_RESOLUTION_X, GRID_RESOLUTION_Y);
    mirror(rawImage);
    scaleSquareCanvas(grid, scaleFactor);
    captureFromCamera(cameraOutput);
    loop();
}

init();
