//Universal Attraction: web-based n-body simulator by Liav Koren is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//Based on a work at http://www.liavkoren.com/nBody_main.html.

var nb = {
	numBodies: 3,
	trailLength: 5000,
	bodyID_Counter: 0
};
nb.Body = function(mass) {		
	nb.bodyID_Counter++;	
	this.id = nb.bodyID_Counter;	
	this.mass = mass || 20.0;
	this.vel = new THREE.Vector3(2.5-Math.random()*5, 2.5-Math.random()*5, 2.5-Math.random()*5);
	this.starMesh = new THREE.Mesh(this.starGeom, this.starMaterial);
	var scale_factor = 0.25 + (Math.log(mass)/Math.log(50))
	var scale_vector = new THREE.Vector3(scale_factor, scale_factor, scale_factor)
	this.starMesh.scale = scale_vector
	this.starMesh.position = new THREE.Vector3(3 - Math.random()*5, 3 - Math.random()*5, 3 - Math.random()*5);		
	var trail_geom = new THREE.Geometry();	
	this.trail = new THREE.ParticleSystem(trail_geom, this.trail_material); 
	this.initTrail();
	this.init_vel_arrow();
	this.pick_box = new THREE.Mesh(this.pick_box_geom, this.pick_box_mat);	
	this.pick_box.position = this.pos();
	//this.pick_box.scale = new THREE.Vector3(this.mass/2, this.mass/2, this.mass/2)
	this.pick_box.scale = scale_vector.multiplyScalar(1.1)
	scene.add(this.starMesh);
	scene.add(this.trail);
	scene.add(this.pick_box);	
	this.pick_box.visible = false;
	this.vel_x = this.vel.x;	//this is really clunky, used for adjusting position/velocity via gui, refactor this.	
	this.vel_y = this.vel.y;	
	this.vel_z = this.vel.z;	
	this.pos_x = this.pos().x
	this.pos_y = this.pos().y
	this.pos_z = this.pos().z	
	this.pos_widget;
	this.vel_widget;

}
nb.Body.prototype.starGeom = new THREE.SphereGeometry(0.15, 12, 10);
nb.Body.prototype.toggle_camera_lock = function() {
	if (nb.nBodies.camera_target != this.pos()) {
		controls.target = this.pos();
		nb.nBodies.camera_target = this.pos();
		controls.noPan = true;
	} else {
		controls.target = new THREE.Vector3().copy(this.pos())
		controls.noPan = false;
		nb.nBodies.camera_target = null;
	}
}
var sprite = THREE.ImageUtils.loadTexture( "textures/ball_flat_white.png" );
nb.Body.prototype.starMaterial = new THREE.MeshLambertMaterial( 
	{ambient: 0xeeccaa, color: 0xeeccaa, shading: THREE.FlatShading, emissive: 0x100000, wireframe:true, fog:false } )
nb.Body.prototype.trail_material = new THREE.ParticleBasicMaterial(
	{size:0.075, color: 0xffffff, map: sprite, transparent: true, opacity: 0.3, 
	fog: true, blending: THREE.AdditiveBlending, depthTest: false}); // vertexColors: true, size values between 0.05 and 0.1 are nice.
