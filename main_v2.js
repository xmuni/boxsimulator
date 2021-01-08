// import { OrbitControls } from './jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true });
const [box_x, box_y, box_z] = document.querySelector("#box-size").value.split("x").map(n => parseFloat(n));
const box = {x: box_x, y: box_y, z: box_z};


// const controls = new THREE.OrbitControls();
const controls = new THREE.OrbitControls( camera, renderer.domElement );


let box_objects = [];
let objects = [];
let virtual_objects = [];
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
    controls.update();


    scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    scene.fog = new THREE.Fog( scene.background, 1, 5000 );
    
    // GROUND

    const groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
    const groundMat = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    groundMat.color.setHSL( 0.095, 1, 0.75 );

    const ground = new THREE.Mesh( groundGeo, groundMat );
    ground.position.y = - 33;
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add( ground );

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
    camera.up.set(0,0,1);
    camera.position.x = px;
    camera.position.y = py;
    camera.position.z = pz;
    camera.rotation.x = rx;
    camera.rotation.y = ry;
    camera.rotation.z = rz;
    // camera.position.set( 0, 80, 400 );
    camera.position.set( -120,-84, 100 );
    // camera.rotation.set(49,-10,-8.54);
    // camera.rotation.set(0.855,-0.1737,-0.1491);

    window.addEventListener("resize",onWindowResize);
}




function add_crate() {

    const cubes = [
        // X        Y           Z       start       texture
        [box.x+1.5,   box.y+1.5,     1.5,    0,0,0,      'crate.jpg'],
        [box.x,       1.5,box.z,     1.5,    0,1.5,      'crate.jpg'],
        [1.5,       box.y+1.5,     box.z,     0,0,1.5,    'crate.jpg'],
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
        // console.log("Item added at",w,d,h,x,y,z);
    }
}



function addCubeMesh(w,d,h, x,y,z, geometry, material, add=true) {
    // const [w,d,h, x,y,z, surface] = cubedata;

    var item = new THREE.Mesh( geometry, material );
    scene.add( item );

    item.position.x = (w/2 + x) * -1; // -1 to invert axis
    item.position.y = (d/2 + y) * -1; // -1 to invert axis
    item.position.z = h/2 + z;

    if(add) {
        objects.push(item);
        // console.log("Item added at",w,d,h,x,y,z);
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
        // console.log("Rotation:",rotation);
        
        let [w2,d2,h2] = rotate([w,d,h],rotation);
        
        const cols = fit_axis(w2, x, margin);
        const rows = fit_axis(d2, y, margin);
        const lays = fit_axis(h2, z, margin);
        // console.log("Rotation:",rotation,[w2,d2,h2],cols,rows,lays);
        total_spots[rotation] = { rows, cols, lays, total: cols*rows*lays };
    }

    const text_rows = [];
    for (const [key, value] of Object.entries(total_spots)) {
        text_rows.push(`${key}: ${value.total} pcs (${value.cols} x ${value.rows} = ${value.rows*value.cols}; su ${value.lays} livelli)`);
    }

    document.querySelector("#total-spots").innerText = text_rows.join('\n');

    return total_spots;
}


function display_info({
    base,extra,layers,full_layers,partial_layers,
    full_crates,layer_pcs,number,z1,full_crate_height}) {
    
    let text_rows = [
        `Substrato base: ${base.cols}x${base.rows}`,
        `Substrato extra: ${extra.cols}x${extra.rows}`,
        `Pz per strato: ${layer_pcs} (${base.cols*base.rows} base + ${extra.cols*extra.rows} extra)`,        
        `Strati: ${layers} (${full_layers} strati interi + ${partial_layers} parziale da ${number-(full_layers*layer_pcs)} pz)`,
        `\nAltezza di ciascuno strato: ${layers*z1} cm`,
        `Altezza dei ${full_layers} strati interi: ${full_layers*z1} cm`,
        `Altezza dei ${full_layers} strati interi + ${partial_layers} parziale : ${(layers)*z1} cm`,
        // `Casse piene: ${full_crates} alte ${(full_layers*z1)/full_crates} cm (${layer_pcs*Math.round(full_layers/full_crates)} pz/cassa)`,
        `Altezza di ciascuna cassa intera: ${full_crates>0 ? (full_crate_height/full_crates) : "ZERO (nessuna cassa intera)"}`,
        `\nPer riempire ${layers} strati servono ${(full_layers+partial_layers)*layer_pcs} pezzi (${(full_layers+partial_layers)*layer_pcs-number} extra)`,
    ];

    let text = text_rows.join('\n');
    document.querySelector("#total-spots").innerText = text;
    return text;
}



