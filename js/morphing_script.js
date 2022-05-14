//===============================================================
// Import Library
//===============================================================
import * as THREE from './three.js-master/build/three.module';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls';
import { scene, camera, container, renderer } from './morphing_basescene.js';
import { vertexShader, fragmentShader } from './morphing_glsl.js';
 
//===============================================================
// Init
//===============================================================
window.addEventListener('load',function(){
   init();
});
 
let orbitControls;
let particles,sphereGeometry,planeGeometry;
let shapeFlg = 'sphere';
let animationFlg = 'animation';
let time = 0;
const amountX = 50,amountY = 50;
 
function init(){
    setLoading();
}
 
function setLoading(){
    TweenMax.to('.loader',0.1,{opacity:1});
    TweenMax.to('#loader_wrapper',1,{
        opacity:0,
        delay:1,
        onComplete: function(){
            document.getElementById('loader_wrapper').style.display = 'none';
            TweenMax.to('.loader',0,{opacity:0});
        }
    });
    threeWorld();
    setLight();
    setControll();
    rendering();
}
//===============================================================
// Create World
//===============================================================
function threeWorld(){
    renderer.outputEncoding = THREE.sRGBEncoding;
 
    const separation = 100;
    const particleNum = amountX * amountY;
    const positions = new Float32Array(particleNum * 3);
    const colors = new Float32Array(particleNum * 3);
    const scales = new Float32Array(particleNum);
 
    let i = 0;
    for(let ix = 0; ix < amountX; ix++){
        for(let iy = 0; iy < amountY; iy++){
            positions[i * 3] = ix * separation - ((amountX * separation) / 2);
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = iy * separation - ((amountY * separation) / 2);
            scales[i] = 1;
 
            const h = Math.round((i / particleNum) * 360);
            const s = 50;
            const l = 50;
            const color = new THREE.Color(`hsl(${h},${s}%,${l}%)`);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
 
            i ++;
        }
    }
 
    planeGeometry = new THREE.BufferGeometry();
    planeGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
    planeGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
    planeGeometry.setAttribute('scale',new THREE.BufferAttribute(scales,1));
 
    sphereGeometry = new THREE.SphereGeometry(500,49,49);
    sphereGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
    sphereGeometry.setAttribute('scale',new THREE.BufferAttribute(scales,1));
 
    const geometry = new THREE.SphereGeometry(500,49,49);
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
    geometry.setAttribute('scale',new THREE.BufferAttribute(scales,1));
 
    const material = new THREE.RawShaderMaterial({
        vertexShader:vertexShader,
        fragmentShader:fragmentShader,
    });
    particles = new THREE.Points(geometry,material);
    scene.add(particles)
}
 
function setLight(){
    const ambientlight = new THREE.AmbientLight(0xFFFFFF,1.0);
    scene.add(ambientlight);
}
 
function setControll(){
    document.addEventListener('touchmove',function(e){e.preventDefault();},{passive:false});
    orbitControls = new OrbitControls(camera,renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.5;
}
 
function rendering(){
    requestAnimationFrame(rendering);
 
    if(orbitControls){
        orbitControls.update();
    }
 
    time ++;
 
    if(Math.floor(time) % 650 == 0){
 
        if(shapeFlg == 'sphere'){
            shapeFlg = 'plane';
            animationFlg = 'animation';
            particles.geometry = planeGeometry.clone();
 
            setTimeout(function(){
                animationFlg = 'finish';
            },1500);
 
        }else{
            shapeFlg = 'sphere';
            animationFlg = 'animation';
            particles.geometry = sphereGeometry.clone();
        }
    }
 
    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;
 
    let i = 0;
    let p,p2;
 
    for(let ix = 0; ix < amountX; ix++){
        for(let iy = 0; iy < amountY; iy++){
            p = new THREE.Vector3(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2]
            );
 
            if(shapeFlg == 'sphere'){
                p2 = new THREE.Vector3(
                    planeGeometry.attributes.position.array[i * 3],
                    planeGeometry.attributes.position.array[i * 3 + 1],
                    planeGeometry.attributes.position.array[i * 3 + 2]
                );
 
                if(animationFlg == 'animation'){
                    positions[i * 3] += (p2.x - p.x) * 0.05;
                    positions[i * 3 + 1] += (p2.y - p.y) * 0.05;
                    positions[i * 3 + 2] += (p2.z - p.z) * 0.05;
 
                    if(positions[i * 3 + 1] <= 2.0){
                        animationFlg = 'finish';
                    }
                }else{
                    positions[i * 3] += (p2.x - p.x) * 0.05;
                    positions[i * 3 + 1] = (Math.sin((ix + time * 0.1) * 0.3) * 50) + (Math.sin((iy + time * 0.1) * 0.5) * 50);
                    positions[i * 3 + 2] += (p2.z - p.z) * 0.05;
                }
            }else{
                p2 = new THREE.Vector3(
                    sphereGeometry.attributes.position.array[i * 3],
                    sphereGeometry.attributes.position.array[i * 3 + 1],
                    sphereGeometry.attributes.position.array[i * 3 + 2]
                );
 
                if(animationFlg == 'animation'){
                    positions[i * 3] += (p2.x - p.x) * 0.06;
                    positions[i * 3 + 1] += (p2.y - p.y) * 0.06;
                    positions[i * 3 + 2] += (p2.z - p.z) * 0.06;
                }else{
                    p = new THREE.Vector3(
                        positions[i * 3],
                        positions[i * 3 + 1],
                        positions[i * 3 + 2]
                    );
 
                    p.normalize().multiplyScalar((Math.sin((ix + time * 0.1 * 0.8) * 0.3) * 3) + 500);
 
                    positions[i * 3] += (p2.x - p.x) * 0.06;
                    positions[i * 3 + 1] += (p2.y - p.y) * 0.06;
                    positions[i * 3 + 2] += (p2.z - p.z) * 0.06;
                }
            }
            scales[i] = (Math.sin((ix + time * 0.1) * 0.3) + 1) * 12.5 + (Math.sin((iy + time * 0.1) * 0.3) + 1) * 12.5;
 
            i ++;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;
 
    particles.rotation.y = time * 0.05 * Math.PI / 180;
 
    renderer.render(scene,camera);
}