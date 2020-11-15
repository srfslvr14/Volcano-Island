// Vertex shader program
var VSHADER_SOURCE =
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_UV;\n' +
    'varying vec2 v_UV;\n'+
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjectionMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    '   v_UV = a_UV;' + 
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec2 v_UV;\n'+
    'uniform vec4 u_FragColor;\n' + 
    'uniform sampler2D u_Sampler0;\n' +
    'uniform sampler2D u_Sampler1;\n' +
    'uniform sampler2D u_Sampler2;\n' +
    'uniform sampler2D u_Sampler3;\n' +
    'uniform int u_whichTexture;\n' +
    'void main() {\n' +
    '   if(u_whichTexture == -2){\n' +  
    '       gl_FragColor = u_FragColor; }\n' + 

    '   else if(u_whichTexture == -1){\n' +
    '       gl_FragColor = vec4(v_UV, 1.0, 1.0); }\n' +   

    '   else if(u_whichTexture == 0){\n' +
    '       gl_FragColor = texture2D(u_Sampler0, v_UV); }\n' +

    '   else if(u_whichTexture == 1){\n' +
    '       gl_FragColor = texture2D(u_Sampler1, v_UV); }\n' +  

    '   else if(u_whichTexture == 2){\n' +
    '       gl_FragColor = texture2D(u_Sampler2, v_UV); }\n' +

    '   else if(u_whichTexture == 3){\n' +
    '       gl_FragColor = texture2D(u_Sampler3, v_UV); }\n' +  

    '   else { gl_FragColor = vec4(1, .2, .2, 1); }\n' + 
    '}\n';

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;

let g_charON            = false;
let g_CharAnimation     = true;
let g_CharHoverLocation = -.3;
let g_tailAngle         = 0;
let g_fireSize          = 1;
let g_blink             = 1;
let g_wingAngle         = 40;
let g_limbAngle         = 0;
let g_armsAngle         = 0;
let g_forearmsAngle     = 0;

let g_globalAngle = 0;
var g_startTime = performance.now()/1000.0;
var g_seconds   = performance.now()/1000.0 - g_startTime;
let g_camera = new Camera();
let g_map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 4, 5, 5, 5, 5, 5, 5, 5, 5, 4, 2, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 5, 6, 6, 6, 6, 6, 6, 5, 4, 2, 0, 0, 0, 0, 0],
    [0, 0, 3, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 4, 5, 6, 8, 8, 8, 8, 6, 5, 4, 2, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 5, 6, 8, 9, 9, 8, 6, 5, 4, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 5, 6, 8, 9, 9, 8, 6, 5, 4, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 4, 5, 6, 8, 8, 8, 8, 6, 5, 4, 2, 1, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 2, 4, 5, 6, 6, 6, 6, 6, 6, 5, 4, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 5, 5, 5, 5, 5, 5, 5, 5, 4, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 3, 2],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 2, 1, 0, 1, 0, 0, 0, 0, 4, 1],
    [0, 0, 0, 0, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
];

