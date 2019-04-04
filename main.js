




/**
 * https://codepen.io/SitePoint/pen/wBERzm?editors=1010
 * https://itnext.io/promise-loading-with-three-js-78a6297652a5
 * http://learningthreejs.com/blog/2013/09/16/how-to-make-the-earth-in-webgl/
 * https://threejsfundamentals.org/threejs/lessons/threejs-textures.html#hello
 * http://planetpixelemporium.com/earth.html
 * 
 * 
 * 
 */


let camera,
    renderer,
    light,
    scene,
    earthMesh,
    starMesh,
    atmosMesh,
    earthObject,
    stats,
    rotationSpeed = 0.2,
    satelliteSpeed = 0.2,
    orbitControl,
    container,
    atmosphere,
    orbits = [],
    constallation = [],
    clock,
    WIDTH,
    loader,
    mapTexture,
    bumpMapTexture,
    specularMapTexture,
    starTexture,
    HEIGHT;

document.addEventListener('DOMContentLoaded', init);

function init() {
  loader = new THREE.TextureLoader();
  container = document.querySelector('.container');
  WIDTH = container.offsetWidth;
  HEIGHT = container.offsetHeight; 

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize(WIDTH, HEIGHT);
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  let angle = 60,
    aspect = WIDTH / HEIGHT,
    near = 0.1,
    far = 3000;

  addStatsAndGUI();

  addEarth();
  addLight();
  addGridAndAxis();
  addStars();
  addOrbits();
  addSatellites();


  camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
  camera.position.set(20, 50, 220);
  
  // atmosphere = new THREE.ShaderMaterial({
  //   uniforms:{
  //     "c": { type: "f", value: 0.3 },
  //     "p": { type: "f", value: 5.2},
  //     glowColor: { type: "c", value: new THREE.Color(0x00dbdb)},
  //     viewVector: { type: "v3", value: camera.position}
  //   },
  //   vertexShader: vertexShader,
  //   fragmentShader: fragmentShader,
  //   side: THREE.BackSide,
  //   blending: THREE.AdditiveBlending,
  //   transparent: true
  // });

  // atmosMesh = new THREE.Mesh(earthGeo, atmosphere);
  // atmosMesh.position = earthMesh.position;
  // atmosMesh.scale.multiplyScalar(1.2);
  // scene.add(atmosMesh);

  renderer.autoClear = false;
  renderer.shadowMapEnabled = true;

  container.appendChild(renderer.domElement);

  // orbitControl
  orbitControl = new THREE.OrbitControls( camera, renderer.domElement);
  orbitControl.addEventListener('change', render);
  console.log('THREE.OrbitControls: ', THREE.OrbitControls);
  animate();
} 


function animate() {
  requestAnimationFrame(animate);
  orbitControl.update();
  render();
}

function render() {
  delta = clock.getDelta();
  earthMesh.rotation.y += rotationSpeed * delta;
  updateSatellites();

  renderer.clear();
  renderer.render(scene, camera);
}


function resizeRenderer() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    renderer.setSize(width, height, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();    
  }
}


function addLight() {
  light = new THREE.AmbientLight(0xF9F5F5);
  // light.position.set(400, 4000, 1500);
  // light.target.position.set(1000, 3800, 1000);
  // light.castShadow = true;
  scene.add(light);
}

function addEarth() {

  const mapUrl = './aseets/world.jpg';
  const bumpMapUrl = './aseets/bump-map.jpg';
  const specularUrl = './aseets/specular.jpg';


  mapTexture = loader.load(mapUrl, function ( texture ) {
    // in this example we create the material when the texture is loaded
    console.log(texture);
  }, undefined, function(err) {
    console.log(err);
  });

  bumpMapTexture = loader.load(bumpMapUrl);

  const earthGeo = new THREE.SphereGeometry(37, 50, 50);
  const earthMat = new THREE.MeshPhongMaterial();
  // console.log('mapTexture: ', mapTexture);
  earthMat.map = mapTexture;
  // console.log('bumpMapTexture: ', bumpMapTexture);

  earthMat.bumpMap = bumpMapTexture;
  earthMat.bumpScale = 6;
  
  earthMat.specularMap = loader.load(specularUrl);;
  // console.log('bumpMapTexture: ', bumpMapTexture);
  earthMat.specular = new THREE.Color('#2e2e2e');          

  earthMesh = new THREE.Mesh(earthGeo, earthMat);
  //earthMesh.rotation.y = 5;
  // earthMesh.castShadow = true;
  // earthMesh.receiveShadow = true;

  scene.add(earthMesh);
}


