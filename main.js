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
    
    for(let object of objects) {
        let cubeMesh = object['item'];
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
    
    /* Add box  */
    /*
    const geometry = new THREE.BoxGeometry(20,15,3);
    // const material = new THREE.MeshBasicMaterial( { color: 0x73b3ff } );
    const texture = new THREE.TextureLoader().load('textures/crate.jpg')
    const material = new THREE.MeshBasicMaterial( { map: texture } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    */
   
   
   /* Add floor  */    
   var geometry2 = new THREE.PlaneGeometry( 1000, 1000, 1, 1 );
   var material2 = new THREE.MeshBasicMaterial( { color: 0xeeeeee } );
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
        [114.5,1.5,75,  1.5,0,1.5,  'crate.jpg'],
        [1.5,76,75,   0,0,1.5,      'crate.jpg'],
    ]
    
    for(const cubedata of cubes) {
        addCube(...cubedata, add=false);
    }
    
}



function addCube(w,d,h, x,y,z, surface='clay_a.jpg', add=true) {
    // const [w,d,h, x,y,z, surface] = cubedata;
    var geo = new THREE.BoxGeometry( w,d,h );
    // var mat = new THREE.MeshBasicMaterial( { color: color } );
    // var mat = new THREE.MeshBasicMaterial( { map: texture });

    var mat = null;
    // console.log("Surface texture:",surface,typeof(surface)==String);
    if(isString(surface)) {
        const texture = new THREE.TextureLoader().load(`textures/${surface}`)
        mat = new THREE.MeshBasicMaterial( { map: texture });
    }
    else
        var mat = new THREE.MeshBasicMaterial( { color: surface } );

    var item = new THREE.Mesh( geo, mat );
    scene.add( item );

    item.position.x = -(w/2 + x);
    item.position.y = -(d/2 + y);
    item.position.z = h/2 + z;

    if(add) {
        objects.push({
            geo: geo,
            mat: mat,
            item: item,
        });
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

/* Format:
30 50x20x30 r1
*/
function parse_textarea() {
    const text = document.querySelectorAll("textarea")[0].value;
    console.log(text);
    const [number,size,rotation] = text.split(' ');
    let [w,d,h] = size.split('x').map(s => parseInt(s));
    console.log(number,w,d,h,rotation);

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

        default:
            break;
    }

    console.log("Width: ",w);
    console.log("Depth: ",d);
    console.log("Height:",h);

    const max_x = 116;
    const max_y = 76;
    const max_z = 80;

    const cols = Math.floor(max_x/(w+1));
    const rows = Math.floor(max_y/(d+1));
    const lays = Math.floor(max_z/(h+1));

    const total_spots = cols*rows*lays;

    const pcs_per_layer = rows*cols;

    console.log(`Cols: ${cols} (${max_x}/${w+1})`);
    console.log(`Rows: ${rows} (${max_y}/${d+1})`);
    console.log(`Lays: ${lays} (${max_z}/${h+1})`);
    console.log("Total spots:",total_spots);

    const [start_x, start_y, start_z] = [1.5,1.5,1.5];


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
        const offset_z = layer * (h+1);
        const offset_x = col * (w+1);
        const offset_y = row * (d+1);
        addCube(w,d,h,
            offset_x+start_x,
            offset_y+start_y,
            offset_z+start_z);
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