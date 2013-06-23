define(['rb.vector'],function (Vector) {

    var Boid = function (game) {

        "use strict";

        this.game = game;
        this.radius = 3;

        this.location       = new Vector();
        this.velocity       = new Vector(Math.random(),Math.random(),Math.random());
        this.acceleration   = new Vector();

        this.r = 0;
        this.maxforce = 0.03;
        this.maxspeed = 2;

        this.location.x = Math.floor(Math.random()*this.game.width);
        this.location.y = Math.floor(Math.random()*this.game.height);
        this.location.z = 0;

        this.desiredSeparation = 25;
        this.neighborDistance = 50;

    };

    Boid.prototype.update = function (time) {

        var that = this;

        var cohesion = this.cohesion(this.game.flock);
        var separation = this.seperate(this.game.flock);
        var alignment = this.align(this.game.flock);
        
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
        var opacity = this.location.z/100
        context.fillStyle = 'rgba(255,255,255,' + opacity + ')';
        context.beginPath();
        context.arc(this.location.x, this.location.y, this.location.z/15, 0, 2*Math.PI, true);
        context.fill();
        context.closePath();
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

    // Separation
    // Method checks for nearby boids and steers away
    Boid.prototype.seperate = function( flock ) {
        var steer = new Vector();
        // PVector steer = new PVector(0, 0, 0);
        var count = 0;
        
        for (var i = flock.length - 1; i >= 0; i--) {
            var other = flock[i];
            var distance = this.location.distance(other.location);
            if ((distance > 0) && (distance < this.desiredSeparation)) {
                var diff = new Vector();
                    diff.add(this.location).subtract(other.location);
                    diff.normalize()
                    diff.divide(distance);
                    steer.add(diff);
                count += 1;
            }
        };

        if( count > 0 ){
            steer.divide(count);
        }

        if(steer.magnitude() > 0){
            steer.normalize();
            steer.multiply(this.maxspeed);
            steer.subtract(this.velocity);
            steer.limit(this.maxforce);
        }

        return steer;


    };

    // Alignment
    // For every nearby boid in the system, calculate the
    // average velocity
    Boid.prototype.align = function( flock ) {

        var sum = new Vector();
        var count = 0;

        for (var i = flock.length - 1; i >= 0; i--) {
            var other = flock[i];
            var distance = this.location.distance(other.location);
            if ((distance > 0) && (distance < this.neighborDistance)) {
              sum.add(other.velocity);
              count++;
            }            
        }

        this.neighbors = count;
        if( count > 0 ){
            sum.divide(count);

            sum.normalize();
            sum.multiply(this.maxspeed);
            var steer = new Vector();
                steer.add(sum);
                steer.subtract(this.velocity);
                steer.limit(this.maxforce);
            return steer;
        } else {
            return new Vector();
        }
    };


    // Cohesion
    // For the average location (i.e. center) of all nearby
    // boids, calculate steering vector towards that location
    Boid.prototype.cohesion = function( flock ) {
        
        var sum = new Vector();
        var count = 0;
        for (var i = flock.length - 1; i >= 0; i--) {
            var other = flock[i];
            var distance = this.location.distance(other.location);
            if ((distance > 0) && (distance < this.neighborDistance)) {
                sum.add(other.location);
                count += 1;
            }
        };
        if(count > 0){
            sum = sum.divide(count);
            return this.seek(sum);
        } else {
            return new Vector();
        }

    };

    Boid.prototype.seek = function(target) {


        var desired = new Vector();

            desired.add(target).subtract(this.location);

            desired.normalize();
            desired.multiply(this.maxspeed);

           // Steering = Desired minus Velocity
            var steer = desired.subtract(this.velocity);
                steer.limit(this.maxforce);

           return steer;

    };

    return Boid;

});