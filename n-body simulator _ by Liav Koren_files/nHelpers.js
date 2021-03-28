//Universal Attraction: web-based n-body simulator by Liav Koren is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//Based on a work at http://www.liavkoren.com/nBody_main.html.

////Misc helper code
////Picking
//document.addEventListener('mousedown', onDocMouseClick, false);

info = function() {	
}
info.toggle_info = function() {
	if ($('#info-container').length == 0) {
		$('body').append('<div id="info-container"></div>');		
		$('#info-container').append('<div id="floating-info"></div>');		
		$('#info-container').css({"position":"absolute", "left":"50%", "z-index": "100", "top":"20px", "width":"70%", "display":"none"})
		$('#floating-info').css({"position":"relative", "left": "-50%", "background":"#ededed", "opacity":"0.9", "top": "20px", "padding-left": "2em",
								"padding-right": "2em", "padding-top": "0.5em","padding-bottom": "0.5em", "display":"none", "-webkit-border-radius": "10px",
								"-moz-border-radius": "10px", "border-radius": "10px",  "font-family": "Candara, Calibri, Segoe, 'Segoe UI', Optima, Arial, sans-serif"})
	}
	$('#floating-info').html(fall_back_text)
	$('#info-container').toggle()
	$('#floating-info').toggle()
	$('#floating-info').click(function() { $(this).css({'display':'none'}); $(this).parent().css({'display':'none'}) })
}

