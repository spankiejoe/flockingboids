define(['fb.boid'], function (Boid) {

    var exports = function (runner) {

        "use strict";

        this.runner = runner;
        this.width = this.runner.width;
        this.height = this.runner.height;
        this.mouse = {'x':0,'y':0};

        this.boids = [];

        this.runner.start();

    };

    exports.prototype.update = function (time) {

        if( this.boids.length > this.runner.settings.boids ){
            var delta = this.boids.length - this.runner.settings.boids;
            this.boids.splice(0,delta);
        } else if( this.boids.length < this.runner.settings.boids ){
            var delta = this.runner.settings.boids - this.boids.length;
            for (var i = delta - 1; i >= 0; i--) {
                this.boids.push(new Boid(this));
            };
        }

        for (var i = this.boids.length - 1; i >= 0; i--) {
            this.boids[i].update(time);
        }
    };

    exports.prototype.draw = function (context) {
        context.strokeRect(0, 0, this.width, this.height);
        for (var i = this.boids.length - 1; i >= 0; i--) {
            this.boids[i].draw(context);
        }
    };

    return exports;

});