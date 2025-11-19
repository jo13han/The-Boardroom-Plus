import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xf0f0f0)

/**
 * Loader
 */
const gltfLoader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()

/**
 * Helper Functions
 */
function createTable() {
    // Load table GLB model
    gltfLoader.load(
        './table/table.glb',
        (gltf) => {
            tableModel = gltf.scene
            
            // Load table texture
            const tableTexture = textureLoader.load('./textures/tabletexture.png')
            
            // Apply texture to all meshes in the table model
            tableModel.traverse((child) => {
                if (child.isMesh) {
                    const texturedMaterial = new THREE.MeshStandardMaterial({
                        map: tableTexture,
                        side: THREE.DoubleSide,
                        roughness: 0.8,
                        metalness: 0.1
                    })
                    child.material = texturedMaterial
                }
            })
            
            // Position and scale the table - smaller on Y and X axes
            tableModel.position.set(0, 0, 0)
            tableModel.scale.set(0.7, 0.5, 1) // Smaller on X and Y axes
            
            scene.add(tableModel)
            console.log('GLB table with texture loaded successfully')
        },
        (progress) => {
            console.log('Table loading progress:', (progress.loaded / progress.total * 100) + '%')
        },
        (error) => {
            console.error('Error loading table:', error)
        }
    )
}

function createWhiteboard() {
    // Load whiteboard GLB model
    gltfLoader.load(
        './frame/whiteboardnew.glb',
        (gltf) => {
            const whiteboardModel = gltf.scene
            
            // Load wooden frame texture
            const frameTexture = textureLoader.load('./textures/wooden_frame.jpg')
            frameTexture.wrapS = THREE.RepeatWrapping
            frameTexture.wrapT = THREE.RepeatWrapping
            frameTexture.anisotropy = 8
            if (frameTexture.colorSpace !== undefined) {
                frameTexture.colorSpace = THREE.SRGBColorSpace
            }
            
            // Apply texture to all meshes in the whiteboard model
            whiteboardModel.traverse((child) => {
                if (child.isMesh) {
                    const texturedMaterial = new THREE.MeshStandardMaterial({
                        map: frameTexture,
                        side: THREE.DoubleSide,
                        roughness: 0.7,
                        metalness: 0.1
                    })
                    child.material = texturedMaterial
                }
            })
            
            // Calculate bounding box to determine size
            const box = new THREE.Box3().setFromObject(whiteboardModel)
            const size = box.getSize(new THREE.Vector3())
            
            // Scale to appropriate size (target width ~3-4 units, height ~2-3 units)
            const targetWidth = 3.5
            const targetHeight = 2.5
            const scaleX = targetWidth / size.x
            const scaleY = targetHeight / size.y
            const scale = Math.min(scaleX, scaleY) // Use smaller scale to maintain aspect ratio
            whiteboardModel.scale.setScalar(scale)
            
            // Position on left wall (inner surface)
            // Left wall inner surface is at x = -floorWidth * 0.5 + small offset
            const floorWidth = 20
            const wallHeight = 6
            const wallThickness = 0.2
            const offsetFromWall = 0.15 // Larger offset to place it on the wall surface
            
            // Lower the frame - position it lower on the wall (around 1.5-2 units from floor)
            const whiteboardHeight = targetHeight * scale
            const whiteboardYPosition = 1.5 + whiteboardHeight * 0.5 // Lower position
            
            whiteboardModel.position.set(
                -floorWidth * 0.5 + offsetFromWall,
                whiteboardYPosition,
                0 // Center on Z axis
            )
            
            // Rotate to face into the room (rotate -90 degrees around Y axis to face positive X)
            whiteboardModel.rotation.y = -Math.PI * 2
            
            // Create white planes for the whiteboard surface
            // Create two separate white panels (left and right) that lie flat over the frame panels
            const whiteboardMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.6,
                metalness: 0.0,
                side: THREE.DoubleSide
            })
            
            // Panel dimensions - sized to match the actual frame sections
            // Each panel should cover approximately half of the frame width
            const panelWidth = targetWidth * 0.4 // Panels sized to fit frame sections
            const panelHeight = targetHeight * 0.95 // Taller panel height (extended on bottom more)
            const panelThickness = 0.05 // Add thickness to panels
            const gapBetweenPanels = 0.1 // Small gap between panels
            
            // Position in front of the frame to be visible on top of it
            const panelOffset = 0.2 // Increased offset to sit on top of frame surface
            
            // Calculate height increase to adjust position (keep top fixed)
            const heightIncrease = (targetHeight * 0.95) - (targetHeight * 0.75)
            const yAdjustment = heightIncrease * 0.5 // Move down by half the increase to keep top fixed
            
            // Left panel - positioned on the left section of the frame
            // Use BoxGeometry instead of PlaneGeometry to add thickness
            const leftPanelGeometry = new THREE.BoxGeometry(panelWidth, panelHeight, panelThickness)
            const leftPanel = new THREE.Mesh(leftPanelGeometry, whiteboardMaterial)
            // Position on the left side: moved 0.5 more to the left, taller on bottom (top fixed)
            leftPanel.position.set(
                -floorWidth * 0.5 + offsetFromWall + panelOffset, // Further out to be visible
                whiteboardYPosition + 1.4 - yAdjustment, // Adjusted down to keep top fixed
                -(panelWidth * 0.5 + gapBetweenPanels * 0.5) - 1.5 // Moved 0.5 more to the left (1.0 + 0.5)
            )
            // Rotate 90 degrees to face into the room
            leftPanel.rotation.y = Math.PI * 0.5
            scene.add(leftPanel)
            
            // Right panel - positioned on the right section of the frame
            // Use BoxGeometry instead of PlaneGeometry to add thickness
            const rightPanelGeometry = new THREE.BoxGeometry(panelWidth, panelHeight, panelThickness)
            const rightPanel = new THREE.Mesh(rightPanelGeometry, whiteboardMaterial)
            // Position on the right side: moved 0.5 more to the right, taller on bottom (top fixed)
            rightPanel.position.set(
                -floorWidth * 0.5 + offsetFromWall + panelOffset, // Further out to be visible
                whiteboardYPosition + 1.4 - yAdjustment, // Adjusted down to keep top fixed
                panelWidth * 0.5 + gapBetweenPanels * 0.5 + 1.5 // Moved 0.5 more to the right (1.0 + 0.5)
            )
            // Rotate 90 degrees to face into the room
            rightPanel.rotation.y = Math.PI * 0.5
            scene.add(rightPanel)
            
            scene.add(whiteboardModel)
            console.log('Whiteboard with wooden frame texture loaded successfully')
        },
        (progress) => {
            console.log('Whiteboard loading progress:', (progress.loaded / progress.total * 100) + '%')
        },
        (error) => {
            console.error('Error loading whiteboard:', error)
        }
    )
}

