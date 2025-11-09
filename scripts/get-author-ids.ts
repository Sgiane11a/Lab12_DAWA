import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getAuthorIds() {
  try {
    console.log('📋 Obteniendo IDs de autores para pruebas...\n')

    const authors = await prisma.author.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { books: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('🎭 AUTORES DISPONIBLES:')
    console.log('========================')
    
    authors.forEach((author, index) => {
      console.log(`${index + 1}. ${author.name}`)
      console.log(`   ID: ${author.id}`)
      console.log(`   Libros: ${author._count.books}`)
      console.log(`   URL de Stats: http://localhost:3000/api/authors/${author.id}/stats`)
      console.log('')
    })

    console.log('🧪 COMANDOS DE PRUEBA CON PowerShell:')
    console.log('====================================')
    
    authors.forEach((author, index) => {
      console.log(`${index + 1}. Estadísticas de ${author.name}:`)
      console.log(`   Invoke-RestMethod -Uri "http://localhost:3000/api/authors/${author.id}/stats" -Method Get`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error al obtener autores:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getAuthorIds()