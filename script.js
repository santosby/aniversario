// VARIABLES DEL ENTORNO GRÁFICO
let scene, camera, renderer, clock;
let galaxyParticles, heartParticles, blackHoleMesh, starField;
let bubblesArray = [];
let raycaster, mouse;

// 🌟 NUEVAS VARIABLES: ESTRELLAS FUGACES Y HOVER
let shootingStars = [];
let currentlyHovered = null;

// ESTADO DE LA ANIMACIÓN
let animationPhase = "waiting"; // waiting, explosion, active
let explosionProgress = 0;

// ==========================================
// CONFIGURACIÓN DE TUS FOTOS LOCALES (10 FOTOS)
// ==========================================
const memoryData = [
    { 
        title: "Nuestros Inicios", 
        text: "Hace exactamente 3 años nuestra historia comenzó. Desde ese primer instante supe que cambiarías mi mundo para siempre.", 
        img: "./fotos/foto1.jpg" 
    },
    { 
        title: "Mi Lugar Favorito", 
        text: "En todo el mapa del infinito cosmos, mi coordenada preferida siempre será acurrucarme entre tus brazos, Jael.", 
        img: "./fotos/foto2.jpg" 
    },
    { 
        title: "Constelación de Ti", 
        text: "Si uniera las estrellas más brillantes del cielo nocturno, sin duda alguna formarían la silueta de tu hermoso rostro.", 
        img: "./fotos/foto3.jpg" 
    },
    { 
        title: "Amor Infinito", 
        text: "Nuestro viaje romántico no conoce de límites temporales. Cruzamos el espacio-tiempo directo hacia un siempre juntos.", 
        img: "./fotos/foto4.jpg" 
    },
    { 
        title: "Cada Segundo Contigo", 
        text: "Cada momento a tu lado se convierte en mi recuerdo más valioso. Gracias por hacer que estos 3 años se sientan tan mágicos.", 
        img: "./fotos/foto5.jpg" 
    },
    { 
        title: "Mi Complemento Perfecto", 
        text: "Eres todo lo que un día soñé y mucho más. No me canso de descubrir lo increíble que es compartir mi vida contigo.", 
        img: "./fotos/foto6.jpg" 
    },
    { 
        title: "Un Futuro Juntos", 
        text: "Mirar al futuro ya no me da miedo porque sé que estás tú en él. Quiero seguir construyendo este camino de tu mano.", 
        img: "./fotos/foto7.jpg" 
    },
    { 
        title: "Mi Amor Eterno", 
        text: "En esta vida y en cualquiera que exista después, mi corazón te volvería a elegir una y otra vez sin dudarlo.", 
        img: "./fotos/foto8.jpg" 
    },
    { 
        title: "Cómplices de Vida", 
        text: "Por todas las risas compartidas, nuestros secretos y el apoyo incondicional que nos damos en cada paso.", 
        img: "./fotos/foto9.jpg" 
    },
    { 
        title: "Nuestro Reflejo en el Cielo ✨", 
        text: "En el Salar de Uyuni, donde el cielo se une con la tierra, entendí que lo nuestro es infinito. Caminar contigo sobre ese espejo blanco, sintiendo que tocábamos las estrellas juntos, es el recuerdo más mágico de mi vida. Eres mi universo entero, Jael. ¡Felices 3 años de parte de tu Moisés!", 
        img: "./fotos/foto10.jpg" 
    }
];

// ASIGNACIÓN DE BOTONES E INTERFAZ HTML
const btnStart = document.getElementById('btn-start');
const welcomeScreen = document.getElementById('welcome-screen');
const anniversaryBadge = document.getElementById('anniversary-badge'); 
const modal = document.getElementById('message-modal');
const btnClose = document.getElementById('btn-close');
const bgMusic = document.getElementById('bg-music'); 

// AL HACER CLIC EN INICIAR, ARRANCAMOS EL SISTEMA, LA MÚSICA Y LA EXPLOSIÓN
btnStart.addEventListener('click', () => {
    if (bgMusic) {
        bgMusic.volume = 0.5; 
        bgMusic.play().catch(error => console.log("Error al reproducir audio:", error));
    }

    welcomeScreen.style.opacity = '0';
    setTimeout(() => {
        welcomeScreen.style.visibility = 'hidden';
        anniversaryBadge.classList.remove('hidden-ui'); 
        initThreeJS();
        animationPhase = "explosion"; 
    }, 1500);
});

// EVENTO DE CIERRE DE TARJETA
btnClose.addEventListener('click', () => {
    modal.classList.add('modal-hidden');
});

// INICIALIZACIÓN DEL ENTORNO DE GRÁFICOS 3D
function initThreeJS() {
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002); 

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 75, 140);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // CONSTRUCCIÓN DE COMPONENTES DEL UNIVERSO
    buildBackgroundStars(); 
    buildBlackHole();
    buildGalaxyAndExplosionParticles();
    buildHeartStructure();
    buildFloatingBubbles();
    addShootingStarSystem(); // 🌟 Activamos las estrellas fugaces

    // EVENTOS DE ESCUCHA
    window.addEventListener('resize', handleResize);
    window.addEventListener('click', handleBubbleClick);
    window.addEventListener('mousemove', handleMouseMove); // 🌟 Captura el movimiento del mouse
    
    modal.classList.add('modal-hidden');

    runRenderLoop();
}

