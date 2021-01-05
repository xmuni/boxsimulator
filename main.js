const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true });

// const controls = new THREE.OrbitControls();
const controls = new THREE.OrbitControls( camera, renderer.domElement );


var objects = [];
let cube_index = 0;
const new_cubes = [
    [30,20,5, 5,5,5, 'clay_a.jpg'],
    [30,50,3, 45,15,5, 'clay_a.jpg'],
    [40,20,3, 80,30,10, 'clay_a.jpg'],
]


setup();
add_crate();
parse_textarea();


function clear_objects() {
    console.log("Clearing objects");
    
    for(let cubeMesh of objects) {
        scene.remove(cubeMesh);
        cubeMesh.geometry.dispose();
        cubeMesh.material.dispose();
        cubeMesh = undefined; //clear any reference for it to be able to garbage collected
    }
    
    cube_index = 0;
}



function setup() {
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    //controls.update() must be called after any manual changes to the camera's transform
    camera.position.set( 0, 80, 400 );
    controls.update();


    scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    scene.fog = new THREE.Fog( scene.background, 1, 5000 );
    
    /* Add box  */
    /*
    const geometry = new THREE.BoxGeometry(20,15,3);
    // const material = new THREE.MeshBasicMaterial( { color: 0x73b3ff } );
    const texture = new THREE.TextureLoader().load('textures/crate.jpg')
    const material = new THREE.MeshBasicMaterial( { map: texture } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    */
   // LIGHTS
    /*
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
    scene.add( hemiLightHelper );

    //

    const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( - 1, 1.75, 1 );
    dirLight.position.multiplyScalar( 30 );
    scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    const d = 50;

    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = - 0.0001;

    const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
    scene.add( dirLightHelper );
    */
    // GROUND

    const groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
    const groundMat = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    groundMat.color.setHSL( 0.095, 1, 0.75 );

    const ground = new THREE.Mesh( groundGeo, groundMat );
    ground.position.y = - 33;
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add( ground );

    // SKYDOME
    /*
    const vertexShader = document.getElementById( 'vertexShader' ).textContent;
    const fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
    const uniforms = {
        "topColor": { value: new THREE.Color( 0x0077ff ) },
        "bottomColor": { value: new THREE.Color( 0xffffff ) },
        "offset": { value: 33 },
        "exponent": { value: 0.6 }
    };
    uniforms[ "topColor" ].value.copy( hemiLight.color );

    scene.fog.color.copy( uniforms[ "bottomColor" ].value );

    const skyGeo = new THREE.SphereBufferGeometry( 4000, 32, 15 );
    const skyMat = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide
    } );

    const sky = new THREE.Mesh( skyGeo, skyMat );
    scene.add( sky );
   */
    /* Add floor  */    
    var geometry2 = new THREE.PlaneGeometry( 1000, 1000, 1, 1 );
    const texture = new THREE.TextureLoader().load('textures/seamless_sand.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 8, 8 );
    var material2 = new THREE.MeshBasicMaterial( { map: texture } );
    var floor = new THREE.Mesh( geometry2, material2 );
    floor.material.side = THREE.DoubleSide;
    scene.add( floor );

    // Camera default position and rotation
    const [px,py,pz,rx,ry,rz] = [-70, -140, 140, 57, 2, -2];
    camera.position.x = px;
    camera.position.y = py;
    camera.position.z = pz;
    camera.rotation.x = rx;
    camera.rotation.y = ry;
    camera.rotation.z = rz;

    window.addEventListener("resize",onWindowResize);
}




function add_crate() {

    const cubes = [
        [116,76,1.5,    0,0,0,      'crate.jpg'],
        [114.5,1.5,80,  1.5,0,1.5,  'crate.jpg'],
        [1.5,76,80,   0,0,1.5,      'crate.jpg'],
    ]
    
    for(const cubedata of cubes) {
        addCube(...cubedata, add=false);
    }
    
}



function addCube(w,d,h, x,y,z, surface='clay_a.jpg', add=true, geometry=null, material=null) {
    // const [w,d,h, x,y,z, surface] = cubedata;
    var geo = geometry ? geometry : new THREE.BoxGeometry( w,d,h );
    // var mat = new THREE.MeshBasicMaterial( { color: color } );
    // var mat = new THREE.MeshBasicMaterial( { map: texture });

    var mat = material ? material : null;
    // console.log("Surface texture:",surface,typeof(surface)==String);

    if(mat === null) {
        if(isString(surface)) {
            const texture = new THREE.TextureLoader().load(`textures/${surface}`)
            mat = new THREE.MeshBasicMaterial( { map: texture });
        }
        else
            mat = new THREE.MeshBasicMaterial( { color: surface } );
    }


    var item = new THREE.Mesh( geo, mat );
    scene.add( item );

    item.position.x = -(w/2 + x);
    item.position.y = -(d/2 + y);
    item.position.z = h/2 + z;

    if(add) {
        objects.push(item);
        console.log("Item added at",w,d,h,x,y,z);
    }
}



function addCubeMesh(w,d,h, x,y,z, geometry, material, add=true) {
    // const [w,d,h, x,y,z, surface] = cubedata;

    var item = new THREE.Mesh( geometry, material );
    scene.add( item );

    item.position.x = -(w/2 + x);
    item.position.y = -(d/2 + y);
    item.position.z = h/2 + z;

    if(add) {
        objects.push(item);
        console.log("Item added at",w,d,h,x,y,z);
    }
}



function isString(x) {
    return Object.prototype.toString.call(x) === "[object String]";
}


function animate() {

    // cube.rotation.z += 0.01;

    requestAnimationFrame( animate );
    
    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

	renderer.render( scene, camera );
}
animate();

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
}


