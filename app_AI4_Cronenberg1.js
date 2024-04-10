let canvasWidth;
let canvasHeight;
let mainCanvas;

const weight = [
	1/16, 1/8, 1/16,
	 1/8, 1/4,  1/8,
	1/16, 1/8, 1/16,
];

let counts = [0,0,0,0];
let regenerate_next = true;

const agents = [];
let trail; 

let gfx;
let W = 400;
let H = 400;

let controller = function(){
    this.sensor_distance =  10;
	this.sensor_angle = 40/180*Math.PI;
	this.turning_speed = 40/180*Math.PI; 
	this.speed = 3;
	this.decay_factor = 0.9;
	this.deposit_amount = 0.2;
	this.num_agents = 5000;
	this.start_in_circle = false; 
	this.highlight_agents = false;
	this.random_turning = false;
	this.wrap_around = true;
}
let settings = new controller();

function sim_step(agents, trail, width, height) {
	function index(x, y) {
		return x + y * width;
	}

	function step_sense_and_rotate() {
		for (let agent of agents) {
			function sense_relative_angle(theta) {
				return trail[index(
					Math.round(agent.x + Math.cos(agent.heading + theta) * settings.sensor_distance),
					Math.round(agent.y + Math.sin(agent.heading + theta) * settings.sensor_distance)
				)];
			}

			const sense_left   = sense_relative_angle(settings.sensor_angle);
			const sense_middle = sense_relative_angle(0);
			const sense_right  = sense_relative_angle(-settings.sensor_angle);

			const modified_turning = (settings.random_turning ? (Math.random() * 0.5 + 0.5) : 1) * settings.turning_speed;
			let option = -1;
			if (sense_middle > sense_left && sense_middle > sense_right) {
				option = 0;
			} else if (sense_left > sense_right) {
				option = 1;
				agent.heading += modified_turning;
			} else if (sense_right > sense_left) {
				option = 2;
				agent.heading -= modified_turning;
			} else {
				option = 3;
				agent.heading += Math.round(Math.random() * 2 - 1) * settings.turning_speed;
			}
			counts[option] += 1
			agent.last_option = option;
		}
	}

	function step_move() {
		for (let agent of agents) {
			agent.x += settings.speed * Math.cos(agent.heading);
			agent.y += settings.speed * Math.sin(agent.heading);
			if (settings.wrap_around) {
				agent.x = (agent.x + width) % width;
				agent.y = (agent.y + height) % height;
			}
		}
	}

	function step_deposit() {
		for (let agent of agents) {
			const x = Math.round(agent.x);
			const y = Math.round(agent.y);
			if (x <= 0 || y <= 0 || x >= width-1 || y >= height-1)
				continue;
			trail[index(x, y)] += settings.deposit_amount;
		}
	}

	function step_diffuse_and_decay() {
		let old_trail = Float32Array.from(trail);
		for (let y=1; y<height-1; ++y) {
			for (let x=1; x<width-1; ++x) {
				const diffused_value = (
					old_trail[index(x-1, y-1)] * weight[0] +
					old_trail[index(x  , y-1)] * weight[1] +
					old_trail[index(x+1, y-1)] * weight[2] +
					old_trail[index(x-1, y  )] * weight[3] +
					old_trail[index(x  , y  )] * weight[4] +
					old_trail[index(x+1, y  )] * weight[5] +
					old_trail[index(x-1, y+1)] * weight[6] +
					old_trail[index(x  , y+1)] * weight[7] +
					old_trail[index(x+1, y+1)] * weight[8]
				);

				trail[index(x, y)] = Math.min(1.0, diffused_value * settings.decay_factor);
			}
		}
	}

	step_sense_and_rotate();
	step_move();
	step_deposit();
	step_diffuse_and_decay();
	return trail;
}

function render(trail, agents) {
	gfx.loadPixels();
	const max_brightness = settings.highlight_agents ? 50 : 255;
	let i = 0;
	for (let y=0; y<W; ++y) {
		for (let x=0; x<H; ++x) {
			const value = trail[i];
			const brightness = Math.floor(value * max_brightness);
			gfx.pixels[i*4+0] = brightness;
			gfx.pixels[i*4+1] = brightness;
			gfx.pixels[i*4+2] = brightness;
			gfx.pixels[i*4+3] = 255;
			i++;
		}
	}
	if (settings.highlight_agents) {
		for (let agent of agents) {
			let color = [0,0,0];
			switch (agent.last_option) {
				case 0: color = [150, 50, 50]; break;
				case 1: color = [ 50,150, 50]; break;
				case 2: color = [ 50, 50,150]; break;
				case 3: color = [255,255,255]; break;
			}
			gfx.pixels[(Math.floor(agent.x)+Math.floor(agent.y)*W)*4+0] = color[0];
			gfx.pixels[(Math.floor(agent.x)+Math.floor(agent.y)*W)*4+1] = color[1];
			gfx.pixels[(Math.floor(agent.x)+Math.floor(agent.y)*W)*4+2] = color[2];
		}
	}
  gfx.updatePixels();
}

function regenerate() {
		agents.splice(0,agents.length);

		if (settings.start_in_circle) {
			const radius = Math.min(W,H) * 0.3;
			for (let i=0; i<settings.num_agents; ++i) {
				const t = 2 * Math.PI*i/settings.num_agents;
				agents.push({
					x: Math.cos(t) * radius + W / 2,
					y: Math.sin(t) * radius + H / 2,
					heading: t - Math.PI / 2,
				});
			}
		} else {
			for (let i=0; i<settings.num_agents; ++i) {
				agents.push({
					x: Math.random() * W,
					y: Math.random() * H,
					heading: Math.random() * 2 * Math.PI,
				});
			}
		}
		regenerate_next = false;
}

function reset() {
  trail = new Float32Array(W * H);
  regenerate();
}

function setup() {
    mainCanvas = createCanvas(windowWidth * 0.6, windowHeight * 0.6);
    mainCanvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    trail = new Float32Array(W * H);
    gfx = createGraphics(W, H);
    gfx.pixelDensity(1);
	canv2Wid = width;
    canv2Hgt = height;
    if (windowWidth <= 900) {
    canvasWidth = windowWidth;
    canvasHeight = windowWidth * 3 / 4;
    resizeCanvas(canvasWidth, canvasHeight);
    mainCanvas.position((windowWidth - canvasWidth) / 2, (windowHeight - canvasHeight) / 2);
  	}
    settings.sensor_distance = Math.random() * 100 + 1;
    settings.sensor_angle = Math.random() * PI;
    settings.turning_speed = Math.random() * PI;
    settings.speed = Math.random() * 40;
    settings.decay_factor = Math.random();
    settings.deposit_amount = Math.random();
    settings.num_agents = Math.floor(Math.random() * 19999) + 1;
    settings.start_in_circle = Math.random() > 0.5;
    settings.highlight_agents = Math.random() < 0.5;
    settings.random_turning = Math.random() > 0.5;
    settings.wrap_around = Math.random() < 0.5;
    mainCanvas.mousePressed(canvasClickedEvent);
}

function draw() {
  background(220);
  if (regenerate_next) {
    regenerate();
  }
  trail = sim_step(agents, trail, W, H);
  render(trail, agents);
  
  image(gfx,0,0, width, height);
}

function canvasClickedEvent() {
    saveCanvasWithFilename();
}

function saveCanvasWithFilename() {
    save('I_created_with_goreletariat.jpg');
}