// CAPA DE ESTRELLAS DE FONDO (POLVO ESTELAR)
function buildBackgroundStars() {
    const starCount = 12000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 700;
        positions[i3+1] = (Math.random() - 0.5) * 700;
        positions[i3+2] = (Math.random() - 0.5) * 700;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.65,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    starField = new THREE.Points(geometry, material);
    scene.add(starField);
}

// 1. EL AGUJERO NEGRO CENTRAL
function buildBlackHole() {
    const coreGeo = new THREE.SphereGeometry(4, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    blackHoleMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(blackHoleMesh);

    const glowGeo = new THREE.RingGeometry(4, 9, 32);
    const glowMat = new THREE.MeshBasicMaterial({ 
        color: 0xff8c00, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.rotation.x = Math.PI / 2;
    blackHoleMesh.add(glowMesh);
}

// 2. LA GALAXIA Y PARTÍCULAS DE LA EXPLOSIÓN INICIAL
function buildGalaxyAndExplosionParticles() {
    const particleCount = 25000; 
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const customTargets = [];
    const colorInside = new THREE.Color(0xff1493); 
    const colorOutside = new THREE.Color(0x4b0082); 

    for(let i=0; i<particleCount; i++) {
        const i3 = i * 3;

        const radius = Math.pow(Math.random(), 2) * 100;
        const spinAngle = radius * 0.14;
        const branchAngle = ((i % 4) * Math.PI * 2) / 4; 

        const xTarget = Math.cos(branchAngle + spinAngle) * radius + (Math.random() - 0.5) * 5;
        const zTarget = Math.sin(branchAngle + spinAngle) * radius + (Math.random() - 0.5) * 5;
        const yTarget = (Math.random() - 0.5) * 3 * (1 - radius/100);

        positions[i3] = (Math.random() - 0.5) * 2;
        positions[i3+1] = (Math.random() - 0.5) * 2;
        positions[i3+2] = (Math.random() - 0.5) * 2;

        customTargets.push(new THREE.Vector3(xTarget, yTarget, zTarget));

        const mixedColor = colorInside.clone().lerp(colorOutside, radius / 100);
        colors[i3] = mixedColor.r;
        colors[i3+1] = mixedColor.g;
        colors[i3+2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.42,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    galaxyParticles = new THREE.Points(geometry, material);
    galaxyParticles.userData = { targets: customTargets };
    scene.add(galaxyParticles);
}

// 3. EL GRAN CORAZÓN QUE SE ELEVA EN EL CENTRO
function buildHeartStructure() {
    const heartCount = 4000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(heartCount * 3);

    for(let i=0; i<heartCount; i++) {
        const i3 = i * 3;
        const t = Math.random() * Math.PI * 2;

        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        const z = (Math.random() - 0.5) * 8; 

        positions[i3] = x * 1.8;
        positions[i3+1] = y * 1.8 + 40; 
        positions[i3+2] = z * 1.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xda70d6, 
        size: 0.65,
        transparent: true,
        opacity: 0, 
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    heartParticles = new THREE.Points(geometry, material);
    scene.add(heartParticles);
}

// 4. BURBUJAS FLOTANTES
function buildFloatingBubbles() {
    const textureLoader = new THREE.TextureLoader();

    memoryData.forEach((data, index) => {
        const geo = new THREE.CircleGeometry(8, 32); 
        const texture = textureLoader.load(data.img);
        const mat = new THREE.MeshBasicMaterial({ 
            map: texture, 
            side: THREE.DoubleSide, 
            transparent: true,
            opacity: 0 
        });

        const mesh = new THREE.Mesh(geo, mat);
        const angle = (index * (Math.PI * 2)) / memoryData.length;
        const radius = 75; 

        mesh.position.set(Math.cos(angle) * radius, 15, Math.sin(angle) * radius);
        
        mesh.userData = {
            title: data.title,
            text: data.text,
            img: data.img,
            angle: angle,
            radius: radius,
            speed: 0.3 + (index * 0.02),
            heightOffset: index * 2.5,
            baseScale: 1.0 // Guardamos la escala base
        };

        scene.add(mesh);
        bubblesArray.push(mesh);
    });
}

// 🌟 NUEVO: INICIALIZAR LÍNEAS DE ESTRELLAS FUGACES
function addShootingStarSystem() {
    for (let i = 0; i < 3; i++) {
        const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0 });
        const points = [new THREE.Vector3(0,0,0), new THREE.Vector3(-15, 10, -15)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const starLine = new THREE.Line(lineGeo, lineMat);
        
        resetShootingStar(starLine);
        scene.add(starLine);
        shootingStars.push(starLine);
    }
}

function resetShootingStar(star) {
    star.position.set((Math.random() - 0.5) * 300, 100 + Math.random() * 50, (Math.random() - 0.5) * 300);
    star.material.opacity = 0;
    star.userData = { speedY: -60 - Math.random() * 40, speedX: 40 + Math.random() * 30, active: false, timer: Math.random() * 5 };
}

// BUCLE DE RENDERIZADO Y ANIMACIÓN
function runRenderLoop() {
    requestAnimationFrame(runRenderLoop);

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    if (animationPhase === "explosion") {
        explosionProgress += delta * 0.6; 
        const posAttr = galaxyParticles.geometry.attributes.position;
        const targets = galaxyParticles.userData.targets;

        for (let i = 0; i < targets.length; i++) {
            const i3 = i * 3;
            posAttr.array[i3] += (targets[i].x - posAttr.array[i3]) * (explosionProgress * 0.1);
            posAttr.array[i3+1] += (targets[i].y - posAttr.array[i3+1]) * (explosionProgress * 0.1);
            posAttr.array[i3+2] += (targets[i].z - posAttr.array[i3+2]) * (explosionProgress * 0.1);
        }
        posAttr.needsUpdate = true;

        if (explosionProgress >= 1) {
            animationPhase = "active";
        }
    } else if (animationPhase === "active") {
        galaxyParticles.rotation.y += 0.002;
        if (starField) starField.rotation.y += 0.0003; 
        
        if(heartParticles.material.opacity < 0.95) heartParticles.material.opacity += 0.01;
        bubblesArray.forEach(b => { if(b.material.opacity < 1) b.material.opacity += 0.02; });

        // 🌟 MANEJO DE ESTRELLAS FUGACES EN TIEMPO REAL
        shootingStars.forEach(star => {
            if (!star.userData.active) {
                star.userData.timer -= delta;
                if (star.userData.timer <= 0) star.userData.active = true;
            } else {
                star.position.y += star.userData.speedY * delta;
                star.position.x += star.userData.speedX * delta;
                star.material.opacity = Math.min(star.material.opacity + 0.1, 1.0);
                
                if (star.position.y < -50) resetShootingStar(star);
            }
        });
    }

    // 🌟 CORAZÓN QUE PULSA EN TAMAÑO Y COLOR SUTILMENTE
    if (heartParticles) {
        const pulseFactor = 1 + Math.sin(elapsed * 2.5) * 0.05;
        heartParticles.scale.set(pulseFactor, pulseFactor, pulseFactor);
        heartParticles.rotation.y = Math.sin(elapsed * 0.2) * 0.12;
        
        // Cambia sutilmente el tono entre morado y dorado de aniversario
        let cycle = (Math.sin(elapsed * 1.5) + 1) / 2;
        heartParticles.material.color.setHSL(0.85 - (cycle * 0.1), 0.7, 0.6);
    }

    // INTERPOLACIÓN SUAVE PARA EL EFECTO HOVER EN LAS BURBUJAS
    bubblesArray.forEach((bubble) => {
        const uData = bubble.userData;
        uData.angle += 0.003 * uData.speed; 

        let targetRadius = uData.radius;
        let targetScale = 1.0;

        // Si la burbuja está bajo el mouse, crece y se acerca al usuario
        if (currentlyHovered === bubble) {
            targetRadius = uData.radius + 8;
            targetScale = 1.25;
        }

        // Lerp o transición suave
        let currentRadius = THREE.MathUtils.lerp(bubble.position.distanceTo(new THREE.Vector3(0, bubble.position.y, 0)), targetRadius, 0.1);
        
        bubble.position.x = Math.cos(uData.angle) * currentRadius;
        bubble.position.z = Math.sin(uData.angle) * currentRadius;
        bubble.position.y = 15 + Math.sin(elapsed * 1.2 + uData.heightOffset) * 3;

        let s = THREE.MathUtils.lerp(bubble.scale.x, targetScale, 0.1);
        bubble.scale.set(s, s, s);

        bubble.lookAt(camera.position);
    });

    renderer.render(scene, camera);
}

// 🌟 NUEVO: DETECTAR QUÉ ESTÁ TOCANDO EL MOUSE PARA EL HOVER
function handleMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bubblesArray);

    if (intersects.length > 0) {
        if (currentlyHovered !== intersects[0].object) {
            currentlyHovered = intersects[0].object;
            document.body.style.cursor = 'pointer'; // Cambia el cursor a mano interactiva
        }
    } else {
        if (currentlyHovered !== null) {
            currentlyHovered = null;
            document.body.style.cursor = 'default';
        }
    }
}

// MANEJO DE CLICS
function handleBubbleClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bubblesArray);

    if (intersects.length > 0) {
        const selectedBubble = intersects[0].object.userData;
        
        document.getElementById('modal-img').src = selectedBubble.img;
        document.getElementById('modal-title').textContent = selectedBubble.title;
        document.getElementById('modal-text').textContent = selectedBubble.text;

        modal.classList.remove('modal-hidden');
    }
}

// REDIMENSIONAMIENTO
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}