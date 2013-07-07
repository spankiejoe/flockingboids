define(['components/vector'],function (Vector) {

    function remap(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    var Boid = function (game) {

        "use strict";

        this.game = game;
        //this.radius = 3;

        this.location       = new Vector();
        this.velocity       = new Vector(5*(Math.random()-0.5),5*(Math.random()-0.5),0.01);
        this.acceleration   = new Vector();

        this.maxforce = 0.03;
        // this.maxspeed = 2;

        this.location.x = this.game.runner.width/2;
        this.location.y = this.game.runner.height/2;
        this.location.z = 0;

    };

    Boid.prototype.update = function (time) {
        var settings = this.game.runner.settings;

        var that = this;

        var flocking = this.flocking(this.game.boids);

        var cohesion    = flocking.cohesion; 
        var separation  = flocking.seperation;
        var alignment   = flocking.align;
        
        cohesion.multiply(1.0);
        separation.multiply(1.5);
        alignment.multiply(1.0);

        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
        this.acceleration.add(alignment);

        // Update velocity
        this.velocity.add(this.acceleration);
        
        // Limit speed
        this.velocity.limit(settings.maxSpeed);
        
        this.location.add(this.velocity);
        this.location = this.bound(this.location);
        
        // Reset accelertion to 0 each cycle
        this.acceleration.multiply(0);

        return this;
    };

    Boid.prototype.draw = function (context) {
        var settings = this.game.runner.settings;

        var theta = this.velocity.heading2D();
        var opacity = this.location.z/100

        context.save();
        context.translate(this.location.x, this.location.y);

        // console.log(this.velocity.x + this.velocity.y);
        var speed = this.velocity.distance(new Vector());

        var value = Math.floor( remap(speed, 0, 2, 0, 360) );
        context.fillStyle = 'hsla(' + value + ',50%,50%,' + opacity +')';

        context.beginPath();
        context.arc(0, 0, settings.radius*(this.location.z/100), 0, 2*Math.PI, true);

        context.fill();
        context.closePath();

        context.restore();

    };

    Boid.prototype.bound = function( location ) {

        // Width
        if( location.x < 0 ) location.x = this.game.runner.width;
        if( location.x > this.game.runner.width ) location.x = 0;

        // Height
        if( location.y < 0 ) location.y = this.game.runner.height;
        if( location.y > this.game.runner.height ) location.y = 0;

        // Depth
        if( location.z < 0 ){
            location.z = 1;
            this.velocity.z *= -1;
        }
        if( location.z > 100 ){
            location.z = 99;
            this.velocity.z *= -1;
        }

        return location;

    };

    Boid.prototype.flocking = function( flock ) {
        var settings = this.game.runner.settings;

        var flocking = {};

        var seperateSteer = new Vector();
        var velocitySum = new Vector();
        var locationSum = new Vector();

        var seperateCount = 0;
        var neighborCount = 0;

        for (var i = flock.length - 1; i >= 0; i--) {
            var other = flock[i];
            var distance = this.location.distance(other.location);

            if(distance > 0){
                // Seperation
                if ( distance < settings.desiredSeparation ) {
                    var difference = new Vector();
                        difference.add(this.location).subtract(other.location);
                        difference.normalize();
                        difference.divide(distance);
                        seperateSteer.add(difference);
                    seperateCount += 1;
                }

                // Alignment (velocity) and Cohesion (location)
                if ( distance < settings.neighborDistance ) {
                    velocitySum.add(other.velocity);
                    locationSum.add(other.location);
                    neighborCount++;
                } 
            }
        };
        
        if( seperateCount > 0 ){
            // Seperate
            seperateSteer.divide(seperateCount);
        }

        // Align
        if( neighborCount > 0 ){
            velocitySum.divide(neighborCount);
            velocitySum.normalize();
            velocitySum.multiply(settings.maxSpeed);
            var steer = new Vector(velocitySum);
                steer.subtract(this.velocity).limit(settings.maxForce);
            flocking.align = steer;

            // Cohesion
            locationSum.divide(neighborCount);
            flocking.cohesion = this.seek(locationSum);

        } else {
            flocking.align = new Vector();
            flocking.cohesion = new Vector();
        }

        // Seperate
        if(seperateSteer.magnitude() > 0){
            seperateSteer.normalize();
            seperateSteer.multiply(settings.maxSpeed);
            seperateSteer.subtract(this.velocity);
            seperateSteer.limit(settings.maxForce);
        }

        flocking.seperation = seperateSteer;

        return flocking;


    };

    Boid.prototype.seek = function(target) {
        var settings = this.game.runner.settings;


        var desired = new Vector(target);

            desired.subtract(this.location);

            desired.normalize();
            desired.multiply(settings.maxSpeed);

           // Steering = Desired minus Velocity
            var steer = desired.subtract(this.velocity);
                steer.limit(settings.maxForce);

           return steer;

    };

    return Boid;

});