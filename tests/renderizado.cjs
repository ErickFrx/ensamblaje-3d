/* Real WebGL checks for linear composition, output color and quality resizing. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const scripts = ['three.min', 'CopyShader', 'LuminosityHighPassShader',
  'EffectComposer', 'MaskPass', 'ShaderPass', 'RenderPass', 'UnrealBloomPass', 'render-base'];

(async () => {
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url === '/fixture') {
        res.setHeader('Content-Type', 'text/html');
        res.end('<link rel="icon" href="data:,"><canvas id="c"></canvas>' + scripts.map(s =>
          '<script src="/js/' + s + '.js"></script>').join(''));
        return;
      }
      let pathname = decodeURIComponent(req.url.split('?')[0]);
      if (pathname.endsWith('/')) pathname += 'index.html';
      const file = path.resolve(root, '.' + pathname);
      if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      const data = await fs.readFile(file);
      res.setHeader('Content-Type', ({ '.js': 'application/javascript', '.html': 'text/html',
        '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4' })[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.SKY_CHROMIUM || undefined,
      args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 320, height: 240 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const base = 'http://127.0.0.1:' + server.address().port;
    await page.goto(base + '/fixture');
    const fixture = await page.evaluate(() => {
      const R = crearRendererSimulador(document.getElementById('c'), 2);
      R.setSize(320, 240, false);
      const S = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
      camera.position.z = 1;
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(.18, .18, .18) });
      S.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
      const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(320, 240), .1, .2, 2);
      const comp = crearComposerSimulador(R, S, camera, bloom);
      const values = [];
      function pixel() {
        R.setRenderTarget(null);
        comp.render();
        const gl = R.getContext();
        const bytes = new Uint8Array(4);
        gl.readPixels(gl.drawingBufferWidth / 2, gl.drawingBufferHeight / 2,
          1, 1, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
        return [...bytes];
      }
      for (const ratio of [1, 2, 1, 2]) {
        ajustarCalidadRender(R, comp, 320, 240, ratio === 1);
        values.push({ ratio: R.getPixelRatio(), composerRatio: comp._pixelRatio,
          width: comp.renderTarget1.width, height: comp.renderTarget1.height, pixel: pixel() });
      }
      material.color.setRGB(1, 1, 1); const white = pixel();
      material.color.setRGB(0, 0, 0); const black = pixel();
      material.color.setHex(0x767676); const authoredGrey = pixel();
      material.color.setRGB(.18, .18, .18);
      comp.outputPass.uniforms.toneMappingExposure.value = .5;
      const dimmed = pixel();
      comp.outputPass.uniforms.toneMappingExposure.value = 1;
      const type = comp.renderTarget1.texture.type;
      comp.passes.forEach(p => p.dispose?.()); comp.dispose();
      const originalHas = R.extensions.has;
      R.extensions.has = name => name === 'EXT_color_buffer_float' ? false : originalHas.call(R.extensions, name);
      const fallbackBloom = new THREE.UnrealBloomPass(new THREE.Vector2(320, 240), .1, .2, 2);
      fallbackBloom.enabled = false;
      const fallback = crearComposerSimulador(R, S, camera, fallbackBloom);
      R.extensions.has = originalHas;
      ajustarCalidadRender(R, fallback, 320, 240, false);
      fallbackBloom.enabled = false;
      R.setRenderTarget(null); fallback.render();
      const fallbackPixel = new Uint8Array(4), gl = R.getContext();
      gl.readPixels(gl.drawingBufferWidth / 2, gl.drawingBufferHeight / 2,
        1, 1, gl.RGBA, gl.UNSIGNED_BYTE, fallbackPixel);
      const fallbackType = fallback.renderTarget1.texture.type;
      fallback.passes.forEach(p => p.dispose?.()); fallback.dispose();
      material.dispose(); S.children[0].geometry.dispose(); R.dispose();
      return { values, white, black, authoredGrey, dimmed, type, fallbackType, fallbackPixel: [...fallbackPixel] };
    });
    for (const v of fixture.values) {
      assert.equal(v.ratio, v.composerRatio);
      assert.equal(v.width, 320 * v.ratio); assert.equal(v.height, 240 * v.ratio);
      // Linear 18% grey after r147 ACES + sRGB is approximately 127/255.
      for (const c of v.pixel.slice(0, 3)) assert(Math.abs(c - 127) <= 3, JSON.stringify(v));
    }
    for (const c of fixture.white.slice(0, 3)) assert(Math.abs(c - 226) <= 3, 'white ' + fixture.white);
    assert.deepEqual(fixture.black.slice(0, 3), [0, 0, 0]);
    for (const c of fixture.authoredGrey.slice(0, 3)) assert(Math.abs(c - 127) <= 3, 'gris sRGB del material');
    assert(fixture.dimmed[0] > 0 && fixture.dimmed[0] < 127, 'exposición ajustable');
    assert.equal(fixture.fallbackType, 1009, 'UnsignedByteType sin HDR disponible');
    for (const c of fixture.fallbackPixel.slice(0, 3)) assert(Math.abs(c - 127) <= 3);
    assert.deepEqual(errors, []);
    console.log('PASS color ACES/sRGB, bloom y DPR 1/2', JSON.stringify(fixture));

    await page.goto(base + '/#pc');
    await page.waitForFunction(() => window.SKY && !document.getElementById('carga'));
    const pc = await page.evaluate(() => {
      const result = [];
      for (const light of [false, true, false, true]) {
        window.dispatchEvent(new CustomEvent('sim:quality', { detail: light }));
        comp.render();
        const target = comp.renderTarget1;
        result.push({ ratio: R.getPixelRatio(), composerRatio: comp._pixelRatio,
          width: target.width, height: target.height, bloom: comp.passes[1].enabled,
          output: comp.outputPass.enabled, type: target.texture.type, samples: target.samples });
      }
      const badMaps = [];
      S.traverse(o => { if (!o.isMesh) return;
        for (const m of [].concat(o.material)) {
          for (const slot of ['map', 'emissiveMap']) {
            if (m[slot] && m[slot].encoding !== THREE.sRGBEncoding) badMaps.push(slot + ':' + o.name);
          }
          for (const slot of ['normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) {
            if (m[slot] && m[slot].encoding !== THREE.LinearEncoding) badMaps.push(slot + ':' + o.name);
          }
        }
      });
      return { result, badMaps };
    });
    for (const [i, v] of pc.result.entries()) {
      const ratio = i % 2 ? 1 : 2;
      assert.equal(v.ratio, ratio); assert.equal(v.composerRatio, ratio);
      assert.equal(v.width, 320 * ratio); assert.equal(v.height, 240 * ratio);
      assert.equal(v.bloom, ratio === 2); assert.equal(v.output, true);
      assert.equal(v.type, ratio === 2 ? 1016 : 1009);
      assert.equal(v.samples, ratio === 2 ? 4 : 2);
    }
    assert.deepEqual(pc.badMaps, []);
    await page.evaluate(() => SIM_ROUTER.go('laptop'));
    await page.frameLocator('#laptop-view').locator('#sig').waitFor({ state: 'attached' });
    const frame = page.frames().find(f => f.url().includes('laptop.html'));
    await frame.waitForFunction(() => window.LAPTOP_READY === true);
    const laptop = await frame.evaluate(() => {
      const values = [];
      for (const light of [false, true, false, true]) {
        window.dispatchEvent(new CustomEvent('sim:quality', { detail: light }));
        comp.render();
        values.push({ ratio: R.getPixelRatio(), composerRatio: comp._pixelRatio,
          width: comp.renderTarget1.width, height: comp.renderTarget1.height,
          bloom: comp.passes[1].enabled, output: comp.outputPass.enabled,
          type: comp.renderTarget1.texture.type, samples: comp.renderTarget1.samples });
      }
      return values;
    });
    for (const [i, v] of laptop.entries()) {
      const ratio = i % 2 ? 1 : 2;
      assert.equal(v.ratio, ratio); assert.equal(v.composerRatio, ratio);
      assert.equal(v.width, 320 * ratio); assert.equal(v.height, 240 * ratio);
      assert.equal(v.bloom, ratio === 2); assert.equal(v.output, true);
      assert.equal(v.type, ratio === 2 ? 1016 : 1009);
      assert.equal(v.samples, ratio === 2 ? 4 : 2);
    }
    const knownErrors = errors.filter(e => e.includes('THREE.Object3D.add:'));
    assert.deepEqual(errors.filter(e => !e.includes('THREE.Object3D.add:')), []);
    assert.equal(knownErrors.length, 4, 'Solo los cuatro errores previos de grupos vacíos de laptop');
    console.log('PASS calidad PC/laptop y mapas de color/datos; 4 errores de consola conocidos sin cambios');
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
