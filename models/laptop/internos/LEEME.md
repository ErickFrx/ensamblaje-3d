# Componentes internos originales

Seis GLB exportados de la geometría original de `js/laptop-modelos.js`: placa base, CPU BGA, dos SO-DIMM, SSD M.2 2280, refrigeración y batería. La GPU y sus memorias forman parte de la placa. Los ventiladores conservan sus nodos separados.

No proceden de los CAD de terceros inspeccionados. El diseño es educativo y genérico, adaptado al espacio del exterior Gaming Laptop; no es una reproducción certificada de su hardware real.

Las coordenadas de los GLB están en las unidades ilustrativas del simulador y mantienen la posición de montaje de cada conjunto. Para interpretarlas en metros, multiplicar por 0,3432 / 15,6 (0,022 m por unidad). Para la galería puede centrarse cada conjunto por su caja envolvente. Las etiquetas y materiales están incluidos, sin archivos externos.

13.308 triángulos entre los seis conjuntos. Los GLB completos suman 1.383.808 bytes. El simulador construye la geometría directamente con Three.js; estos GLB son copias exportadas reutilizables y no se vuelven a cargar sobre las piezas existentes.

`medidas.json` registra límites y triángulos en las unidades del simulador. El código preserva un corredor lateral para los puertos y mantiene los componentes por debajo del plano de cubierta de 0,82 unidades. Los contactos y fijaciones tienen contacto intencional con sus sockets y la placa; el disipador contacta con CPU/GPU.

Los componentes y sus fuentes originales de geometría se ofrecen bajo la licencia MIT incluida. Esa licencia no cambia la licencia del exterior de Diego G. ni la de otros recursos del proyecto.
