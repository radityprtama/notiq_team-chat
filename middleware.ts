import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  NextResponse,
  type NextMiddleware,
  type NextRequest,
} from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:PREVIEW",
        "CATEGORY:MONITOR",
        "CATEGORY:WEBHOOK",
      ],
    }),
  ],
});

async function existingMiddleware(req: NextRequest) {
  const { nextUrl } = req as NextRequest;
  const kinde = (req as any).kindeAuth;

  const orgCode =
    kinde?.user?.org_code ||
    kinde?.token?.org_code ||
    kinde?.token?.claims?.org_code ||
    kinde?.token?.claims?.organization;

  if (nextUrl.pathname.startsWith("/workspace")) {
    if (!orgCode) {
      // kalau user belum punya org, redirect ke homepage
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (!nextUrl.pathname.includes(orgCode)) {
      nextUrl.pathname = `/workspace/${orgCode}`;
      return NextResponse.redirect(nextUrl);
    }
  }

  return NextResponse.next();
}

export default createMiddleware(
  aj,
  withAuth(existingMiddleware, {
    publicPaths: ["/", "/api/auth/**"],
  }) as NextMiddleware,
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|/rpc).*)"],
};
