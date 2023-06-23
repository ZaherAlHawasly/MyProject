// Set up the WebGL context
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

// Set up the scene, camera, and lighting
const cameraPosition = [0, 0, 5];
const lightPosition = [0, 1, 1];
const lightColor = [1, 1, 1];
const ambientColor = [0.5, 0.5, 0.5];

// Set up the shader program
const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec3 a_normal;

    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_projectionMatrix;
    uniform mat3 u_normalMatrix;

    varying vec3 v_normal;

    void main() {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
        v_normal = normalize(u_normalMatrix * a_normal);
    }
`;

const fragmentShaderSource = `
    precision mediump float;

    uniform vec3 u_lightPosition;
    uniform vec3 u_lightColor;
    uniform vec3 u_ambientColor;

    varying vec3 v_normal;

    void main() {
        vec3 color = vec3(1.0, 0.0, 0.0); // Red

        vec3 L = normalize(u_lightPosition - gl_FragCoord.xyz);
        vec3 N = normalize(v_normal);
        float diffuse = max(dot(L, N), 0.0);

        vec3 ambient = u_ambientColor * color;
        vec3 diffuseColor = u_lightColor * color * diffuse;

        gl_FragColor = vec4(ambient + diffuseColor, 1.0);
    }
`;

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

const bodyVertices = [
  // Body vertices
  -0.5, -0.4, 3,
  -0.5, -0.5, 1,
  1, -0.5, 1,
  1, -0.5, -1,
  -1, 0.5, -1,
  -1, 0.5, 1,
  1, 0.5, 1,
  1, 0.5, -1,
];

const bodyNormals = [
  // Body normals
  0, -1, 0,
  0, -1, 0,
  0, -1, 0,
  0, -1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
];

const bodyIndices = [
  // Body indices
  0, 1, 2,
  0, 2, 3,
  0, 3, 7,
  0, 7, 4,
  1, 5, 6,
  1, 6, 2,
  4, 5, 1,
  4, 1, 0,
  3, 2, 6,
  3, 6, 7,
  5, 4, 7,
  5, 7, 6,
];

const tailFanVertices = [
  // Tail vertices
  -0.1, -0.5, 0,
  -0.1, 0.5, 0,
  0.1, 0.5, 0,
  0.1, -0.5, 0,

  // Fan1 vertices
  -0.5, 0, 0.5,
  0.5, 0, 0.5,
  0, 0, 1,

  // Fan2 vertices
  -0.5, 0, -0.5,
  0.5, 0, -0.5,
  0, 0, -1,

  // Fan3 vertices
  0, 0.5, 0.5,
  0, 0.5, -0.5,
  0.5, 0.5, 0,

  // Fan4 vertices
  0, -0.5, 0.5,
  0, -0.5, -0.5,
  -0.5, -0.5, 0,
];

const tailFanNormals = [
  // Tail normals
  -1, 0, 0,
  -1, 0, 0,
  1, 0, 0,
  1, 0, 0,

  // Fan1 normals
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,

  // Fan2 normals
  0, 0, -1,
  0, 0, -1,
  0, 0, -1,

  // Fan3 normals
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,

  // Fan4 normals
  0, -1, 0,
  0, -1, 0,
  0, -1, 0,
];

const tailFanIndices = [
  // Tail indices
  0, 1, 2,
  0, 2, 3,

  // Fan1 indices
  4, 5, 6,

  // Fan2 indices
  7, 8, 9,

  // Fan3 indices
  10, 11, 12,

  // Fan4 indices
  13, 14, 15,
];

const vertexBuffer = createBuffer(gl, new Float32Array([...bodyVertices, ...tailFanVertices]));
const bodyNormalBuffer = createBuffer(gl, new Float32Array(bodyNormals));
const tailFanNormalBuffer = createBuffer(gl, new Float32Array(tailFanNormals));
const bodyIndexBuffer = createIndexBuffer(gl, new Uint16Array(bodyIndices));
const tailFanIndexBuffer = createIndexBuffer(gl, new Uint16Array(tailFanIndices));

// Create the helicopter transforms
const bodyTransform = {
  position: [-10, -4, -10],
  rotation: [0, 0, 0],
  scale: [1, 2, 5],
};

const tailFanTransforms = [
  {
    position: [0, 1.5, 0],
    rotation: [0, 0.5, 0],
    scale: [2, 2, 1],
  },
];

// Add keyboard event listeners
const keys = {};
document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);

// Animation loop
let fanSpeed = 0;
let cameraPositionX = 0;
let cameraPositionY = -2;
let cameraPositionZ = 10;

var background_size=100;

function animate() {

    requestAnimationFrame(animate);

    // Update fan blade rotation based on user input
    if (keys['Digit1']) fanSpeed = 0.3;
    if (keys['Digit2']) fanSpeed = 0.5;
    if (keys['Digit3']) fanSpeed =  1;

    tailFanTransforms.map(item =>{ item.rotation[1] += fanSpeed});
    

    // Update camera position based on user input
    if (keys['KeyA'] && cameraPositionX>=-5) cameraPositionX -= 0.1;
    if (keys['KeyD'] && cameraPositionX<=+5) cameraPositionX += 0.1;

    // Update helicopter position based on user input
    if (keys['ArrowUp'] && fanSpeed>=0.3) {
      bodyTransform.position[1] += 0.1;
    };
    if (keys['ArrowDown'] && fanSpeed>=0.3) {
      bodyTransform.position[1] -= 0.1;
    };
    if (keys['ArrowLeft'] && fanSpeed>=0.3) {
      bodyTransform.position[0] -= 0.1;
    };
    if (keys['ArrowRight'] && fanSpeed>=0.3) {
      bodyTransform.position[0] += 0.1;
    };
    if (keys['KeyW'] && fanSpeed>=0.3 ) {
      bodyTransform.position[2] -= 0.1;
      background_size+=0.1
      document.querySelector('canvas').style.backgroundSize = `100% ${background_size}%`;
    };
    if (keys['KeyS'] && fanSpeed>=0.3 && background_size>100) {
      bodyTransform.position[2] += 0.1;
      background_size-=0.1
      document.querySelector('canvas').style.backgroundSize = `100% ${background_size}%`;
    };

    const cameraPosition = [cameraPositionX, cameraPositionY, cameraPositionZ];


    // Set up the model-view and projection matrices
    const viewMatrix = createViewMatrix(cameraPosition, [0, 0, 0], [0, 1, 0]);
    const modelViewMatrix = createModelViewMatrix(bodyTransform, viewMatrix);
    const projectionMatrix = createProjectionMatrix(45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 100);

    // Set up the normal matrix
    const normalMatrix = createNormalMatrix(modelViewMatrix);

    
    
    // Set up the uniforms
    gl.useProgram(program);

    gl.uniform3fv(gl.getUniformLocation(program, 'u_lightPosition'), lightPosition);
    gl.uniform3fv(gl.getUniformLocation(program, 'u_lightColor'), lightColor);
    gl.uniform3fv(gl.getUniformLocation(program, 'u_ambientColor'), ambientColor);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_modelViewMatrix'), false, modelViewMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_projectionMatrix'), false, projectionMatrix);
    gl.uniformMatrix3fv(gl.getUniformLocation(program, 'u_normalMatrix'), false, normalMatrix);


    


    // Draw the helicopter body
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(gl.getAttribLocation(program, 'a_position'));
    gl.vertexAttribPointer(gl.getAttribLocation(program, 'a_position'), 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bodyNormalBuffer);
    gl.enableVertexAttribArray(gl.getAttribLocation(program, 'a_normal'));
    gl.vertexAttribPointer(gl.getAttribLocation(program, 'a_normal'), 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bodyIndexBuffer);
    gl.drawElements(gl.TRIANGLES, bodyIndices.length, gl.UNSIGNED_SHORT, 0);

    // // Draw the helicopter tail
    const tailModelViewMatrices = tailFanTransforms.map(transform => createModelViewMatrix(transform, modelViewMatrix));
const tailNormalMatrices = tailModelViewMatrices.map(tailModelViewMatrices => createNormalMatrix(tailModelViewMatrices));

// Set the model view matrix and normal matrix uniforms for the tail/fans
for (let i = 0; i < tailModelViewMatrices.length; i++) {
  const tailModelViewMatrix = tailModelViewMatrices[i];
  const tailNormalMatrix = tailNormalMatrices[i];

  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_modelViewMatrix'), false, tailModelViewMatrix);
  gl.uniformMatrix3fv(gl.getUniformLocation(program, 'u_normalMatrix'), false, tailNormalMatrix);

  // Draw the tail/fan component
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(program, 'a_position'), 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, tailFanNormalBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(program, 'a_normal'), 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tailFanIndexBuffer);
  gl.drawElements(gl.TRIANGLES, tailFanIndices.length, gl.UNSIGNED_SHORT, 0);
}

}

// Helper functions
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Error compiling shader (${type}):`, gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function createBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}

function createIndexBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}

function createViewMatrix(eye, target, up) {
    const z = normalize(subtract(target, eye));
    const x = normalize(cross(z, up));
    const y = cross(x, z);
    return [
        x[0], y[0], -z[0], 0,
        x[1], y[1], -z[1], 0,
        x[2], y[2], -z[2], 0,
        -dot(x, eye), -dot(y, eye), dot(z, eye), 1
    ];
}

function createModelViewMatrix(transform, viewMatrix) {
    const {position, rotation, scale} = transform;
    const translationMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        position[0], position[1], position[2], 1
    ];
    const rotationMatrix = createRotationMatrix(rotation);
    const scaleMatrix = [
        scale[0], 0, 0, 0,
        0, scale[1], 0, 0,
        0, 0, scale[2], 0,
        0, 0, 0, 1
    ];
    return multiply(viewMatrix, multiply(translationMatrix, multiply(rotationMatrix, scaleMatrix)));
}

function createProjectionMatrix(fovy, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fovy);
    const rangeInv = 1.0 / (near - far);
    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ];
}

function createNormalMatrix(modelViewMatrix) {
  const normalMatrix = mat3.create();

  // Extract the upper-left 3x3 submatrix from the 4x4 model-view matrix
  mat3.fromMat4(normalMatrix, modelViewMatrix);

  // Compute the inverse transpose of the 3x3 matrix
  mat3.invert(normalMatrix, normalMatrix);
  mat3.transpose(normalMatrix, normalMatrix);

  return normalMatrix;
}

