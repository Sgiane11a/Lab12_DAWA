import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  try {
    console.log('🌱 Iniciando seed de datos de prueba...')

    // Crear autores
    const author1 = await prisma.author.create({
      data: {
        name: 'Gabriel García Márquez',
        email: 'gabriel@example.com',
        bio: 'Escritor colombiano, Premio Nobel de Literatura',
        nationality: 'Colombiano',
        birthYear: 1927
      }
    })

    const author2 = await prisma.author.create({
      data: {
        name: 'Isabel Allende',
        email: 'isabel@example.com',
        bio: 'Escritora chilena de renombre internacional',
        nationality: 'Chilena',
        birthYear: 1942
      }
    })

    const author3 = await prisma.author.create({
      data: {
        name: 'Mario Vargas Llosa',
        email: 'mario@example.com',
        bio: 'Escritor peruano, Premio Nobel de Literatura',
        nationality: 'Peruano',
        birthYear: 1936
      }
    })

    // Crear libros
    const books = [
      {
        title: 'Cien años de soledad',
        description: 'Una obra maestra del realismo mágico',
        isbn: '978-0307474728',
        publishedYear: 1967,
        genre: 'Novela',
        pages: 448,
        authorId: author1.id
      },
      {
        title: 'El amor en los tiempos del cólera',
        description: 'Una historia de amor que trasciende el tiempo',
        isbn: '978-0307387351',
        publishedYear: 1985,
        genre: 'Novela',
        pages: 348,
        authorId: author1.id
      },
      {
        title: 'La casa de los espíritus',
        description: 'Una saga familiar llena de magia y realidad',
        isbn: '978-0553383805',
        publishedYear: 1982,
        genre: 'Novela',
        pages: 433,
        authorId: author2.id
      },
      {
        title: 'Eva Luna',
        description: 'La historia de una mujer extraordinaria',
        isbn: '978-0553383812',
        publishedYear: 1987,
        genre: 'Novela',
        pages: 271,
        authorId: author2.id
      },
      {
        title: 'La ciudad y los perros',
        description: 'Una novela sobre la violencia y la corrupción',
        isbn: '978-0060732813',
        publishedYear: 1963,
        genre: 'Novela',
        pages: 409,
        authorId: author3.id
      },
      {
        title: 'Conversación en La Catedral',
        description: 'Una crítica social de la dictadura peruana',
        isbn: '978-0060732820',
        publishedYear: 1969,
        genre: 'Novela',
        pages: 601,
        authorId: author3.id
      },
      {
        title: 'Manual del perfecto amor',
        description: 'Guía completa para el romance moderno',
        isbn: '978-1234567890',
        publishedYear: 2020,
        genre: 'Romance',
        pages: 250,
        authorId: author2.id
      },
      {
        title: 'Crónica de una muerte anunciada',
        description: 'Un relato sobre el honor y la tragedia',
        isbn: '978-0307387368',
        publishedYear: 1981,
        genre: 'Novela',
        pages: 120,
        authorId: author1.id
      }
    ]

    for (const book of books) {
      await prisma.book.create({ data: book })
    }

    console.log('✅ Datos de prueba creados exitosamente')
    console.log(`📚 Creados ${books.length} libros de 3 autores`)
  } catch (error) {
    console.error('❌ Error al crear datos de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seed()