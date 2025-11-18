// Variabili globali
let scene, camera, renderer, sphere;
let videoSfondo, textureSfondo;
let mouse = new THREE.Vector2(); // Vettore per le coordinate normalizzate del mouse
let targetRotation = new THREE.Vector2(0, 0); // Rotazione target della sfera
let clock = new THREE.Clock(); // ⭐ NUOVO: Clock per tracciare il tempo per l'animazione di levitazione

// Inizializzazione
function init() {
    // Setup scena
    scene = new THREE.Scene();
    
    // Setup camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 9;
    
    
    // Setup renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Carica video
    setupVideo();
    
    // Crea sfera
    createSphere();
    
    // Illuminazione
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', playVideo);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    
    // Avvia animazione
    animate();
}

// Setup video
function setupVideo() {
    videoSfondo = document.getElementById('videoSfondo');
    
    // Crea texture dal video
    textureSfondo = new THREE.VideoTexture(videoSfondo);
    textureSfondo.minFilter = THREE.LinearFilter;
    textureSfondo.magFilter = THREE.LinearFilter;

    // Prova ad avviare il video
    playVideo();
}

// Avvia il video
function playVideo() {
    videoSfondo.play().catch(e => {
        console.log('Clicca sullo schermo per avviare il video');
    });
}

// Crea la sfera con texture
function createSphere() {
    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    
    const material = new THREE.MeshBasicMaterial({
        map: textureSfondo,
        side: THREE.DoubleSide
    });
    
    sphere = new THREE.Mesh(geometry, material);
    
    // Rotazione iniziale per orientare correttamente la texture 
    sphere.rotation.y = -Math.PI / 2; 
    
    scene.add(sphere);
}

// Gestione del movimento del mouse
function onDocumentMouseMove(event) {
    // Calcola le coordinate del mouse in un intervallo da -1 a 1 (coordinate normalizzate)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Imposta la rotazione target basata sul movimento del mouse.
    targetRotation.x = -mouse.y * 0.5; // Rotazione sull'asse X (verticale)
    targetRotation.y = mouse.x * 0.5;  // Rotazione sull'asse Y (orizzontale)
}

// Animazione
function animate() {
    requestAnimationFrame(animate);
    
    // ⭐ NUOVO: Ottieni il tempo trascorso (in secondi)
    const elapsedTime = clock.getElapsedTime();
    
    if (sphere) {
        // --- Levitation Effect ---
        // Utilizza la funzione seno per creare un'oscillazione verticale fluida.
        // Math.sin(tempo * velocità) * ampiezza
        const speed = 2; // Frequenza del movimento (più basso = più lento)
        const amplitude = 0.1; // Distanza che copre il movimento (più alto = più alto)
        
        // ⭐ APPLICA L'OSCILLAZIONE ALLA POSIZIONE Y
        sphere.position.y = Math.sin(elapsedTime * speed) * amplitude;
        
        // --- Mouse Look Rotation ---
        // Rotazione sull'asse X (movimento verticale del mouse)
        sphere.rotation.x += (targetRotation.x - sphere.rotation.x) * 0.1;
        
        // Rotazione sull'asse Y (movimento orizzontale del mouse)
        let targetY = targetRotation.y - Math.PI / 2;
        sphere.rotation.y += (targetY - sphere.rotation.y) * 0.1;
    }
    
    renderer.render(scene, camera);
}

// Gestione resize finestra
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Avvia quando il DOM è pronto
window.addEventListener('DOMContentLoaded', init);