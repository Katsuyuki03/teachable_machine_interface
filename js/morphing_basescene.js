//===============================================================
// Import Library
//===============================================================
import * as THREE from './three.js-master/build/three.module';
 
//===============================================================
// Base scene
//===============================================================
let scene,camera,container,renderer;
 
init();
 
function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,10000);
    camera.position.set(0,400,1000);
    scene.add(camera);
 
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);
 
    container = document.querySelector('#canvas_vr');
    container.appendChild(renderer.domElement);
 
    window.addEventListener('resize',function(){
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth,window.innerHeight);
    },false);
}
 
export { scene, camera, container, renderer }