renderer.domElement.addEventListener( 'mousedown', onDocMouseClick, false );
var projector = new THREE.Projector();	
//ugh! So gross. Refactor all this preset logic, please. 
var guiPresets = {
	"remembered": {
		"Random system": {
			"0": {
				"numBodies": 3,
				"stop_go": false,
				"eps": 0.75,	
				"n.bodies[3].position": new THREE.Vector3(10,10,10),
			} 
		},
		"Infinity": {
			"0": {
				"eps": 0.001,
			}
		},
		"Moth I": {
			"0": {
				"eps": 0.001,
			}
		}
	},
	standard_presets: ["Random system", "Infinity", "MothI"]	//used to keep track of new, user-added presets. 
}
var gui = new dat.GUI({load: guiPresets});
gui.remember(n);
var gui_options = gui.__preset_select;
var reset_scene = function() {	
	while(n.bodies.length > 0) n.deleteStar()	
}
gui_options.onchange = function() {
	var v = gui_options.value
	reset_scene()
	if (v === "Infinity"){
		build_system(infinity)
	}
	else if (v === "Moth I") {
		build_system(mothI)
	}
	else if (v === "Random system"){
		n.addStar()
		n.addStar()
		n.addStar()

	} else {
		build_system(guiPresets.remembered[v])
	}
}
function build_system(sys) {
	for (var key in sys) {	
		if (!isNaN(parseInt(key))) {
			var temp_body = sys[key]
			var body = n.addStar(temp_body.mass)
			body.starMesh.position = array_to_vector(temp_body.position) 
			body.set_vel(array_to_vector(temp_body.velocity))
			if (temp_body.trail_vertices) body.trail.geometry.vertices = temp_body.trail_vertices
			body.trail.geometry.verticesNeedUpdate = true 
			body.update_body_pick_box()
			body.update_pos_vel()
		}
	}
	n.eps = sys.eps || 0.3
	n.dt = sys.dt || 0.001
	n.bodies[0].trail_material.size = sys.trail_material_size || 0.05
}
function array_to_vector(arr) {
	if (arr.length === 3) return new THREE.Vector3(arr[0], arr[1], arr[2])
}
function onDocMouseClick(event) {
	event.preventDefault();
	find_picked_bodies();
}
var body_gui, guiContainer;
function find_picked_bodies() { 	//standard raycasting picking code:
	var mouse = getMouseNDCoord();
	var raycaster = projector.pickingRay(mouse.clone(), camera);	
	intersects = [];		
	//check each body for picking, using the picking box as the test:
	n.bodies.some(function(body) {
		raycaster.intersectObject(body.pick_box);
		intersect = raycaster.intersectObject(body.pick_box);			
		if (intersect[0]) {
			intersect[0].object.visible = !intersect[0].object.visible;		//toggles visibility of the pickbox
			body.toggle_velocity();
			body_gui = new dat.GUI({autoPlace:false});
			if (intersect[0].object.visible) { //add the velocity gui elements.				
				var scale_factor = 0.25 + (Math.log(body.mass)/Math.log(50))
				body.pos_widget = WIDGET_FACTORY.make_widget(intersect[0].object.position, {height: 0.75 * scale_factor, type: "position"})		
				body.vel_widget = WIDGET_FACTORY.make_widget(body.vel_arrow.geometry.vertices[1], {height:0.35 * scale_factor, type: "velocity"})	

				body.create_gui_div()				
				guiContainer = document.getElementById('gui_' + body.id);				
				guiContainer.appendChild(body_gui.domElement);				
				body.update_gui_div_position(get_body_screen_coords(body.starMesh))	
				body_gui.addFolder('Body ' + body.id)
				body_gui.add(body, 'toggle_camera_lock').name("Toggle camera lock")			
				addFolder(body, 'Body ' + body.id);	
				//reset_gui_css("#gui_" + body.id)													
			} else {		
				guiContainer = document.getElementById('gui_' + body.id);
				$('#gui_' + body.id).remove()
				WIDGET_FACTORY.remove_widget(body.pos_widget)
				WIDGET_FACTORY.remove_widget(body.vel_widget)
				delete body.pos_widget			
				delete body.gui_div
				gui.removeFolder('Body ' + body.id)
			}
		}
	});
}
reset_gui_css = function(name) {
	$(name).find(".dg").css({"width":"120px"}) //futz with gui.dat's defaults	
/*	console.log($(name).children())
	console.log($(name).find(".close-button"))
	$(name).children().css({"width":"120px !important"}) //futz with gui.dat's defaults	
	var t = name + " .dg.main"
	$(t).css({"width":"120px !important"})
	$(name).find(".close-button").css({"width":"120px !important"}) //futz with gui.dat's defaults	
	console.log($(name).children())
	console.log($(name).find(".close-button"))	 */
}
function remove_gui(gui, parent){
  	if(!parent) {
    	parent = DAT.GUI.autoPlaceContainer;
  	}
  	parent.removeChild(gui.domElement);
}
function get_body_screen_coords(mesh) {
	var halfWidth = window.innerWidth/2;
	var halfHeight = window.innerHeight/2;
	var vector = new projector.projectVector(new THREE.Vector3().getPositionFromMatrix(mesh.matrixWorld), camera);
	vector.x = (vector.x*halfWidth)+halfWidth
	vector.y = -1*(vector.y*halfHeight)+halfHeight
	return vector
}

