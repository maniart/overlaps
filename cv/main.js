'use strict';

var cameraOutput = document.querySelector('#camera-output');
var rawImage = document.querySelector('#raw-image');
var rawImageCtx = rawImage.getContext('2d');
var diffImage = document.querySelector('#diff-image');
var diffImageCrx = diffImage.getContext('2d');
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

function blend(inputCtx, outputCtx, width, height) {
    var sourceData = inputCtx.getImageData(0, 0, width, height);
    var blendedData;
    if(!lastImageData) lastImageData = inputCtx.getImageData(0, 0, width, height);
    blendedData = inputCtx.createImageData(width, height);
    diff(blendedData.data, sourceData, lastImageData, 2.5);
    outputCtx.putImageData(blendedData, 0, 0);
    lastImageData = sourceData;
}
