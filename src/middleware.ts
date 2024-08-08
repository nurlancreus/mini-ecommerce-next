import { NextRequest, NextResponse } from "next/server";
import { isValidPassword } from "./lib/isValidPassword";

// Middleware function to handle authentication for requests
export async function middleware(req: NextRequest) {
  // Check if the user is authenticated
  if ((await isAuthenticated(req)) === false) {
    // Return a 401 Unauthorized response if authentication fails
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" }, // Prompt for Basic authentication
    });
  }
}

// Function to check if the request is authenticated
async function isAuthenticated(req: NextRequest) {
  // Get the Authorization header from the request
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  // If no Authorization header is present, return false (not authenticated)
  if (authHeader == null) return false;

  // Decode the Base64-encoded username:password from the Authorization header
  const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");

  // Check if the username and password are correct
  return (
    username === process.env.ADMIN_USERNAME && // Compare with the admin username from environment variables
    (await isValidPassword(
      password,
      process.env.HASHED_ADMIN_PASSWORD as string, // Compare with the hashed admin password from environment variables
    ))
  );
}

// Configuration object for the middleware to match specific routes
export const config = {
  matcher: "/admin/:path*", // Apply the middleware to all routes under /admin/
};

// NOTE:
/*
Explanation of Concepts:
NextRequest and NextResponse:

Part of Next.js API for handling requests and responses in middleware.
NextRequest provides methods to access request data such as headers and query parameters.
NextResponse is used to construct responses that can be sent back to the client.
authorization header:

The header used in HTTP requests to carry credentials.
Commonly used for Basic authentication where credentials are encoded in Base64 format.
Buffer.from:

A Node.js method to create a Buffer instance from a given input.
Here, it decodes the Base64-encoded credentials from the authorization header.
process.env:

Access environment variables in Node.js.
Used here to securely retrieve the admin username and hashed password.
*/
