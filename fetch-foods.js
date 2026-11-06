const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, 'backend', 'src', 'main', 'resources', 'foods.json');
const BEDCA_URL = 'https://raw.githubusercontent.com/TerjeRu/bedca-database/main/output/bedca_foods.csv';

// LISTA BLANCA: Los ingredientes puros que queremos buscar en BEDCA
const STAPLE_INGREDIENTS = [
  // Carnes y Aves
  { search: 'Pollo, pechuga, con piel, crudo', cleanName: 'Pechuga de pollo' },
  { search: 'Pavo, pechuga', cleanName: 'Pechuga de pavo' },
  { search: 'Ternera, solomillo', cleanName: 'Solomillo de ternera' },
  { search: 'Ternera, lomo', cleanName: 'Lomo de ternera' },
  { search: 'Cerdo, lomo', cleanName: 'Lomo de cerdo' },
  { search: 'Cerdo, solomillo', cleanName: 'Solomillo de cerdo' },
  { search: 'Conejo de granja', cleanName: 'Carne de conejo' },
  { search: 'Carne picada', cleanName: 'Carne picada de vacuno' },
  
  // Pescados y Mariscos
  { search: 'Salmón', cleanName: 'Salmón fresco' },
  { search: 'Merluza fresca', cleanName: 'Merluza' },
  { search: 'Bacalao', cleanName: 'Bacalao fresco' },
  { search: 'Atún', cleanName: 'Atún fresco' },
  { search: 'Dorada', cleanName: 'Dorada' },
  { search: 'Lubina', cleanName: 'Lubina' },
  { search: 'Sardina', cleanName: 'Sardinas' },
  { search: 'Gamba', cleanName: 'Gambas' },
  { search: 'Langostino', cleanName: 'Langostinos' },
  { search: 'Calamar', cleanName: 'Calamar' },
  { search: 'Pulpo', cleanName: 'Pulpo' },
  { search: 'Sepia', cleanName: 'Sepia' },
  { search: 'Mejillon', cleanName: 'Mejillones' },

  // Huevos y Lácteos
  { search: 'Huevo de gallina, entero', cleanName: 'Huevo entero' },
  { search: 'Huevo de gallina, clara', cleanName: 'Claras de huevo' },
  { search: 'Huevo de gallina, yema', cleanName: 'Yema de huevo' },
  { search: 'Leche de vaca, entera', cleanName: 'Leche entera' },
  { search: 'Leche, semidesnatada', cleanName: 'Leche semidesnatada' },
  { search: 'Leche, desnatada', cleanName: 'Leche desnatada' },
  { search: 'Queso fresco de burgos', cleanName: 'Queso fresco tipo Burgos' },
  { search: 'Queso mozzarella', cleanName: 'Queso mozzarella' },
  { search: 'Queso semicurado', cleanName: 'Queso semicurado' },
  { search: 'Requesón', cleanName: 'Requesón' },
  { search: 'Yogur, desnatado, sabor natural', cleanName: 'Yogur desnatado natural' },
  { search: 'Yogur griego', cleanName: 'Yogur griego natural' },

  // Cereales y Granos
  { search: 'Avena', cleanName: 'Copos de avena' },
  { search: 'Arroz', cleanName: 'Arroz blanco' },
  { search: 'Arroz integral', cleanName: 'Arroz integral' },
  { search: 'Pasta alimenticia, integral', cleanName: 'Pasta integral' },
  { search: 'Pasta alimenticia', cleanName: 'Pasta de trigo' },
  { search: 'Quinoa', cleanName: 'Quinoa en grano' },
  { search: 'Pan integral', cleanName: 'Pan 100% integral' },
  { search: 'Pan blanco, de barra', cleanName: 'Pan blanco' },
  { search: 'Harina de avena', cleanName: 'Harina de avena' },
  { search: 'Harina de trigo, integral', cleanName: 'Harina de trigo integral' },

  // Legumbres y Proteína Vegetal
  { search: 'Lenteja, seca', cleanName: 'Lentejas' },
  { search: 'Garbanzo, seco', cleanName: 'Garbanzos' },
  { search: 'Alubia blanca, seca', cleanName: 'Alubias blancas' },
  { search: 'Guisante', cleanName: 'Guisantes' },
  { search: 'Soja, seca', cleanName: 'Soja en grano' },
  { search: 'Tofu', cleanName: 'Tofu' },

  // Tubérculos
  { search: 'Patata', cleanName: 'Patata' },
  { search: 'Boniato', cleanName: 'Boniato / Batata' },

  // Frutas
  { search: 'Plátano', cleanName: 'Plátano' },
  { search: 'Manzana', cleanName: 'Manzana' },
  { search: 'Pera', cleanName: 'Pera' },
  { search: 'Naranja', cleanName: 'Naranja' },
  { search: 'Fresa', cleanName: 'Fresas' },
  { search: 'Arandano', cleanName: 'Arándanos' },
  { search: 'Kiwi', cleanName: 'Kiwi' },
  { search: 'Aguacate', cleanName: 'Aguacate' },
  { search: 'Mango', cleanName: 'Mango' },
  { search: 'Melón', cleanName: 'Melón' },
  { search: 'Sandía', cleanName: 'Sandía' },
  { search: 'Cereza', cleanName: 'Cerezas' },

  // Verduras y Hortalizas
  { search: 'Espinaca', cleanName: 'Espinacas' },
  { search: 'Brécol', cleanName: 'Brócoli' },
  { search: 'Coliflor', cleanName: 'Coliflor' },
  { search: 'Zanahoria', cleanName: 'Zanahoria' },
  { search: 'Tomate', cleanName: 'Tomate fresco' },
  { search: 'Calabacín', cleanName: 'Calabacín' },
  { search: 'Berenjena', cleanName: 'Berenjena' },
  { search: 'Pimiento rojo', cleanName: 'Pimiento rojo' },
  { search: 'Cebolla', cleanName: 'Cebolla' },
  { search: 'Champiñon', cleanName: 'Champiñones' },
  { search: 'Lechuga', cleanName: 'Lechuga' },
  { search: 'Pepino', cleanName: 'Pepino' },
  { search: 'Espárrago, verde', cleanName: 'Espárragos verdes' },
  { search: 'Ajo', cleanName: 'Ajo' },

  // Frutos Secos, Semillas y Aceites
  { search: 'Nuez', cleanName: 'Nueces' },
  { search: 'Almendra', cleanName: 'Almendras crudas' },
  { search: 'Avellana', cleanName: 'Avellanas' },
  { search: 'Cacahuete', cleanName: 'Cacahuetes' },
  { search: 'Semilla de lino', cleanName: 'Semillas de lino' },
  { search: 'Pipa de calabaza', cleanName: 'Semillas de calabaza' },
  { search: 'Aceite de oliva', cleanName: 'Aceite de oliva virgen extra' }
];

