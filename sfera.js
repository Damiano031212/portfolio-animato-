// Variabili globali
let scene, camera, renderer, sphere;
let videoSfondo, textureSfondo;
let mouse = new THREE.Vector2();
let targetRotation = new THREE.Vector2(0, 0);
let clock = new THREE.Clock();

// Altezza di comparsa della sfera
const APPEAR_HEIGHT = 1800;

let sphereVisible = false;
let appearProgress = 0;
let disappearProgress = 0;

let raycaster = new THREE.Raycaster();
let sphereStartY = -1;
let sphereFinalY = 0;
let sphereSize = 0.5;

// Spin Z
let spinZ = 0;
let originalZ = 0;
let recoverZ = false;

// Stato hover Three.js → cursor.js
window.isHoverSphere = false;

// Inizializzazione
function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 9;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('container').appendChild(renderer.domElement);

    setupVideo();
    createSphere();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onClickScene);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('scroll', onScrollShowSphere);

    animate();
}

// Setup video
function setupVideo() {
    videoSfondo = document.getElementById('videoSfondo');

    textureSfondo = new THREE.VideoTexture(videoSfondo);
    textureSfondo.minFilter = THREE.LinearFilter;
    textureSfondo.magFilter = THREE.LinearFilter;

    playVideo();
}

function playVideo() {
    videoSfondo.play().catch(() => {
        console.log('Clicca sullo schermo per avviare il video');
    });
}

// Crea la sfera
function createSphere() {
    const geometry = new THREE.SphereGeometry(sphereSize, 64, 64);

    const material = new THREE.MeshBasicMaterial({
        map: textureSfondo,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
    });

    sphere = new THREE.Mesh(geometry, material);
    sphere.rotation.y = -Math.PI / 2;

    originalZ = sphere.rotation.z;

    sphere.position.y = sphereStartY;
    sphere.visible = false;

    scene.add(sphere);
}

// Hover della sfera (basato su raycaster)
function checkSphereHover() {
    if (!sphere || !sphere.visible) {
        window.isHoverSphere = false;
        return;
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(sphere);

    if (intersects.length > 0) {
        window.isHoverSphere = true;
    } else {
        window.isHoverSphere = false;
    }
}

// Movimento mouse — versione corretta con bounding rect del canvas
function onDocumentMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();

    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    mouse.x = (canvasX / rect.width) * 2 - 1;
    mouse.y = -(canvasY / rect.height) * 2 + 1;

    targetRotation.x = -mouse.y * 0.5;
    targetRotation.y = mouse.x * 0.5;

    checkSphereHover();
}

// Apparizione con scroll
function onScrollShowSphere() {
    if (window.scrollY > APPEAR_HEIGHT && !sphereVisible) {
        sphereVisible = true;
        appearProgress = 0;
        sphere.visible = true;
    }

    if (window.scrollY < APPEAR_HEIGHT && sphereVisible) {
        sphereVisible = false;
        disappearProgress = 0;
    }
}

// Click sulla sfera
function onClickScene(event) {
    if (!sphere) return;

    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    mouse.set(x, y);
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(sphere);

    if (intersects.length > 0) {
        spinZ = 0.9;
        recoverZ = true;

        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// Animazione principale
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    if (sphere) {

        // Fade in / Fade out
        if (sphereVisible) {
            if (appearProgress < 1) appearProgress += 0.05;
            const t = appearProgress * appearProgress;

            sphere.material.opacity = t;
            sphere.position.y = sphereStartY + (sphereFinalY - sphereStartY) * t;

        } else {
            if (disappearProgress < 1) disappearProgress += 0.05;
            const t = 1 - disappearProgress;

            sphere.material.opacity = t;
            sphere.position.y = sphereStartY + (sphereFinalY - sphereStartY) * t;

            if (t <= 0) sphere.visible = false;
        }

        // Movimento controllato dal mouse
        sphere.rotation.x += (targetRotation.x - sphere.rotation.x) * 0.1;
        let targetY = targetRotation.y - Math.PI / 2;
        sphere.rotation.y += (targetY - sphere.rotation.y) * 0.1;

        // Levita
        const speed = 2;
        const amplitude = 0.1;
        sphere.position.y += Math.sin(elapsedTime * speed) * amplitude * 0.01;

        // Spin Z
        if (spinZ > 0.001) {
            sphere.rotation.z += spinZ;
            spinZ *= 0.88;
        } else if (recoverZ) {
            const diff = originalZ - sphere.rotation.z;
            sphere.rotation.z += diff * 0.15;

            if (Math.abs(diff) < 0.001) {
                sphere.rotation.z = originalZ;
                recoverZ = false;
            }
        }
    }

    renderer.render(scene, camera);
}

// Resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('DOMContentLoaded', init);