nb.Body.prototype.trail_material.side = THREE.DoubleSide;
//nb.Body.prototype.trail_material.setHSL(1.0, 0.8, 0.6);
//nb.Body.prototype.pick_box_geom = new THREE.CubeGeometry(0.4, 0.4, 0.4);
nb.Body.prototype.pick_box_geom = new THREE.SphereGeometry(0.155, 12, 10);
nb.Body.prototype.pick_box_mat = new THREE.MeshBasicMaterial({color:0x801010, wireframe:true});
nb.Body.prototype.set_pos = function(v){
	if (v instanceof THREE.Vector3) {
		this.starMesh.position.copy(v);
		return v
	} else {
		throw "Not a vector."
	}
}
nb.Body.prototype.pos = function() {
	return this.starMesh.position
}
// return the accel vector on a body, produced by all other bodies:
nb.Body.prototype.accel = function(body_array, eps) { 
	var a = new THREE.Vector3(0,0,0);
	for (var i = 0; i < body_array.length; i++) {					
		if (!(body_array[i] === this)) { //refactor internal to something less ugly. PS -- I miss you "unless"! Love you!
			var r = new THREE.Vector3(0,0,0); 
			r.copy(body_array[i].pos());
			r.sub(this.pos()); //get the distance between bodies.
			var r2 = r.dot(r) + eps*eps;
			var r3 = r2*Math.sqrt(r2);						
			a.add(r.multiplyScalar(body_array[i].mass/r3)); //toDo: create copy method for body
		}
	}
	return a;
}
nb.Body.prototype.ekin = function() {
	return 0.5*this.mass*this.vel.dot(this.vel);
}
nb.Body.prototype.epot = function(body_array){
	ep = 0.0;
	for (var i = 0; i < body_array.length; i++) {					
		body = body_array[i]; 					
		if (!(body === this)) {
			var r = new THREE.Vector3(0,0,0); 
			r.copy(body.pos());
			r.sub(this.pos() + n.eps*n.eps); //get the distance between bodies.
			ep += -1*body.mass*this.mass/Math.sqrt(r.dot(r));
		}
	}
	return ep;
}
nb.Body.prototype.updateTrail = function() {
	var t = this.trail;
	if (t.geometry.vertices.length > nb.trailLength) {
		t.geometry.vertices.shift();
	}
	t.geometry.vertices[t.geometry.vertices.length] = new THREE.Vector3().copy(this.pos());
	t.geometry.verticesNeedUpdate = true;
}
nb.Body.prototype.initTrail = function() {
	var t = this.trail.geometry.vertices;
	//var c = this.trail.geometry.colors;
	//var tempCol = new THREE.Color(0xffffff);
	for (var i = 0; i < nb.trailLength; i++) {
	//	c.push(tempCol);
		t.push(new THREE.Vector3(1000,1000,1000)); //better fix for this? 
	}
}
nb.Body.prototype.vel_arrow_mat = new THREE.LineBasicMaterial({color:0x301010});
nb.Body.prototype.init_vel_arrow = function(){
	this.vel_arrow_geom = new THREE.Geometry();
	this.vel_arrow = new THREE.Line(this.vel_arrow_geom, this.vel_arrow_mat);
	this.vel_arrow.geometry.vertices[0] = new THREE.Vector3().copy(this.pos());
	this.vel_arrow.geometry.vertices[1] = new THREE.Vector3().copy(this.pos()).add(this.vel);
	scene.add(this.vel_arrow);
	this.vel_arrow.visible = false;
};
nb.Body.prototype.toggle_velocity = function() {
	this.update_velocity_arrow_geometry();
	this.vel_arrow.visible = !this.vel_arrow.visible;
	this.vel_arrow.geometry.verticesNeedUpdate = true;
	return this;
};
nb.Body.prototype.update_velocity_arrow_geometry = function() {
	this.vel_arrow.geometry.vertices[0] = new THREE.Vector3().copy(this.pos());
	this.vel_arrow.geometry.vertices[1] = new THREE.Vector3().copy(this.pos()).add(this.vel);	
	this.vel_arrow.geometry.verticesNeedUpdate = true;
	return this;	
}
nb.Body.prototype.to_s = function() {
	console.log("Mass = ", this.mass);
	console.log("Pos = ", this.pos());
	console.log("Vel = ", this.vel);
	console.log("ekin = ", this.ekin());
	console.log("epot = ", this.epot(n.bodies));  //is there a more general way to get this reference?
	console.log("eTot = ", this.ekin() + this.epot(n.bodies));
	console.log("=======") 
}	
nb.Body.prototype.set_vel_component = function(v, widget) {
	if (v.x) {
		this.vel.x = v.x
	} else if (v.y) {
		this.vel.y = v.y
	} else if (v.z) {
		this.vel.z = v.z
	}
	var tempVel = new THREE.Vector3().copy(this.vel).add(this.pos());
	if (widget) {
		widget.update_position(tempVel);
	}
	this.update_velocity_arrow_geometry();
}
nb.Body.prototype.set_vel = function(v) {
	this.vel.copy(v)
}
nb.Body.prototype.create_gui_div = function(){
	var div = document.createElement("div")	
	div.style.visibility = "hidden"
	div.style.opacity = "0.5"
	div.style.width = "125px"
	div.style.height = "25px"
	div.style.position = "absolute"
	div.style["background-color"] = "#1050ff"
	div.style["z-index"] = "50"
	div.id = "gui_" + this.id;		
	this.gui_div = div;
	document.body.appendChild(this.gui_div);
}
nb.Body.prototype.update_gui_div_position = function(pos) {
	pos = pos || get_body_screen_coords(this.starMesh)
	this.gui_div.style.left = pos.x + 20 + "px"
	this.gui_div.style.top = pos.y + 20 + "px"
	this.gui_div.style.visibility = "visible"
}
nb.Body.prototype.remove_div = function() {
	this.gui_div.parentNode.removeChild(this.gui_div);
}
nb.Body.prototype.update_pos_vel = function(){
	this.pos_x = this.starMesh.position.x
	this.pos_y = this.starMesh.position.y
	this.pos_z = this.starMesh.position.z	
	this.vel_x = this.vel.x;
	this.vel_y = this.vel.y;	
	this.vel_z = this.vel.z;	
}
nb.Body.prototype.update_body_pick_box = function() {
	this.pick_box.position.copy(this.pos())
}
/////////////////////////
nb.nBodies = function() {
	this.e0;
	this.dt = 0.005;
	this.nSteps = 0;
	this.bodies = new Array(nb.numBodies);
	this.numBodies = nb.numBodies;
	this.reverse = false;
	for (var i = 0; i < nb.numBodies; i++) {		
		var mass = Math.random() * 100;		
		this.bodies[i] = new nb.Body(mass);
	}
	this.time = 0;
	this.go = false;	
	this.eps = 0.01;
	this.camera_target = null;
	this.options = ["1st", "2nd", "3rd"]
}

