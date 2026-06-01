import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Internal Area"',
    },
  });
}

function hasValidCredentials(
  request: NextRequest,
  expectedUser: string,
  expectedPassword: string,
) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) {
    return false;
  }

  const payload = authorization.slice("Basic ".length).trim();
  if (payload.length === 0) {
    return false;
  }

  try {
    const decoded = atob(payload);
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) {
      return false;
    }

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);
    return username === expectedUser && password === expectedPassword;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const expectedUser = process.env.INTERNAL_ROUTE_USER;
  const expectedPassword = process.env.INTERNAL_ROUTE_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (!hasValidCredentials(request, expectedUser, expectedPassword)) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/acerca/:path*", "/admin/:path*"],
};
