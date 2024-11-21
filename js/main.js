//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

//Create a Three.JS Scene
const scene = new THREE.Scene();
//create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 1000);

//Keep track of the mouse position
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

//Keep the 3D object on a global variable so we can access it later
let object;
let isDragging = false;
let dragOffset = new THREE.Vector3();

//OrbitControls allow the camera to move around the scene
let controls;

//Set which object to render
let objToRender = 'robot_ball';

//Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

//Load the file
loader.load(
  `models/${objToRender}/scene.gltf`,
  function (gltf) {
    //If the file is loaded, add it to the scene
    object = gltf.scene;
    scene.add(object);
  },
  function (xhr) {
    //While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    //If there is an error, log it
    console.error(error);
  }
);

//Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true }); //Alpha: true allows for the transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

//Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

//Set how far the camera will be from the 3D model
camera.position.z = objToRender === "robot_ball" ? 3 : 500;

//Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500) //top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === "robot_ball" ? 5 : 1);
scene.add(ambientLight);

//This adds controls to the camera, so we can rotate / zoom it with the mouse
if (objToRender === "robot_ball") {
  controls = new OrbitControls(camera, renderer.domElement);
}

//Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//Function to update the mouse position
function updateMouse(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

//Detect if the mouse is over an object
function onMouseDown(event) {
  updateMouse(event);
  
  //Raycast to detect object under the mouse
  raycaster.update();

  //Check intersection with the object
  const intersects = getIntersects();
  if (intersects.length > 0) {
    //Store the offset for dragging
    isDragging = true;
    dragOffset.copy(intersects[0].point).sub(object.position);
  }
}

function onMouseMove(event) {
  if (!isDragging) return;

  //Update the mouse position
  updateMouse(event);

  //Raycast again
  const intersects = getIntersects();
  if (intersects.length > 0) {
    //Move the object based on mouse position
    object.position.copy(intersects[0].point.sub(dragOffset));
  }
}

function onMouseUp() {
  isDragging = false;
}

function getIntersects() {
  raycaster.update();
  const intersects = raycaster.intersectObject(object);
  return intersects;
}

document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('mouseup', onMouseUp, false);

//Render the scene
function animate() {
  requestAnimationFrame(animate);
  // Here we could add some code to update the scene, adding some automatic movement
  renderer.render(scene, camera);
}

//Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//Start the 3D rendering
animate();
