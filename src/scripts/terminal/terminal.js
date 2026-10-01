import { loadEngine } from '../../utils/engine.js';
import { assetUrl } from '../../utils/assets.js';

export function initTerminal(scope) {
(() => {


        // Three.js is only needed after the visitor opens the terminal. Keep it out of
        // the initial page payload, then fetch it while the terminal boot animation plays.
        let THREE;
        let OrbitControls;
        let threeLoadPromise;
        function loadThree() {
            if (!threeLoadPromise) {
                threeLoadPromise = loadEngine().then(engine => {
                    THREE = engine;
                    OrbitControls = window.OrbitControls;
                });
            }
            return threeLoadPromise;
        }

        const container     = document.getElementById('three-canvas');
        const wrapper       = document.getElementById('sceneWrapper');
        const labelContainer= document.getElementById('labelContainer');
        const mainUI        = document.getElementById('main-ui');
        const audio         = document.getElementById('bg-music');
        const bootScreen    = document.getElementById('boot');
        const initBtn       = document.getElementById('init-btn');
        const statusEl      = document.getElementById('boot-status');
        const bgTransition  = document.getElementById('bg-transition');
        const floatingEmblem= document.getElementById('floating-emblem');
        const bootFadeGroup = document.getElementById('bootFadeGroup');
        const bScanlines    = document.getElementById('bScanlines');
        const bEmblem       = document.querySelector('.b-emblem');
        const orbitTitle    = document.getElementById('orbitTitle');
        const orbitPanels   = document.getElementById('orbitPanels');
        const orbitTabBtns  = Array.from(document.querySelectorAll('.orbit-tab'));
        const vehicleCards  = Array.from(document.querySelectorAll('.widget-card.selectable'));

        /* ===== 轨道参数显示标签切换 ===== */
        let onLockVehicle = null;   // 由 3D 场景注册：锁定视角跟随某航天器
        let onUnlockVehicle = null; // 由 3D 场景注册：解除视角锁定

        function switchOrbitPanel(target, lockCamera = false) {
            orbitTabBtns.forEach(t => t.classList.toggle('active', t.dataset.target === target));
            orbitPanels.querySelectorAll('.orbit-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === target));
            vehicleCards.forEach(c => c.classList.toggle('selected', c.dataset.sc === target));
            orbitTitle.textContent = target === 'global' ? 'Orbital Parameters' : `Orbital Parameters · ${target}`;
            // Parameter tabs should only change the data.  Keeping their camera independent
            // leaves the Earth centered and fully visible in the main scene.
            if (lockCamera && target !== 'global' && onLockVehicle) {
                onLockVehicle(target);
            } else if (onUnlockVehicle) {
                onUnlockVehicle();
            }
        }

        orbitTabBtns.forEach(btn => scope.listen(btn, 'click', () => {
            const target = btn.dataset.target;
            switchOrbitPanel(target, target !== 'global');
        }));
        vehicleCards.forEach(card => scope.listen(card, 'click', () => {
            switchOrbitPanel(card.dataset.sc, true);
        }));

        /* ===== 运转速度控制（1x / 0.5x / 0.25x / 0.1x） ===== */
        const speedBtns = Array.from(document.querySelectorAll('.speed-btn'));
        let orbitSpeed = 1;
        let onOrbitSpeedChange = null; // 由 3D 场景注册：速度档位变化时刷新角速度/周期显示
        speedBtns.forEach(btn => scope.listen(btn, 'click', () => {
            orbitSpeed = parseFloat(btn.dataset.speed);
            speedBtns.forEach(b => b.classList.toggle('active', b === btn));
            if (onOrbitSpeedChange) onOrbitSpeedChange();
        }));

        /* ========================================================
           修改 SUBTITLE_INTER 的值来调节字幕的(毫秒)
           ======================================================== */
        const SUBTITLE_INTERVAL = 250;

        const MSGS = [
            'INITIALIZING INS CORE…',
            'LOADING ORBITAL DATABASE…',
            'CALIBRATING GYROSCOPES…',
            'ESTABLISHING TELEMETRY LINK…',
            'ACQUIRING ГЛОНАСС SIGNAL…',
            'ALL SYSTEMS NOMINAL, ALL ENGINE RUNNING…',
            'A NEW AGE IS UPON US!.'
        ];

        function boot() {
            initBtn.disabled = true;
            // Start downloading the 3D renderer only after the user has opted into it.
            // The transition below gives this request time to finish before the dashboard appears.
            loadThree().catch(() => {
                statusEl.textContent = '3D MODULE UNAVAILABLE';
            });
            window.SiteMusic.startTerminal();

            let i = 0;
            const iv = scope.setInterval(() => {
                statusEl.textContent = MSGS[i++];
                if (i >= MSGS.length) {
                    scope.clearInterval(iv);
                    scope.setTimeout(() => {
                        startTransition();
                    }, 400);
                }
            }, SUBTITLE_INTERVAL); // 使用变量控制速度
        }

        function startTransition() {
            // 将徽标移到固定过渡层：文字先淡出，核心图案则保留到最后上升。
            const emblemRect = bEmblem.getBoundingClientRect();
            floatingEmblem.style.left = `${emblemRect.left}px`;
            floatingEmblem.style.top = `${emblemRect.top}px`;
            floatingEmblem.style.width = `${emblemRect.width}px`;
            floatingEmblem.style.height = `${emblemRect.height}px`;
            floatingEmblem.appendChild(bEmblem);
            floatingEmblem.classList.add('active');

            // 淡出其余内容（标题、状态、按钮）
            bootFadeGroup.classList.add('fade-out');
            bScanlines.classList.add('fade-out');

            // 背景色过渡
            bgTransition.classList.add('to-light');

            // 外围图案与背景同步淡出
            bEmblem.classList.add('periph-gone');

            // 外围轨道消失后，保留的核心航天器图案单独上升。
            scope.setTimeout(() => {
                floatingEmblem.classList.add('emblem-rise');
            }, 1500);

            // 上升完成后淡出徽标，再让主 UI 进入。
            scope.setTimeout(() => {
                floatingEmblem.classList.add('emblem-gone');
                mainUI.classList.add('active');
                mainUI.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                scope.requestAnimationFrame(() => {
                    scope.requestAnimationFrame(() => {
                        mainUI.classList.add('visible');
                    });
                });
                startApp();
            }, 2600);

            // 清理
            scope.setTimeout(() => {
                bootScreen.style.display = 'none';
                floatingEmblem.style.display = 'none';
                bgTransition.style.display = 'none';
            }, 3500);
        }

        scope.listen(initBtn, 'click', boot);

        // ---------- 3D 场景（保持不变） ----------
        async function startApp() {
            await loadThree();
            if (!scope.active) return;
            wrapper.classList.remove('is-model-ready');
            const scene = new THREE.Scene();
            scene.background = new THREE.Color('#ece6dc');

            const isMobile = window.innerWidth < 768;
            const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
            // Keep the planet fully inside the scene frame while using nearly all of its height.
            // The desktop dashboard has a deliberately shallow scene strip, so a small pull-back
            // prevents the globe from being clipped when a vehicle parameter panel is selected.
            camera.position.set(isMobile ? 3.5 : 2.6, isMobile ? 1.8 : 1.73, isMobile ? 5.2 : 3.47);
            camera.lookAt(0, 0, 0);

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.1;
            container.appendChild(renderer.domElement);

            const controls = new OrbitControls(camera, renderer.domElement);
            scope.trackScene(scene, renderer, controls);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 1.6;
            controls.minDistance = 0.5;
            controls.maxDistance = 35;
            controls.target.set(0, 0, 0);
            controls.update();

            scene.add(new THREE.AmbientLight(0xffffff, 0.55));
            const sun = new THREE.DirectionalLight(0xffeedd, 2.2);
            sun.position.set(8, 6, 5);
            scene.add(sun);
            const fill = new THREE.DirectionalLight(0xccddff, 0.6);
            fill.position.set(-4, -2, -6);
            scene.add(fill);
            const rim = new THREE.DirectionalLight(0xffeeee, 0.7);
            rim.position.set(-3, 5, -4);
            scene.add(rim);

            const earthGroup = new THREE.Group();
            scene.add(earthGroup);
            const radius = 1.25;
            const textureUrl = assetUrl('images/textures/earth_atmos_2048.jpg');
            let earthTextureReady = false;
            const tex = new THREE.TextureLoader().load(
                textureUrl,
                () => { earthTextureReady = true; },
                undefined,
                () => { earthTextureReady = false; }
            );
            const earth = new THREE.Mesh(
                new THREE.SphereGeometry(radius, 64, 64),
                new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.08 })
            );
            earthGroup.add(earth);
            earthGroup.add(new THREE.Mesh(
                new THREE.SphereGeometry(radius * 1.015, 48, 48),
                new THREE.MeshBasicMaterial({ color: 0x8a9bb5, transparent: true, opacity: 0.09, side: THREE.BackSide })
            ));
            // 地球自转（受 Rotation Speed 档位控制；单位：1x 时每秒自转弧度）
            const EARTH_SPIN = 0.15;

            function createOrbitLine(a, b, inclDeg, color, opacity = 0.5) {
                const g = new THREE.Group();
                g.rotation.x = THREE.MathUtils.degToRad(inclDeg);
                const pts = [];
                for (let i = 0; i <= 120; i++) {
                    const t = (i / 120) * Math.PI * 2;
                    pts.push(a * Math.cos(t), 0, b * Math.sin(t));
                }
                const geom = new THREE.BufferGeometry();
                geom.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
                g.add(new THREE.Line(geom, new THREE.LineBasicMaterial({ color, transparent: true, opacity })));
                return g;
            }

            const orbitParams = [
                { a: 3.35, b: 2.15, inclination: 1.6,  color: 0xd4a84b },
                { a: 1.5,  b: 1.5,  inclination: 43.0, color: 0x6ba7d4 },
                { a: 1.9,  b: 1.7,  inclination: 69.0, color: 0x7ccf8c },
                { a: 2.6,  b: 2.4,  inclination: 28.0, color: 0xcf88b0 }
            ];

            const orbitGroups = [];
            orbitParams.forEach((p, i) => {
                const mainOrbit = createOrbitLine(p.a, p.b, p.inclination, p.color, 0.50);
                scene.add(mainOrbit);
                if (i === 0) {
                    scene.add(createOrbitLine(p.a * 0.97, p.b * 0.97, p.inclination, p.color, 0.15));
                    scene.add(createOrbitLine(p.a * 1.04, p.b * 1.04, p.inclination, p.color, 0.12));
                }
                orbitGroups.push(mainOrbit);
            });

            function createMarker(color, emissive) {
                const g = new THREE.Group();
                g.add(new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 0.35, roughness: 0.2, metalness: 0.7 })));
                g.add(new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 12), new THREE.MeshBasicMaterial({ color: emissive, transparent: true, opacity: 0.20 })));
                return g;
            }

            const spacecrafts = [];
            const angles = [0, 1.2, 2.5, 3.8];
            const speeds  = [0.006, 0.05, 0.02, 0.009];
            const colors  = [
                { c: 0xffd866, e: 0xffaa44 },
                { c: 0x88ddff, e: 0x4488cc },
                { c: 0x88ff99, e: 0x44cc55 },
                { c: 0xff88cc, e: 0xcc4488 }
            ];
            const clickableMeshes = [];
            orbitParams.forEach((p, i) => {
                const mg = new THREE.Group();
                orbitGroups[i].add(mg);
                const name = ['D1','D2','DR1','DWS1'][i];
                const marker = createMarker(colors[i].c, colors[i].e);
                marker.traverse((obj) => {
                    if (obj.isMesh) {
                        obj.userData.scName = name;
                        clickableMeshes.push(obj);
                    }
                });
                mg.add(marker);
                spacecrafts.push({ group: mg, params: p, angle: angles[i], omega: speeds[i] * 60, name }); // omega：角速度 rad/s（1x）
            });

            // 为每个航天器生成专属参数面板（角速度、周期、倾角、半长轴、实时相位角）
            const scColors = { D1:'#d4a84b', D2:'#6ba7d4', DR1:'#7ccf8c', DWS1:'#cf88b0' };
            spacecrafts.forEach((sc) => {
                const omega = sc.omega; // rad/s（真实角速度）
                const panel = document.createElement('div');
                panel.className = 'orbit-panel';
                panel.dataset.panel = sc.name;
                panel.innerHTML = `
                    <div class="sc-panel-head">
                        <span class="sc-dot" style="color:${scColors[sc.name]};background:${scColors[sc.name]};"></span>
                        <span class="sc-name" style="color:${scColors[sc.name]};">${sc.name}</span>
                        <span class="sc-tag">Tracking · Nominal</span>
                    </div>
                    <div class="orbit-grid">
                        <div class="orbit-item">
                            <span class="label">Angular Velocity</span>
                            <span class="value" id="omegaDeg-${sc.name}">${(omega * 180 / Math.PI).toFixed(1)}</span>
                            <span class="unit">°/s</span>
                        </div>
                        <div class="orbit-item">
                            <span class="label">Angular Velocity</span>
                            <span class="value" id="omegaRad-${sc.name}">${omega.toFixed(2)}</span>
                            <span class="unit">rad/s</span>
                        </div>
                        <div class="orbit-item">
                            <span class="label">Orbital Period</span>
                            <span class="value" id="period-${sc.name}">${(2 * Math.PI / omega).toFixed(2)}</span>
                            <span class="unit">s</span>
                        </div>
                        <div class="orbit-item">
                            <span class="label">Inclination</span>
                            <span class="value">${sc.params.inclination.toFixed(1)}</span>
                            <span class="unit">°</span>
                        </div>
                        <div class="orbit-item">
                            <span class="label">Semi-Major Axis</span>
                            <span class="value">${sc.params.a.toFixed(2)}</span>
                            <span class="unit"></span>
                        </div>
                        <div class="orbit-item">
                            <span class="label">Phase Angle</span>
                            <span class="value" id="phase-${sc.name}">0.0</span>
                            <span class="unit">°</span>
                        </div>
                    </div>`;
                orbitPanels.appendChild(panel);
                sc.angleEl = panel.querySelector(`#phase-${sc.name}`);
                sc.omegaDegEl = panel.querySelector(`#omegaDeg-${sc.name}`);
                sc.omegaRadEl = panel.querySelector(`#omegaRad-${sc.name}`);
                sc.periodEl  = panel.querySelector(`#period-${sc.name}`);
            });

            // 速度档位变化时，按当前实际角速度刷新各面板显示
            onOrbitSpeedChange = () => {
                spacecrafts.forEach((sc) => {
                    const w = sc.omega * orbitSpeed;
                    sc.omegaDegEl.textContent = (w * 180 / Math.PI).toFixed(1);
                    sc.omegaRadEl.textContent = w.toFixed(2);
                    sc.periodEl.textContent = (2 * Math.PI / w).toFixed(2);
                });
            };

            scene.add(new THREE.Points(
                new THREE.BufferGeometry().setFromPoints(Array.from({ length: 320 }, () => {
                    const r = 20 + Math.random() * 50;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    return new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
                })),
                new THREE.PointsMaterial({ color: 0x8a9bb5, size: 0.035, transparent: true, opacity: 0.35, sizeAttenuation: true })
            ));

            function createTrackLabel(text, color) {
                const el = document.createElement('div');
                el.textContent = text;
                el.className = 'tracking-label';
                el.style.color = color;
                labelContainer.appendChild(el);
                return el;
            }

            const trackables = [];
            spacecrafts.forEach((sc) => {
                const hex = { D1:'#d4a84b', D2:'#6ba7d4', DR1:'#7ccf8c', DWS1:'#cf88b0' }[sc.name] || '#ffffff';
                trackables.push({ element: createTrackLabel(sc.name, hex), object: sc.group, x: null, y: null });
            });

            const raycaster = new THREE.Raycaster();

            // ---------- 点击 3D 场景中的航天器小球，切换到对应标签 ----------
            const clickRaycaster = new THREE.Raycaster();
            const pointer = new THREE.Vector2();
            let pointerDownPos = null;
            let lockObj = null; // 当前视角锁定的航天器
            let lockDir = new THREE.Vector3(0, 0, 1); // 锁定视角方向（相对小球的单位向量）
            let lockDistance = 2.8;                   // 锁定视角距离
            let isLockDragging = false;               // 锁定状态下是否正在拖拽
            let lastPointer = { x: 0, y: 0 };         // 拖拽上一次指针位置

            // 注册视角锁定/解锁：以小球为静止系，相机刚性绑定小球
            onLockVehicle = (name) => {
                const sc = spacecrafts.find(s => s.name === name);
                if (sc) {
                    if (!lockObj) {
                        const wp = new THREE.Vector3();
                        sc.group.updateWorldMatrix(true, false);
                        sc.group.getWorldPosition(wp);
                        const viewDir = new THREE.Vector3().copy(camera.position).sub(wp);
                        if (viewDir.lengthSq() < 0.0001) {
                            lockDir.set(0, 0, 1);
                        } else {
                            lockDir.copy(viewDir).normalize();
                        }
                        lockDistance = 2.8;
                    }
                    lockObj = sc;
                    controls.enabled = false;
                    controls.enableDamping = false;
                    controls.autoRotate = false;
                }
            };
            onUnlockVehicle = () => {
                lockObj = null;
                controls.enabled = true;
                controls.enableDamping = true;
                controls.autoRotate = true;
                // Every free/orbital view is anchored to the Earth, never the
                // last selected spacecraft. This keeps the planet centered.
                controls.target.set(0, 0, 0);
                controls.update();
            };

            function onCanvasPointerDown(e) {
                pointerDownPos = [e.clientX, e.clientY];
                if (lockObj) {
                    isLockDragging = true;
                    lastPointer.x = e.clientX;
                    lastPointer.y = e.clientY;
                    renderer.domElement.style.cursor = 'grabbing';
                }
            }

            function onCanvasClick(e) {
                // 拖动视角时不触发选中
                if (pointerDownPos && (Math.abs(e.clientX - pointerDownPos[0]) > 5 || Math.abs(e.clientY - pointerDownPos[1]) > 5)) {
                    return;
                }
                const rect = renderer.domElement.getBoundingClientRect();
                pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                clickRaycaster.setFromCamera(pointer, camera);
                const hits = clickRaycaster.intersectObjects(clickableMeshes, false);
                if (hits.length > 0 && hits[0].object.userData.scName) {
                    switchOrbitPanel(hits[0].object.userData.scName, true);
                } else {
                    // 点空白处：切回 Orbital 标签并解锁视角，保持界面与视角一致
                    switchOrbitPanel('global');
                }
            }

            function onCanvasPointerMove(e) {
                const rect = renderer.domElement.getBoundingClientRect();
                pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                // 锁定静止系下的拖拽：相机绕小球旋转，小球保持静止
                if (lockObj && isLockDragging) {
                    const dx = e.clientX - lastPointer.x;
                    const dy = e.clientY - lastPointer.y;
                    lastPointer.x = e.clientX;
                    lastPointer.y = e.clientY;
                    rotateLockView(dx, dy);
                    return;
                }
                clickRaycaster.setFromCamera(pointer, camera);
                const hovered = clickRaycaster.intersectObjects(clickableMeshes, false).length > 0;
                renderer.domElement.style.cursor = hovered ? 'pointer' : '';
            }

            // 锁定拖拽结束
            function endLockDrag() {
                if (isLockDragging) {
                    isLockDragging = false;
                    renderer.domElement.style.cursor = '';
                }
            }

            // 绕小球旋转视角方向（水平/垂直）
            const lockUp = new THREE.Vector3(0, 1, 0);
            const lockRight = new THREE.Vector3();
            function rotateLockView(dx, dy) {
                // 与总览视角（OrbitControls）一致的拖拽灵敏度：2π / 画布高度
                const h = renderer.domElement.clientHeight || 1;
                const SENS = (2 * Math.PI) / h;
                lockRight.crossVectors(lockDir, lockUp);
                if (lockRight.lengthSq() < 1e-8) lockRight.set(1, 0, 0);
                lockRight.normalize();
                lockDir.applyAxisAngle(lockUp, -dx * SENS);
                lockDir.applyAxisAngle(lockRight, dy * SENS);
                // 限制垂直角度，避免翻转到背面
                const maxY = 0.97;
                if (Math.abs(lockDir.y) > maxY) {
                    lockDir.y = Math.sign(lockDir.y) * maxY;
                    const s = Math.sqrt(Math.max(0, 1 - lockDir.y * lockDir.y) / (lockDir.x * lockDir.x + lockDir.z * lockDir.z));
                    lockDir.x *= s;
                    lockDir.z *= s;
                }
                lockDir.normalize();
            }

            scope.listen(renderer.domElement, 'pointerdown', onCanvasPointerDown);
            scope.listen(renderer.domElement, 'click', onCanvasClick);
            scope.listen(renderer.domElement, 'pointermove', onCanvasPointerMove);
            scope.listen(renderer.domElement, 'pointerup', endLockDrag);
            scope.listen(renderer.domElement, 'pointercancel', endLockDrag);
            // 锁定时滚轮缩放（小球仍保持静止）
            scope.listen(renderer.domElement, 'wheel', (e) => {
                if (!lockObj) return;
                e.preventDefault();
                lockDistance = Math.max(1.2, Math.min(8, lockDistance + e.deltaY * 0.004));
            }, { passive: false });

            function updateLabels(delta) {
                trackables.forEach((item) => {
                    const worldPos = new THREE.Vector3();
                    item.object.getWorldPosition(worldPos);
                    const direction = new THREE.Vector3().copy(worldPos).sub(camera.position).normalize();
                    raycaster.set(camera.position, direction);
                    const intersects = raycaster.intersectObject(earth);
                    let isBlocked = false;
                    if (intersects.length > 0) {
                        if (intersects[0].distance < worldPos.distanceTo(camera.position) - 0.05) isBlocked = true;
                    }
                    const vector = worldPos.clone();
                    vector.project(camera);
                    // Keep labels attached to visible craft, while allowing a small
                    // edge buffer for craft that sit just outside the camera frame.
                    const isOutsideFrame = vector.x < -1.12 || vector.x > 1.12 || vector.y < -1.12 || vector.y > 1.12;
                    if (isBlocked || vector.z > 1 || isOutsideFrame) {
                        item.element.style.display = 'none';
                        item.x = null;
                        item.y = null;
                    } else {
                        item.element.style.display = 'block';
                        const rawX = (vector.x * 0.5 + 0.5) * container.clientWidth;
                        const rawY = (-vector.y * 0.5 + 0.5) * container.clientHeight;
                        const edge = 10;
                        const labelWidth = item.element.offsetWidth;
                        const labelHeight = item.element.offsetHeight;
                        const minX = Math.min(container.clientWidth / 2, labelWidth / 2 + edge);
                        const maxX = Math.max(container.clientWidth / 2, container.clientWidth - labelWidth / 2 - edge);
                        const minY = Math.min(container.clientHeight / 2, labelHeight * 1.2 + edge);
                        const maxY = Math.max(minY, container.clientHeight - edge);
                        const targetX = Math.min(Math.max(rawX, minX), maxX);
                        const targetY = Math.min(Math.max(rawY, minY), maxY);
                        // Exponential interpolation keeps labels stable during locked-camera drags
                        // without making them feel detached from their spacecraft.
                        const follow = item.x === null ? 1 : 1 - Math.exp(-18 * delta);
                        item.x = item.x === null ? targetX : item.x + (targetX - item.x) * follow;
                        item.y = item.y === null ? targetY : item.y + (targetY - item.y) * follow;
                        item.element.style.transform = `translate(-50%, -120%) translate(${item.x}px, ${item.y}px)`;
                    }
                });
            }

            const dom = {
                altitude: document.getElementById('altitudeVal'),
                velocity: document.getElementById('velocityVal'),
                clock:    document.getElementById('clockDisplay'),
            };

            const followPos = new THREE.Vector3();
            let lastFrameTime = performance.now();
            function animate(now) {
                scope.requestAnimationFrame(animate);
                // 按真实时间差驱动运动，帧率（60/120/144Hz）不再影响速度
                const delta = Math.min(Math.max((now - lastFrameTime) / 1000, 0), 0.1);
                lastFrameTime = now;
                spacecrafts.forEach((sc) => {
                    sc.angle += sc.omega * orbitSpeed * delta;
                    sc.group.position.set(sc.params.a * Math.cos(sc.angle), 0, sc.params.b * Math.sin(sc.angle));
                    if (sc.angleEl) {
                        sc.angleEl.textContent = ((sc.angle * 180 / Math.PI) % 360).toFixed(1);
                    }
                });
                // 运转速度同时作用于地球自转与相机自动旋转
                earthGroup.rotation.y += EARTH_SPIN * orbitSpeed * delta;
                controls.autoRotateSpeed = 1.6 * orbitSpeed;
                // 追踪视角：以小球为静止系（相机绑定小球，地球与轨道围绕小球运动）
                if (lockObj) {
                    lockObj.group.updateWorldMatrix(true, false);
                    lockObj.group.getWorldPosition(followPos);
                    camera.position.copy(followPos).addScaledVector(lockDir, lockDistance);
                    camera.lookAt(followPos);
                } else {
                    controls.update();
                }
                updateLabels(delta);
                renderer.render(scene, camera);
                // Reveal only after the Earth texture has been uploaded in a complete
                // scene frame. Until then the wrapper background remains clean.
                if (earthTextureReady && !wrapper.classList.contains('is-model-ready')) {
                    wrapper.classList.add('is-model-ready');
                }
            }
            animate(performance.now());

            function onResize() {
                const w = wrapper.clientWidth, h = wrapper.clientHeight;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
            scope.listen(window, 'resize', onResize);
            new scope.ResizeObserver(onResize).observe(wrapper);

            function updateClock() {
                const now = new Date();
                const h = String(now.getHours()).padStart(2, '0');
                const m = String(now.getMinutes()).padStart(2, '0');
                const s = String(now.getSeconds()).padStart(2, '0');
                dom.clock.textContent = `${h}:${m}:${s}`;
            }
            updateClock();
            scope.setInterval(updateClock, 1000);

            scope.setInterval(() => {
                dom.altitude.textContent = (400 + (Math.sin(Date.now()/5000)*0.00025 + 2.5)).toFixed(1);
                dom.velocity.textContent  = (7.66 + Math.sin(Date.now()/3000)*0.0002).toFixed(3);
            }, 200);
        }



        const back = document.getElementById('terminal-close');
        if (location.protocol === 'file:') back.href = '../index.html#dc';
        scope.listen(document, 'keydown', event => {
            if (event.key === 'Escape') back.click();
        });
        scope.listen(window, 'pageshow', event => {
            // A fresh entry, including browser Back/Forward, starts at the boot screen.
            if (event.persisted) location.reload();
        });
})();
}
