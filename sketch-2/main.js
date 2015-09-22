'use strict';


var renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, {
	transparent: true,
	antialias: true
});

document.body.appendChild(renderer.view);

var graphics = new PIXI.Graphics();

console.log(graphics);
graphics.lineStyle(2);
//graphics.beginFill(0x000000, 0.5);
var circle = graphics.drawCircle(470, 200,100);

var count = 0;
var radius = 0;

function animate() {
	count += 0.1;
	requestAnimationFrame(animate);
	var temp = graphics.drawCircle(470, 200, Math.sin(count) * 100);
	temp.lineStyle(0.5);
	temp.beginFill(0x000000, 0.5)
	graphics.addChild(temp);

}


graphics.addChild(circle);

renderer.render(graphics);

animate();



