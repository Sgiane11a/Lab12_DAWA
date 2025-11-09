import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    
    try {
        console.log('Obteniendo estadísticas para autor ID:', resolvedParams.id);

        // Verificar que el autor existe y obtener sus datos básicos
        const author = await prisma.author.findUnique({
            where: { id: resolvedParams.id },
            select: {
                id: true,
                name: true
            }
        });

        if (!author) {
            return NextResponse.json(
                { error: 'Autor no encontrado' },
                { status: 404 }
            );
        }

        // Obtener todos los libros del autor con la información necesaria
        const books = await prisma.book.findMany({
            where: { authorId: resolvedParams.id },
            select: {
                id: true,
                title: true,
                publishedYear: true,
                pages: true,
                genre: true
            },
            orderBy: {
                publishedYear: 'asc'
            }
        });

        // Calcular estadísticas
        const totalBooks = books.length;

        if (totalBooks === 0) {
            return NextResponse.json({
                authorId: author.id,
                authorName: author.name,
                totalBooks: 0,
                firstBook: null,
                latestBook: null,
                averagePages: 0,
                genres: [],
                longestBook: null,
                shortestBook: null
            });
        }

        // Filtrar libros que tienen año de publicación
        const booksWithYear = books.filter(book => book.publishedYear !== null);
        
        // Primer libro (por año de publicación)
        const firstBook = booksWithYear.length > 0 ? booksWithYear[0] : null;
        
        // Último libro (por año de publicación)
        const latestBook = booksWithYear.length > 0 ? booksWithYear[booksWithYear.length - 1] : null;

        // Filtrar libros que tienen páginas
        const booksWithPages = books.filter(book => book.pages !== null && book.pages > 0);
        
        // Calcular promedio de páginas
        const averagePages = booksWithPages.length > 0 
            ? Math.round(booksWithPages.reduce((sum, book) => sum + book.pages!, 0) / booksWithPages.length)
            : 0;

        // Obtener géneros únicos (filtrar nulls y vacíos)
        const genresSet = new Set(
            books
                .map(book => book.genre)
                .filter(genre => genre !== null && genre.trim() !== '')
        );
        const genres = Array.from(genresSet).sort();

        // Libro con más páginas
        const longestBook = booksWithPages.length > 0 
            ? booksWithPages.reduce((max, book) => 
                book.pages! > max.pages! ? book : max
              )
            : null;

        // Libro con menos páginas
        const shortestBook = booksWithPages.length > 0 
            ? booksWithPages.reduce((min, book) => 
                book.pages! < min.pages! ? book : min
              )
            : null;

        // Construir respuesta
        const stats = {
            authorId: author.id,
            authorName: author.name,
            totalBooks,
            firstBook: firstBook ? {
                title: firstBook.title,
                year: firstBook.publishedYear
            } : null,
            latestBook: latestBook ? {
                title: latestBook.title,
                year: latestBook.publishedYear
            } : null,
            averagePages,
            genres,
            longestBook: longestBook ? {
                title: longestBook.title,
                pages: longestBook.pages
            } : null,
            shortestBook: shortestBook ? {
                title: shortestBook.title,
                pages: shortestBook.pages
            } : null
        };

        console.log(`Estadísticas calculadas para ${author.name}:`, {
            totalBooks,
            averagePages,
            genres: genres.length
        });

        return NextResponse.json(stats);

    } catch (error: any) {
        console.error('Error al obtener estadísticas del autor:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack,
            authorId: resolvedParams.id
        });
        
        return NextResponse.json(
            { 
                error: 'Error al obtener estadísticas del autor',
                details: error.message,
                code: error.code || 'UNKNOWN_ERROR'
            },
            { status: 500 }
        );
    }
}