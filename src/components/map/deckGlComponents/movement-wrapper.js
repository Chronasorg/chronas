import {Layer} from 'deck.gl';

import {Model, Geometry} from 'luma.gl';

const tripsVertex = `\
#define SHADER_NAME trips-layer-vertex-shader

attribute vec3 positions;
attribute vec3 colors;

uniform float opacity;
uniform float currentTime;
uniform float trailLength;

varying float vTime;
varying vec4 vColor;

void main(void) {
  vec2 p = project_position(positions.xy);
  // the magic de-flickering factor
  vec4 shift = vec4(0., 0., mod(positions.z, trailLength) * 1e-4, 0.);

  gl_Position = project_to_clipspace(vec4(p, 1., 1.)) + shift;

  vColor = vec4(colors / 255.0, opacity);
  vTime = 1.0 - (currentTime - positions.z) / trailLength;
}
`;

const tripsFragment = `\
#define SHADER_NAME trips-layer-fragment-shader

precision highp float;

varying float vTime;
varying vec4 vColor;

void main(void) {
  if (vTime > 1.0 || vTime < 0.0) {
    discard;
  }
  gl_FragColor = vec4(vColor.rgb, vColor.a * vTime);
}
`;

const defaultProps = {
  trailLength: 120,
  currentTime: 0,
  getPath: d => d.path,
  getColor: d => d.color
};

export default class MovementLayer extends Layer {
  initializeState() {
    const {gl} = this.context;
    const attributeManager = this.getAttributeManager();

    const model = this.getModel(gl);

    attributeManager.add({
      indices: {size: 1, update: this.calculateIndices, isIndexed: true},
      positions: {size: 3, update: this.calculatePositions},
      colors: {size: 3, update: this.calculateColors}
    });

    gl.getExtension('OES_element_index_uint');
    this.setState({model});
  }

  updateState({props, changeFlags: {dataChanged}}) {
    if (dataChanged) {
      this.countVertices(props.data);
      this.state.attributeManager.invalidateAll();
    }
  }

  getModel(gl) {
    return new Model(gl, {
      id: this.props.id,
      vs: tripsVertex,
      fs: tripsFragment,
      geometry: new Geometry({
        id: this.props.id,
        drawMode: 'LINES'
      }),
      vertexCount: 0,
      isIndexed: true,
      // TODO-state-management: onBeforeRender can go to settings, onAfterRender, we should
      // move this settings of corresponding draw.
      onBeforeRender: () => {
        gl.enable(gl.BLEND);
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(2.0, 1.0);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendEquation(gl.FUNC_ADD);
      },
      onAfterRender: () => {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.POLYGON_OFFSET_FILL);
      }
    });
  }

  countVertices(data) {
    if (!data) {
      return;
    }

    const {getPath} = this.props;
    let vertexCount = 0;
    const pathLengths = data.reduce((acc, d) => {
      const l = getPath(d).length;
      vertexCount += l;
      return [...acc, l];
    }, []);
    this.setState({pathLengths, vertexCount});
  }

  draw({uniforms}) {
    const {trailLength, currentTime} = this.props;
    this.state.model.render(
      Object.assign({}, uniforms, {
        trailLength,
        currentTime
      })
    );
  }

  calculateIndices(attribute) {
    const {pathLengths, vertexCount} = this.state;

    const indicesCount = (vertexCount - pathLengths.length) * 2;
    const indices = new Uint32Array(indicesCount);

    let offset = 0;
    let index = 0;
    for (let i = 0; i < pathLengths.length; i++) {
      const l = pathLengths[i];
      indices[index++] = offset;
      for (let j = 1; j < l - 1; j++) {
        indices[index++] = j + offset;
        indices[index++] = j + offset;
      }
      indices[index++] = offset + l - 1;
      offset += l;
    }
    attribute.value = indices;
    this.state.model.setVertexCount(indicesCount);
  }

  calculatePositions(attribute) {
    const {data, getPath} = this.props;
    const {vertexCount} = this.state;
    const positions = new Float32Array(vertexCount * 3);

    let index = 0;
    for (let i = 0; i < data.length; i++) {
      const path = getPath(data[i]);
      for (let j = 0; j < path.length; j++) {
        const pt = path[j];
        positions[index++] = pt[0];
        positions[index++] = pt[1];
        positions[index++] = pt[2];
      }
    }
    attribute.value = positions;
  }

  calculateColors(attribute) {
    const {data, getColor} = this.props;
    const {pathLengths, vertexCount} = this.state;
    const colors = new Float32Array(vertexCount * 3);

    let index = 0;
    for (let i = 0; i < data.length; i++) {
      const color = getColor(data[i]);
      const l = pathLengths[i];
      for (let j = 0; j < l; j++) {
        colors[index++] = color[0];
        colors[index++] = color[1];
        colors[index++] = color[2];
      }
    }
    attribute.value = colors;
  }
}

MovementLayer.layerName = 'MovementLayer';
MovementLayer.defaultProps = defaultProps;
