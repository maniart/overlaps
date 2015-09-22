var renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, {
    transparent: true,
    antialias: true,
    autoResize: true,
    resolution: window.devicePixelRatio || 2
});

document.body.appendChild(renderer.view);

var stage = new PIXI.Container();
var graphics = new PIXI.Graphics();

function Agent(config) {
    this.graphics = new PIXI.Graphics();
    this.graphics.lineStyle(1, 0x000000, 1);
    this.count = 0;
    this.pos = new PIXI.Point(config.x, config.y);
}
Agent.prototype.animate = function animate() {
    var _animate = function _animate() {
        this.graphics.clear();
        this.graphics.lineStyle(1, 0x000000, 1);
        this.count += 0.01;
        this.graphics.drawCircle(this.pos.x, this.pos.x, ( Math.sin(this.count) * 70 ));
        stage.addChild(this.graphics);
        renderer.render(stage);
        //console.log('run');
//        requestAnimationFrame(_animate);
    }.bind(this);


    _animate();
    return this;

};

graphics.lineStyle(10, 0x000000, 1);
graphics.drawCircle(window.innerWidth / 2, window.innerHeight / 2, 50);
graphics.position = {
    x: 0,
    y: 0
};

stage.addChild(graphics);
var count = 0;
function animate() {
    graphics.clear();

    graphics.lineStyle(1, 0x000000, 1);
    count += 0.01;
    graphics.drawCircle(window.innerWidth / 2, window.innerHeight / 2,(  Math.sin(count) * 70 ));
    requestAnimationFrame(animate);
    renderer.render(stage);
}
animate();

var b = new Agent({x: 400,y:50});
function foo() {
  b.animate.call(b);
  requestAnimationFrame(foo);
}
foo();

renderer.render(stage);