function createTV() {
    // Load TV GLTF model
    gltfLoader.load(
        './tv/scene.gltf',
        (gltf) => {
            const tvModel = gltf.scene
            
            // Load texture from tv folder
            const tvTexture = textureLoader.load('./tv/textures/texture.png')
            
            // Configure texture properties
            tvTexture.wrapS = THREE.RepeatWrapping
            tvTexture.wrapT = THREE.RepeatWrapping
            tvTexture.anisotropy = 8
            if (tvTexture.colorSpace !== undefined) {
                tvTexture.colorSpace = THREE.SRGBColorSpace
            }
            
            // Calculate bounding box to determine size
            const box = new THREE.Box3().setFromObject(tvModel)
            const size = box.getSize(new THREE.Vector3())
            
            // Scale to appropriate size (target width ~2-3 units, height ~1.5-2 units for TV)
            const targetWidth = 2.5
            const targetHeight = 1.8
            const scaleX = targetWidth / size.x
            const scaleY = targetHeight / size.y
            const scale = Math.min(scaleX, scaleY) // Use smaller scale to maintain aspect ratio
            tvModel.scale.setScalar(scale)
            
            // Apply texture from tv folder to all meshes
            tvModel.traverse((child) => {
                if (child.isMesh) {
                    // Apply material using texture from tv folder
                    const texturedMaterial = new THREE.MeshStandardMaterial({
                        map: tvTexture,
                        side: THREE.DoubleSide,
                        roughness: 0.7,
                        metalness: 0.1
                    })
                    child.material = texturedMaterial
                }
            })
            
            // Position on left wall (inner surface) - same wall as whiteboard
            const floorWidth = 20
            const wallHeight = 6
            const wallThickness = 0.2
            const offsetFromWall = 0.08 // Closer to the wall
            
            // Position at center of frame (vertically and horizontally centered)
            const tvHeight = targetHeight * scale
            const tvYPosition = wallHeight * 0.425 // Center vertically in the frame
            
            // Position centered on the left wall (same Z as whiteboard center)
            tvModel.position.set(
                -floorWidth * 0.5 + offsetFromWall,
                tvYPosition,
                0 // Centered horizontally, same as whiteboard
            )
            
            // Rotate to face into the room (rotate 180 degrees to face opposite direction from whiteboard)
            tvModel.rotation.y = Math.PI * 0.50
            
            scene.add(tvModel)
            console.log('TV with textures from tv folder loaded successfully')
        },
        (progress) => {
            console.log('TV loading progress:', (progress.loaded / progress.total * 100) + '%')
        },
        (error) => {
            console.error('Error loading TV:', error)
        }
    )
}

