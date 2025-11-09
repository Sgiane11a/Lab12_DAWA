# Despliegue en Vercel

Instrucciones rápidas para desplegar este proyecto Next.js en Vercel.

Requisitos previos:
- Tener una cuenta en Vercel.
- Tener `vercel` CLI (opcional) o usar la integración con GitHub/GitLab/Bitbucket.
- Configurar la variable de entorno `DATABASE_URL` en el panel de Vercel (se usa por Prisma).

Pasos por Git (integración automática):

1. Subir tu rama principal (ej. `main`) al repositorio remoto (GitHub).
2. En Vercel, añadir el proyecto desde Git y seleccionar el repositorio.
3. En Settings > Environment Variables, configurar:
   - `DATABASE_URL` = `postgresql://...` (o el DSN que uses)
   - (Opcional) otras variables que uses en `.env` durante desarrollo.
4. Vercel detectará automáticamente que es un proyecto Next.js y usará `npm run build`.

Línea de comando (opcional):

1. Instalar vercel CLI si no lo tienes:

```powershell
npm i -g vercel
```

2. Ejecutar (desde la carpeta del proyecto):

```powershell
vercel login
vercel
```

Notas importantes sobre la configuración local y CI:
- Si ves una advertencia sobre la raíz del workspace (Next.js detectando una raíz distinta debido a múltiples lockfiles), ya hemos fijado `turbopack.root` en `next.config.ts` para apuntar a la raíz de este proyecto. Si no quieres este ajuste, elimina el archivo `package-lock.json` de carpetas superiores que no pertenezcan al repo.
- Asegúrate de que `prisma migrate deploy` (si usas migraciones) se ejecute en el pipeline o que la base de datos ya esté preparada. Puedes añadir un script o un hook que ejecute migraciones tras el despliegue.

Comprobación post-despliegue:
- Abrir la URL que Vercel provee y probar las páginas: `/`, `/books`, `/authors/<id>`.
- Verificar que las llamadas a la API funcionan y que Prisma puede conectarse (revisar logs en Vercel si hay errores con DB).
