define(['fb.boid'], function (Boid) {

    var exports = function (runner) {

        "use strict";

        this.runner = runner;
        this.width = this.runner.width;
        this.height = this.runner.height;
        this.mouse = {'x':0,'y':0};

        this.flock = [];

        this.runner.start();

    };

    exports.prototype.update = function (time) {

        if(this.runner.stats.fps < 120 && this.flock.length > 10){
            this.flock.pop();
        } else if( this.runner.stats.fps > 240 ){
            this.flock.push(new Boid(this));
        }

        for (var i = this.flock.length - 1; i >= 0; i--) {
            this.flock[i].update(time);
        }
    };

    exports.prototype.draw = function (context) {
        context.strokeRect(0, 0, this.width, this.height);
        for (var i = this.flock.length - 1; i >= 0; i--) {
            this.flock[i].draw(context);
        }
    };

    return exports;

});