function createRotationMatrix(rotation) {
    const [x, y, z] = rotation;
    const cx = Math.cos(x);
    const cy = Math.cos(y);
    const cz = Math.cos(z);
    const sx = Math.sin(x);
    const sy = Math.sin(y);
    const sz = Math.sin(z);
    return [
        cy * cz, -cy * sz, sy, 0,
        cx * sz + cz * sx * sy, cx * cz - sx * sy * sz, -cy * sx, 0,
        sx * sz - cx * cz * sy, cz * sx + cx * sy * sz, cx * cy, 0,
        0, 0, 0, 1
    ];
}

function dot(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += a[i] * b[i];
    }
    return sum;
}

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function normalize(v) {
    const length = Math.sqrt(dot(v, v));
    return v.map(x => x / length);
}

function subtract(a, b) {
    return a.map((x, i) => x - b[i]);
}

function multiply(a, b) {
    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a03 = a[0 * 4 + 3];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a13 = a[1 * 4 + 3];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];
    const a23 = a[2 * 4 + 3];
    const a30 = a[3 * 4 + 0];
    const a31 = a[3 * 4 + 1];
    const a32 = a[3 * 4 + 2];
    const a33 = a[3 * 4 + 3];
    const b00 = b[0 * 4 + 0];
    const b01 = b[0 * 4 + 1];
    const b02 = b[0 * 4 + 2];
    const b03 = b[0 * 4 + 3];
    const b10 = b[1 * 4 + 0];
    const b11 = b[1 * 4 + 1];
    const b12 = b[1 * 4 + 2];
    const b13 = b[1 * 4 + 3];
    const b20 = b[2 * 4 + 0];
    const b21 = b[2 * 4 + 1];
    const b22 = b[2 * 4 + 2];
    const b23 = b[2 * 4 + 3];
    const b30 = b[3 * 4 + 0];
    const b31 = b[3 * 4 + 1];
    const b32 = b[3 * 4 + 2];
    const b33 = b[3 * 4 + 3];
    return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
}

animate()

setTimeout(function() {

  alert(`
التحرك : باستخدام الأسهم من لوحة المفاتيح

الدوران : A , D

الأزرار لتشغيل شفرات الهيلكوبتر و التحكم بسرعة الدوران :
 1 , 2 , 3

`);

}, 1000);