function rotate(dimensions,rotation) {

    const [w,d,h] = dimensions;
    
    switch(rotation) {
        case 'r2':
            return [d,w,h];
        case 'r3':
            return [w,h,d];
        case 'r4':
            return [h,w,d];
        case 'r5':
            return [h,d,w];
        case 'r6':
            return [d,h,w];
        default:
            return [w,d,h];
    }
}



function fit_axis(size_piece, size_container, margin) {
    return Math.floor((size_container+margin) / (size_piece+margin));
}

function fit_2d(piece_x, piece_y, container_x, container_y, margin) {
    return {
        rows: fit_axis(piece_y, container_y, margin),
        cols: fit_axis(piece_x, container_x, margin),
    }
}

function fit_2d_with_extra(piece_x, piece_y, container_x, container_y, margin) {

}

function populate_2d(rows,cols,lays,start_x,start_y,start_z,geometry,texture) {
    
    for(let i=0; i<(rows*cols); i++) {
        
        const layer = 0;
        const row = Math.floor((i/extra.cols) % extra.rows);
        const col = i % extra.cols;

        const offset_z = layer * (z+margin) + 1.5;
        const offset_x = col * (x+margin);
        const offset_y = row * (y+margin);

        console.log(i,row,col,'-->',x,y,z,'@',(offset_x+extra_start_x).toFixed(2),(offset_y,extra_start_y).toFixed(2));

        addCubeMesh(x,y,z,
            offset_x+extra_start_x,
            offset_y+extra_start_y,
            offset_z+0,
            geometry, material);
    }

}


class Crate {

    constructor(width,height) {
        this.width = width;
        this.height = height;
    }

    fitAxis(size_piece, margin) {
        return;
    }

    fitLayer(params) {
        return;
    }
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

    // Default rotation to r3
    if(typeof(rotation) === undefined)
        rotation= 'r3';

    const max_x = box.x;
    const max_y = box.y;
    const max_z = box.z;

    console.log(typeof(box_x),box_x);
    console.log(typeof(box_y),box_y);
    console.log(typeof(box_z),box_z);

    const margin = Math.abs(parseFloat(document.querySelector("#object-margin").value));

    const [original_w,original_d,original_h] = size.split('x').map(s => parseFloat(s));

    // place_v1(number,original_w,original_d,original_h,rotation,margin,max_x,max_y,max_z);
    place_v2(number,original_w,original_d,original_h,rotation,margin,max_x,max_y,max_z);
}



