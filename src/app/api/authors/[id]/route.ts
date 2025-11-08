import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un autor específico por ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    
    try {
        console.log('Buscando autor con ID:', resolvedParams.id);
        
        const author = await prisma.author.findUnique({
            where: { id: resolvedParams.id },
            include: {
                books: {
                    orderBy: {
                        publishedYear: 'desc'
                    },
                },
                _count: {
                    select: { books: true }
                }
            },
        })

        console.log('Resultado de búsqueda:', author ? 'Encontrado' : 'No encontrado');

        if (!author) {
            return NextResponse.json(
                { error: 'Autor no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json(author)
    } catch (error: any) {
        console.error('Error detallado al obtener autor:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack,
            authorId: resolvedParams.id
        });
        
        return NextResponse.json(
            { 
                error: 'Error al obtener autor',
                details: error.message,
                code: error.code || 'UNKNOWN_ERROR'
            },
            { status: 500 }
        )
    }
}

// PUT - Actualizar un autor
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    
    try {
        const body = await request.json()
        const { name, email, bio, nationality, birthYear } = body

        // Validación
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                return NextResponse.json(
                    { error: 'Email inválido' },
                    { status: 400 }
                )
            }
        }

        const author = await prisma.author.update({
            where: { id: resolvedParams.id },
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

        return NextResponse.json(author)
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Autor no encontrado' },
                { status: 404 }
            )
        }

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'El email ya está registrado' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: 'Error al actualizar autor' },
            { status: 500 }
        )
    }
}

// DELETE - Eliminar un autor
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    
    try {
        await prisma.author.delete({
            where: { id: resolvedParams.id },
        })

        return NextResponse.json({
            message: 'Autor eliminado correctamente'
        })
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Autor no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: 'Error al eliminar autor' },
            { status: 500 }
        )
    }
}