function setupCanvas(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preseveDrawingBuffer: true}); // gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // get the storage location of u_Sample0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if(!u_Sampler0){
        console.log('Failed to create the u_Sampler0 object');
        return;
    }

    // get the storage location of u_Sampler1
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if(!u_Sampler1){
        console.log('Failed to create the u_Sampler1 object');
        return;
    }

    // get the storage location of u_Sampler1
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if(!u_Sampler2){
        console.log('Failed to create the u_Sampler1 object');
        return;
    }

    // get the storage location of u_Sampler
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if(!u_whichTexture){
        console.log('Failed to create the u_whichTexture object');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionForHtmlUI(){    
    document.getElementById('Animate').onclick  = function(){g_CharAnimation = !g_CharAnimation};
    document.getElementById('CharVis').onclick  = function(){g_charON = !g_charON};
}

function convertCoordEventToWebGL(ev){
    var x = ev.clientX;                                         // x coordinate of a mouse pointer
    var y = ev.clientY;                                         // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x,y]);
}

function initTextures(){
    // -------------------------------- image 0 --------------------------------
    var image0 = new Image();
    if(!image0){
        console.log('Failed to create the image0 object');
        return false;
    }

    // Register the event handler to be called on loading an image
    image0.onload = function(){ sendTextureToTEXTURE0(image0); };
    // Tell the browser to load
    image0.src = 'rock.jpg';
    

    //-------------------------------- image 1 --------------------------------
    var image1 = new Image();
    if(!image1){
        console.log('Failed to create the image1 object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image1.onload = function(){ sendTextureToTEXTURE1(image1); };
    // Tell the browser to load
    image1.src = 'sand.jpeg';
    
    //-------------------------------- image 2 --------------------------------
    var image2 = new Image();
    if(!image2){
        console.log('Failed to create the image2 object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image2.onload = function(){ sendTextureToTEXTURE2(image2); };
    // Tell the browser to load
    // image2.src = 'lava.jpeg';
    image2.src = 'magma.png';

    //-------------------------------- image 3 --------------------------------
    // var image3 = new Image();
    // if(!image3){
    //     console.log('Failed to create the image3 object');
    //     return false;
    // }

    // // Register the event handler to be called on loading an image
    // image3.onload = function(){ sendTextureToTEXTURE3(image3); };
    // // Tell the browser to load
    // image3.src = 'lava.jpeg';
    

    return true;
}

function sendTextureToTEXTURE0(image){
    var texture = gl.createTexture();   // create a texture object
    if(!texture){
        console.log('Failed to create the texture0 object');
        return false;
    }

    // flip the image's Y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);

    // gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    // console.log('finished loadTexture0');
}

function sendTextureToTEXTURE1(image){
    var texture = gl.createTexture();   // create a texture object
    if(!texture){
        console.log('Failed to create the texture1 object');
        return false;
    }

    // flip the image's Y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit1
    gl.activeTexture(gl.TEXTURE1);
    // bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);
}

function sendTextureToTEXTURE2(image){
    var texture = gl.createTexture();   // create a texture object
    if(!texture){
        console.log('Failed to create the texture2 object');
        return false;
    }

    // flip the image's Y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit0
    gl.activeTexture(gl.TEXTURE2);
    // bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler2, 2);
}

function sendTextureToTEXTURE3(image){
    var texture = gl.createTexture();   // create a texture object
    if(!texture){
        console.log('Failed to create the texture3 object');
        return false;
    }

    // flip the image's Y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit0
    gl.activeTexture(gl.TEXTURE3);
    // bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler3, 3);
}

function main(){
    setupCanvas();                      // set global canvas webGL 
    connectVariablesToGLSL();           // Initialize shaders
    addActionForHtmlUI();               // Connect buttons and sliders to js actions
    initTextures();
    document.onkeydown = keydown;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Specify the color for clearing <canvas>
    // Clear <canvas>    
    // gl.clear(gl.COLOR_BUFFER_BIT); 
    requestAnimationFrame(tick);
}

function tick(){
    g_seconds = performance.now()/1000.0 - g_startTime;
    updateAnimationTransformations();                   // update the angles of my animated blocks
    renderAllShapes();                                  // draw everything
    requestAnimationFrame(tick);                        // tell the browser to update again when it can
}

function updateAnimationTransformations(){
    if(g_CharAnimation){ 
        g_CharHoverLocation = ((Math.sin(g_seconds*3))/30)-(.3);
        g_tailAngle = 5*Math.sin(g_seconds*3);
        g_fireSize = Math.abs( Math.sin(g_seconds*4));
        g_blink = Math.abs(Math.sin(g_seconds*3));
        g_wingAngle = 20*Math.sin(g_seconds*3)+40;
        g_limbAngle = 5*Math.sin(g_seconds*3);
        g_armsAngle = 10*Math.sin(g_seconds*3);
        g_forearmsAngle = 20*Math.sin(g_seconds*3);
    }
}

function keydown(ev){
    if(ev.keyCode      == 68){      // d (move right)
        g_camera.right();
    }
    else if(ev.keyCode == 65){      // a (move left)
        g_camera.left();  
    }
    else if(ev.keyCode == 87){      // w (move forward)
        g_camera.forward();
    }
    else if(ev.keyCode == 83){      // s (move backward)
        g_camera.backward();
    }
    else if(ev.keyCode == 69){      // e (Rotate Camera Right)
        g_camera.rotRight();
    }
    else if(ev.keyCode == 81){
        g_camera.rotLeft();         // q (Rotate Camera Left)
    }
    else if(ev.keyCode == 90){
        g_camera.upward();          // z (up plz)
    }
    else if(ev.keyCode == 88){
        g_camera.downward();        // x (up plz)
    }
    renderAllShapes();
    // console.log(ev.keyCode);
}

function renderAllShapes(){
    var startTime = performance.now();

    // Pass the project matrix
    var projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width/canvas.height, .1, 100); 
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],  
        g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
        g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Pass the global rotate matrix
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1 ,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ------------------ BEGIN RENDERING CUBES ------------------

    drawSetting();
    drawMap();
    if(g_charON){ renderCharShapes(); }

}

function drawSetting(){
    var ocean = new Cube();
    // ocean.textureNum = 2;
    ocean.color = [0, .25, .5, 1];
    ocean.matrix.translate(-0, -.9, -0);
    ocean.matrix.scale(63, .1, 63);
    ocean.matrix.translate(-.35, 0, -.35);
    ocean.render();

    var floor = new Cube();
    floor.textureNum = 1;
    // floor.color = [.76, .70, .50, 1];
    floor.matrix.translate(-0, -.75, -0);
    floor.matrix.scale(35, .01, 35);
    floor.matrix.translate(-.15, 0, -.15);
    floor.render();

    var sky = new Cube();
    sky.color = [0, 0, 1, .5];
    sky.matrix.translate(-1,0,-1);
    sky.matrix.scale(60,60,60);
    sky.matrix.translate(-.3,-.5,-.3);
    sky.render();

    var sun = new Cube();
    sun.color = [1, .7, .2, 1];
    sun.matrix.translate(-17.5,0,0);
    sun.matrix.scale(1,10,10);
    sun.matrix.translate(-2,-.5,.5);
    sun.render();
}

function drawMap(){
    // var c = new Cube();
    for(x=0; x<32; x++){
        for(y=0;y<32;y++){
            if(g_map[x][y] > 0 && g_map[x][y] < 6){   
                for(z=0; z<g_map[x][y]; z++){
                    var c = new Cube();
                    c.textureNum = 0;
                    c.matrix.translate(y-4, z-.75, x-4);
                    c.renderfaster();
                }              
            }
            if(g_map[x][y] > 5){
                for(z=0; z<g_map[x][y]; z++){
                    var c = new Cube();
                    c.textureNum = 2;
                    c.matrix.translate(y-4, z-.75, x-4);
                    c.renderfaster();
                }      
            }   
        }
    }
}

// -------------- RENDER CHARIZARD --------------
function renderCharShapes(){
    let charColor = [1, .55, 0, 1];

    // TORSO
    var body = new Cube();
    body.color = charColor;
    body.matrix.translate(10, g_CharHoverLocation, 5.5);
    body.matrix.rotate(-7, 1, 0, 0);
    var bodyCoordMat = new Matrix4(body.matrix);
    body.matrix.scale(0.4, 0.6, 0.35);
    body.render();

    var stomach = new Cube();
    stomach.color = [1, .65, 0, .5];
    stomach.matrix = bodyCoordMat;
    stomach.matrix.translate(0.024, -0.01, -0.01);
    stomach.matrix.scale(.35, .45, .3);
    stomach.render();

    var bodyCoordMatforNeck = new Matrix4(stomach.matrix);
    var bodyCoordMatforArms = new Matrix4(stomach.matrix);
    var bodyCoordMatforLegs = new Matrix4(stomach.matrix);
    var bodyCoordMatforTail = new Matrix4(stomach.matrix);
    var bodyCoordMatforWing = new Matrix4(stomach.matrix);

    renderHead(charColor, bodyCoordMatforNeck);     // HEAD
    renderArms(charColor, bodyCoordMatforArms);     // ARMS
    renderLegs(charColor, bodyCoordMatforLegs);     // LEGS
    renderTail(charColor, bodyCoordMatforTail);     // TAIL
    renderWing(charColor, bodyCoordMatforWing);     // WINGS
}

function renderHead(charColor, bodyCoordMatforNeck){    
    var neck = new Cube();
    neck.color = charColor;
    neck.matrix = bodyCoordMatforNeck;
    neck.matrix.rotate(-g_limbAngle*1/2, 1, 0, 0);
    neck.matrix.translate(.25, 1, .25);
    neck.matrix.scale(.5, 1, .5);
    var neckCoordMat = new Matrix4(neck.matrix);
    neck.render();

    var skull = new Cube();
    skull.color = charColor;
    skull.matrix = neckCoordMat;
    skull.matrix.translate(-.25, .75, -.6);
    skull.matrix.scale(1.5, .6, 1.7);
    var skullCoordMat1 = new Matrix4(skull.matrix);
    var skullCoordMat2 = new Matrix4(skull.matrix);
    var skullCoordMat3 = new Matrix4(skull.matrix);
    skull.render();

    var topSnout = new Cube();
    topSnout.color = charColor;
    topSnout.matrix = skullCoordMat1;
    topSnout.matrix.translate(0, .25, -.45);
    topSnout.matrix.scale(1, .4, .6);
    topSnout.render();

    var botSnout = new Cube();
    botSnout.color = charColor;
    botSnout.matrix = skullCoordMat1;
    botSnout.matrix.translate(0, -.7, .2);
    botSnout.matrix.scale(1, .5, 1.5);
    botSnout.render();

    var ear = new Cube();
    ear.color = charColor;
    ear.matrix = skullCoordMat2;
    ear.matrix.rotate(45, 1, 0, 0);
    ear.matrix.translate(.05, .9, -.3);
    ear.matrix.scale(.3, .8, .25);
    ear.render();
    ear.matrix.translate(2, 0, 0);
    ear.render();

    renderFace(skullCoordMat3);
}

function renderFace(skullCoordMat){
    var SnoutForNose    = new Matrix4(skullCoordMat);
    var SnoutForTopFang = new Matrix4(skullCoordMat);
    var SnoutForBotFang = new Matrix4(skullCoordMat);

    // EYES
    var eyes = new Cube();
    eyes.color = [0, 0, .65, 1];
    eyes.matrix = skullCoordMat;
    eyes.matrix.translate(.65, .66, -.001);
    eyes.matrix.scale(.15, .15*g_blink, .01)
    eyes.render();
    eyes.matrix.translate(-3, 0, 0);
    eyes.render();

    // NOSE DOTS 
    var nose = new Cube();
    nose.color = [.3, .3, .3, 1];
    nose.matrix = SnoutForNose;
    nose.matrix.translate(.65, .4, -.46);
    nose.matrix.scale(.06, .08, .01)
    nose.render();
    nose.matrix.translate(-6, 0, 0);
    nose.render();

    // FANGS
    var fangs = new Cube();
    fangs.matrix = SnoutForTopFang;
    fangs.matrix.translate(.77, .1, -.4);
    fangs.matrix.scale(.09, .2, .09)
    fangs.render();
    fangs.matrix.translate(-7, 0, 0);
    fangs.render();
}

function renderArms(charColor, bodyCoordMatforArms){
    var bodyCoordMatforArmsR = new Matrix4(bodyCoordMatforArms);
    var bodyCoordMatforArmsL = new Matrix4(bodyCoordMatforArms);

    // RIGHT ARM
    var rArm = new Cube();
    rArm.color = charColor;
    rArm.matrix = bodyCoordMatforArmsR;
    rArm.matrix.translate(.2, 1.1, .4);
    rArm.matrix.rotate(130-(-g_armsAngle), 0, 0, 1);
    var rArmCoordMat = new Matrix4(rArm.matrix);
    rArm.matrix.scale(.25, .7, .3);
    rArm.render();

    var rForearm = new Cube();
    rForearm.color = charColor;
    rForearm.matrix = rArmCoordMat;
    rForearm.matrix.translate(.035, .55, .1);
    rForearm.matrix.rotate(-60-g_forearmsAngle, 1, 0, 0);
    rForearm.matrix.scale(.2, .45, .2);
    var rForearmCoordMat = new Matrix4(rForearm.matrix);
    rForearm.render();

    var rHand = new Cube();
    rHand.color = charColor;
    rHand.matrix = rForearmCoordMat;
    rHand.matrix.translate(0, 1, -.1);
    rHand.matrix.scale(1.1, .4, 1.2);
    var rHandCoordMat = new Matrix4(rHand.matrix);
    rHand.render();

    var rClaw = new Cube();
    rClaw.matrix = rHandCoordMat;
    rClaw.matrix.translate(0, 1, 1);
    rClaw.matrix.scale(.25, .75, -.25);
    rClaw.render();
    rClaw.matrix.translate(2, 0, 3);
    rClaw.render();
    rClaw.matrix.translate(1, 0, -3);
    rClaw.render();

    // LEFT ARM
    var lArm = new Cube();
    lArm.color = charColor;
    lArm.matrix = bodyCoordMatforArmsL;
    lArm.matrix.translate(.8, 1.1, .4);
    lArm.matrix.rotate(-130-g_armsAngle, 0, 0, 1);
    var lArmCoordMat = new Matrix4(lArm.matrix);
    lArm.matrix.scale(-.25, .7, .3);
    lArm.render();

    var lForearm = new Cube();
    lForearm.color = charColor;
    lForearm.matrix = lArmCoordMat;
    lForearm.matrix.translate(-.225, .55, .1);
    lForearm.matrix.rotate(-60-g_forearmsAngle, 1, 0, 0);
    lForearm.matrix.scale(.2, .45, .2);
    var lForearmCoordMat = new Matrix4(lForearm.matrix);
    lForearm.render();

    var lHand = new Cube();
    lHand.color = charColor;
    lHand.matrix = lForearmCoordMat;
    lHand.matrix.translate(-.1, 1, -.1);
    lHand.matrix.scale(1.1, .4, 1.2);
    var lHandCoordMat = new Matrix4(lHand.matrix);
    lHand.render();

    var lClaw = new Cube();
    lClaw.matrix = lHandCoordMat;
    lClaw.matrix.translate(0, 1, 1);
    lClaw.matrix.scale(.25, .75, -.25);
    lClaw.render();
    lClaw.matrix.translate(2, 0, 3);
    lClaw.render();
    lClaw.matrix.translate(1, 0, -3);
    lClaw.render();
}

function renderLegs(charColor, bodyCoordMatforLegs){
    var bodyCoordMatforLegR = new Matrix4(bodyCoordMatforLegs);
    var bodyCoordMatforLegL = new Matrix4(bodyCoordMatforLegs);

    // RIGHT LEG
    var rLeg = new Cube();
    rLeg.color = charColor;
    rLeg.matrix = bodyCoordMatforLegR;
    rLeg.matrix.translate(-.3, .5, .5);
    rLeg.matrix.scale(.8, .75, 1);
    rLeg.matrix.rotate(40+g_limbAngle, 1, 0, 0);
    var rLegCoordMat = new Matrix4(rLeg.matrix);
    rLeg.matrix.scale(.4, -1, .7);
    rLeg.render();

    var rCalf = new Cube();
    rCalf.color = charColor;
    rCalf.matrix = rLegCoordMat;
    rCalf.matrix.translate(.025, -1, .25);
    rCalf.matrix.scale(.3, .6, .7);
    var rCalfCoordMat = new Matrix4(rCalf.matrix);
    rCalf.render();

    var rFoot = new Cube();
    rFoot.color = charColor;
    rFoot.matrix = rCalfCoordMat;
    rFoot.matrix.translate(-.1, -.5, .8);
    rFoot.matrix.scale(1.3, 1.3, .3);
    var rFootCoordMat = new Matrix4(rFoot.matrix);
    rFoot.render();

    var rToe = new Cube();
    rToe.matrix = rFootCoordMat;
    rToe.matrix.translate(.1, -.15, 0.5);
    rToe.matrix.scale(.2, .7, .3);
    rToe.render();
    rToe.matrix.translate(1.5, 0, 0);
    rToe.render();
    rToe.matrix.translate(1.5, 0, 0);
    rToe.render();


    // LEFT LEG
    var lLeg = new Cube();
    lLeg.color = charColor;
    lLeg.matrix = bodyCoordMatforLegL;
    lLeg.matrix.translate(1, .5, .5);
    lLeg.matrix.scale(.8, .75, 1);
    lLeg.matrix.rotate(40+g_limbAngle, 1, 0, 0);
    var lLegCoordMat = new Matrix4(lLeg.matrix);
    lLeg.matrix.scale(.4, -1, .7);
    lLeg.render();

    var lCalf = new Cube();
    lCalf.color = charColor;
    lCalf.matrix = lLegCoordMat;
    lCalf.matrix.translate(.025, -1, .25);
    lCalf.matrix.rotate(-g_limbAngle, 1, 0, 0);
    lCalf.matrix.scale(.3, .6, .7);
    var lCalfCoordMat = new Matrix4(lCalf.matrix);
    lCalf.render();

    var lFoot = new Cube();
    lFoot.color = charColor;
    lFoot.matrix = lCalfCoordMat;
    lFoot.matrix.translate(-.15, -.5, .8);
    lFoot.matrix.scale(1.3, 1.3, .3);
    var lFootCoordMat = new Matrix4(lFoot.matrix);
    lFoot.render();

    var lToe = new Cube();
    lToe.matrix = lFootCoordMat;
    lToe.matrix.translate(.1, -.15, 0.5);
    lToe.matrix.scale(.2, .7, .3);
    lToe.render();
    lToe.matrix.translate(1.5, 0, 0);
    lToe.render();
    lToe.matrix.translate(1.5, 0, 0);
    lToe.render();
}

function renderTail(charColor, bodyCoordMatforTail){

    var tailBase = new Cube();
    tailBase.color = charColor;
    tailBase.matrix = bodyCoordMatforTail;
    tailBase.matrix.translate(.25, .35, 1);
    tailBase.matrix.scale(.5, .5, .8);
    tailBase.matrix.rotate(2*g_tailAngle, 1, 0, 0);
    tailBase.matrix.translate(0, -.5, 0);
    var tailBaseCoordMat = new Matrix4(tailBase.matrix);
    tailBase.render();

    var tailSec = new Cube();
    tailSec.color = charColor;
    tailSec.matrix = tailBaseCoordMat;
    tailSec.matrix.translate(.2, .2, .65);
    tailSec.matrix.rotate(2*g_tailAngle, 1, 0, 0);
    var tailSecCoordMat = new Matrix4(tailSec.matrix);
    tailSec.matrix.scale(.6, .6, 1.15);
    tailSec.render();

    var tailTri = new Cube();
    tailTri.color = charColor;
    tailTri.matrix = tailSecCoordMat;
    tailTri.matrix.translate(.1, .1, .75);
    tailTri.matrix.rotate(g_tailAngle, 1, 0, 0);
    var tailTriCoordMat = new Matrix4(tailTri.matrix);
    tailTri.matrix.scale(.4, .4, 1);
    tailTri.render();

    var tailQuad = new Cube();
    tailQuad.color = charColor;
    tailQuad.matrix = tailTriCoordMat;
    tailQuad.matrix.translate(.08, .08, .75);
    tailQuad.matrix.rotate(g_tailAngle, 1, 0, 0);
    var tailQuadCoordMat = new Matrix4(tailQuad.matrix);
    tailQuad.matrix.scale(.25, .25, .75);
    tailQuad.render();

    var tailTip = new Cube();
    tailTip.color = charColor;
    tailTip.matrix = tailQuadCoordMat;
    tailTip.matrix.translate(.08, .08, .75);
    tailTip.matrix.rotate(g_tailAngle, 1, 0, 0);
    var tailTipCoordMat1 = new Matrix4(tailTip.matrix);
    var tailTipCoordMat2 = new Matrix4(tailTip.matrix);
    tailTip.matrix.scale(.1, .1, .25);
    tailTip.render();

    var tailFireY = new Cube();
    tailFireY.color = [1, .75, 0, 1];
    tailFireY.matrix = tailTipCoordMat1;
    tailFireY.matrix.translate(-.1, .03, .23);
    tailFireY.matrix.scale(.2*g_fireSize+.1, .5*g_fireSize+.1, .2*g_fireSize+.1);
    tailFireY.matrix.rotate(-30, 1, 0, 0);
    tailFireY.render();

    var tailFireR = new Cube();
    tailFireR.color = [1, 0, 0, 1];
    tailFireR.matrix = tailTipCoordMat2;
    tailFireR.matrix.translate(-.1, .03, .23);
    tailFireR.matrix.scale(.2*g_fireSize+.1, .6*g_fireSize+.1, .2*g_fireSize+.1);
    tailFireR.matrix.rotate(50, 1, 0, 0);
    tailFireR.matrix.rotate(90, 0, 1, 0);
    tailFireR.render();

}

function renderWing(charColor, bodyCoordMatforWing){
    var bodyCoordMatforWingR = new Matrix4(bodyCoordMatforWing);
    var bodyCoordMatforWingL = new Matrix4(bodyCoordMatforWing);

    // RIGHT WING
    var rightWingBase = new Cube();
    rightWingBase.color = charColor;
    rightWingBase.matrix = bodyCoordMatforWingR;
    rightWingBase.matrix.translate(.4, 1.15, 1);
    rightWingBase.matrix.rotate(g_wingAngle, 0, -1, 0);
    rightWingBase.matrix.rotate(70, 1, 0, 0);
    var rightWingBaseCoordMat = new Matrix4(rightWingBase.matrix);
    rightWingBase.matrix.scale(-.2, 2, .2);
    rightWingBase.render();

    var rightWingSec = new Cube();
    rightWingSec.color = charColor;
    rightWingSec.matrix = rightWingBaseCoordMat;
    rightWingSec.matrix.translate(-.01, 1.84, -.07);
    var rightWingSecCoordMat = new Matrix4(rightWingSec.matrix);
    rightWingSec.matrix.scale(-.15, .15, 1.2);
    rightWingSec.render();

    var rightWing = new Cube();
    rightWing.color = [0, 0, .5, 1];
    rightWing.matrix = rightWingSecCoordMat;
    rightWing.matrix.translate(-.05, .05, .2);
    rightWing.matrix.scale(.01, -1, .95);
    rightWing.render();
    rightWing.matrix.translate(0, 1, 0);
    rightWing.matrix.scale(.5, .6, .7);
    rightWing.render();

    // LEFT WING
    var leftWingBase = new Cube();
    leftWingBase.color = charColor;
    leftWingBase.matrix = bodyCoordMatforWingL;
    leftWingBase.matrix.translate(1, 0, 0);
    leftWingBase.matrix.scale(-1, 1, 1);
    leftWingBase.matrix.translate(.4, 1.15, 1);
    leftWingBase.matrix.rotate(g_wingAngle, 0, -1, 0);
    leftWingBase.matrix.rotate(70, 1, 0, 0);
    var leftWingBaseCoordMat = new Matrix4(leftWingBase.matrix);
    leftWingBase.matrix.scale(-.2, 2, .2);
    leftWingBase.render();

    var leftWingSec = new Cube();
    leftWingSec.color = charColor;
    leftWingSec.matrix = leftWingBaseCoordMat;
    leftWingSec.matrix.translate(-.01, 1.84, -.07);
    var leftWingSecCoordMat = new Matrix4(leftWingSec.matrix);
    leftWingSec.matrix.scale(-.15, .15, 1.2);
    leftWingSec.render();

    var leftWing = new Cube();
    leftWing.color = [0, 0, .5, 1];
    leftWing.matrix = leftWingSecCoordMat;
    leftWing.matrix.translate(-.05, .05, .2);
    leftWing.matrix.scale(.01, -1, .95);
    leftWing.render();
    leftWing.matrix.translate(0, 1, 0);
    leftWing.matrix.scale(.5, .6, .7);
    leftWing.render();
}