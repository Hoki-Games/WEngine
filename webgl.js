const initWebGL = (canvas) => {
    let gl = null;
    try {
        gl = canvas.getContext('webgl2');
    }
    catch (err) { }
    if (!gl)
        throw new Error('Unable to initialize WebGL');
    return gl;
};
const getShader = (gl, id) => {
    const elem = document.getElementById(id);
    if (!elem)
        return null;
    let source = '';
    for (const child of elem.childNodes) {
        if (child.nodeType == child.TEXT_NODE)
            source += child.textContent;
    }
    let shader = null;
    if (elem.type == 'x-shader/x-fragment')
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    else if (elem.type == 'x-shader/x-vertex')
        shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error('An error occured whild compiling a shader: ' + gl.getShaderInfoLog(shader));
    return shader;
};
const initShaders = (gl) => {
    const fragShader = getShader(gl, 'shader-fs');
    const vertShader = getShader(gl, 'shader-vs');
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        throw new Error('Unable to initialize the shader program.');
    gl.useProgram(shaderProgram);
    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPositionAttribute);
    return shaderProgram;
};
class Shape {
    #gl;
    #buffer;
    #attribute;
    #uColor;
    #vertCount;
    color;
    constructor(gl, program, vertices, color) {
        this.color = color;
        this.#gl = gl;
        this.#vertCount = vertices.length / 3;
        this.#attribute = gl.getAttribLocation(program, 'aVertexPosition');
        this.#uColor = gl.getUniformLocation(program, 'uColor');
        this.#buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }
    draw() {
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffer);
        this.#gl.vertexAttribPointer(this.#attribute, 3, this.#gl.FLOAT, false, 0, 0);
        this.#gl.uniform4fv(this.#uColor, new Float32Array(this.color));
        this.#gl.drawArrays(this.#gl.TRIANGLE_STRIP, 0, this.#vertCount);
    }
}
const drawScene = (gl, scene) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (const obj of scene) {
        obj.draw();
    }
};
window.addEventListener('load', () => {
    const display = document.getElementById('display');
    const gl = globalThis.gl = initWebGL(display);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, 1000, 1000);
    const program = globalThis.glProg = initShaders(gl);
    globalThis.objects = [
        new Shape(gl, program, [
            0, 0, -0.8,
            -1, 0, -0.8,
            0, -1, -0.8,
            -1, -1, -0.8
        ], [1, 0, 0, 1]),
        new Shape(gl, program, [
            1, 1, 0.8,
            0, 1, 0.8,
            1, 0, 0.8,
            0, 0, 0.8
        ], [0, 1, 0, 1]),
        new Shape(gl, program, [
            0, 0.5, 1,
            0.5, -0.25, -1,
            -0.5, -0.25, -1
        ], [1, 1, 1, 1])
    ];
    globalThis.draw = () => drawScene(gl, globalThis.objects);
    globalThis.draw();
});
