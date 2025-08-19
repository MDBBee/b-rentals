import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/properties(.*)', '/api(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const isAdminUser1 = auth().userId === process.env.ADMIN_USER_ID1;
  const isAdminUser2 = auth().userId === process.env.ADMIN_USER_ID2;

  if (
    isAdminRoute(req) &&
    !isAdminUser1 &&
    isAdminRoute(req) &&
    !isAdminUser2
  ) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!isPublicRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// const isProtectedRoute = createRouteMatcher([
//   '/bookings(.*)',
//   '/checkout(.*)',
//   '/favorites(.*)',
//   '/profile(.*)',
//   '/rentals(.*)',
//   '/reviews(.*)',
// ]);

// export default clerkMiddleware((auth, req) => {
//   if (isProtectedRoute(req)) auth().protect();
// });

// export const config = {
//   matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
// };
