"use client"

import React, { useEffect, useMemo, useState, useRef } from 'react'

type Author = { id: string; name: string }
type Book = {
  id: string;
  title: string;
  description?: string | null;
  isbn?: string | null;
  publishedYear?: number | null;
  genre?: string | null;
  pages?: number | null;
  author: Author;
  createdAt?: string;
}

type SearchResponse = {
  data: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
}

export default function BooksPage(){
  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState<string | ''>('')
  const [authorFilter, setAuthorFilter] = useState<string | ''>('')
  const [sortBy, setSortBy] = useState<'title'|'publishedYear'|'createdAt'>('createdAt')

  // Pagination (server-driven)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // New book form
  const [newBook, setNewBook] = useState({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '', authorId: '' })

  // debounce
  const searchTimer = useRef<number | null>(null)

  useEffect(() => { fetchAuthors(); fetchSearch() }, [])

  useEffect(() => {
    // Debounce search input
    if (searchTimer.current) window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(()=>{
      setPage(1)
      fetchSearch()
    }, 350)
    return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(()=>{ fetchSearch() }, [genreFilter, authorFilter, sortBy, page, limit])

  async function fetchAuthors(){
    try{
      const res = await fetch('/api/authors')
      const data = await res.json()
      setAuthors(data.map((a:any)=>({ id: a.id, name: a.name })))
    }catch(e){ console.error(e) }
  }

  async function fetchSearch(){
    setLoading(true)
    try{
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (genreFilter) params.set('genre', genreFilter)
      // the search endpoint expects authorName (partial, case-insensitive)
      if (authorFilter) {
        const found = authors.find(a=>a.id === authorFilter)
        if (found) params.set('authorName', found.name)
      }
      params.set('page', String(page))
      params.set('limit', String(Math.min(Math.max(1, limit), 50)))
  params.set('sortBy', sortBy)
  // Default order: desc (not exposed in UI)
  params.set('order', 'desc')

      const res = await fetch(`/api/books/search?${params.toString()}`)
      const json: SearchResponse = await res.json()
      setBooks(json.data)
      setTotal(json.pagination.total)
      setTotalPages(json.pagination.totalPages)
      setPage(json.pagination.page)
    }catch(e){
      console.error(e)
    }finally{ setLoading(false) }
  }

  const genres = useMemo(()=>{
    const s = new Set<string>()
    books.forEach(b => { if (b.genre) s.add(b.genre) })
    return Array.from(s).sort()
  }, [books])

  async function handleCreate(e: React.FormEvent){
    e.preventDefault()
    try{
      const payload = {
        ...newBook,
        publishedYear: newBook.publishedYear ? parseInt(newBook.publishedYear) : undefined,
        pages: newBook.pages ? parseInt(newBook.pages) : undefined,
      }
      const res = await fetch('/api/books', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      setNewBook({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '', authorId: '' })
      // refresh current search
      fetchSearch()
    }catch(err:any){ alert(err.message || 'Error creando libro') }
  }

  async function handleDelete(id: string){
    if (!confirm('Eliminar libro?')) return
    try{
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      // after delete, refetch current page (server may return fewer items)
      // if current page is now out of range, move to previous page
      const maybeRes = await fetch(`/api/books/search?page=${page}&limit=${limit}`)
      const json: SearchResponse = await maybeRes.json()
      if (json.pagination.totalPages < page && page > 1) setPage(p=>p-1)
      fetchSearch()
    }catch(err:any){ alert(err.message || 'Error eliminando libro') }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3">Libros</h1>
        <div className="text-muted">Resultados: <strong>{total}</strong></div>
      </div>

      <div className="row">
        <div className="col-lg-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Crear libro</h5>
              <form onSubmit={handleCreate}>
                <div className="mb-2"><label className="form-label">Título</label><input className="form-control" value={newBook.title} onChange={e=>setNewBook({...newBook, title:e.target.value})} required/></div>
                <div className="mb-2"><label className="form-label">Autor</label>
                  <select className="form-select" value={newBook.authorId} onChange={e=>setNewBook({...newBook, authorId: e.target.value})} required>
                    <option value="">Selecciona un autor</option>
                    {authors.map(a=> <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="mb-2"><label className="form-label">Género</label><input className="form-control" value={newBook.genre} onChange={e=>setNewBook({...newBook, genre:e.target.value})} /></div>
                <div className="mb-2 row g-2"><div className="col-6"><label className="form-label">Año</label><input className="form-control" value={newBook.publishedYear} onChange={e=>setNewBook({...newBook, publishedYear:e.target.value})} type="number"/></div><div className="col-6"><label className="form-label">Páginas</label><input className="form-control" value={newBook.pages} onChange={e=>setNewBook({...newBook, pages:e.target.value})} type="number"/></div></div>
                <div className="d-grid"><button className="btn btn-primary">Crear libro</button></div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card mb-3 shadow-sm">
            <div className="card-body">
              <div className="row g-2 align-items-center mb-3">
                <div className="col-md-5"><input className="form-control" placeholder="Buscar título/descr/ISBN" value={search} onChange={e=>{ setSearch(e.target.value) }} /></div>
                <div className="col-md-3"><select className="form-select" value={genreFilter} onChange={e=>{ setGenreFilter(e.target.value); setPage(1) }}><option value="">Género (todos)</option>{genres.map(g=> <option key={g} value={g}>{g}</option>)}</select></div>
                <div className="col-md-3"><select className="form-select" value={authorFilter} onChange={e=>{ setAuthorFilter(e.target.value); setPage(1) }}><option value="">Autor (todos)</option>{authors.map(a=> <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                <div className="col-md-1 d-flex">
                  <select className="form-select" value={sortBy} onChange={e=>{ setSortBy(e.target.value as any); setPage(1) }} style={{maxWidth:160}}>
                    <option value="createdAt">Fecha</option>
                    <option value="title">Título</option>
                    <option value="publishedYear">Año</option>
                  </select>
                </div>
              </div>

              {loading && <div className="alert alert-info">Cargando libros...</div>}

              <div className="list-group">
                {books.map(b => (
                  <div key={b.id} className="list-group-item">
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">{b.title}</h5>
                      <small className="text-muted">{b.publishedYear ?? '—'}</small>
                    </div>
                    <p className="mb-1 text-truncate">{b.description}</p>
                    <small className="text-muted">Autor: {b.author?.name} · Género: {b.genre ?? '—'}</small>
                    <div className="mt-2 text-end">
                      <a className="btn btn-sm btn-outline-primary me-2" href={`/authors/${b.author?.id}`}>Ver autor</a>
                      <a className="btn btn-sm btn-outline-secondary me-2" href={`/books/${b.id}`}>Editar</a>
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(b.id)}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>Mostrando página <strong>{page}</strong> de <strong>{totalPages}</strong> — <strong>{total}</strong> resultados</div>
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${page<=1? 'disabled':''}`}><button className="page-link" onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button></li>
                    {Array.from({length: totalPages}).map((_,i)=> <li key={i} className={`page-item ${page===i+1? 'active':''}`}><button className="page-link" onClick={()=>setPage(i+1)}>{i+1}</button></li>)}
                    <li className={`page-item ${page>=totalPages? 'disabled':''}`}><button className="page-link" onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Siguiente</button></li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