//numerical softening parameter. See ArtCompSci, vol 4, pp 100...
nb.nBodies.prototype.set_eps = function(e) { 
	this.eps = e;
	return this;
}
//LEAPFROG integrator///////////////////////
nb.nBodies.prototype.leapfrog = function() { 
	var dt = this.dt;
	var bodyArr = this.bodies; //get all the bodies								
	this.bodies.forEach(function(body) {	
		var tempVel = new THREE.Vector3(0,0,0);
		body.vel.add(body.accel(bodyArr, n.eps).multiplyScalar(0.5*dt));	
		tempVel.copy(body.vel);
		body.pos().add(tempVel.multiplyScalar(dt));
		body.vel.add(body.accel(bodyArr, n.eps).multiplyScalar(0.5*dt));		
		body.updateTrail();		
		body.update_body_pick_box()
		if (body.vel_arrow.visible) body.update_velocity_arrow_geometry()
	})
} 
nb.nBodies.prototype.integrate = function(){
	if (this.go){
		this.leapfrog();
		this.update_gui();
		
		update_vel_while_integrating()
	}	
	return this
}
nb.nBodies.prototype.stop_go = function(){
	this.go = !this.go;
	return this
}
nb.nBodies.prototype.simple_print = function() {
	str = ["Total bodies: ", nb.numBodies, "\n", 
			"dt: ", this.dt, "\n", 
			"at time: ", this.time, "after ", this.nSteps, "steps: \n",
			"with softening: ", this.eps, "\n"].join(" ");
	console.log(str);
	this.bodies.forEach(function(body) {
		body.to_s();
	})
	nrg = ["Total energy stats:", "\n",
			"kin energy = ", this.ekin(), "\n",
			"pot energy = ", this.epot(), "\n",
			"total energy = ", this.e_tot(), "\n",
			"(e_init - e_fin)/e_init: ", (this.e0 - this.e_tot())/this.e0].join(" ");
	console.log(nrg);
}
nb.nBodies.prototype.ekin = function() {
	ek = 0.0;
	this.bodies.forEach(function(body){
		ek += body.ekin();
	})
	return ek;
}	
nb.nBodies.prototype.epot = function() {
	ep = 0.0;
	var bodyArr = this.bodies;
	this.bodies.forEach(function(body) {
		ep += body.epot(bodyArr);
	})
	return ep/2;
}
nb.nBodies.prototype.e_init = function() {
	return this.e0 = this.ekin() + this.epot();
}
nb.nBodies.prototype.e_tot = function() {
	return (this.ekin() + this.epot());
}
nb.nBodies.prototype.set_trailLength = function(x) {
	nb.trailLength = x;
	return this
}
nb.nBodies.prototype.change_num_stars = function(x) {	//kind of ugly, refactor
	if (x >= 0) {
		if (x > this.bodies.length) {
			for (var i = 0; i < (x - this.bodies.length); i++) {
				this.addStar();
			}
			return this
		} else if ( this.bodies.length > x) {
			var i;
			for (i = 0; i < (this.bodies.length - x); i++) {
				this.deleteStar();
			}
			return this
		}
	}
}
nb.nBodies.prototype.addStar = function(mass) {	
	var mass = mass || Math.random() * 100
	this.bodies[this.bodies.length] = new nb.Body(mass);	
	this.numBodies = this.bodies.length;
	//return this //2013 07 15
	return this.bodies[this.bodies.length-1]
}
nb.nBodies.prototype.deleteStar = function(star) {	//todo: refactor this to use obj.traverse
	var index = this.bodies.length-1;
	var i;
	if (this.bodies.length > 0) {
		var b = this.bodies[index];
		scene.remove(b.starMesh);
		scene.remove(b.trail);
		scene.remove(b.pick_box);
		scene.remove(b.vel_arrow);		
		scene.remove(b.pos_widget);
		scene.remove(b.vel_widget);		
		if (b.gui_div){
			WIDGET_FACTORY.remove_widget(b.pos_widget);
			WIDGET_FACTORY.remove_widget(b.vel_widget);
		}
		this.bodies.pop();
		gui.removeFolder('Body ' + b.id);
		$("#gui_" + b.id).remove();
		delete b.pos_widget;
		delete b.vel_widget;
		delete b;
		this.numBodies = this.bodies.length;
	};
	return this;
};
var n = new nb.nBodies;
nb.nBodies.prototype.update_gui= function() {
	this.bodies.forEach(function(body) {
		if(body.gui_div) { 
			body.update_gui_div_position(get_body_screen_coords(body.starMesh)) 
			body.pos_widget.update_position(body.pos())			
		}
	})
}
var reverse_time = function() {
	n.dt *= -1
}
var update_vel_while_integrating = function() {
	n.bodies.forEach(function(body) {
		if (body.vel_widget) body.vel_widget.update_position(body.vel_arrow.geometry.vertices[1])
	})
}