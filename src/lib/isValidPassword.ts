export async function isValidPassword(
  password: string,
  hashedPassword: string,
) {
  // Check if the hashed version of the provided password matches the stored hashed password
  return (await hashPassword(password)) === hashedPassword;
}

async function hashPassword(password: string) {
  // Convert the password string into an array of bytes using TextEncoder
  const arrayBuffer = await crypto.subtle.digest(
    "SHA-512", // Specify the hashing algorithm, in this case, SHA-512
    new TextEncoder().encode(password), // Encode the password string into a Uint8Array
  );

  // Convert the resulting ArrayBuffer to a Buffer and then to a Base64-encoded string
  return Buffer.from(arrayBuffer).toString("base64");
}

// NOTE:
/*
 Explanation of Concepts:
crypto.subtle.digest:

Part of the Web Crypto API, used for performing cryptographic operations.
The digest method generates a hash of the input data using the specified algorithm.
Here, "SHA-512" is used as the hashing algorithm, which produces a 512-bit hash value.
TextEncoder:

A built-in JavaScript API that converts a string into a Uint8Array (array of bytes).
Used here to convert the password string into a format that can be processed by the crypto.subtle.digest method.
ArrayBuffer:

A low-level binary data buffer.
The result of the crypto.subtle.digest method is an ArrayBuffer containing the hash.
Buffer:

A Node.js API for handling binary data.
Used here to convert the ArrayBuffer into a Buffer, which is then encoded into a Base64 string for easier storage and comparison.
 */
