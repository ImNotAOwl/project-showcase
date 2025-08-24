import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function unauthorized() {
  return new Response('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Projets", charset="UTF-8"' },
  });
}

export function middleware(req: NextRequest) {
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  const visitUser = process.env.VISITOR_USER;
  const visitPass = process.env.VISITOR_PASS;

  if (!adminUser || !adminPass || !visitUser || !visitPass) {
    // si pas configuré: laisser passer (évite de se lock en dev)
    return NextResponse.next();
  }

  const auth = req.headers.get('authorization');
  if (!auth) return unauthorized();

  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic' || !encoded) return unauthorized();

  const [u, p] = atob(encoded).split(':');
  let role: 'admin' | 'visitor' | null = null;
  if (u === adminUser && p === adminPass) role = 'admin';
  else if (u === visitUser && p === visitPass) role = 'visitor';
  else return unauthorized();

  // Bloquer les mutations API pour visitor
  const url = req.nextUrl;
  const isApiProjects = url.pathname.startsWith('/api/projects');
  const method = req.method.toUpperCase();

  if (role === 'visitor' && isApiProjects && method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Propager le rôle au client/serveur via cookie
  const res = NextResponse.next();
  res.cookies.set('role', role, { httpOnly: false, sameSite: 'lax', path: '/' });
  return res;
}

export const config = {
  matcher: [
    // protège tout sauf assets statiques & fichiers publics
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|uploads/).*)',
  ],
};
