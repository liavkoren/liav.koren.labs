

var projector, scene, camera;


var mouse_button_pressed = false;
var sliding_axis; //keeps track of which, if any, axis we are alowed to move along. 
var mouse = {x:0, y:0}, INTERSECTED_MESH; 
//var intersects;
var w,x; 
//var x_axis_line, y_axis_line, z_axis_line;
//var x_pick_box, y_pick_box, z_pick_box;
/*initCamScene();
initRenderer();
animate();*/

projector = new THREE.Projector();

function initCamScene() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 20;
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x202020, 0.2 );

}
initCamScene();

function WIDGET_FACTORY() {
	//this.widgets = [];  --why is this not a publically accesible var?
	{};
};

WIDGET_FACTORY.widgets = [];
WIDGET_FACTORY.update = function() {
	/*var private = "private";
	function shoot_ray() {
		console.log(private);
	};
	shoot_ray();*/
}
WIDGET_FACTORY.start_factory = function() {
	return WIDGET_FACTORY;
}
WIDGET_FACTORY.mouse_over_widget = null;
WIDGET_FACTORY.intersected_widget = null;
WIDGET_FACTORY.intersection_point = new THREE.Vector3();
WIDGET_FACTORY.widget_counter = 0;
WIDGET_FACTORY.xz_plane = 
			new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 8,8), 
			new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.25, transparent: true, wireframe: true, doubleSided: true}));
WIDGET_FACTORY.xz_plane.rotation.x = -90 * Math.PI/180;
WIDGET_FACTORY.xz_plane.rotation.y = Math.PI/180;
WIDGET_FACTORY.xz_plane.visible = false;
WIDGET_FACTORY.skew_line;
WIDGET_FACTORY.currentHex = new THREE.Color(0,0,0);
//scene.add(WIDGET_FACTORY.xz_plane);

