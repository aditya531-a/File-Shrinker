import { db } from "./db";
import { files, type InsertFile, type FileRecord } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createFileRecord(file: InsertFile): Promise<FileRecord>;
  getFileRecord(id: number): Promise<FileRecord | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createFileRecord(insertFile: InsertFile): Promise<FileRecord> {
    const [file] = await db.insert(files).values(insertFile).returning();
    return file;
  }

  async getFileRecord(id: number): Promise<FileRecord | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }
}

export const storage = new DatabaseStorage();