function addFolder(body, folderName) { //pass in the ref to the body that is being clicked, create a new folder for mod properties
	var starGui = gui.addFolder(folderName);
	starGui.add(body, "pos_x").step(0.1).listen().name("position x:").onChange(function(x) {update_body_position(new THREE.Vector3(x,0,0), body)})
	starGui.add(body, "pos_y").step(0.1).listen().name("position y:").onChange(function(y) {update_body_position(new THREE.Vector3(0,y,0), body)})
	starGui.add(body, "pos_z").step(0.1).listen().name("position z:").onChange(function(z) {update_body_position(new THREE.Vector3(0,0,z), body)})	
	starGui.add(body, "vel_x",-5,5).step(0.1).listen().onChange(function(x) {body.set_vel_component(new THREE.Vector3(x,0,0), body.vel_widget)});
	starGui.add(body, "vel_y",-5,5).step(0.1).listen().onChange(function(y) {body.set_vel_component(new THREE.Vector3(0,y,0), body.vel_widget)});
	starGui.add(body, "vel_z",-5,5).step(0.1).listen().onChange(function(z) {body.set_vel_component(new THREE.Vector3(0,0,z), body.vel_widget)});			
}
update_body_position = function(v, body) {
	if (v.x) {
		body.starMesh.position.x = v.x	
	} else if (v.y) {
		body.starMesh.position.y = v.y	
	} else if (v.z) {
		body.starMesh.position.z = v.z
	}
	body.update_velocity_arrow_geometry()
	update_vel_widget_position(body)
}
function release_cam(){
	t = new THREE.Vector3().copy(controls.target);
	controls.target = t;
	controls.noPan = false;
}
window.onload = function() {
	gui.add(n, "numBodies", 2, 400).name("Number of bodies").min(0).step(1.0).listen().onChange(function(x) { n.change_num_stars(x)});
	gui.add(stop_go, "toggle").name("Play/Pause")
	gui.add(n, "reverse").onChange(reverse_time).name("Reverse time");
	gui.add(n, "addStar").name("Add another star");
	gui.add(n, "deleteStar").name("Remove a star");	
	gui.add(n, "eps", 0,10).step(0.1).name("Softening").listen();
	gui.add(n, "simple_print").name("Save state");
	gui.add(controls, "noPan").name("Release camera").listen().onChange(function() {release_cam()});
	gui.add(info, "toggle_info").name("  -- ABOUT --")	
	$('.button.save').click(function(e) {gui_save_button(e)})
	$('.button.save-as').click(function(e) {gui_saveAs_button(e)})
	$('select').click(function(){ n.dt < 0 ? n.dt *= -1 : n.dt})  //ToDo: garg. Fix this -- more crap from weird bindings.
}	
stop_go = function() {}; //total hack to deal with complication from adding presets to gui.dat. 
stop_go.toggle = function() {
	n.stop_go();
}
function widget_move(e) {
	n.bodies.forEach(function(body) {
		if (body.gui_div) {
			body.update_pos_vel()
			if (e.detail.params.type == "velocity" && e.detail == body.vel_widget  ) {
				if (e.detail.intersected_mesh.axis == "x pick box") {
					body.vel.x = e.detail.origin.x - body.pos().x
				} else if (e.detail.intersected_mesh.axis == "y pick box") {
					body.vel.y = e.detail.origin.y - body.pos().y
				} else if (e.detail.intersected_mesh.axis == "z pick box") {
					body.vel.z = e.detail.origin.z - body.pos().z
				}
			} else if (e.detail.params.type == "position") {
				update_vel_widget_position(body)
			}
			body.update_velocity_arrow_geometry()
		}
	})
}
update_vel_widget_position = function(body) {
	var temp = new THREE.Vector3().copy(body.pos()).add(body.vel)
	body.vel_widget.update_position(temp)
}
gui_save_button = function(e) {	
	if (e) e.preventDefault()
	var current_preset_name = gui_options.value
	var standard_presets = guiPresets.standard_presets
	if (standard_presets.indexOf(current_preset_name) > -1) {	
		alert("Please use the 'New' button to create a new preset, then use the 'Save' button to save the state of the system when you are ready.")
	} else {		
		guiPresets.remembered[current_preset_name] = save_system_state()
	}
}
gui_saveAs_button = function(e) {
	reverse_time() //ToDo: fix this bug. For some reason, this button is bound to reverse time code. 
	gui_save_button()
}
save_system_state = function() {
	var system = {}
	for (var i = 0; i < n.bodies.length; i++) {
		var body = n.bodies[i];
		system[i] = {}
		system[i].mass = body.mass
		system[i].position = [body.pos().x, body.pos().y, body.pos().z]
		system[i].velocity = [body.vel.x, body.vel.y, body.vel.z]
		system[i].trail_vertices = body.trail.geometry.vertices
	}
	system.eps = n.eps
	return system
}


////stats
var stats;
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild( stats.domElement );

Array.prototype.last = function() {
	l = this.length;
	return this[l-1];
}
//http://stackoverflow.com/questions/14710559/dat-gui-how-hide-menu-from-code
dat.GUI.prototype.removeFolder = function(name) {
	var folder = this.__folders[name];
	if (!folder) {
	  return;
	}
	folder.close();
	this.__ul.removeChild(folder.domElement.parentNode);
	delete this.__folders[name];
this.onResize();
}
////

/*toggle_info_div = function() {
	console.log("toggle")
}*/
document.addEventListener('widget_move', widget_move, false)