// Add a textured floor using textures in ./textures/floor
function createFloor() {
    // Load PBR textures
    const baseColor = textureLoader.load('./textures/floor/Poliigon_TilesCeramicWhite_6956_BaseColor.jpg')
    const roughness = textureLoader.load('./textures/floor/Poliigon_TilesCeramicWhite_6956_Roughness.jpg')
    const normal = textureLoader.load('./textures/floor/Poliigon_TilesCeramicWhite_6956_Normal.png')
    const metalness = textureLoader.load('./textures/floor/Poliigon_TilesCeramicWhite_6956_Metallic.jpg')
    const ao = textureLoader.load('./textures/floor/Poliigon_TilesCeramicWhite_6956_AmbientOcclusion.jpg')

    // Room dimensions
    const floorWidth = 20 // smaller floor (X)
    const floorDepth = 12 // smaller floor (Z)
    const wallHeight = 6

    // Make tiles larger and grout thinner by reducing repeats
    const repeatX = 5
    const repeatY = 3

    // Improve quality and repeat tiling
    ;[baseColor, roughness, normal, metalness, ao].forEach((tex) => {
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(repeatX, repeatY)
        tex.anisotropy = 8
    })
    // Correct color space for albedo
    if (baseColor.colorSpace !== undefined) {
        baseColor.colorSpace = THREE.SRGBColorSpace
    }

    const floorGeometry = new THREE.PlaneGeometry(floorWidth, floorDepth)
    // Provide uv2 for aoMap
    floorGeometry.setAttribute('uv2', new THREE.BufferAttribute(floorGeometry.attributes.uv.array, 2))

    // Use a more glossy ceramic look
    const floorMaterial = new THREE.MeshPhysicalMaterial({
        map: baseColor,
        roughnessMap: roughness,
        normalMap: normal,
        metalnessMap: metalness,
        aoMap: ao,
        metalness: 0.0,
        roughness: 0.28, // shinier
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        reflectivity: 0.6
    })
    // Extra tuning
    floorMaterial.normalScale = new THREE.Vector2(0.6, 0.6)
    floorMaterial.aoMapIntensity = 0.9
    floorMaterial.envMapIntensity = 1.0

    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
    floorMesh.rotation.x = -Math.PI * 0.5
    floorMesh.position.y = -0.01 // Slightly below to avoid z-fighting
    floorMesh.receiveShadow = true
    scene.add(floorMesh)

    // Build simple walls around the floor
    createWalls(floorWidth, floorDepth, wallHeight)

    // Constrain camera within room bounds
    const bounds = {
        minX: -floorWidth * 0.5 + 0.5,
        maxX: floorWidth * 0.5 - 0.5,
        minZ: -floorDepth * 0.5 + 0.5,
        maxZ: floorDepth * 0.5 - 0.5,
        minY: 0.2,
        maxY: wallHeight - 0.05
    }

    controls.enablePan = false // keep orbit centered
    controls.minDistance = 2
    controls.maxDistance = Math.min(floorWidth, floorDepth) * 0.8 // keep inside walls
    controls.maxPolarAngle = Math.PI * 0.5 - 0.05
    controls.minPolarAngle = 0.1

    controls.addEventListener('change', () => {
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, bounds.minX, bounds.maxX)
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, bounds.minZ, bounds.maxZ)
        camera.position.y = THREE.MathUtils.clamp(camera.position.y, bounds.minY, bounds.maxY)
    })
}

