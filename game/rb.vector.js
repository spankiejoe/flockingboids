define(function () {

    function Vector(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    Vector.prototype.add = function(v) {
    	this.x += v.x;
    	this.y += v.y;
    	this.z += v.z;
		return this;
	};

   	Vector.prototype.distance = function(v) {
        var dx = this.x - v.x,
            dy = this.y - v.y,
            dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
   	};

   	Vector.prototype.subtract = function(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
   	};

   	Vector.prototype.normalize = function() {
		var m = this.magnitude();
		if (m > 0) {
			this.divide(m);
		}
		return this;
   	};

   	Vector.prototype.multiply = function(v) {
		if (typeof v === 'number') {
   	    	this.x *= v;
   	   		this.y *= v;
   	    	this.z *= v;
   	  	} else {
   	    	this.x *= v.x;
   	    	this.y *= v.y;
   	    	this.z *= v.z;
   	  	}
   	  	return this;
   	};

   	Vector.prototype.magnitude = function() {
		var x = this.x,
			y = this.y,
			z = this.z;
		return Math.sqrt(x * x + y * y + z * z);
   	};

   	Vector.prototype.divide = function(v) {
		if (typeof v === 'number') {
			this.x /= v;
			this.y /= v;
			this.z /= v;
		} else {
			this.x /= v.x;
			this.y /= v.y;
			this.z /= v.z;
		}
		return this;
   	};

   	Vector.prototype.limit = function(high) {
		if (this.magnitude() > high) {
			this.normalize();
			this.multiply(high);
        }
   	};


    return Vector;

});