////WIDGET_FACTORY: make/remove methods:
WIDGET_FACTORY.make_widget = function(origin, params) {
	var widget = {};
	widget.origin = origin || new THREE.Vector3(0,0,0);
	widget.params = params || {};
	widget.params.radius = widget.params.radius || 0.05;
	widget.params.height = widget.params.height || 2; 
	widget.id;
	this.widgets.push(widget);	
	var that = widget;
	init_widget();		
	widget.getDescendants = function() {
		return [that.x_pick_box, that.y_pick_box, that.z_pick_box];
	}
	widget.intersected = function(m) { //true if the passed axis mesh is part of this widget
		return this.getDescendants().indexOf(m) > - 1 ? true : false;
	}
	widget.update_position_by_translation = function(origin) {		
		var origin_x_offset, origin_y_offset, origin_z_offset;
		var offset = new THREE.Vector3(0,0,0);
		if (INTERSECTED_MESH.axis === "y pick box") {
//		    offset.copy(WIDGET_FACTORY.intersection_point).sub(WIDGET_FACTORY.xz_plane.position);
//		    origin.y -= offset.y; //this introduces a slight bug in the dragging logic.
								//added to give the correct offset for the mouse position
								//when dragging. 
			origin.y -= this.params.height;	//less buggy, but not quite as nice.			    						
		} else if (INTERSECTED_MESH.axis === "x pick box") {
			origin.x -= this.params.height;	//less buggy, but not quite as nice.			    						
		} else if (INTERSECTED_MESH.axis === "z pick box") {
			origin.z -= this.params.height;	//less buggy, but not quite as nice.			    						
		}
		this.update_position(origin)
	}
	widget.update_position = function(origin) {
		this.origin.copy(origin);
		this.x_pick_box.position = new THREE.Vector3().copy(origin);
		this.y_pick_box.position = new THREE.Vector3().copy(origin);
		this.z_pick_box.position = new THREE.Vector3().copy(origin);
		this.x_pick_box.position.x += this.params.height;
		this.y_pick_box.position.y += this.params.height;
		this.z_pick_box.position.z += this.params.height;
		//toDo: refactor to something nicer.
		origin_x_offset = new THREE.Vector3().copy(origin).add(new THREE.Vector3(250,0,0));
		origin_y_offset = new THREE.Vector3().copy(origin).add(new THREE.Vector3(0,250,0));
		origin_z_offset = new THREE.Vector3().copy(origin).add(new THREE.Vector3(0,0,250));
		this.x_axis.geometry.vertices[0].copy(origin);
		this.x_axis.geometry.vertices[1] = origin_x_offset;    
		this.y_axis.geometry.vertices[0].copy(origin);
		this.y_axis.geometry.vertices[1] = origin_y_offset;
		this.z_axis.geometry.vertices[0].copy(origin);
		this.z_axis.geometry.vertices[1] = origin_z_offset;
		this.x_axis.geometry.verticesNeedUpdate = true;
		this.y_axis.geometry.verticesNeedUpdate = true;
		this.z_axis.geometry.verticesNeedUpdate = true;
	}

	//INTERSECTED_MESH.currentHex == 10092441
	function init_widget() {
		var axis_lines, axis_pick_boxes, scale;
		that.id = ++WIDGET_FACTORY.widget_counter;
		that.x_axis = make_axis_line(new THREE.Vector3(0.5,0,0), new THREE.Vector3(4,0,0), 0x880000, "x axis line");
		that.y_axis = make_axis_line(new THREE.Vector3(0,0.5,0), new THREE.Vector3(0,4,0), 0x008800, "y axis line");
		that.z_axis = make_axis_line(new THREE.Vector3(0,0,0.5), new THREE.Vector3(0,0,4), 0x000088, "z axis line");
		update_axis_line_positions(widget.origin);
		axis_pick_boxes = make_widget_pick_boxes();
	}	
	function update_axis_line_positions(v) { //all calculations are based on geometry verticies. 
		that.x_axis.geometry.vertices[0].add(v);
		that.x_axis.geometry.vertices[1].add(v);
		that.y_axis.geometry.vertices[0].add(v);
		that.y_axis.geometry.vertices[1].add(v);
		that.z_axis.geometry.vertices[0].add(v);
		that.z_axis.geometry.vertices[1].add(v);
	}
	function make_axis_line(v1, v2, col, name) {
		var geom = new THREE.Geometry();
		var mat = new THREE.LineBasicMaterial({color: col});
		geom.vertices = [v1, v2];
		var L = new THREE.Line(geom, mat);
		L.axis = "name";
		//scene.add(L);
		return L;
	}
	function make_widget_pick_boxes() {
		var x_pick_box, y_pick_box, z_pick_box, pos;
		that.x_pick_box = make_pick_box(0xff9999, widget.params, "x pick box");
		that.x_pick_box.rotation.z -= 90 * Math.PI / 180;
		that.x_pick_box.position.x += that.params.height / 1.0;
		that.x_pick_box.position.add(that.origin);
		scene.add(that.x_pick_box);		
		that.y_pick_box = make_pick_box(0x99ff99, widget.params, "y pick box");
		that.y_pick_box.rotation.y += 90 * Math.PI / 180;
		that.y_pick_box.position.y += widget.params.height;
		that.y_pick_box.position.add(that.origin);
		scene.add(that.y_pick_box);
		that.z_pick_box = make_pick_box(0x9999ff, widget.params, "z pick box");
		that.z_pick_box.rotation.x += 90 * Math.PI / 180;     
		that.z_pick_box.rotation.y += 90 * Math.PI / 180;  
		that.z_pick_box.position.z += widget.params.height;
		that.z_pick_box.position.add(that.origin);
		scene.add(that.z_pick_box);   
	}
	function make_pick_box(col, params, name) {
		var mat = new THREE.MeshBasicMaterial({color:col, transparent: true, opacity: 0.7});
		var wireframe_mat = new THREE.MeshBasicMaterial({color:col, wireframe:true, transparency: true, opacity: 0.7});
		var geom = new THREE.CubeGeometry(0.05 * params.height, 1.5 * params.height, 0.5 * params.height);
		var pick_cube = new THREE.Mesh(geom, mat);
		pick_cube.add(new THREE.Mesh(geom, wireframe_mat));
		pick_cube.axis = name;
		pick_cube.widget = that; //// this creates a double link. 
		return pick_cube;
	}
	return widget; //ding! widget is done.
}
WIDGET_FACTORY.remove_widget = function(w)  {
	scene.remove(w.x_pick_box);
	scene.remove(w.y_pick_box);
	scene.remove(w.z_pick_box);
	scene.remove(w.x_axis)
	scene.remove(w.y_axis)
	scene.remove(w.z_axis)
	this.widgets.splice(this.widgets.indexOf(w),1);
	return this.widgets
}
////geometry methods:
WIDGET_FACTORY.shootRay = function(targ_line) {
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera );
	vector.sub(camera.position);
	var geom = new THREE.Geometry();
	geom.vertices = [new THREE.Vector3().copy(vector), new THREE.Vector3().copy(camera.position)]
		////change this to vec3?:
		var mat = new THREE.LineBasicMaterial({color:0xffff00});
		var l = new THREE.Line(geom, mat);
		//scene.add(l);    
	this.build_skew_line(l, targ_line);    
}
//skew line algo from http://nrich.maths.org/askedNRICH/edited/2360.html . 1st step, find the length of the shortest line that connects
//both skew lines. The form for line is L = offsetVector + t*directionVector, where t is a free param. We'll call this shortest line
//which connects the two lines the skew_line_solution_vector 
WIDGET_FACTORY.build_skew_line = function(line1, line2) {
	var skew_line_mat = new THREE.LineBasicMaterial({color:0x333333});
	var diff = new THREE.Vector3();
	var skew_line_solution_vector = new THREE.Vector3();
	var skew_line_solution_length; 
	var L1, L2, L1_offset, L1_vect, L2_offset, L2_vect;
	var b, candidate_solution, skew_line;
	init();
	translate_system();
	////skew_line_sol_vect = |(off1 - off1) * (vect1 x vect2) / |(vect1 x vect2)|| * (vect1 x vect2) / |(vect1 x vect2)| 
	//where * = dot product or scalarMultiplication, x = cross product. See nrich.math.org ref above. 
	function init() {
		L1 = make_line_equation(line1);
		L2 = make_line_equation(line2);
		L1_offset = L1[0];
		L1_vect = L1[1];
		L2_offset = L2[0];
		L2_vect = L2[1];
		diff.copy(L1_offset);
		diff.sub(L2_offset);        
		skew_line_solution_vector.copy(L2_vect);
		skew_line_solution_vector.cross(new THREE.Vector3().copy(L1_vect)).normalize();
		skew_line_solution_length = diff.dot(skew_line_solution_vector);
		skew_line_solution_vector.multiplyScalar(skew_line_solution_length);    
	}
	////After you've +/- the skew_line_solution_vector to one of the lines, L1, L2 will intersect in 
	//one of those two systems, generatating a system of equations, of the form Ax=b.     
	function translate_system() {
		b = new THREE.Vector3().copy(L1_offset);
		b.add(skew_line_solution_vector);
		b.multiplyScalar(-1);
		b.add(L2_offset);   
		//The skew line vector gets added to the righ-hand-side of the equation sys, however we don't 
		//know if the vector is pointing in the right direction or needs to be flipped.
		candidate_solution = solve_eq_sys(L1_vect, L2_vect, b);     
		if (check_solution(candidate_solution, b)) { 
			sl = draw_skew_line(candidate_solution);
		} else {
			b = new THREE.Vector3().copy(L1_offset);
			b.sub(skew_line_solution_vector);
			b.multiplyScalar(-1);
			b.add(L2_offset);
			candidate_solution = solve_eq_sys(L1_vect, L2_vect, b); 
			skew_line = draw_skew_line(candidate_solution);
		}
		if (skew_line.length() < 4.5) {
			WIDGET_FACTORY.intersected_widget.update_position_by_translation(skew_line.geometry.vertices[1]);
		}
	}
	// check a candidate solution from solve_eq_sys() against the lines. If we set L1 = L2, we get a system of  xV1 - yV2 = right_side
	//where right_side = the sum of the offset vectors + the translation vector b, which we found above. We can plug candidate 
	//solutions back into the system and test for equality. 
	function check_solution(sol, right_side) {  
		var x = sol[0];
		var y = sol[1];     
		var LHS = new THREE.Vector3();
		LHS.setX(x*L1_vect.x + y*L2_vect.x);
		LHS.setY(x*L1_vect.y + y*L2_vect.y);
		LHS.setZ(x*L1_vect.z + y*L2_vect.z);
		LHS.sub(right_side);        
		return (LHS.length() < 0.00001); // nb: this is > 0 to deal with small numerical errors. 
	}
	function draw_skew_line(sol) { //uses the found solution to Ax = b.       
		var skew_line_geom = new THREE.Geometry();        
		var start = new THREE.Vector3().copy(L1_vect);
		var end = new THREE.Vector3().copy(L2_vect);
		var x = sol[0];
		var y = sol[1];        
		start.multiplyScalar(x).add(L1_offset);
		end.multiplyScalar(-y).add(L2_offset);
		var w;
		for (var i = 0; i < WIDGET_FACTORY.widgets.length; i++) {
			if (WIDGET_FACTORY.widgets[i].getDescendants(INTERSECTED_MESH)) {
				w = WIDGET_FACTORY.widgets[i];
				break;
			}
		}
		if (INTERSECTED_MESH.axis === "y pick box"){
			start.y -= w.params.height;
		} else if (INTERSECTED_MESH.axis === "x pick box") {
			start.x -= w.params.height;
		} else if (INTERSECTED_MESH.axis === "z pick box") {
			start.z -= w.params.height;
		}
		skew_line_geom.vertices.push(start);
		skew_line_geom.vertices.push(end);
		var skew_line = new THREE.Line(skew_line_geom, skew_line_mat);
		skew_line.name = "Skew line " + scene.children.length;
		//scene.add(skew_line);
		return skew_line;
	}
	function make_line_equation(line) {
		var offset, vector;
		offset = new THREE.Vector3();
		offset.copy(line.geometry.vertices[0]);        
		vector = new THREE.Vector3().copy(line.geometry.vertices[1]);
		vector.sub(offset);
		return [offset, vector];
	} 
	function solve_eq_sys(v1, v2, b) { //solve sys of Ax = b, where A is two equations for skew lines.
		var a = $M([[v1.x, v2.x, b.x],
					[v1.y, v2.y, b.y], 
					[v1.z, v2.z, b.z] ]);
		a = a.toRightTriangular();
		var sol_y = a.e(2,3)/a.e(2,2);
		var sol_x = (a.e(1,3) - a.e(1,2)*sol_y)/a.e(1,1);
		return [sol_x, sol_y];
	}
}
function check_for_intersection() {
	var vector, raycaster, intersects;
	vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );
	raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize());
	intersects = raycaster.intersectObjects(WIDGET_FACTORY.widgets, true);
	if ( intersects.length > 0 ) {
		WIDGET_FACTORY.intersection_point.copy(intersects[0].point);
		if ( INTERSECTED_MESH !== intersects[ 0 ].object ) {
			if ( INTERSECTED_MESH ) 
				INTERSECTED_MESH.material.color.setHex( INTERSECTED_MESH.currentHex );
		INTERSECTED_MESH = intersects[ 0 ].object;
		INTERSECTED_MESH.currentHex = INTERSECTED_MESH.material.color.getHex();
		INTERSECTED_MESH.material.color.setHex( 0xffff00 );
		}
	} else {
		WIDGET_FACTORY.intersection_point = new THREE.Vector3(0,0,0);
		if ( INTERSECTED_MESH ) 
			INTERSECTED_MESH.material.color.setHex( INTERSECTED_MESH.currentHex );
		INTERSECTED_MESH = null;		
	}
	return INTERSECTED_MESH;
}
////event listeners:
var xz_offset;
var raycaster, plane_intersection, vector;
function mousedown(event) { //better way to do this than using sliding_axis?
	mouse_button_pressed = true;
	if (INTERSECTED_MESH) {
		WIDGET_FACTORY.xz_plane.position.copy(WIDGET_FACTORY.intersected_widget.origin);
	}
}
function mousemove( event ) {
	var intersected_mesh = check_for_intersection();    	
	for (var i = 0; i < WIDGET_FACTORY.widgets.length; i++ ) {
		if (WIDGET_FACTORY.widgets[i].intersected(intersected_mesh)) {
			WIDGET_FACTORY.intersected_widget = WIDGET_FACTORY.widgets[i];
			break;
		} 		
	}
	mouse = getMouseNDCoord()
	if (mouse_button_pressed && WIDGET_FACTORY.intersected_widget && INTERSECTED_MESH) {
		if (INTERSECTED_MESH.currentHex === 10092441) { //Green = y axis    		    	
			WIDGET_FACTORY.shootRay(WIDGET_FACTORY.intersected_widget.y_axis);    
		} else if (INTERSECTED_MESH.currentHex === 16751001) { //Blue = z Axis
			WIDGET_FACTORY.shootRay(WIDGET_FACTORY.intersected_widget.x_axis);        	
		} else if (INTERSECTED_MESH.currentHex === 10066431) { //Red = x Axis
			WIDGET_FACTORY.shootRay(WIDGET_FACTORY.intersected_widget.z_axis);        	
		}
		controls.enabled = false
		send_widget_event(WIDGET_FACTORY.intersected_widget)
	}	
	n.update_gui();
}
function mouseup() {
	mouse_button_pressed = false;
	controls.enabled = true;
	WIDGET_FACTORY.intersected_widget = null;
}
function send_widget_event(w) {
	//var event = new Event('widget_move')    
	w.intersected_mesh = INTERSECTED_MESH;
	var event = new CustomEvent('widget_move', {detail: w})
	document.dispatchEvent(event);		
}

////
THREE.Line.prototype.length = function() {
	if (this instanceof THREE.Line) {
		a = new THREE.Vector3().copy(this.geometry.vertices[0]);        
		a.sub(this.geometry.vertices[1]);
		return a.length();
	}
}
////
var a = new THREE.Vector3(1,2,3);
var b = new THREE.Vector3(5,5,5);
var w = WIDGET_FACTORY.start_factory();
/*var x = w.make_widget(a);
var y = w.make_widget(b);*/

function getMouseNDCoord() {
	var mouse = new THREE.Vector3();
	mouse.x = (event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight ) * 2 + 1;
	mouse.z = 0.5;
	return mouse;
}