// Create 4 surrounding walls
function createWalls(floorWidth, floorDepth, wallHeight) {
    // Load granite baseboard texture supplied by user
    const graniteTex = textureLoader.load('./textures/granite_baseboard.jpg')
    graniteTex.wrapS = THREE.RepeatWrapping
    graniteTex.wrapT = THREE.RepeatWrapping
    graniteTex.repeat.set(6, 1)
    graniteTex.anisotropy = 8
    if (graniteTex.colorSpace !== undefined) graniteTex.colorSpace = THREE.SRGBColorSpace

    // Load wood texture for columns
    const woodTex = textureLoader.load('./textures/wooden_wall.jpg')
    woodTex.wrapS = THREE.RepeatWrapping
    woodTex.wrapT = THREE.RepeatWrapping
    woodTex.repeat.set(1, 2)
    woodTex.anisotropy = 8
    if (woodTex.colorSpace !== undefined) woodTex.colorSpace = THREE.SRGBColorSpace

    // Load metal ceiling texture
    const ceilingTex = textureLoader.load('./textures/metal_ceiling.jpg')
    ceilingTex.wrapS = THREE.RepeatWrapping
    ceilingTex.wrapT = THREE.RepeatWrapping
    ceilingTex.repeat.set(4, 4)
    ceilingTex.anisotropy = 8
    if (ceilingTex.colorSpace !== undefined) ceilingTex.colorSpace = THREE.SRGBColorSpace

    // Materials
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9, metalness: 0.1 })
    const baseboardMaterial = new THREE.MeshStandardMaterial({ map: graniteTex, roughness: 0.7, metalness: 0.05 })
    // help reduce z-fighting where baseboard touches walls/columns
    baseboardMaterial.polygonOffset = true
    baseboardMaterial.polygonOffsetFactor = 1
    baseboardMaterial.polygonOffsetUnits = 1
    const ceilingMaterial = new THREE.MeshStandardMaterial({ 
        map: ceilingTex, 
        roughness: 0.1, 
        metalness: 0.1,
        color: 0xf5f5f5 // Light grey base color to match the texture
    })
    ceilingMaterial.side = THREE.DoubleSide
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.05,
        transmission: 0.92,
        thickness: 0.02,
        transparent: true,
        opacity: 1,
        clearcoat: 0.6,
        clearcoatRoughness: 0.05
    })

    // Wall and baseboard dimensions
    const wallThickness = 0.2
    const baseboardHeight = 0.35 // slightly taller granite
    const baseboardThickness = 0.03 // slightly thicker
    const baseboardOffset = baseboardThickness * 0.5 + 0.01

    // Helper to create a wall box (adds thickness)
    const makeWall = (width, height, depth, material) => new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material)
    // Helper to create a baseboard box along X or Z
    const makeBaseboard = (length, alongX) => {
        const geo = alongX ? new THREE.BoxGeometry(length, baseboardHeight, baseboardThickness) : new THREE.BoxGeometry(baseboardThickness, baseboardHeight, length)
        const m = new THREE.Mesh(geo, baseboardMaterial)
        return m
    }

    // Left wall (x = -width/2) - concrete
    const leftWall = makeWall(wallThickness, wallHeight, floorDepth, wallMaterial)
    leftWall.position.set(-floorWidth * 0.5 - wallThickness * 0.5, wallHeight * 0.5, 0)
    leftWall.receiveShadow = true
    scene.add(leftWall)

    // Right wall (x = +width/2) - concrete
    const rightWall = makeWall(wallThickness, wallHeight, floorDepth, wallMaterial)
    rightWall.position.set(floorWidth * 0.5 + wallThickness * 0.5, wallHeight * 0.5, 0)
    rightWall.receiveShadow = true
    scene.add(rightWall)

    // Back wall (far length side, z = -depth/2) as glass pane
    const backWall = makeWall(floorWidth, wallHeight, wallThickness, glassMaterial)
    backWall.position.set(0, wallHeight * 0.5, -floorDepth * 0.5 - wallThickness * 0.5)
    backWall.castShadow = false
    backWall.receiveShadow = false
    scene.add(backWall)

    // Front wall (near side, z = +depth/2) - now glass (opposite to back wall)
    const frontWall = makeWall(floorWidth, wallHeight, wallThickness, glassMaterial)
    frontWall.position.set(0, wallHeight * 0.5, floorDepth * 0.5 + wallThickness * 0.5)
    frontWall.castShadow = false
    frontWall.receiveShadow = false
    scene.add(frontWall)

    // Baseboards along all four inner edges, slightly inside room
    const baseFront = makeBaseboard(floorWidth, true)
    baseFront.position.set(0, baseboardHeight * 0.5, floorDepth * 0.5 - baseboardOffset)
    scene.add(baseFront)

    const baseBack = makeBaseboard(floorWidth, true)
    baseBack.position.set(0, baseboardHeight * 0.5, -floorDepth * 0.5 + baseboardOffset)
    scene.add(baseBack)

    const baseLeft = makeBaseboard(floorDepth, false)
    baseLeft.position.set(-floorWidth * 0.5 + baseboardOffset, baseboardHeight * 0.5, 0)
    scene.add(baseLeft)

    const baseRight = makeBaseboard(floorDepth, false)
    baseRight.position.set(floorWidth * 0.5 - baseboardOffset, baseboardHeight * 0.5, 0)
    scene.add(baseRight)

    // Top baseboard on glass wall (back wall) - horizontal strip at top
    const topBaseboard = makeBaseboard(floorWidth, true)
    topBaseboard.position.set(0, wallHeight - baseboardHeight * 0.5, -floorDepth * 0.5 - wallThickness * 0.5 - baseboardOffset)
    scene.add(topBaseboard)

    // Corner columns at back-left and back-right corners (glass side) — square, protruding inward
    const columnSize = 1.2 // bigger square column
    const columnHeight = wallHeight
    const columnGeo = new THREE.BoxGeometry(columnSize, columnHeight, columnSize)
    const columnMaterial = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.6, metalness: 0.05 })

    const colBL = new THREE.Mesh(columnGeo, columnMaterial)
    const colBLX = -floorWidth * 0.5 + columnSize * 0.5 + 0.05
    const colBLZ = -floorDepth * 0.5 + columnSize * 0.5 + 0.05
    colBL.position.set(colBLX, wallHeight * 0.5, colBLZ)
    colBL.castShadow = true
    colBL.receiveShadow = true
    scene.add(colBL)
    columns.push(colBL) // Add to columns array for collision detection

    const colBR = new THREE.Mesh(columnGeo, columnMaterial)
    const colBRX = floorWidth * 0.5 - columnSize * 0.5 - 0.05
    const colBRZ = -floorDepth * 0.5 + columnSize * 0.5 + 0.05
    colBR.position.set(colBRX, wallHeight * 0.5, colBRZ)
    colBR.castShadow = true
    colBR.receiveShadow = true
    scene.add(colBR)
    columns.push(colBR) // Add to columns array for collision detection

    // Create seamless baseboard wraps around columns
    const eps = 0.001

    // Calculate column boundaries
    const colLeft = -floorWidth * 0.5 + 0.05
    const colRight = floorWidth * 0.5 - 0.05
    const colFront = -floorDepth * 0.5 + columnSize + 0.05
    const colBack = -floorDepth * 0.5 + 0.05

    // Create continuous baseboard strips that flow around each column
    // Left column (BL) - create 4 segments: left side, front, right side, back
    const blLeftX = colBLX - columnSize * 0.5 - baseboardThickness * 0.5 - eps
    const blRightX = colBLX + columnSize * 0.5 + baseboardThickness * 0.5 + eps
    const blFrontZ = colFront + baseboardThickness * 0.5 + eps
    const blBackZ = colBack - baseboardThickness * 0.5 - eps

    // Left side of left column
    const blSideL = makeBaseboard(columnSize + baseboardThickness, false)
    blSideL.position.set(blLeftX, baseboardHeight * 0.5, colBLZ)
    scene.add(blSideL)

    // Front of left column
    const blFront = makeBaseboard(columnSize + baseboardThickness, true)
    blFront.position.set(colBLX, baseboardHeight * 0.5, blFrontZ)
    scene.add(blFront)

    // Right side of left column
    const blSideR = makeBaseboard(columnSize + baseboardThickness, false)
    blSideR.position.set(blRightX, baseboardHeight * 0.5, colBLZ)
    scene.add(blSideR)

    // Back of left column (connects to wall baseboard)
    const blBack = makeBaseboard(columnSize + baseboardThickness, true)
    blBack.position.set(colBLX, baseboardHeight * 0.5, blBackZ)
    scene.add(blBack)

    // Right column (BR) - create 4 segments: left side, front, right side, back
    const brLeftX = colBRX - columnSize * 0.5 - baseboardThickness * 0.5 - eps
    const brRightX = colBRX + columnSize * 0.5 + baseboardThickness * 0.5 + eps
    const brFrontZ = colFront + baseboardThickness * 0.5 + eps
    const brBackZ = colBack - baseboardThickness * 0.5 - eps

    // Left side of right column
    const brSideL = makeBaseboard(columnSize + baseboardThickness, false)
    brSideL.position.set(brLeftX, baseboardHeight * 0.5, colBRZ)
    scene.add(brSideL)

    // Front of right column
    const brFront = makeBaseboard(columnSize + baseboardThickness, true)
    brFront.position.set(colBRX, baseboardHeight * 0.5, brFrontZ)
    scene.add(brFront)

    // Right side of right column
    const brSideR = makeBaseboard(columnSize + baseboardThickness, false)
    brSideR.position.set(brRightX, baseboardHeight * 0.5, colBRZ)
    scene.add(brSideR)

    // Back of right column (connects to wall baseboard)
    const brBack = makeBaseboard(columnSize + baseboardThickness, true)
    brBack.position.set(colBRX, baseboardHeight * 0.5, brBackZ)
    scene.add(brBack)

    // Create ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(floorWidth + wallThickness * 2, floorDepth + wallThickness * 2)
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial)
    ceiling.rotation.x = -Math.PI / 2 // Rotate to be horizontal
    ceiling.position.set(0, wallHeight, 0)
    ceiling.receiveShadow = true
    scene.add(ceiling)

    // Create 4 recessed ceiling lights
    const lightGeometry = new THREE.PlaneGeometry(2, 0.3) // long rectangular light
    const lightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.9,
        side: THREE.DoubleSide
    })

    // Position 4 lights evenly across the ceiling
    const lightPositions = [
        { x: -floorWidth * 0.3, z: -floorDepth * 0.3 }, // back-left
        { x: floorWidth * 0.3, z: -floorDepth * 0.3 },  // back-right
        { x: -floorWidth * 0.3, z: floorDepth * 0.3 },  // front-left
        { x: floorWidth * 0.3, z: floorDepth * 0.3 }    // front-right
    ]

    lightPositions.forEach((pos, index) => {
        const lightFixture = new THREE.Mesh(lightGeometry, lightMaterial)
        lightFixture.rotation.x = -Math.PI / 2 // Rotate to be horizontal
        lightFixture.position.set(pos.x, wallHeight - 0.01, pos.z) // slightly below ceiling
        scene.add(lightFixture)

        // Add bright white point light above each fixture
        const pointLight = new THREE.PointLight(0xffffff, 15, 40, 1.5)
        pointLight.position.set(pos.x, wallHeight - 0.1, pos.z)
        pointLight.castShadow = true
        pointLight.shadow.mapSize.width = 1024
        pointLight.shadow.mapSize.height = 1024
        pointLight.shadow.camera.near = 0.1
        pointLight.shadow.camera.far = 40
        scene.add(pointLight)
        pointLights.push(pointLight) // Store for dynamic control
    })

    // Load and add ceiling fans between the lights
    gltfLoader.load(
        './ceiling_fan/ceiling_fan.glb',
        (gltf) => {
            const fanModel = gltf.scene
            
            // Make fan white
            fanModel.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({ 
                        color: 0xffffff,
                        roughness: 0.3,
                        metalness: 0.1
                    })
                }
            })
            
            // Position fans between the lights on width side (2 fans total)
            const fanPositions = [
                { x: -floorWidth * 0.3, z: 0 }, // between left lights
                { x: floorWidth * 0.3, z: 0 }   // between right lights
            ]
            
            fanPositions.forEach((pos, index) => {
                const fan = fanModel.clone()
                fan.position.set(pos.x, wallHeight - 1.2, pos.z)
                fan.scale.setScalar(1) // Bigger fan
                scene.add(fan)
                
                // Store fan reference for rotation animation
                fan.userData = { rotationSpeed: 0.4 } // Faster rotation
            })
        },
        undefined,
        (error) => console.error('Error loading ceiling fan:', error)
    )
}

