const vertexShader =`
    attribute vec3 position;
    attribute vec3 color;
    attribute float scale;
 
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
 
    varying vec3 vColor;
 
    void main(void){
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = scale * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;
 
const fragmentShader =`
    precision highp float;
 
    varying vec3 vColor;
 
    void main(void){
        if(length(gl_PointCoord - vec2(0.5,0.5)) > 0.475){
            discard;
        }
        gl_FragColor = vec4(vColor,1.0);
    }
`;
 
export { vertexShader, fragmentShader };