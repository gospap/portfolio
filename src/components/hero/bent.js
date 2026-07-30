import * as THREE from "three";
import { extend } from "@react-three/fiber";

/* ===========================================================================
   Ported verbatim from the pmndrs example this hero is modelled on:
   pmndrs/examples · demos/cards-with-border-radius/src/util.js

   BentPlaneGeometry is Paul West's (@prisoner849) curved-plane construction:
   https://discourse.threejs.org/t/simple-curved-plane/26647/10
   It bows a PlaneGeometry along a circular arc so a card sitting on a ring
   follows the ring instead of cutting a chord across it.
   =========================================================================== */

class BentPlaneGeometry extends THREE.PlaneGeometry {
  constructor(radius, ...args) {
    super(...args);
    let p = this.parameters;
    let hw = p.width * 0.5;
    let a = new THREE.Vector2(-hw, 0);
    let b = new THREE.Vector2(0, radius);
    let c = new THREE.Vector2(hw, 0);
    let ab = new THREE.Vector2().subVectors(a, b);
    let bc = new THREE.Vector2().subVectors(b, c);
    let ac = new THREE.Vector2().subVectors(a, c);
    let r =
      (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));
    let center = new THREE.Vector2(0, radius - r);
    let baseV = new THREE.Vector2().subVectors(a, center);
    let baseAngle = baseV.angle() - Math.PI * 0.5;
    let arc = baseAngle * 2;
    let uv = this.attributes.uv;
    let pos = this.attributes.position;
    let mainV = new THREE.Vector2();
    for (let i = 0; i < uv.count; i++) {
      let uvRatio = 1 - uv.getX(i);
      let y = pos.getY(i);
      mainV.copy(c).rotateAround(center, arc * uvRatio);
      /* +mainV.y, where the reference has -mainV.y. That sign is the only
         change: it decides which way the card bows. Negative puts the middle
         of the card BEHIND its edges — concave, cupping away from you, which
         is what the reference wants because its cards face inward and are seen
         from the far side of the ring. These cards face outward, so the same
         sign would show you the inside of a bowl. Positive bows the middle
         toward the camera: convex, like a card held up and flexed. */
      pos.setXYZ(i, mainV.x, y, mainV.y);
    }
    pos.needsUpdate = true;
    this.computeVertexNormals();
  }
}

/**
 * MeshBasicMaterial with a travelling sine along the banner's length.
 *
 * Deviation from the reference: the wave height is a uniform instead of the
 * hard-coded `/ 4.0`. That constant is ±0.25 world units, which was fine for
 * the demo's 1-unit ring and is far too much here — it swung the band up into
 * the bottom edge of the cards. Set it imperatively (`material.amplitude.value`)
 * like `time`, never as a JSX prop: R3F would assign the number straight over
 * the uniform object and the shader would lose its reference.
 */
class MeshSineMaterial extends THREE.MeshBasicMaterial {
  constructor(parameters = {}) {
    super(parameters);
    this.setValues(parameters);
    this.time = { value: 0 };
    this.amplitude = { value: 0.25 };
  }
  onBeforeCompile(shader) {
    shader.uniforms.time = this.time;
    shader.uniforms.amplitude = this.amplitude;
    shader.vertexShader = `
      uniform float time;
      uniform float amplitude;
      ${shader.vertexShader}
    `;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `vec3 transformed = vec3(position.x, position.y + sin(time + uv.x * PI * 4.0) * amplitude, position.z);`,
    );
  }
}

extend({ BentPlaneGeometry, MeshSineMaterial });

export { BentPlaneGeometry, MeshSineMaterial };