function duplicateChairs(originalChair, scale) {
    const chairPositions = [
        // 6 chairs on the front side (facing away from table) - moved further from table
        { x: -3.0, z: 3.5, rotation: Math.PI },
        { x: -1.25, z: 3.5, rotation: Math.PI },
        { x: 0.75, z: 3.5, rotation: Math.PI },
        { x: 2.50, z: 3.5, rotation: Math.PI },
        { x: 4.25, z: 3.5, rotation: Math.PI },
        { x: 6, z: 3.5, rotation: Math.PI },
        
        // 6 chairs on the back side (facing away from table) - moved further from table
        { x: -6.0, z: -3.5, rotation: 0 },
        { x: -4.25, z: -3.5, rotation: 0 },
        { x: -2.50, z: -3.5, rotation: 0 },
        { x: -0.75, z: -3.5, rotation: 0 },
        { x: 1.0, z: -3.5, rotation: 0 },
        { x: 2.75, z: -3.5, rotation: 0 }
    ]
    
    chairPositions.forEach((pos, index) => {
        // Clone the original chair
        const clonedChair = originalChair.clone()
        
        // Position the chair
        clonedChair.position.set(pos.x, 0, pos.z)
        clonedChair.rotation.y = pos.rotation
        
        // Apply textures to the cloned chair
        clonedChair.traverse((child) => {
            if (child.isMesh) {
                const isSeatOrBackrest = child.name.toLowerCase().includes('seat') || 
                                       child.name.toLowerCase().includes('back') ||
                                       child.name.toLowerCase().includes('chair') ||
                                       (child.position.y > 0 && child.position.y < 1)
                
                if (isSeatOrBackrest) {
                    const seatTexture = textureLoader.load('./textures/AcousticFoam001.png')
                    const texturedMaterial = new THREE.MeshLambertMaterial({
                        map: seatTexture,
                        color: 0x555555,
                        side: THREE.DoubleSide
                    })
                    child.material = texturedMaterial
                } else {
                    child.material.color.setHex(0x333333)
                }
            }
        })
        
        scene.add(clonedChair)
        console.log(`Created chair ${index + 1} at position:`, pos)
    })
    
    console.log('All 12 chairs created around the rectangular table')
}

/**
 * Object
 */
let chairModel = null

// Add a temporary cube to see something while loading
const tempGeometry = new THREE.BoxGeometry(1, 1, 1)
const tempMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const tempMesh = new THREE.Mesh(tempGeometry, tempMaterial)
scene.add(tempMesh)

gltfLoader.load(
    './office_chair/scene.gltf',
    (gltf) => {
        chairModel = gltf.scene
        // Don't add the original chair to scene - we'll only use clones
        
        // Remove the temporary cube
        scene.remove(tempMesh)
        
        // Center the model at origin
        const box = new THREE.Box3().setFromObject(chairModel)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        
        // Calculate scale to make chair reasonable size (target ~2 units tall)
        const targetHeight = 2
        const scale = targetHeight / size.y
        chairModel.scale.setScalar(scale)
        
        // Center the model
        chairModel.position.x = -center.x * scale
        chairModel.position.y = -center.y * scale
        chairModel.position.z = -center.z * scale
        
        // Load textures and apply to seat and backrest
        const seatTexture = textureLoader.load('./textures/AcousticFoam001.png')
        
        console.log('Starting texture application...')
        let texturedCount = 0
        
        // Remove wireframe to show normal materials and apply textures
        chairModel.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = false
                console.log('Found mesh:', child.name, 'at position:', child.position)
                
                // Check if this mesh is likely the seat or backrest based on name or position
                const isSeatOrBackrest = child.name.toLowerCase().includes('seat') || 
                                       child.name.toLowerCase().includes('back') ||
                                       child.name.toLowerCase().includes('chair') ||
                                       (child.position.y > 0 && child.position.y < 1) // Heuristic for seat/backrest height
                
                if (isSeatOrBackrest) {
                    const texturedMaterial = new THREE.MeshLambertMaterial({
                        map: seatTexture,
                        color: 0x555555, // Slightly lighter dark grey to show more texture variation
                        side: THREE.DoubleSide // Render both sides of the material
                    })
                    child.material = texturedMaterial
                    child.material.needsUpdate = true
                    texturedCount++
                    console.log('Applied texture to mesh:', child.name)
                } else {
                    // Keep other parts dark grey
                    child.material.color.setHex(0x333333)
                    console.log('Set color to dark grey for mesh:', child.name)
                }
            }
        })
        
        console.log(`Applied texture to ${texturedCount} meshes`)
        
        // Create floor first
        createFloor()
        
        // Create table
        createTable()
        
        // Create whiteboard on left wall
        createWhiteboard()
        
        // Create TV on right wall
        createTV()
        
        // Duplicate chairs around the table
        duplicateChairs(chairModel, scale)
        
        // Update camera to look at the scene
        camera.position.set(4, 3, 4)
        camera.lookAt(0, 0, 0)
        
        console.log('Office chair loaded successfully!')
        console.log('Chair bounding box:', box)
        console.log('Chair bounding box size:', box.getSize(new THREE.Vector3()))
        console.log('Chair position:', chairModel.position)
        console.log('Camera position:', camera.position)
        console.log('Chair scale:', chairModel.scale)
    },
    (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
    },
    (error) => {
        console.error('Error loading office chair:', error)
        // Keep the temporary cube if loading fails
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 1, 2)
camera.lookAt(0, 0, 0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// Keep camera above the floor and avoid flipping underneath
controls.target.set(0, 0, 0)
controls.maxPolarAngle = Math.PI * 0.5 - 0.05 // slightly less than 90°
controls.minPolarAngle = 0.1
controls.minDistance = 0.5 // Prevent zooming too close
controls.maxDistance = 20
controls.update()

/**
 * WASD Movement Controls
 */
const moveSpeed = 0.1
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
}