function place_v2(number,x,y,z,rotation,margin,max_x,max_y,max_z) {

    console.log("------------ Place_v2 -------------")

    const [x1,y1,z1] = rotate([x,y,z],rotation); // Must come after update_total_spots

    // Find pieces per layer
    const base = fit_2d(x1,y1,max_x,max_y,margin);


    const residual_x = parseFloat(( max_x - (x1+margin)*base.cols ).toFixed(2));
    const residual_y = parseFloat(( max_y - (y1+margin)*base.rows ).toFixed(2));
    const residual_a = [residual_x,max_y];
    const residual_b = [max_x,residual_y];


    /********** Calculate residual **********/

    const [extra_x,extra_y] = residual_x*max_y > max_x*residual_y ? residual_a : residual_b;
    const [x2,y2,z2] = rotate([x,y,z], rotation==='r3' ? 'r4' : 'r3');


    console.log(extra_x,extra_y);

    const extra = fit_2d(x2,y2,extra_x,extra_y,margin);

    let extra_start_x = rotation === 'r4' ? 0 : (max_x - residual_x);
    let extra_start_y = rotation === 'r3' ? 0 : (max_y - residual_y);

    const base_pcs  = base.cols*base.rows;
    const extra_pcs = extra.cols*extra.rows;
    const layer_pcs = base_pcs + extra_pcs;
    
    // Find max layers
    // const max_layers = fit_axis(z,max_z,margin);

    // Find min layers
    const layers = Math.ceil(number/layer_pcs);
    const full_layers = (number%layer_pcs===0) ? layers : layers-1;
    const partial_layers = layers-full_layers;

    const full_crate_height = full_layers*z1;
    const MAX_CRATE_Z = 85;
    const full_crates = Math.ceil(full_crate_height/MAX_CRATE_Z);
    

    console.log(display_info({
        base,extra,layers,full_layers,partial_layers,
        full_crates,layer_pcs,number,z1,full_crate_height
    }));


    /********** Place cubes **********/


    const geometry_base = new THREE.BoxGeometry( x1,y1,z1 );
    const geometry_extra = new THREE.BoxGeometry( x2,y2,z2 );
    const texture = new THREE.TextureLoader().load('textures/clay_a.jpg');
    const material = new THREE.MeshBasicMaterial( { map: texture });


    const start_base = {x: 1.5, y: 1.5, z: 1.5};

    const start_extra = {
        x: (rotation === 'r4' ? 0 : (max_x - residual_x)) + x1/2,
        y: (rotation === 'r3' ? 0 : (max_y - residual_y)) + 1.5,
        z: start_base.z
    }

    console.log("Start_base:",start_base);
    console.log("Start_extra:",start_extra);


    for(let i=0; i<full_layers; i++) {
        const z_height = start_base.z + i*(z1+margin);
        console.log(`Filling sublayer ${i} with z_height ${z_height}`);
        fill_sublayer({
            cols:       base.cols,
            rows:       base.rows,
            z_height:   z_height,
            start:      start_base,
            margin:     margin,
            geometry:   geometry_base,
            material:   material
        });

        fill_sublayer({
            cols:       extra.cols,
            rows:       extra.rows,
            z_height:   z_height,
            start:      start_extra,
            margin:     margin,
            geometry:   geometry_extra,
            material:   material
        });
    }

    // Add partial layer
    const partial_layer_pcs = number-(full_layers*layer_pcs);
    const z_height = start_base.z + full_layers*(z1+margin);
    console.log(`Filling partial layer (${partial_layer_pcs} pcs) with z_height ${z_height}`);
    fill_sublayer({
        cols:       base.cols,
        rows:       base.rows,
        z_height:   z_height,
        start:      start_base,
        margin:     margin,
        geometry:   geometry_base,
        material:   material,
        cap_pcs:    Math.min(partial_layer_pcs, base.cols*base.rows)
    });

    fill_sublayer({
        cols:       extra.cols,
        rows:       extra.rows,
        z_height:   z_height,
        start:      start_extra,
        margin:     margin,
        geometry:   geometry_extra,
        material:   material,
        cap_pcs:    partial_layer_pcs - Math.min(partial_layer_pcs, base.cols*base.rows)
    });

    // Margins: 0.2
    // 108 30x15x3.1 r4
}


function fill_sublayer({cols,rows,z_height,start,margin,geometry,material,cap_pcs=-1}) {
    
    // XYZ: ${[x,y,z]},
    /*
    console.log(`
        Cols: ${cols},
        Rows: ${rows},
        Z height: ${z_height},
        Start: ${[start.x,start.y,start.z]},
        Margin: ${margin},
        Geometry: ${geometry},
        Material: ${material},
        cap_pcs: ${cap_pcs}`);
    */

    const [x,y,z] = [geometry.parameters.width, geometry.parameters.height, geometry.parameters.depth];
    
    // console.log("XYZ:",x,y,z);

    for(let n=0; n<cols*rows; n++) {

        // Do not exceed pcs limit (if set)
        if(cap_pcs===0 || (cap_pcs>0 && n>cap_pcs))
            break;

        // console.log(n);
        const row = Math.floor((n/cols) % rows);
        const col = n % cols;

        const offset_z = (z_height);
        const offset_x = (col * (x+margin));
        const offset_y = (row * (y+margin));

        // console.log(n,offset_x.toFixed(2),offset_y.toFixed(2),offset_z.toFixed(2));

        /*
        console.log(n,x,y,z,
            offset_x+start.x,
            offset_y+start.y,
            offset_z+start.z);
        */

        addCubeMesh(x,y,z,
            offset_x+start.x,
            offset_y+start.y,
            offset_z+start.z,
            geometry, material);
    }
}


