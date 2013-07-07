define(['components/gui'], function (GUI) {


    var exports = function (Game, options) {

        "use strict";

        this.settings = options || {};

        // Settings
        this.fps = this.settings.fps || 120;
        this.interval = 1000.0 / this.fps;
        this.lastFrame = new Date().getTime();
        this.settings.pixelRatio = 1;

        this.settings.radius = options.radius || 5;
        this.settings.maxSpeed = options.maxSpeed || 2;
        this.settings.boids = options.boids || 200;
        this.settings.maxForce = options.maxForce || 0.02;
        this.settings.neighborDistance = options.neighborDistance || 50;
        this.settings.desiredSeparation = options.desiredSeparation || 25;

        this.gui = new GUI();
        this.gui.add(this.settings, 'radius', 0, 100);
        this.gui.add(this.settings, 'maxSpeed', 0, 30);
        this.gui.add(this.settings, 'boids', 0, 1000);
        this.gui.add(this.settings, 'maxForce', -1, 1);
        this.gui.add(this.settings, 'neighborDistance', 0, 200);
        this.gui.add(this.settings, 'desiredSeparation', 0, 200);

        // Stats
        this.stats = {
            'show': this.settings.stats || true
        };

        // Initialize canvas.
        this.element = this.settings.element || document.body;
        this.canvas = this.createCanvas();
        this.element.appendChild(this.canvas);
        this.canvasContext = this.canvas.getContext('2d');

        // Set canvas dimensions.
        this.setDimensions( this.canvas );

        // GO!
        this.game = new Game(this, this.settings);

        window.addEventListener('resize', this.handleWindowResize.bind(this));

    };

    exports.prototype.setDimensions = function(canvas) {
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;

        // Set dimensions.
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Initialize buffer.
        this.buffer = this.createCanvas();
        this.buffer.width = this.width;
        this.buffer.height = this.height;
        this.bufferContext = this.buffer.getContext('2d');
    };

    exports.prototype.createCanvas = function () {
        return document.createElement('canvas');
    };

    exports.prototype.start = function () {
        setInterval(this.loop.bind(this), this.interval);
    };

    exports.prototype.loop = function () {
        var start = new Date().getTime();
        this.update((start - this.lastFrame) / 1000.0);
        this.draw();
        this.lastFrame = start;
    };

    exports.prototype.update = function (time) {
        this.game.update(time);
    };

    exports.prototype.draw = function () {
        this.bufferContext.clearRect(0, 0, this.width, this.height);
        this.game.draw(this.bufferContext);
        
        // This will give the boids their tail
        this.canvasContext.globalCompositeOperation = "source-over";
        this.canvasContext.fillStyle = "rgba(0,0,0,0.25)";
        this.canvasContext.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.canvasContext.globalCompositeOperation = "lighter";    

        // Clear frame around stats
        this.canvasContext.clearRect(15, 10, 60, 25);

        this.canvasContext.drawImage(this.buffer, 0, 0);
    };


    exports.prototype.handleWindowResize = function(event) {

        // Set canvas dimensions.
        this.setDimensions( this.canvas );

        // GO!
        // this.game = new this.settings.game(this);

    };

    return exports;

});