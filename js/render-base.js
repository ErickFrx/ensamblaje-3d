/* Shared linear rendering pipeline for the vendored Three.js r147. */
(function () {
  'use strict';

  // Hex/CSS colors are authored in sRGB; lighting works in linear sRGB.
  THREE.ColorManagement.legacyMode = false;

  window.crearRendererSimulador = function (canvas, pixelRatio) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(pixelRatio);
    // Keep scene and bloom linear. The final pass alone applies ACES and sRGB.
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    return renderer;
  };

  window.crearComposerSimulador = function (renderer, scene, camera, bloom) {
    const size = renderer.getSize(new THREE.Vector2());
    const ratio = renderer.getPixelRatio();
    const hdr = renderer.capabilities.isWebGL2 &&
      renderer.extensions.has('EXT_color_buffer_float');
    const target = new THREE.WebGLRenderTarget(size.x * ratio, size.y * ratio, {
      type: THREE.UnsignedByteType,
      encoding: THREE.LinearEncoding,
      // The canvas' antialias flag does not smooth offscreen RenderPass targets.
      samples: renderer.capabilities.isWebGL2 ? Math.min(2, renderer.capabilities.maxSamples) : 0,
    });
    const composer = new THREE.EffectComposer(renderer, target);
    composer.hdrAvailable = hdr;
    composer.maxSamples = renderer.capabilities.isWebGL2 ? Math.min(4, renderer.capabilities.maxSamples) : 0;
    // EffectComposer uses ratio 1 when supplied with an explicit target.
    composer.setSize(size.x, size.y);
    composer.setPixelRatio(ratio);
    composer.addPass(new THREE.RenderPass(scene, camera));
    composer.addPass(bloom);
    const output = new THREE.ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        toneMappingExposure: { value: 1 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        #include <tonemapping_pars_fragment>
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          color.rgb = ACESFilmicToneMapping(color.rgb);
          gl_FragColor = LinearTosRGB(color);
        }
      `,
    });
    output.material.toneMapped = false;
    output.material.depthTest = false;
    output.material.depthWrite = false;
    composer.outputPass = output;
    composer.addPass(output);
    return composer;
  };

  window.ajustarResolucionRender = function (renderer, composer, width, height, ratio) {
    if (ratio === undefined) ratio = renderer.getPixelRatio();
    if (renderer.getPixelRatio() !== ratio) renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    if (composer._pixelRatio !== ratio) composer.setPixelRatio(ratio);
    composer.setSize(width, height);
  };

  window.ajustarCalidadRender = function (renderer, composer, width, height, light) {
    const type = !light && composer.hdrAvailable ? THREE.HalfFloatType : THREE.UnsignedByteType;
    const samples = light ? Math.min(2, composer.maxSamples) : composer.maxSamples;
    for (const target of [composer.renderTarget1, composer.renderTarget2]) {
      if (target.texture.type !== type || target.samples !== samples) {
        target.dispose();
        target.texture.type = type;
        target.samples = samples;
      }
    }
    composer.passes[1].enabled = !light;
    ajustarResolucionRender(renderer, composer, width, height,
      light ? 1 : Math.min(devicePixelRatio, 2));
  };
})();
