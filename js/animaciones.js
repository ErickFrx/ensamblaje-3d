function iniciarCicloAnimacion() {
  let ultimoFrame = 0;

  (function animar(tiempo) {
    requestAnimationFrame(animar);
    if (gal && gexp < 0.25 && hovK) limpiarHover();

    // Limita el salto temporal para que las interpolaciones sigan siendo estables al volver a la pestaña.
    const dt = Math.min(0.05, (tiempo - ultimoFrame) / 1000 || 0);
    ultimoFrame = tiempo;
    if (window.actualizarMovimientoManual)
      window.actualizarMovimientoManual(dt);

    tw = tw.filter((animacion) => {
      animacion.t += dt;
      if (animacion.t < 0) return true;

      const progreso = Math.min(1, animacion.t / animacion.dur);
      animacion.fn(progreso);
      return progreso < 1;
    });

    rgbs.forEach((material) => {
      if (rgbOn) {
        material.color
          .setHSL((tiempo / 4000 + material.userData.o) % 1, 1, 0.55)
          .multiplyScalar(endOn || cur >= 7 ? 1.8 : 1.1);
      } else {
        material.color.set(0x000000);
      }
    });

    spin.forEach((ventilador) => {
      ventilador.rotation.z -= dt * (endOn ? 9 : 2);
    });

    if (gal) {
      gctl.update();
      gspin.forEach((ventilador) => {
        ventilador.rotation.z -= dt * 4;
      });

      gexp += (gexpT - gexp) * Math.min(1, dt * 5);
      if (gobj) {
        const piezas = gobj.userData.partes.children;
        piezas.forEach((pieza, i) => {
          if (!pieza.userData.p0) return;

          const eje = gobj.userData.ax || "z";
          const separacion =
            gobj.userData.id === "mouse"
              ? 0.22
              : piezas.length > 8
                ? (0.7 * 8) / piezas.length
                : 0.7;
          pieza.position[eje] =
            pieza.userData.p0[eje] +
            (i - (piezas.length - 1) / 2) * separacion * gexp;
        });
      }
    } else {
      ctl.update();
    }

    comp.render();
  })(0);
}