function addOrbits() {
  // put inside Object and make eah orbit in different colors
  var orbit = new THREE.Object3D();
  var ringGeom = new THREE.RingGeometry( 60, 60.1, 360, 8, 0, 2*Math.PI );
  var ringMat = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
  var ring = new THREE.Mesh( ringGeom, ringMat );
  orbit.position.set(0, 0, 0);
  orbit.add( ring );

  for (let i = 0; i < 6; i++) {
    orbit = orbit.clone();
    console.log();
    orbit.rotation.y = i * Math.PI/3.0;
    orbit.rotation.x = i * Math.PI/3.0;
    orbit.rotation.z = i * Math.PI/3.0;
    orbits.push(orbit);
    scene.add(orbit);
  }
}

function addStars() {
  const starGeo = new THREE.SphereGeometry(300, 40, 20);
  const starMat = new THREE.MeshBasicMaterial();
  const starsUrl = './aseets/star-fields.png';

  starMat.map = loader.load(starsUrl, function ( texture ) {
    // in this example we create the material when the texture is loaded
    console.log(texture);
  }, undefined, function(err) {
    console.log(err);
  });

  starMat.side = THREE.BackSide;
              
  starMesh = new THREE.Mesh(starGeo, starMat);
              
  scene.add(starMesh);
}

function addGridAndAxis() {
  // radius, radials, circles, divisions, color1, color2
  var polarGridHelper = new THREE.PolarGridHelper( 300, 16, 16, 32, 0x1db207, 0x808080 );
  scene.add( polarGridHelper );
  const axes = new THREE.AxisHelper(100);
  scene.add(axes);
}


function addControls() {
  
}


function addSatellites() {

  for (let i=0; i<1; i+=1) {
    const satellGeo = new THREE.SphereGeometry(1,25,25);
    const satellMat = new THREE.MeshLambertMaterial({color: 0xffffff});
    const satellite = new THREE.Mesh(satellGeo, satellMat);
    satellite.position.set(50, 50, 0);

    scene.add(satellite);
    satellite.id = `navstar_${i+1}`;
    constallation.push(satellite);
  }

}

function updateSatellites() {
  satelliteSpeed += 0.001;
  for (let i=0; i<constallation.length; i+=1) {
    const navstar = constallation[i];
    navstar.position.x = 60*Math.cos(satelliteSpeed);
    navstar.position.y = 60*Math.sin(satelliteSpeed);
    // navstar.position.z = 55 + 10*Math.cos(satelliteSpeed);
    camera.position.copy(navstar.position);
  }
  
}

function addStatsAndGUI() {
  
  let controls = new function() {
    this.rotationSpeed = 0.02;
    this.bouncingSpeed = 0.03;
	}
  

  let gui = new dat.GUI();
  gui.add(controls, 'rotationSpeed', 0, 0.5);
  gui.add(controls, 'bouncingSpeed', 0, 0.5);

  stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '15px';
  stats.domElement.style.top = '15px';
  console.log('starty: ', gui);

  document.getElementById('stats-panel')
  	.appendChild( stats.domElement );
 
}



function loadAssets() {
  // const worldBestQuality = 'https://blocks.wizb.it/img/world.jpg';
  // const cloudMapUrl = 'http://learningthreejs.com/data/2013-09-16-how-to-make-the-earth-in-webgl/demo/bower_components/threex.planets/images/earthcloudmap.jpg'; 
  // const earthmap1k = 'http://learningthreejs.com/data/2013-09-16-how-to-make-the-earth-in-webgl/demo/bower_components/threex.planets/images/earthmap1k.jpg';
  // const starsUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/star-field.png';
  // const specularMap = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/earthspec1k.jpg';
}
