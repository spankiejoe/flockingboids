define(function () {

    var exports = function (options) {

        "use strict";

        this.settings = options || {};

        // Settings
        this.fps = this.settings.fps || 120;
        this.interval = 1000.0 / this.fps;
        this.lastFrame = new Date().getTime();
        this.settings.pixelRatio = 1;

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
        this.game = new this.settings.game(this);

        window.addEventListener('resize', this.handleWindowResize.bind(this));

    };

    exports.prototype.setDimensions = function(canvas) {
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;

        // if( window.devicePixelRatio ){
        //     this.settings.pixelRatio = window.devicePixelRatio;
        //     this.width = this.width * window.devicePixelRatio;
        //     this.height = this.height * window.devicePixelRatio;
        // }

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
        var end = new Date().getTime();
        this.updateStats(end - start);
        this.lastFrame = start;
    };

    exports.prototype.update = function (time) {
        this.game.update(time);
    };

    exports.prototype.draw = function () {
        this.bufferContext.clearRect(0, 0, this.width, this.height);
        this.game.draw(this.bufferContext);
        this.drawStats(this.bufferContext);
        
        // This will give the boids their tail
        this.canvasContext.globalCompositeOperation = "source-over";
        this.canvasContext.fillStyle = "rgba(0,0,0,0.25)";
        this.canvasContext.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.canvasContext.globalCompositeOperation = "lighter";    

        // Clear frame around stats
        this.canvasContext.clearRect(15, 10, 60, 25);

        this.canvasContext.drawImage(this.buffer, 0, 0);
    };

    exports.prototype.updateStats = function (time) {
        if (this.stats.show) {
            this.stats.fps = 1000 / time;
        }
    };

    exports.prototype.drawStats = function (context) {
        if (this.stats.show) {
            context.fillStyle = 'white';
            context.font = '10px Monaco, monospace';
            context.fillText("FPS   " + Math.min(this.fps, Math.round(this.stats.fps)), 15, 20);
            context.fillText("Boids " + Math.round(this.game.flock.length), 15, 32);
        }
    };

    exports.prototype.handleWindowResize = function(event) {

        // Set canvas dimensions.
        this.setDimensions( this.canvas );

        // GO!
        this.game = new this.settings.game(this);

    };

    return exports;

});