function floatingClicked() {
    console.log("Click");
    if(cube_index < new_cubes.length) {
        addCube(...new_cubes[cube_index]);
        cube_index++;
    }
}

let update_timeout;

function scheduleUpdate() {
    window.clearTimeout(update_timeout);
    update_timeout = window.setTimeout(update,500);
    console.log("Update scheduled");
}

function update() {
    console.log("Update");
    clear_objects();
    parse_textarea();
}





function update_total_spots(w,d,h, x,y,z, margin=1) {

    let total_spots = {};

    for(const rotation of ['r1','r2','r3','r4','r5','r6']) {
        console.log("Rotation:",rotation);
        var [w2,d2,h2] = [w,d,h];

        if(rotation == 'r2')
            [w2,d2,h2] = [d,w,h];
        else if(rotation == 'r3')
            [w2,d2,h2] = [w,h,d];
        else if(rotation == 'r4')
            [w2,d2,h2] = [h,w,d];
        else if(rotation == 'r5')
            [w2,d2,h2] = [h,d,w];
        else if(rotation == 'r6')
            [w2,d2,h2] = [d,h,w];
        
        const cols = Math.floor(x/(w2+margin));
        const rows = Math.floor(y/(d2+margin));
        const lays = Math.floor(z/(h2+margin));
        console.log(rotation,cols,rows,lays);
        total_spots[rotation] = {
            rows: rows,
            cols: cols,
            lays: lays,
            total: cols*rows*lays,
        };
    }

    const text_rows = [];
    for (const [key, value] of Object.entries(total_spots)) {
        text_rows.push(`${key}: ${value.total} pcs (${value.cols} x ${value.rows} = ${value.rows*value.cols}; su ${value.lays} livelli)`);
    }

    document.querySelector("#total-spots").innerText = text_rows.join('\n');

    return total_spots;
}





/* Format:
30 50x20x30 r1
*/
function parse_textarea() {
    const text = document.querySelectorAll("textarea")[0].value;

    if(text.length < 1)
        return;

    console.log(text);
    const [number,size,rotation] = text.split(' ');
    let [w,d,h] = size.split('x').map(s => parseInt(s));
    console.log(number,w,d,h,rotation);

    const max_x = 116;
    const max_y = 76;
    const max_z = 80;

    const margin = Math.abs(parseFloat(document.querySelector("#object-margin").value));

    console.log(update_total_spots(w,d,h,max_x,max_y,max_z, margin));

    const [x,y,z] = [3,3,3];

    switch(rotation) {
        case 'r2':
            [w,d,h] = [d,w,h]; break;
        case 'r3':
            [w,d,h] = [w,h,d]; break;
        case 'r4':
            [w,d,h] = [h,w,d]; break;
        case 'r5':
            [w,d,h] = [h,d,w]; break;
        case 'r6':
            [w,d,h] = [d,h,w]; break;

        default:
            break;
    }

    console.log("Width: ",w);
    console.log("Depth: ",d);
    console.log("Height:",h);

    const cols = Math.floor(max_x/(w+margin));
    const rows = Math.floor(max_y/(d+margin));
    const lays = Math.floor(max_z/(h+margin));

    const total_spots = cols*rows*lays;

    const pcs_per_layer = rows*cols;

    console.log(`Cols: ${cols} (${max_x}/${w+margin})`);
    console.log(`Rows: ${rows} (${max_y}/${d+margin})`);
    console.log(`Lays: ${lays} (${max_z}/${h+margin})`);
    console.log("Total spots:",total_spots);

    const [start_x, start_y, start_z] = [1.5,1.5,1.5];

    
    const geometry = new THREE.BoxGeometry( w,d,h );
    const texture = new THREE.TextureLoader().load('textures/clay_a.jpg');
    console.log(texture);
    const material = new THREE.MeshBasicMaterial( { map: texture });

    for(var i=0; i<number; i++) {
        // const pcs_on_layer = number % layer*pcs_per_layer;
        
        // const spot = i%pcs_per_layer;
        
        const layer = Math.floor(i / pcs_per_layer);
        // console.log(layer,'=',number,'/',pcs_per_layer);
        const row = Math.floor((i/cols) % rows);
        const col = i % cols;
        console.log(i,`--> (layer ${col}, row ${row}, col ${col})`);

        // const offset_z = (layer-1) * (h+1);

        // const offset_x = 
        const offset_z = layer * (h+margin);
        const offset_x = col * (w+margin);
        const offset_y = row * (d+margin);
        addCubeMesh(w,d,h,
            offset_x+start_x,
            offset_y+start_y,
            offset_z+start_z,
            geometry, material);
    }


    return;

    for(var i=0; i<number; i++) {

        const offset_x = 

        // const offset_x = i*(w+1);
        offset_x += (w+1);
        if(offset_x > max_x) {
            offset_x = x;
            offset_y += (d+1);
        }
        // const new_offset_x = offset+w > max_x ? 0 : offset_x = 0;
        console.log(i,offset_x);
        addCube(w,d,h,offset_x,offset_y,z);
    }
}