// Store table and columns references for collision detection
let tableModel = null
let columns = [] // Array to store wooden columns
const cameraRadius = 0.3 // Camera collision radius

/**
 * Check Camera Collision with Table
 */
function checkCameraCollisionWithTable(newPosition) {
    if (!tableModel) return false
    
    // Get table bounding box
    const tableBox = new THREE.Box3().setFromObject(tableModel)
    
    // Expand table box by camera radius to prevent getting too close
    tableBox.expandByScalar(cameraRadius + 0.2) // Add extra margin
    
    // Check if camera position is inside the expanded table box
    return tableBox.containsPoint(newPosition)
}

/**
 * Check Camera Collision with Columns
 */
function checkCameraCollisionWithColumns(newPosition) {
    if (!columns || columns.length === 0) return false
    
    // Check collision with each column
    for (const column of columns) {
        if (!column) continue
        
        // Get column bounding box
        const columnBox = new THREE.Box3().setFromObject(column)
        
        // Expand column box by camera radius to prevent getting too close
        columnBox.expandByScalar(cameraRadius + 0.2) // Add extra margin
        
        // Check if camera position is inside the expanded column box
        if (columnBox.containsPoint(newPosition)) {
            return true
        }
    }
    
    return false
}

// Prevent camera from going through table and columns when using OrbitControls
controls.addEventListener('change', () => {
    const cameraPos = camera.position.clone()
    let needsCorrection = false
    let safePosition = cameraPos.clone()
    
    // Check table collision
    if (tableModel && checkCameraCollisionWithTable(cameraPos)) {
        const tableBox = new THREE.Box3().setFromObject(tableModel)
        const tableCenter = tableBox.getCenter(new THREE.Vector3())
        const tableSize = tableBox.getSize(new THREE.Vector3())
        
        // Calculate direction from table center to camera
        const direction = cameraPos.clone().sub(tableCenter)
        direction.y = 0 // Keep horizontal
        if (direction.length() > 0) {
            direction.normalize()
            // Move camera to edge of table
            const safeDistance = Math.max(tableSize.x, tableSize.z) * 0.5 + cameraRadius + 0.3
            safePosition = tableCenter.clone().add(direction.multiplyScalar(safeDistance))
            safePosition.y = cameraPos.y // Keep original Y
            needsCorrection = true
        }
    }
    
    // Check columns collision
    if (columns && columns.length > 0 && checkCameraCollisionWithColumns(cameraPos)) {
        // Find the closest column
        let closestColumn = null
        let closestDistance = Infinity
        
        for (const column of columns) {
            if (!column) continue
            const columnBox = new THREE.Box3().setFromObject(column)
            const columnCenter = columnBox.getCenter(new THREE.Vector3())
            const distance = cameraPos.distanceTo(columnCenter)
            
            if (distance < closestDistance) {
                closestDistance = distance
                closestColumn = column
            }
        }
        
        if (closestColumn) {
            const columnBox = new THREE.Box3().setFromObject(closestColumn)
            const columnCenter = columnBox.getCenter(new THREE.Vector3())
            const columnSize = columnBox.getSize(new THREE.Vector3())
            
            // Calculate direction from column center to camera
            const direction = cameraPos.clone().sub(columnCenter)
            direction.y = 0 // Keep horizontal
            if (direction.length() > 0) {
                direction.normalize()
                // Move camera to edge of column
                const safeDistance = Math.max(columnSize.x, columnSize.z) * 0.5 + cameraRadius + 0.3
                const newSafePosition = columnCenter.clone().add(direction.multiplyScalar(safeDistance))
                newSafePosition.y = cameraPos.y // Keep original Y
                
                // Use this position if it's better (further from collision)
                if (!needsCorrection || cameraPos.distanceTo(newSafePosition) < cameraPos.distanceTo(safePosition)) {
                    safePosition = newSafePosition
                    needsCorrection = true
                }
            }
        }
    }
    
    // Apply correction if needed
    if (needsCorrection) {
        camera.position.copy(safePosition)
    }
})

// Room boundaries (matching createFloor dimensions)
const roomBounds = {
    minX: -10 + 0.5,
    maxX: 10 - 0.5,
    minZ: -6 + 0.5,
    maxZ: 6 - 0.5,
    minY: 0.2,
    maxY: 6 - 0.05
}

// Keyboard event listeners
window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase()
    if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        keys[key] = true
        event.preventDefault()
    } else if (event.code === 'Space') {
        keys.space = true
        event.preventDefault()
    }
})

window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase()
    if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        keys[key] = false
        event.preventDefault()
    } else if (event.code === 'Space') {
        keys.space = false
        event.preventDefault()
    }
})