function place_v1(number,original_w,original_d,original_h,rotation,margin,max_x,max_y,max_z) {
    
    update_total_spots(original_w,original_d,original_h,max_x,max_y,max_z, margin);
    const [w,d,h] = rotate([original_w,original_d,original_h],rotation); // Must come after update_total_spots
    
    // console.log(number,w,d,h,rotation);
    // console.log("Width: ",w);
    // console.log("Depth: ",d);
    // console.log("Height:",h);

    // const cols = Math.floor(max_x/(w+margin) - margin);
    const cols = fit_axis(w, max_x, margin);
    const rows = fit_axis(d, max_y, margin);
    const lays = fit_axis(h, max_z, margin);

    const total_spots = cols*rows*lays;

    const pcs_per_layer = rows*cols;

    // console.log(`Cols: ${cols} (${max_x}/${w+margin} - ${margin})`);
    // console.log(`Rows: ${rows} (${max_y}/${d+margin} - ${margin})`);
    // console.log(`Lays: ${lays} (${max_z}/${h+margin} - ${margin})`);
    console.log(`Cols: ${cols} (${max_x}+${margin}) / (${w}+${margin})`);
    console.log(`Rows: ${rows} (${max_y}+${margin}) / (${d}+${margin})`);
    console.log(`Lays: ${lays} (${max_z}+${margin}) / (${h}+${margin})`);
    console.log("Total spots:",total_spots);

    const [start_x, start_y, start_z] = [1.5,1.5,1.5];

    
    const geometry = new THREE.BoxGeometry( w,d,h );
    const texture = new THREE.TextureLoader().load('textures/clay_a.jpg');
    // console.log(texture);
    const material = new THREE.MeshBasicMaterial( { map: texture });

    
    for(var i=0; i<number; i++) {
        
        const layer = Math.floor(i / pcs_per_layer);
        const row = Math.floor((i/cols) % rows);
        const col = i % cols;

        const offset_z = layer * (h+margin);
        const offset_x = col * (w+margin);
        const offset_y = row * (d+margin);
        addCubeMesh(w,d,h,
            offset_x+start_x,
            offset_y+start_y,
            offset_z+start_z,
            geometry, material);
    }



    /********** Calculate residual **********/

    const residual_x = parseFloat(( max_x - (w+margin)*cols ).toFixed(2));
    const residual_y = parseFloat(( max_y - (d+margin)*rows ).toFixed(2));

    const residual_a = [residual_x,max_y];
    const residual_b = [max_x,residual_y];


    console.log("Residual XYZ:",[residual_x,residual_y]);
    // console.log("Residual X:",`${max_x} - (${w}+${margin})*${cols}`);
    console.log("Residual areas:",residual_a,residual_b);


    const [extra_x,extra_y] = residual_x*max_y > max_x*residual_y ? residual_a : residual_b;
    console.log(extra_x,extra_y);

    const [x,y,z] = rotate([original_w,original_d,original_h], rotation==='r3' ? 'r4' : 'r3');
    console.log(x,y,z);

    const extra = fit_2d(x,y,extra_x,extra_y,margin);

    let extra_start_x = (max_x - residual_x) + x/2;
    let extra_start_y = (max_y - residual_y) + 1.5;
    
    if (rotation ==='r3')
        extra_start_y = 0;
    else if(rotation === 'r4')
        extra_start_x = 0;
        
    
    for(var i=0; i<number; i++) {
        
        const layer = Math.floor(i / pcs_per_layer);
        const row = Math.floor((i/cols) % rows);
        const col = i % cols;

        const offset_z = layer * (h+margin);
        const offset_x = col * (w+margin);
        const offset_y = row * (d+margin);
        addCubeMesh(w,d,h,
            offset_x+start_x,
            offset_y+start_y,
            offset_z+start_z,
            geometry, material);
    }


    console.log(`New start: X ${extra_start_x}, Y ${extra_start_y}`);
    console.log("Extra cols/rows:",extra.cols,extra.rows);

    const extra_geometry = new THREE.BoxGeometry( x,y,z );

    
    for(let i=0; i<(extra.rows*extra.cols); i++) {
        
        const layer = 0;
        const row = Math.floor((i/extra.cols) % extra.rows);
        const col = i % extra.cols;

        const offset_z = layer * (z+margin) + 1.5;
        const offset_x = col * (x+margin);
        const offset_y = row * (y+margin);

        console.log(i,row,col,'-->',x,y,z,'@',(offset_x+extra_start_x).toFixed(2),(offset_y,extra_start_y).toFixed(2));

        addCubeMesh(x,y,z,
            offset_x+extra_start_x,
            offset_y+extra_start_y,
            offset_z+0,
            extra_geometry, material);
    }


}