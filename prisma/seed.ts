import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.pago.deleteMany();
  await prisma.lineaPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.carritoItem.deleteMany();
  await prisma.carrito.deleteMany();
  await prisma.inventario.deleteMany();
  await prisma.imagenProducto.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.direccion.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.usuario.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      email: 'admin@zapatoflex.com',
      password: adminPassword,
      rol: 'ADMIN',
    },
  });

  // Create test client
  const clientPassword = await bcrypt.hash('cliente123', 10);
  const cliente = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      email: 'juan@email.com',
      password: clientPassword,
      rol: 'CLIENTE',
      direcciones: {
        create: {
          calle: 'Av. Reforma 123',
          ciudad: 'Ciudad de México',
          estado: 'CDMX',
          codigoPostal: '06600',
          pais: 'México',
        },
      },
    },
  });

  // Create categories
  const deportivos = await prisma.categoria.create({
    data: { nombre: 'Deportivos', slug: 'deportivos', imagen: '/images/cat-deportivos.jpg' },
  });
  const casuales = await prisma.categoria.create({
    data: { nombre: 'Casuales', slug: 'casuales', imagen: '/images/cat-casuales.jpg' },
  });
  const formales = await prisma.categoria.create({
    data: { nombre: 'Formales', slug: 'formales', imagen: '/images/cat-formales.jpg' },
  });

  // Create products
  const productos = [
    // Deportivos
    {
      nombre: 'ZapatoFlex Runner Pro',
      slug: 'zapatoflex-runner-pro',
      descripcion: 'Zapatilla deportiva de alto rendimiento con tecnología de amortiguación FlexFoam. Ideal para corredores profesionales y amateurs que buscan comodidad y velocidad.',
      precio: 2499.99,
      stock: 50,
      categoriaId: deportivos.id,
      imagenes: ['/images/runner-pro-1.jpg', '/images/runner-pro-2.jpg'],
    },
    {
      nombre: 'ZapatoFlex Sport Max',
      slug: 'zapatoflex-sport-max',
      descripcion: 'Diseño aerodinámico con suela de caucho antideslizante. Perfecta para entrenamientos intensos en gimnasio o al aire libre.',
      precio: 1899.99,
      stock: 35,
      categoriaId: deportivos.id,
      imagenes: ['/images/sport-max-1.jpg', '/images/sport-max-2.jpg'],
    },
    {
      nombre: 'ZapatoFlex Trail Blaze',
      slug: 'zapatoflex-trail-blaze',
      descripcion: 'Zapatilla de trail running con protección reforzada y agarre extremo. Conquista cualquier terreno con confianza.',
      precio: 2899.99,
      stock: 25,
      categoriaId: deportivos.id,
      imagenes: ['/images/trail-blaze-1.jpg'],
    },
    {
      nombre: 'ZapatoFlex Gym Elite',
      slug: 'zapatoflex-gym-elite',
      descripcion: 'Zapatilla especializada para entrenamiento de fuerza con base estable y soporte lateral reforzado.',
      precio: 1699.99,
      stock: 40,
      categoriaId: deportivos.id,
      imagenes: ['/images/gym-elite-1.jpg'],
    },
    // Casuales
    {
      nombre: 'ZapatoFlex Urban Walk',
      slug: 'zapatoflex-urban-walk',
      descripcion: 'Estilo urbano contemporáneo con la comodidad que necesitas para tu día a día. Combina moda y funcionalidad.',
      precio: 1599.99,
      stock: 60,
      categoriaId: casuales.id,
      imagenes: ['/images/urban-walk-1.jpg', '/images/urban-walk-2.jpg'],
    },
    {
      nombre: 'ZapatoFlex Street Style',
      slug: 'zapatoflex-street-style',
      descripcion: 'Diseño vanguardista inspirado en la cultura street. Suela de plataforma con acabados premium.',
      precio: 1299.99,
      stock: 45,
      categoriaId: casuales.id,
      imagenes: ['/images/street-style-1.jpg'],
    },
    {
      nombre: 'ZapatoFlex Comfort Plus',
      slug: 'zapatoflex-comfort-plus',
      descripcion: 'La máxima comodidad para largas jornadas. Interior memory foam y exterior de cuero sintético premium.',
      precio: 1499.99,
      stock: 55,
      categoriaId: casuales.id,
      imagenes: ['/images/comfort-plus-1.jpg'],
    },
    {
      nombre: 'ZapatoFlex Weekend',
      slug: 'zapatoflex-weekend',
      descripcion: 'El compañero perfecto para el fin de semana. Ligero, cómodo y con estilo relajado.',
      precio: 999.99,
      stock: 70,
      categoriaId: casuales.id,
      imagenes: ['/images/weekend-1.jpg'],
    },
    // Formales
    {
      nombre: 'ZapatoFlex Executive',
      slug: 'zapatoflex-executive',
      descripcion: 'Zapato formal de cuero genuino con acabado brillante. La elección perfecta para el profesional exigente.',
      precio: 3499.99,
      stock: 20,
      categoriaId: formales.id,
      imagenes: ['/images/executive-1.jpg', '/images/executive-2.jpg'],
    },
    {
      nombre: 'ZapatoFlex Classic Oxford',
      slug: 'zapatoflex-classic-oxford',
      descripcion: 'Oxford clásico con diseño atemporal. Cuero italiano de primera calidad con suela de cuero cosida.',
      precio: 3999.99,
      stock: 15,
      categoriaId: formales.id,
      imagenes: ['/images/oxford-1.jpg'],
    },
    {
      nombre: 'ZapatoFlex Derby Elegance',
      slug: 'zapatoflex-derby-elegance',
      descripcion: 'Derby elegante con puntera fina y costuras decorativas. Ideal para eventos formales y reuniones de negocios.',
      precio: 2999.99,
      stock: 30,
      categoriaId: formales.id,
      imagenes: ['/images/derby-1.jpg'],
    },
    {
      nombre: 'ZapatoFlex Loafer Premium',
      slug: 'zapatoflex-loafer-premium',
      descripcion: 'Mocasín premium sin cordones con borla decorativa. Versatilidad y elegancia en cualquier ocasión.',
      precio: 2799.99,
      stock: 25,
      categoriaId: formales.id,
      imagenes: ['/images/loafer-1.jpg'],
    },
  ];

  for (const prod of productos) {
    const { imagenes, ...data } = prod;
    const producto = await prisma.producto.create({ data });
    
    // Create images
    for (const url of imagenes) {
      await prisma.imagenProducto.create({
        data: { url, alt: producto.nombre, productoId: producto.id },
      });
    }

    // Create inventory record
    await prisma.inventario.create({
      data: {
        cantidad: producto.stock,
        minimo: 5,
        productoId: producto.id,
      },
    });
  }

  console.log('✅ Seed completado exitosamente');
  console.log(`   Admin: admin@zapatoflex.com / admin123`);
  console.log(`   Cliente: juan@email.com / cliente123`);
  console.log(`   ${productos.length} productos creados`);
  console.log(`   3 categorías creadas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
