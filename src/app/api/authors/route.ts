import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los autores
export async function GET() {
  try {
    console.log('Intentando conectar a la base de datos...');
    
    const authors = await prisma.author.findMany({
      include: {
        books: true,
        _count: {
          select: { books: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('Autores obtenidos exitosamente:', authors.length);
    return NextResponse.json(authors)
  } catch (error: any) {
    console.error('Error detallado al obtener autores:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Error al obtener autores',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}
// POST - Crear un nuevo autor
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, bio, nationality, birthYear } = body

    // Validación básica
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const author = await prisma.author.create({
      data: {
            name,
            email,
            bio,
            nationality,
            birthYear: birthYear ? parseInt(birthYear) : null,
        },
        include: {
            books: true,
        }
      })

    return NextResponse.json(author, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El email ya esta registrado' },
        { status: 409 }
      )
    }

    console.log(error)
    return NextResponse.json(
      { error: 'Error al crear autor' },
      { status: 500 }
    )
  }
}