async function generateCuratedFoundationalCatalog() {
  console.log('📡 Consultando BEDCA oficial con Lista Blanca de ingredientes puros...');

  try {
    const response = await fetch(BEDCA_URL);
    if (!response.ok) throw new Error(`Error en la descarga: ${response.statusText}`);

    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const idxName = headers.indexOf('f_ori_name');
    const idxKJ   = headers.indexOf('ENERC');
    const idxProt = headers.indexOf('PROT');
    const idxCarb = headers.indexOf('CHO');
    const idxFat  = headers.indexOf('FAT');
    const idxFib  = headers.indexOf('FIBT');
    const idxNa   = headers.indexOf('NA');

    const result = [];
    const usedNames = new Set();

    for (const item of STAPLE_INGREDIENTS) {
      // Buscamos en BEDCA la fila que coincida con nuestro término de búsqueda
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
        const row = [];
        let match;
        while ((match = regex.exec(line)) !== null && row.length < headers.length) {
          let val = match[1] || '';
          val = val.replace(/^"|"$/g, '').trim();
          row.push(val);
        }

        const rawName = row[idxName] || '';

        // Comprobamos si coincide y no lo hemos añadido ya
        if (rawName.toLowerCase().startsWith(item.search.toLowerCase()) && !usedNames.has(item.cleanName.toLowerCase())) {
          const kj = parseFloat(row[idxKJ]);
          const prot = parseFloat(row[idxProt]);
          const carb = parseFloat(row[idxCarb]);
          const fat  = parseFloat(row[idxFat]);
          const fib  = parseFloat(row[idxFib]) || 0.0;
          const naMg = parseFloat(row[idxNa]) || 0.0;

          if (!isNaN(kj) && !isNaN(prot) && !isNaN(carb) && !isNaN(fat)) {
            usedNames.add(item.cleanName.toLowerCase());
            result.push({
              name: item.cleanName,
              calories: Number((kj / 4.184).toFixed(1)), // Conversión a kcal reales
              protein: Number(prot.toFixed(1)),
              carbohydrates: Number(carb.toFixed(1)),
              fat: Number(fat.toFixed(1)),
              fiber: Number(Math.max(0, fib).toFixed(1)),
              salt: Number(Math.max(0, (naMg * 2.5) / 1000).toFixed(2))
            });
            break; // Pasamos al siguiente ingrediente de la lista blanca
          }
        }
      }
    }

    console.log(`✅ ¡Catálogo impecable! Se han extraído exactamente ${result.length} materias primas puras.`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`📁 Archivo generado en: ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateCuratedFoundationalCatalog();