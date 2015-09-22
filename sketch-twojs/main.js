'use strict';

var two = new Two({
	//autostart: true,
	type: Two.Types['webgl'],
	fullscreen: true
}).appendTo(document.body);

var agentProto = {
	initialOpacity: 1,
	circleCount: 5,
	pulseSpeed: 10,
	centerCircleRaduis: 10,
	r: 10,
	x: two.width / 2,
	y: two.height / 2,
	pulses: [],
	pulseCount: 5,
	centerCircle: null,
	drawCenter: function drawCenter() {
		
		var centerCircle = two.makeCircle(this.x, this.y, this.r);
		centerCircle.opacity = 1;
		centerCircle.lineWidth = 0;
		centerCircle.fill = '#000000';
		
		this.centerCircle = centerCircle;

		return this;

	},
	drawPulses: function drawPulses() {
		var pulse;
		_(this.pulseCount).times(function(time) {
			pulse = two.makeCircle(
				this.x,
				this.y,
				this.r * time
			);
			pulse.opacity = 1;
			pulse.stroke = '#000000';
			pulse.fill = 'transparent';
			pulse.lineWidth = 0.5;
			this.pulses.push(pulse);	
		}.bind(this));
		return this;
	
	},
	play: function play() {
		this
			.drawCenter()
			.drawPulses();

		two.bind('update', function(frameCount) {
			_(this.pulses).each(function(pulse) {
				pulse.scale *= 1.1;
			}.bind(this));

		}.bind(this)).play();
		two.update();
		return this;
	}
};

function createAgent() {
	return Object.create(agentProto).play();
}

var agent = {

};

