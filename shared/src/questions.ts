import type { Question, Section, QuestionType } from './types.js';

export const QUESTIONS: Question[] = [
  // SECCIÓN 1: HTML / CSS
  {
    id: 0,
    sectionId: 1,
    type: 'test',
    question: 'Sintaxis correcta para aplicar estilos a dispositivos con un ancho máximo de 768px:',
    options: [
      '@media only screen and (min-device-width: 768px) { ... }',
      '@media (max-device-width: 768px) { ... }',
      '@media only screen and (max-width: 768px) { ... }',
      '@media (min-width: 768px) { ... }',
      '@media screen and (width <= 768px) { ... }',
    ],
    correctIndex: 2,
  },
  {
    id: 1,
    sectionId: 1,
    type: 'test',
    question: 'Unidad de medida más adecuada para establecer el tamaño de fuente en diseños responsivos:',
    options: ['Porcentaje', 'Píxeles', 'em', 'Centímetros', 'rem'],
    correctIndex: 4,
  },
  {
    id: 2,
    sectionId: 1,
    type: 'html',
    question: `Genera en HTML tres elementos \`div\` de 100px por 100px dispuestos horizontalmente, cada uno con un color de fondo distinto.

Debe existir un espacio de 10px entre cada bloque.

Escribe el código HTML + CSS necesario:

\`\`\`html
<!-- Escribe tu solución aquí -->
\`\`\``,
    solution: `<div style="display:flex; gap:10px;">
    <div style="width:100px; height:100px; background:#ff5733;"></div>
    <div style="width:100px; height:100px; background:#33ff57;"></div>
    <div style="width:100px; height:100px; background:#3357ff;"></div>
</div>`,
    hints: [
      'Usa display:flex y gap:10px',
      'Cada div: width:100px; height:100px;',
      'Colores: #ff5733, #33ff57, #3357ff',
    ],
    preview: true,
    devTimeMinutes: 20,
    validationKey: 'html_divs',
  },

  // SECCIÓN 2: JavaScript Básico
  {
    id: 3,
    sectionId: 2,
    type: 'test',
    question: 'Comando para deshacer cambios en un archivo no modificado (no agregado al staging):',
    options: ['reset', 'revert', 'checkout', 'remove', 'undo'],
    correctIndex: 2,
  },
  {
    id: 4,
    sectionId: 2,
    type: 'test',
    question: 'Principal diferencia entre rebase y merge:',
    options: [
      'Rebase crea un commit de fusión, merge no',
      'Merge reescribe el historial, rebase no',
      'Rebase produce un historial lineal, merge preserva las bifurcaciones',
      'No hay diferencia, son lo mismo',
      'Merge solo se usa en ramas remotas',
    ],
    correctIndex: 2,
  },
  {
    id: 5,
    sectionId: 2,
    type: 'codigo',
    question: `Completa el código para calcular temperatura máxima, mínima y promedio semanal.

Agrega la lógica faltante desde el comentario indicado:

\`\`\`javascript
function analizarTemperaturas(temperaturas) {
    if (temperaturas.length === 0) {
        return { promedio: null, maxima: null, minima: null };
    }

    let suma = 0;
    let minima = temperaturas[0];
    let maxima = temperaturas[0];

    for (let temp of temperaturas) {
        suma += temp;
        // ESCRIBE TU CODIGO A PARTIR DE AQUI

    }

    return { promedio, maxima, minima };
}
\`\`\``,
    solution: `if (temp < minima) minima = temp;
if (temp > maxima) maxima = temp;
let promedio = suma / temperaturas.length;`,
    hints: [
      'Dentro del bucle: if (temp < minima) minima = temp;',
      'if (temp > maxima) maxima = temp;',
      'let promedio = suma / temperaturas.length;',
    ],
    devTimeMinutes: 18,
    validationKey: 'js_analizar_temperaturas',
  },

  // SECCIÓN 3: JavaScript Avanzado
  {
    id: 6,
    sectionId: 3,
    type: 'test',
    question: '¿Cuál es el propósito del método constructor dentro de una clase en JavaScript?',
    options: [
      'Definir propiedades y métodos estáticos',
      'Convertir la clase en un objeto JSON',
      'Crear una instancia de la clase automáticamente',
      'Inicializar las propiedades del objeto cuando se crea una instancia',
      'Declarar métodos privados en la clase',
    ],
    correctIndex: 3,
  },
  {
    id: 7,
    sectionId: 3,
    type: 'test',
    question: 'Palabra clave en JavaScript para permitir que una clase herede de otra:',
    options: ['implements', 'extends', 'inherits', 'prototype', 'superclass'],
    correctIndex: 1,
  },
  {
    id: 8,
    sectionId: 3,
    type: 'test',
    question: '¿Cómo evitar que una clase diseñada como abstracta sea instanciada directamente?',
    options: [
      'Usando abstract class como en otros lenguajes',
      'Evitando definir un constructor',
      'Agregando una propiedad private',
      'Lanzando un error en el constructor si se usa new.target',
      'Definiendo todos los métodos como static',
    ],
    correctIndex: 3,
  },
  {
    id: 9,
    sectionId: 3,
    type: 'test',
    question: 'Forma correcta de escribir una función de flecha en JavaScript ES6:',
    options: [
      'function sumar(a, b) => { return a + b; };',
      'const sumar => (a, b) { return a + b; };',
      'sumar = (a, b) => { return a + b; };',
      'const sumar = function(a, b) { return a + b; };',
      'const sumar = (a, b) => a + b;',
    ],
    correctIndex: 4,
  },
  {
    id: 10,
    sectionId: 3,
    type: 'test',
    question:
      '¿Qué salida produce? const numeros = [1,2,3,4]; const nuevosNumeros = [...numeros, 5, 6]; console.log(nuevosNumeros);',
    options: [
      'Error: los corchetes no son válidos en ES6',
      '[1, 2, 3, 4, 5, 6]',
      'undefined',
      '[1, 2, 3, 4, [5, 6]]',
    ],
    correctIndex: 1,
  },
  {
    id: 11,
    sectionId: 3,
    type: 'test',
    question: '¿Qué permite redefinir el comportamiento de iteración de un array en ES6+?',
    options: [
      'Aplicar el método forEach() con un retorno explícito',
      'Asignar una nueva función a la propiedad Symbol.iterator del array',
      'Aplicar Array.prototype.toString() de forma personalizada',
      'Convertir el array en un objeto con Map()',
      'Usar Object.defineProperty para modificar length',
    ],
    correctIndex: 1,
  },
  {
    id: 12,
    sectionId: 3,
    type: 'test',
    question: 'En una función tradicional como manejador de eventos, ¿a qué hace referencia this?',
    options: ['A null', 'Al evento en sí mismo', 'Al objeto window', 'A la función manejadora', 'Al botón que disparó el evento'],
    correctIndex: 4,
  },
  {
    id: 13,
    sectionId: 3,
    type: 'test',
    question: '¿Qué efecto tiene el método stopPropagation() en un manejador de eventos?',
    options: [
      'Evita que el evento se dispare',
      'Reinicia la propagación desde el elemento raíz',
      'Detiene la ejecución del callback',
      'Cancela el evento por completo, incluyendo acciones del navegador',
      'Impide que el evento se propague a elementos padres',
    ],
    correctIndex: 4,
  },
  {
    id: 14,
    sectionId: 3,
    type: 'test',
    question:
      'Cuando se usa una función flecha dentro de setTimeout() en un manejador de eventos, ¿a qué hace referencia this?',
    options: ['Al setTimeout', 'A window', 'Al objeto event', 'Al botón que disparó el evento', 'A null'],
    correctIndex: 1,
  },
  {
    id: 15,
    sectionId: 3,
    type: 'test',
    question: '¿Qué se imprime? console.log("Inicio"); setTimeout(() => console.log("Dentro"), 0); console.log("Fin");',
    options: [
      'Error en la consola',
      '"Inicio", "Dentro", "Fin"',
      '"Dentro", "Inicio", "Fin"',
      '"Inicio", "Fin", "Dentro"',
      '"Fin", "Inicio", "Dentro"',
    ],
    correctIndex: 3,
  },
  {
    id: 16,
    sectionId: 3,
    type: 'test',
    question: '¿Qué hace el método Promise.all()?',
    options: [
      'Espera a que todas las promesas se resuelvan o una falle para devolver una sola promesa',
      'No se usa para manejar promesas',
      'Ejecuta promesas en paralelo sin esperar a todas',
      'Ejecuta promesas en serie, una tras otra',
      'Resuelve la primera promesa que termine, ignorando las demás',
    ],
    correctIndex: 0,
  },
  {
    id: 17,
    sectionId: 3,
    type: 'test',
    question: '¿Qué se imprime? async function test() { return "Hola"; } console.log(test());',
    options: ['undefined', 'null', 'Error', 'Promise {"Hola"}', '"Hola"'],
    correctIndex: 3,
  },
  {
    id: 18,
    sectionId: 3,
    type: 'test',
    question: 'Diferencia entre async/await y .then():',
    options: [
      '.then() solo se usa con setTimeout, async/await con fetch',
      'async/await permite código asíncrono más legible y estructurado',
      '.then() bloquea la ejecución, async/await no',
      'async/await no es compatible con promesas',
      'async/await no permite manejar errores',
    ],
    correctIndex: 1,
  },
  {
    id: 19,
    sectionId: 3,
    type: 'test',
    question: 'Diferencia entre Promise.all() y Promise.allSettled():',
    options: [
      'all() espera todas resueltas o rechazadas, allSettled() solo resoluciones',
      'Funcionan exactamente igual',
      'allSettled() se usa solo con async/await',
      'all() devuelve una promesa que siempre se resuelve',
      'allSettled() espera a que todas terminen (resueltas o rechazadas), all() falla si una se rechaza',
    ],
    correctIndex: 4,
  },
  {
    id: 20,
    sectionId: 3,
    type: 'test',
    question: 'Comportamiento de await cuando espera una promesa ya resuelta:',
    options: [
      'Cede el control al event loop y continúa después',
      'Se comporta como una llamada síncrona y bloquea el hilo',
      'Fuerza el uso de setTimeout',
      'Hace una pausa por un segundo',
      'Ignora la promesa y continúa de inmediato',
    ],
    correctIndex: 0,
  },
  {
    id: 21,
    sectionId: 3,
    type: 'codigo',
    question: `Completa el código para calcular el producto más vendido.

Agrega la lógica faltante dentro del segundo \`for\`:

\`\`\`javascript
function procesarPedidos(pedidos) {
    if (pedidos.length === 0) {
        return { totalVentas: 0, productoMasVendido: null };
    }

    let totalVentas = 0;
    const conteoProductos = {};

    for (const pedido of pedidos) {
        for (const producto of pedido.productos) {
            // COMIENZA A ESCRIBIR TU CODIGO AQUI

        }
    }

    return { totalVentas, productoMasVendido };
}
\`\`\``,
    solution: `totalVentas += producto.precio * producto.cantidad;
const nombre = producto.nombre;
if (conteoProductos[nombre]) {
    conteoProductos[nombre] += producto.cantidad;
} else {
    conteoProductos[nombre] = producto.cantidad;
}`,
    hints: [
      'totalVentas += producto.precio * producto.cantidad;',
      'const nombre = producto.nombre;',
      'if (conteoProductos[nombre]) conteoProductos[nombre] += producto.cantidad; else conteoProductos[nombre] = producto.cantidad;',
    ],
    devTimeMinutes: 22,
    validationKey: 'js_procesar_pedidos',
  },

  // SECCIÓN 4: SQL
  {
    id: 22,
    sectionId: 4,
    type: 'test',
    question: 'Sentencia correcta para insertar un nuevo cliente en la tabla Clientes:',
    options: [
      'NEW INTO Clientes (1, "Juan", "juan@email.com")',
      'COMMIT Clientes SET (1, "Juan", "juan@email.com")',
      'INSERT INTO Clientes (id_cliente, nombre, email) VALUES (1, "Juan", "juan@email.com")',
      'ADD INTO Clientes VALUES (1, "Juan", "juan@email.com")',
      'ALTER Clientes VALUES (1, "Juan", "juan@email.com")',
    ],
    correctIndex: 2,
  },
  {
    id: 23,
    sectionId: 4,
    type: 'test',
    question: 'Sentencia correcta para eliminar completamente la tabla Pedidos:',
    options: ['DROP TABLE Pedidos;', 'ELIMINATE TABLE Pedidos;', 'ERASE TABLE Pedidos;', 'CLEAR Pedidos;', 'REMOVE Pedidos;'],
    correctIndex: 0,
  },
  {
    id: 24,
    sectionId: 4,
    type: 'test',
    question: '¿Cómo definir id_cliente como clave primaria en la tabla Clientes?',
    options: [
      'ALTER TABLE Clientes ADD PRIMARY KEY (id_cliente);',
      'MODIFY TABLE Clientes SET PRIMARY KEY (id_cliente);',
      'CREATE PRIMARY KEY ON Clientes (id_cliente);',
      'DEFINE PRIMARY KEY (id_cliente) ON Clientes;',
      'UPDATE TABLE Clientes SET PRIMARY KEY id_cliente;',
    ],
    correctIndex: 0,
  },
  {
    id: 25,
    sectionId: 4,
    type: 'test',
    question: '¿Cómo definir que edad en Usuarios debe ser mayor o igual a 18?',
    options: [
      'CREATE TABLE Usuarios (id INT, edad INT CHECK (edad >= 18));',
      'CREATE TABLE Usuarios (id INT, edad INT CONSTRAINT edad >= 18);',
      'CREATE TABLE Usuarios (id INT, edad INT WHERE edad >= 18);',
      'CREATE TABLE Usuarios (id INT, edad INT VALIDATE (edad >= 18));',
      'CREATE TABLE Usuarios (id INT, edad INT REQUIRE edad >= 18);',
    ],
    correctIndex: 0,
  },
  {
    id: 26,
    sectionId: 4,
    type: 'test',
    question: '¿Qué hace la instrucción UPDATE en SQL?',
    options: [
      'Agrega nuevas columnas a la tabla',
      'Modifica uno o varios campos de registros existentes',
      'Ordena los resultados por ID',
      'Filtra resultados por texto',
      'Elimina registros duplicados',
    ],
    correctIndex: 1,
  },
  {
    id: 27,
    sectionId: 4,
    type: 'test',
    question: '¿Cómo se actualiza un solo campo de un registro específico?',
    options: [
      'Aplicando REPLACE y LIMIT',
      'Modificando directamente el archivo JSON',
      'Ejecutando DELETE y luego INSERT',
      'Usando UPDATE con SET y una condición WHERE',
      'Usando SELECT INTO',
    ],
    correctIndex: 3,
  },
  {
    id: 28,
    sectionId: 4,
    type: 'test',
    question: '¿Qué hacen BEGIN y COMMIT en SQL?',
    options: [
      'Validan el orden de las consultas',
      'Definen campos obligatorios en formularios',
      'Crean una nueva tabla temporal',
      'Inician y confirman una transacción respectivamente',
      'Filtran resultados automáticamente',
    ],
    correctIndex: 3,
  },
  {
    id: 29,
    sectionId: 4,
    type: 'sql',
    question: `Escribe una consulta SQL que devuelva, por cada categoria de producto, el total de unidades vendidas.

El resultado debe mostrar \`category\` y \`total_vendido\`, ordenado por \`total_vendido\` descendente.

Tablas:

- \`products\`: \`id\`, \`name\`, \`category\`
- \`order_items\`: \`id\`, \`order_id\`, \`product_id\`, \`quantity\`

\`\`\`sql
-- Escribe tu consulta aqui
\`\`\``,
    solution: `SELECT p.category, SUM(oi.quantity) AS total_vendido
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.category
ORDER BY total_vendido DESC;`,
    hints: [
      'SELECT p.category, SUM(oi.quantity) AS total_vendido',
      'FROM products p JOIN order_items oi ON p.id = oi.product_id',
      'GROUP BY p.category ORDER BY total_vendido DESC',
    ],
    devTimeMinutes: 20,
    validationKey: 'sql_category_sales',
  },
  {
    id: 30,
    sectionId: 4,
    type: 'sql',
    question: `Escribe una consulta SQL que muestre el nombre del producto y el total de unidades vendidas.

Solo deben aparecer los productos cuyo total supere las 500 unidades.

Usa una CTE con \`WITH\`.

Tablas:

- \`productos\`: \`id\`, \`nombre\`, \`precio_unitario\`
- \`ventas\`: \`id\`, \`id_producto\`, \`cantidad\`, \`fecha\`

\`\`\`sql
-- Escribe tu consulta aqui
\`\`\``,
    solution: `WITH total_por_producto AS (
    SELECT p.id, p.nombre, SUM(v.cantidad) AS total_unidades
    FROM productos p
    JOIN ventas v ON p.id = v.id_producto
    GROUP BY p.id, p.nombre
)
SELECT nombre, total_unidades
FROM total_por_producto
WHERE total_unidades > 500;`,
    hints: [
      'WITH total_por_producto AS (SELECT ... SUM(v.cantidad) ...)',
      'FROM productos p JOIN ventas v ON p.id = v.id_producto',
      'GROUP BY p.id, p.nombre WHERE total_unidades > 500',
    ],
    devTimeMinutes: 22,
    validationKey: 'sql_cte_products',
  },
  {
    id: 31,
    sectionId: 4,
    type: 'sql',
    question: `Escribe una consulta SQL para insertar dos productos en la tabla \`Productos\` usando valores explicitos y valores por defecto.

La tabla tiene esta estructura:

\`\`\`sql
id_producto INT,
nombre VARCHAR(100),
precio DECIMAL(10,2),
stock INT DEFAULT 0,
fecha_creacion DATE DEFAULT CURRENT_DATE
\`\`\`

Debes insertar:

- Producto 1: \`id=1\`, \`nombre='Laptop'\`, \`precio=1200.00\`
- Producto 2: \`id=2\`, \`nombre='Mouse'\`, \`precio=25.00\`

Asegurate de que \`stock\` y \`fecha_creacion\` usen los valores por defecto.

\`\`\`sql
-- Escribe tu consulta aqui
\`\`\``,
    solution: `INSERT INTO Productos (id_producto, nombre, precio)
VALUES (1, 'Laptop', 1200.00), (2, 'Mouse', 25.00);`,
    hints: [
      'INSERT INTO Productos (id_producto, nombre, precio)',
      'VALUES (1, "Laptop", 1200.00), (2, "Mouse", 25.00)',
    ],
    devTimeMinutes: 18,
    validationKey: 'sql_insert_products',
  },

  // SECCIÓN 5: Modelo Entidad-Relación
  {
    id: 32,
    sectionId: 5,
    type: 'test',
    question:
      '¿Qué elemento del MER usarías para representar a un paciente con nombre, DNI, fecha de nacimiento y domicilio?',
    options: [
      'Una relación entre atributos',
      'Una propiedad del sistema',
      'Un conjunto de datos agrupados en una tabla secundaria',
      'Un índice compuesto',
      'Una entidad, ya que cada paciente es un objeto con existencia propia',
    ],
    correctIndex: 4,
  },
  {
    id: 33,
    sectionId: 5,
    type: 'test',
    question: '¿Cómo se representa una relación de uno a uno en un diagrama ER?',
    options: [
      'Con una línea que conecta las entidades y una "I" en ambos extremos, sin rombo',
      'Con una línea simple y un rombo entre las entidades',
      'Con dos líneas paralelas entre las entidades',
      'Con una línea que conecta las entidades y un "N" en ambos extremos',
    ],
    correctIndex: 1,
  },
  {
    id: 34,
    sectionId: 5,
    type: 'test',
    question: '¿Cómo se representa una relación de muchos a muchos en un diagrama ER?',
    options: [
      'Con una flecha de una entidad a la otra',
      'Mediante un rombo entre las entidades, sin entidad intermedia',
      'Mediante una entidad intermedia que conecta las dos entidades principales',
      'Con una línea de relación que tiene una "I" y una "N" en ambos extremos',
      'Mediante una línea simple que conecta las dos entidades',
    ],
    correctIndex: 1,
  },
  {
    id: 35,
    sectionId: 5,
    type: 'test',
    question: '¿Cómo se representa una relación de uno a muchos en un diagrama ER?',
    options: [
      'Con un rombo en el centro de la relación',
      'Con una línea que conecta las entidades y un símbolo de estrella en un extremo',
      'Con dos líneas entre las entidades',
      'Con una línea recta sin ningún símbolo adicional',
      'Con una línea que conecta las entidades y una "I" en un extremo y una "N" en el otro',
    ],
    correctIndex: 4,
  },

  // SECCIÓN 6: Express / Node.js
  {
    id: 36,
    sectionId: 6,
    type: 'test',
    question: 'Propósito principal de Express:',
    options: [
      'Crear servidores web y manejar rutas y peticiones HTTP',
      'Compilar código a otros lenguajes',
      'Diseñar animaciones en frontend',
      'Construir hojas de estilo',
      'Crear bases de datos',
    ],
    correctIndex: 0,
  },
  {
    id: 37,
    sectionId: 6,
    type: 'test',
    question: '¿Cómo se permite la ejecución secuencial de middlewares en Express?',
    options: [
      'Colocando la ruta en la función listen()',
      'Llamando a la función next() dentro del middleware',
      'Importando el archivo middleware.js',
      'Declarando múltiples rutas en paralelo',
      'Usando promesas en cada endpoint',
    ],
    correctIndex: 1,
  },
  {
    id: 38,
    sectionId: 6,
    type: 'test',
    question: 'Estructura de un middleware de manejo de errores en Express:',
    options: [
      'Debe tener 4 parámetros: err, req, res, next',
      'Utiliza solo dos parámetros: req y res',
      'Debe ejecutarse dentro de app.listen()',
      'Es exclusivo de rutas POST',
      'Solo funciona con archivos estáticos',
    ],
    correctIndex: 0,
  },
  {
    id: 39,
    sectionId: 6,
    type: 'test',
    question: '¿Qué función tiene res.render() en Express?',
    options: [
      'Ejecuta scripts del lado del cliente',
      'Renderiza una vista usando el motor de plantillas configurado',
      'Redirige al usuario a otra URL',
      'Aplica estilos al archivo CSS',
      'Guarda datos en una base de datos',
    ],
    correctIndex: 1,
  },
  {
    id: 40,
    sectionId: 6,
    type: 'test',
    question: '¿Dónde se suelen ubicar las vistas en un proyecto MVC?',
    options: [
      'En una carpeta llamada "views" dentro de la estructura del proyecto',
      'En la misma carpeta que las rutas',
      'Dentro de los controladores',
      'Junto a los archivos de configuración',
      'En la raíz del proyecto con nombre "HTML"',
    ],
    correctIndex: 0,
  },
  {
    id: 41,
    sectionId: 6,
    type: 'test',
    question: 'Función del controlador en MVC:',
    options: [
      'Almacenar los estilos CSS del sitio',
      'Gestionar la lógica de las rutas y conectar modelo con vista',
      'Dividir vistas por colores temáticos',
      'Controlar los errores de la base de datos',
      'Renderizar directamente archivos JSON',
    ],
    correctIndex: 1,
  },
  {
    id: 42,
    sectionId: 6,
    type: 'test',
    question: '¿Qué se debe hacer para modificar un objeto dentro de un archivo JSON?',
    options: [
      'Leer el archivo, modificar el objeto en memoria y sobrescribirlo',
      'Dividir el archivo en múltiples partes',
      'Aplicar una función map() directamente sobre el archivo',
      'Eliminar el archivo y volver a crearlo manualmente',
      'Convertirlo en HTML y modificarlo con DOM',
    ],
    correctIndex: 0,
  },
  {
    id: 43,
    sectionId: 6,
    type: 'test',
    question: 'Error común al leer un archivo JSON:',
    options: [
      'No incluir el archivo en el package.json',
      'Usar promesas en vez de callbacks',
      'Ejecutar funciones async dentro del JSON',
      'Guardar el archivo con extensión .txt',
      'Olvidar convertir el contenido de texto con JSON.parse',
    ],
    correctIndex: 4,
  },
  {
    id: 44,
    sectionId: 6,
    type: 'test',
    question: '¿Qué define el archivo package.json como punto de entrada?',
    options: [
      'El primer archivo que se encuentra en la raíz',
      'La ruta del archivo .env',
      'El script declarado como "start"',
      'La propiedad "main"',
      'La función app.listen()',
    ],
    correctIndex: 3,
  },
  {
    id: 45,
    sectionId: 6,
    type: 'test',
    question: '¿Cómo se detiene manualmente una app Node corriendo en consola?',
    options: [
      'Escribiendo stop-node',
      'Cerrando el archivo .env',
      'Eliminando la carpeta del proyecto',
      'Presionando Ctrl + C en la terminal',
      'Pausando la vista en el navegador',
    ],
    correctIndex: 3,
  },
  {
    id: 46,
    sectionId: 6,
    type: 'test',
    question: 'Módulo común para conectarse a bases de datos en Node.js:',
    options: ['fs para SQL', 'pg para PostgreSQL', 'dotenv para SQL', 'http-server', 'bcryptjs'],
    correctIndex: 1,
  },
  {
    id: 47,
    sectionId: 6,
    type: 'test',
    question: '¿Cómo se realiza una consulta asíncrona en Node?',
    options: [
      'Utilizando JSON.stringify en la query',
      'Usando async/await o promesas con el método query',
      'Aplicando setInterval en las rutas',
      'Incluyendo headers personalizados',
      'Forzando el cierre del servidor',
    ],
    correctIndex: 1,
  },
  {
    id: 48,
    sectionId: 6,
    type: 'test',
    question: '¿Qué se debe tener en cuenta al usar múltiples parámetros en una consulta SQL?',
    options: [
      'Separar las condiciones con punto y coma',
      'Convertir la consulta a minúsculas',
      'Concatenar los valores en la query manualmente',
      'Asignar cada valor en el orden correcto con placeholder',
      'Ignorar valores nulos o vacíos',
    ],
    correctIndex: 3,
  },

  // SECCIÓN 7: ORM / REST / JWT
  {
    id: 49,
    sectionId: 7,
    type: 'test',
    question: 'Propósito de un ORM:',
    options: [
      'Mapear tablas de una base de datos a objetos de código',
      'Ejecutar código HTML desde Node',
      'Convertir JSON en archivos físicos',
      'Crear rutas en aplicaciones Express',
      'Estilizar tablas con CSS',
    ],
    correctIndex: 0,
  },
  {
    id: 50,
    sectionId: 7,
    type: 'test',
    question: '¿Qué define el tipo Sequelize.STRING en un modelo?',
    options: [
      'Un valor booleano true o false',
      'Un objeto JSON interno',
      'Un número entero autoincremental',
      'Un campo de texto como una columna tipo varchar',
      'Una clave foránea numérica',
    ],
    correctIndex: 3,
  },
  {
    id: 51,
    sectionId: 7,
    type: 'test',
    question: '¿Cómo se consulta por un campo específico en Sequelize?',
    options: [
      'Pasando un objeto where: { campo: valor } en findAll()',
      'Usando .filter() sobre los resultados',
      'Modificando directamente la tabla',
      'Agregando una condición en app.js',
      'Cambiando los headers del request',
    ],
    correctIndex: 0,
  },
  {
    id: 52,
    sectionId: 7,
    type: 'test',
    question: '¿Qué representa una relación uno a muchos?',
    options: [
      'Un registro se asocia con varios en otra tabla',
      'Una tabla almacena sólo valores únicos',
      'Una tabla está duplicada en dos bases',
      'Varios modelos comparten la misma vista',
      'Dos tablas se relacionan con el mismo ID',
    ],
    correctIndex: 0,
  },
  {
    id: 53,
    sectionId: 7,
    type: 'test',
    question: '¿Para qué se usa belongsTo en Sequelize?',
    options: [
      'Elimina relaciones uno a muchos',
      'Agrupa modelos con la misma clave primaria',
      'Renombra atributos del modelo',
      'Indica que un modelo pertenece a otro (clave foránea)',
      'Define un modelo sin relaciones',
    ],
    correctIndex: 3,
  },
  {
    id: 54,
    sectionId: 7,
    type: 'test',
    question: '¿Cómo se crea una relación muchos a muchos en Sequelize?',
    options: [
      'Declarando claves compuestas en un solo modelo',
      'Vinculando IDs con una función map()',
      'Usando belongsToMany en ambos modelos con la opción through',
      'Sincronizando cada tabla manualmente',
    ],
    correctIndex: 2,
  },
  {
    id: 55,
    sectionId: 7,
    type: 'test',
    question: 'Función del verbo GET en REST:',
    options: [
      'Actualizar un recurso existente',
      'Crear un recurso nuevo',
      'Subir archivos al servidor',
      'Solicitar datos de un recurso',
      'Eliminar múltiples recursos',
    ],
    correctIndex: 3,
  },
  {
    id: 56,
    sectionId: 7,
    type: 'test',
    question: '¿Qué implica que una API REST sea stateless?',
    options: [
      'Debe usar cookies para mantener el estado',
      'Almacena sesiones en memoria del servidor',
      'Requiere autenticación solo una vez',
      'Depende del almacenamiento local',
      'Cada solicitud debe contener toda la información necesaria',
    ],
    correctIndex: 4,
  },
  {
    id: 57,
    sectionId: 7,
    type: 'test',
    question: '¿Cuál de estos verbos HTTP se considera seguro según el estándar REST?',
    options: ['PUT', 'POST', 'GET', 'DELETE', 'PATCH'],
    correctIndex: 2,
  },
  {
    id: 58,
    sectionId: 7,
    type: 'test',
    question: '¿Qué es serializar datos en una API?',
    options: [
      'Convertir objetos a formato JSON para ser enviados',
      'Ejecutar funciones de control',
      'Transformar HTML a texto plano',
      'Convertir un archivo JS a binario',
      'Validar credenciales del usuario',
    ],
    correctIndex: 0,
  },
  {
    id: 59,
    sectionId: 7,
    type: 'test',
    question: '¿Para qué sirve express.json()?',
    options: [
      'Para permitir que Express interprete cuerpos JSON en solicitudes',
      'Para cifrar contraseñas recibidas',
      'Para analizar cabeceras de seguridad',
      'Para generar respuestas HTML',
      'Para validar rutas duplicadas',
    ],
    correctIndex: 0,
  },
  {
    id: 60,
    sectionId: 7,
    type: 'test',
    question: '¿Qué hace el backend al deserializar datos?',
    options: [
      'Guarda el contenido en un archivo',
      'Transforma HTML en componentes',
      'Aplica estilos CSS',
      'Ejecuta el código automáticamente',
      'Convierte un JSON recibido en un objeto usable en el servidor',
    ],
    correctIndex: 4,
  },
  {
    id: 61,
    sectionId: 7,
    type: 'test',
    question: '¿Cómo se debe validar la entrada de datos en una API REST?',
    options: [
      'Evadiendo el análisis si es un GET',
      'Convirtiendo todo a texto plano',
      'Devolviendo errores sin explicación',
      'Verificando tipo, formato y existencia antes de procesar',
      'Reenviando la petición sin cambios',
    ],
    correctIndex: 3,
  },
  {
    id: 62,
    sectionId: 7,
    type: 'test',
    question: 'Objetivo de usar JWT en una API REST:',
    options: [
      'Guardar archivos grandes en la sesión',
      'Modificar rutas sin permisos',
      'Verificar la identidad del usuario entre solicitudes',
      'Evitar el uso de tokens de sesión',
      'Cifrar contraseñas en el servidor',
    ],
    correctIndex: 2,
  },
  {
    id: 63,
    sectionId: 7,
    type: 'test',
    question: '¿Qué debe hacer un middleware JWT en Express?',
    options: [
      'Cargar todos los usuarios en memoria',
      'Crear tokens para cada petición GET',
      'Comprobar el token antes de acceder a rutas protegidas',
      'Validar el frontend visualmente',
      'Cifrar archivos JSON automáticamente',
    ],
    correctIndex: 2,
  },
  {
    id: 64,
    sectionId: 7,
    type: 'test',
    question: '¿Por qué es importante definir un tiempo de expiración en JWT?',
    options: [
      'Para que se recargue el backend',
      'Para limitar el tiempo en que un token es válido por seguridad',
      'Para evitar errores de red',
      'Para aumentar el tamaño del token',
      'Para compartir el token entre usuarios',
    ],
    correctIndex: 1,
  },
];

export const SECTIONS: Section[] = [
  {
    id: 1,
    title: 'HTML / CSS',
    subtitle: 'Teoría y práctica',
    timeMinutes: 35,
    questionIds: [0, 1, 2],
  },
  {
    id: 2,
    title: 'JavaScript Básico',
    subtitle: 'Teoría y práctica',
    timeMinutes: 40,
    questionIds: [3, 4, 5],
  },
  {
    id: 3,
    title: 'JavaScript Avanzado',
    subtitle: 'Teoría y práctica',
    timeMinutes: 90,
    questionIds: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
  },
  {
    id: 4,
    title: 'SQL',
    subtitle: 'Teoría y práctica',
    timeMinutes: 60,
    questionIds: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
  },
  {
    id: 5,
    title: 'Modelo Entidad-Relación',
    subtitle: 'Solo teoría',
    timeMinutes: 20,
    questionIds: [32, 33, 34, 35],
  },
  {
    id: 6,
    title: 'Express / Node.js',
    subtitle: 'Solo teoría',
    timeMinutes: 45,
    questionIds: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
  },
  {
    id: 7,
    title: 'ORM / REST / JWT',
    subtitle: 'Solo teoría',
    timeMinutes: 45,
    questionIds: [49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64],
  },
];

export function getQuestionById(id: number): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function getSectionById(id: number): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function isDevQuestion(type: QuestionType | string): boolean {
  return type === 'html' || type === 'codigo' || type === 'sql';
}
