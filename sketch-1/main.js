'use strict';

(function main() {

	var renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, {
		transparent: true
	});
	
	document.body.appendChild(renderer.view);

	var stage = new PIXI.Container();

	PIXI.loader
		.add('test', './assets/donut.png')
		.load(function(loader, resources) {
			var test = new PIXI.Sprite(resources['test'].texture);
			console.log(resources);
			test.position.x = window.innerWidth/4;
			test.position.y = window.innerHeight/4;

			test.scale.x = .5;
			test.scale.y = .5;

			stage.addChild(test);

			renderer.render(stage);
		});

	


}());