// Function to move camera with WASD
function moveCamera() {
    
    const direction = new THREE.Vector3()
    const cameraDirection = new THREE.Vector3()
    
    // Get camera's forward direction (where it's looking)
    camera.getWorldDirection(cameraDirection)
    cameraDirection.y = 0 // Keep movement horizontal
    cameraDirection.normalize()
    
    // Get camera's right direction
    const rightDirection = new THREE.Vector3()
    rightDirection.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))
    rightDirection.normalize()
    
    // Calculate movement direction based on keys
    if (keys.w) {
        direction.add(cameraDirection)
    }
    if (keys.s) {
        direction.sub(cameraDirection)
    }
    if (keys.a) {
        direction.sub(rightDirection)
    }
    if (keys.d) {
        direction.add(rightDirection)
    }
    
    // Handle vertical movement with spacebar
    let verticalMovement = 0
    if (keys.space) {
        verticalMovement = moveSpeed * 0.8 // Slightly slower vertical movement
    }
    
    // Normalize and apply speed
    if (direction.length() > 0) {
        direction.normalize()
        direction.multiplyScalar(moveSpeed)
        
        // Calculate new position
        const newPosition = camera.position.clone().add(direction)
        newPosition.y += verticalMovement // Add vertical movement
        
        // Constrain to room bounds
        newPosition.x = THREE.MathUtils.clamp(newPosition.x, roomBounds.minX, roomBounds.maxX)
        newPosition.z = THREE.MathUtils.clamp(newPosition.z, roomBounds.minZ, roomBounds.maxZ)
        newPosition.y = THREE.MathUtils.clamp(newPosition.y, roomBounds.minY, roomBounds.maxY)
        
        // Check collision with table and columns before moving (only check X/Z, not Y)
        const horizontalCheck = new THREE.Vector3(newPosition.x, camera.position.y, newPosition.z)
        if (!checkCameraCollisionWithTable(horizontalCheck) && !checkCameraCollisionWithColumns(horizontalCheck)) {
            // Update camera position
            camera.position.copy(newPosition)
            
            // Update controls target to maintain orbit
            controls.target.add(direction)
            controls.target.x = THREE.MathUtils.clamp(controls.target.x, roomBounds.minX, roomBounds.maxX)
            controls.target.z = THREE.MathUtils.clamp(controls.target.z, roomBounds.minZ, roomBounds.maxZ)
        } else if (verticalMovement !== 0) {
            // If horizontal movement blocked but we have vertical movement, allow vertical only
            const verticalOnlyPosition = camera.position.clone()
            verticalOnlyPosition.y += verticalMovement
            verticalOnlyPosition.y = THREE.MathUtils.clamp(verticalOnlyPosition.y, roomBounds.minY, roomBounds.maxY)
            camera.position.y = verticalOnlyPosition.y
        }
    } else if (verticalMovement !== 0) {
        // Only vertical movement
        const newPosition = camera.position.clone()
        newPosition.y += verticalMovement
        newPosition.y = THREE.MathUtils.clamp(newPosition.y, roomBounds.minY, roomBounds.maxY)
        camera.position.y = newPosition.y
    }
}

/**
 * Lights - 4 ceiling lights + minimal ambient for ceiling visibility
 */
// Ambient light to properly illuminate the light grey ceiling
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambientLight)

// Store point lights for dynamic control
const pointLights = []

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()
    
    // Handle WASD movement
    moveCamera()

    // Rotate ceiling fans
    scene.traverse((child) => {
        if (child.userData && child.userData.rotationSpeed) {
            child.rotation.y += child.userData.rotationSpeed
        }
    })

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

/**
 * Lighting Controls Setup
 */
const ambientSlider = document.getElementById('ambientSlider')
const ambientValue = document.getElementById('ambientValue')
const pointSlider = document.getElementById('pointSlider')
const pointValue = document.getElementById('pointValue')
const rangeSlider = document.getElementById('rangeSlider')
const rangeValue = document.getElementById('rangeValue')

// Ambient light control
if (ambientSlider) {
    ambientSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value)
        ambientLight.intensity = value
        if (ambientValue) ambientValue.textContent = value.toFixed(1)
    })
}

// Point light intensity control
if (pointSlider) {
    pointSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value)
        pointLights.forEach(light => {
            light.intensity = value
        })
        if (pointValue) pointValue.textContent = value
    })
}

// Point light range control
if (rangeSlider) {
    rangeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value)
        pointLights.forEach(light => {
            light.distance = value
        })
        if (rangeValue) rangeValue.textContent = value
    })
}

/**
 * Interactive Object Clicking (Raycasting)
 */
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // Update raycaster with camera and mouse position
    raycaster.setFromCamera(mouse, camera)
    
    // Get intersected objects
    const intersects = raycaster.intersectObjects(scene.children, true)
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object
        
        // Find the parent mesh if we clicked on a child
        let targetObject = clickedObject
        while (targetObject.parent && targetObject.parent !== scene) {
            targetObject = targetObject.parent
        }
        
        // Interactive behaviors
        if (targetObject.userData && targetObject.userData.rotationSpeed) {
            // Ceiling fan clicked - change rotation speed
            targetObject.userData.rotationSpeed *= -1
            console.log('Fan rotation reversed!')
        }
    }
})