import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        
        // Extraer query parameters
        const search = searchParams.get('search') || ''
        const genre = searchParams.get('genre') || ''
        const authorName = searchParams.get('authorName') || ''
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const order = searchParams.get('order') || 'desc'

        // Validar sortBy
        const validSortFields = ['title', 'publishedYear', 'createdAt']
        const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
        
        // Validar order
        const actualOrder = ['asc', 'desc'].includes(order) ? order : 'desc'

        // Construir condiciones de búsqueda
        const whereConditions: any = {
            AND: []
        }

        // Búsqueda por título (case-insensitive, búsqueda parcial)
        if (search.trim()) {
            whereConditions.AND.push({
                title: {
                    contains: search.trim(),
                    mode: 'insensitive'
                }
            })
        }

        // Filtro por género exacto
        if (genre.trim()) {
            whereConditions.AND.push({
                genre: {
                    equals: genre.trim(),
                    mode: 'insensitive'
                }
            })
        }

        // Búsqueda por nombre de autor (case-insensitive, búsqueda parcial)
        if (authorName.trim()) {
            whereConditions.AND.push({
                author: {
                    name: {
                        contains: authorName.trim(),
                        mode: 'insensitive'
                    }
                }
            })
        }

        // Si no hay condiciones AND, usar un objeto vacío
        const finalWhereConditions = whereConditions.AND.length > 0 ? whereConditions : {}

        // Calcular offset para paginación
        const skip = (page - 1) * limit

        // Configurar ordenamiento
        const orderBy: any = {}
        orderBy[actualSortBy] = actualOrder

        // Ejecutar consultas en paralelo
        const [books, totalCount] = await Promise.all([
            // Consulta principal con paginación
            prisma.book.findMany({
                where: finalWhereConditions,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy,
                skip,
                take: limit
            }),
            
            // Contar total de registros para paginación
            prisma.book.count({
                where: finalWhereConditions
            })
        ])

        // Calcular información de paginación
        const totalPages = Math.ceil(totalCount / limit)
        const hasNext = page < totalPages
        const hasPrev = page > 1

        // Estructura de respuesta
        const response = {
            data: books,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages,
                hasNext,
                hasPrev
            }
        }

        console.log(`Búsqueda de libros: ${books.length} resultados de ${totalCount} total (página ${page}/${totalPages})`)

        return NextResponse.json(response)

    } catch (error: any) {
        console.error('Error en búsqueda de libros:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        })
        
        return NextResponse.json(
            { 
                error: 'Error al buscar libros',
                details: error.message,
                code: error.code || 'UNKNOWN_ERROR'
            },
            { status: 500 }
        )
    }
}