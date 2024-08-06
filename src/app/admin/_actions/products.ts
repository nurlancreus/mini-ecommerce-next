"use server"; // Use server-side code

import db from "@/db/db"; // Import database module
import fs from "fs/promises"; // Import filesystem module with promises
import { revalidatePath } from "next/cache"; // Import revalidatePath for caching
import { notFound, redirect } from "next/navigation"; // Import navigation helpers
import { z } from "zod"; // Import zod for schema validation

// Define schema for validating file instances
const fileSchema = z.instanceof(File, { message: "Required" });
// Refine schema to ensure file is either empty or of image type
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/"),
);

// Define schema for adding a product with validation rules
const addSchema = z.object({
  name: z.string().min(1), // Name must be a non-empty string
  description: z.string().min(1), // Description must be a non-empty string
  priceInCents: z.coerce.number().int().min(1), // Price must be an integer greater than 0
  file: fileSchema.refine((file) => file.size > 0, "Required"), // File must be provided and non-empty
  image: imageSchema.refine((file) => file.size > 0, "Required"), // Image must be provided and non-empty
});

// Function to add a product
export async function addProduct(prevState: unknown, formData: FormData) {
  // Parse formData using the addSchema
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  // If parsing fails, return field errors
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data; // Extract validated data

  await fs.mkdir("products", { recursive: true }); // Ensure products directory exists
  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`; // Generate unique file path
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer())); // Save the file

  await fs.mkdir("public/products", { recursive: true }); // Ensure public products directory exists
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`; // Generate unique image path
  await fs.writeFile(
    `public${imagePath}`,
    Buffer.from(await data.image.arrayBuffer()),
  ); // Save the image

  // Create a new product in the database
  await db.product.create({
    data: {
      isAvailableForPurchase: false, // Set default availability
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  revalidatePath("/"); // Revalidate cache for homepage
  revalidatePath("/products"); // Revalidate cache for products page

  redirect("/admin/products"); // Redirect to admin products page
}

// Define schema for editing a product, allowing optional file and image
const editSchema = addSchema.extend({
  file: fileSchema.optional(), // File is optional for editing
  image: imageSchema.optional(), // Image is optional for editing
});

// Function to update a product
export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData,
) {
  // Parse formData using the editSchema
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  // If parsing fails, return field errors
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data; // Extract validated data
  const product = await db.product.findUnique({ where: { id } }); // Find product by ID

  if (product == null) return notFound(); // If product not found, return notFound

  let filePath = product.filePath; // Initialize filePath with existing path
  if (data.file != null && data.file.size > 0) {
    await fs.unlink(product.filePath); // Delete existing file
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`; // Generate new file path
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer())); // Save the new file
  }

  let imagePath = product.imagePath; // Initialize imagePath with existing path
  if (data.image != null && data.image.size > 0) {
    await fs.unlink(`public${product.imagePath}`); // Delete existing image
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`; // Generate new image path
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer()),
    ); // Save the new image
  }

  // Update the product in the database
  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  revalidatePath("/"); // Revalidate cache for homepage
  revalidatePath("/products"); // Revalidate cache for products page

  redirect("/admin/products"); // Redirect to admin products page
}

// Function to toggle product availability
export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean,
) {
  // Update the product availability in the database
  await db.product.update({ where: { id }, data: { isAvailableForPurchase } });

  revalidatePath("/"); // Revalidate cache for homepage
  revalidatePath("/products"); // Revalidate cache for products page
}

// Function to delete a product
export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } }); // Delete product by ID

  if (product == null) return notFound(); // If product not found, return notFound

  await fs.unlink(product.filePath); // Delete the file
  await fs.unlink(`public${product.imagePath}`); // Delete the image

  revalidatePath("/"); // Revalidate cache for homepage
  revalidatePath("/products"); // Revalidate cache for products page
}
