define(['components/vector'],function (Vector) {

    function remap(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    var Boid = function (game) {

        "use strict";

        this.game = game;
        this.radius = 3;

        this.location       = new Vector();
        this.velocity       = new Vector(5*(Math.random()-0.5),5*(Math.random()-0.5),0.01);
        this.acceleration   = new Vector();

        this.r = 0;
        this.maxforce = 0.03;
        this.maxspeed = 2;

        this.location.x = this.game.width/2;
        this.location.y = this.game.height/2;
        this.location.z = 0;

        this.desiredSeparation = 25;
        this.neighborDistance = 50;

    };

    Boid.prototype.update = function (time) {

        var that = this;

        var flocking = this.flocking(this.game.flock);

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
        this.velocity.limit(this.maxspeed);
        
        this.location.add(this.velocity);
        this.location = this.bound(this.location);
        
        // Reset accelertion to 0 each cycle
        this.acceleration.multiply(0);

        return this;
    };

    Boid.prototype.draw = function (context) {
        var theta = this.velocity.heading2D();
        var opacity = this.location.z/100

        context.save();
        context.translate(this.location.x, this.location.y);

        // console.log(this.velocity.x + this.velocity.y);
        var speed = this.velocity.distance(new Vector());

        var value = Math.floor( remap(speed, 0, 2, 0, 360) );
        context.fillStyle = 'hsla(' + value + ',50%,50%,' + opacity +')';
        
        // context.strokeStyle = 'rgba(255,255,255,' + opacity + ')';
        // context.lineWidth = 1;
        context.beginPath();
        context.arc(0, 0, 6*(this.location.z/100), 0, 2*Math.PI, true);
        // context.moveTo(0,0);
        // context.lineTo(10,10);
        // context.stroke();
        context.fill();
        context.closePath();

        context.restore();

    };

    Boid.prototype.bound = function( location ) {

        // Width
        if( location.x < 0 ) location.x = this.game.width;
        if( location.x > this.game.width ) location.x = 0;

        // Height
        if( location.y < 0 ) location.y = this.game.height;
        if( location.y > this.game.height ) location.y = 0;

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
                if ( distance < this.desiredSeparation ) {
                    var difference = new Vector();
                        difference.add(this.location).subtract(other.location);
                        difference.normalize();
                        difference.divide(distance);
                        seperateSteer.add(difference);
                    seperateCount += 1;
                }

                // Alignment (velocity) and Cohesion (location)
                if ( distance < this.neighborDistance ) {
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
            velocitySum.multiply(this.maxspeed);
            var steer = new Vector(velocitySum);
                steer.subtract(this.velocity).limit(this.maxforce);
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
            seperateSteer.multiply(this.maxspeed);
            seperateSteer.subtract(this.velocity);
            seperateSteer.limit(this.maxforce);
        }

        flocking.seperation = seperateSteer;

        return flocking;


    };

    Boid.prototype.seek = function(target) {


        var desired = new Vector(target);

            desired.subtract(this.location);

            desired.normalize();
            desired.multiply(this.maxspeed);

           // Steering = Desired minus Velocity
            var steer = desired.subtract(this.velocity);
                steer.limit(this.maxforce);

           return steer;

    };

    return Boid;

});