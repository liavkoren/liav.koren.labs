//Universal Attraction: web-based n-body simulator by Liav Koren is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//Based on a work at http://www.liavkoren.com/nBody_main.html.
var container;
var camera, controls, renderer;	
var composer, base_render_composer;

initCamScene();
initRenderer();
//init_post_processing();
animate();

function initCamScene() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 20;
	scene.fog = new THREE.FogExp2( 0x202020, 0.02 );
}
function initRenderer() {
	renderer = new THREE.WebGLRenderer( { antialias: true, clearAlpha: 1 } );
	renderer.setClearColor(0x100808)
	renderer.setSize( window.innerWidth, window.innerHeight );	
	controls = new THREE.TrackballControls(camera, renderer.domElement);
	controls.addEventListener( 'change', render );	
	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	renderer.domElement.innerHTML = fall_back_text
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', mousemove, false );
    document.addEventListener('mousedown', mousedown, false);
    document.addEventListener('mouseup', mouseup, false);    
    window.addEventListener( 'resize', onWindowResize, false );
    scene.add(new THREE.AmbientLight(0x555555));
	var directionalLight = new THREE.DirectionalLight(0xffddcc, 1.0);
	directionalLight.position.x = Math.random() - 0.5;
	directionalLight.position.y = Math.random() - 0.5;
	directionalLight.position.z = Math.random() - 0.5;
	directionalLight.position.normalize();
	scene.add( directionalLight );	
	screenW = window.innerWidth;
	screenH = window.innerHeight;

}
function init_post_processing() {
////two stage render for primary image: base image pass + noise/bloom pass. The two passes are additively blended. 
	var renderTargetParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, 
								format: THREE.RGBFormat, stencilBufer: false };
	var base_render_target = new THREE.WebGLRenderTarget( screenW, screenH, renderTargetParameters ); 
	base_render_composer = new THREE.EffectComposer( renderer,base_render_target );
	var renderPass = new THREE.RenderPass( scene, camera );
	var CopyShader = new THREE.ShaderPass(THREE.CopyShader);
/*	var effectFocus = new THREE.ShaderPass( THREE.FocusShader );
	effectFocus.uniforms[ "screenWidth" ].value = window.innerWidth;
	effectFocus.uniforms[ "screenHeight" ].value = window.innerHeight; */
	//base_render_composer.addPass( effectFocus );
	base_render_composer.addPass( renderPass );
	base_render_composer.addPass(CopyShader);
////
	glow_render_target = new THREE.WebGLRenderTarget( screenW/8, screenH/8, renderTargetParameters ); //1/2 res for performance
	glow_composer = new THREE.EffectComposer(renderer, glow_render_target);
	var effectFilm = new THREE.FilmPass( 0.05, 0.1, 3000.0, true );
	var effectBloom = new THREE.BloomPass( 0.3, 35, 1000, 256);	
	glow_composer.addPass(renderPass);
	glow_composer.addPass(effectFilm);
	glow_composer.addPass(effectBloom);
////
	blendPass = new THREE.ShaderPass( THREE.AdditiveBlendShader );
	blendPass.uniforms[ 'tBase' ].value = base_render_composer.renderTarget1;
	blendPass.uniforms[ 'tAdd' ].value = glow_composer.renderTarget1;
	blendComposer = new THREE.EffectComposer(renderer);
	blendComposer.addPass(blendPass);
	blendPass.renderToScreen = true;
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	render();
}
function animate() {
	requestAnimationFrame( animate );
	controls.update();	
	try{
		stats.update();
	}catch(e){}
	render();	
}					
function render() {		
	try {
		n.integrate();		
		check_for_intersection();  //widget factory logic
		//background.update_position(camera.position.copy())
	}
	catch(e) {
	}	
	/**
	base_render_composer.render(0.1)
	glow_composer.render(0.1);
	blendComposer.render(0.1);	
	**/

	renderer.render(scene, camera);
}
