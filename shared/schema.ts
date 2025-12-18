import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  originalSize: integer("original_size").notNull(),
  compressedSize: integer("compressed_size"),
  compressionRatio: text("compression_ratio"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  // Store the path or content reference if needed, for now we might just process in-memory/temp
});

export const insertFileSchema = createInsertSchema(files).omit({ id: true, uploadedAt: true });

export type FileRecord = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

// API Response types
export const compressionStatsSchema = z.object({
  originalSize: z.number(),
  compressedSize: z.number(),
  compressionRatio: z.string(),
  downloadUrl: z.string(),
  originalName: z.string(),
  compressedName: z.string(),
});

export type CompressionStats = z.infer<typeof compressionStatsSchema>;
