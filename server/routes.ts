import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import fs from "fs";
import path from "path";
import { api } from "@shared/routes";
import { HuffmanCoder } from "./huffman";
import { storage } from "./storage";
import { insertFileSchema } from "@shared/schema";
import { z } from "zod";

const uploadDir = path.join(process.cwd(), "uploads");
const compressedDir = path.join(process.cwd(), "compressed");

// Ensure directories exist
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(compressedDir)) fs.mkdirSync(compressedDir, { recursive: true });

const upload = multer({ dest: uploadDir });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.compression.upload.path, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const originalFilePath = req.file.path;
      const originalText = fs.readFileSync(originalFilePath, "utf8");
      const coder = new HuffmanCoder();
      
      const { encodedData, freqMap } = coder.compress(originalText);
      const packedBuffer = coder.packBits(encodedData);
      
      // Prepare metadata
      const metadata = JSON.stringify({
        originalName: req.file.originalname,
        freqMap
      });
      const metadataBuffer = Buffer.from(metadata);
      const metadataLengthBuffer = Buffer.alloc(4);
      metadataLengthBuffer.writeUInt32LE(metadataBuffer.length, 0);
      
      // Final file format: [Length 4][Metadata][Data]
      const finalBuffer = Buffer.concat([metadataLengthBuffer, metadataBuffer, packedBuffer]);
      
      const compressedFileName = `${req.file.filename}.huff`;
      const compressedFilePath = path.join(compressedDir, compressedFileName);
      fs.writeFileSync(compressedFilePath, finalBuffer);
      
      // Cleanup original upload
      // fs.unlinkSync(originalFilePath); // Optional: keep for now or delete

      const stats = {
        originalSize: req.file.size,
        compressedSize: finalBuffer.length,
        compressionRatio: ((1 - finalBuffer.length / req.file.size) * 100).toFixed(2) + "%",
        downloadUrl: `/api/download/${compressedFileName}`,
        originalName: req.file.originalname,
        compressedName: `${req.file.originalname}.huff`
      };

      // Store in DB (optional but good for history)
      try {
        await storage.createFileRecord({
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          originalSize: req.file.size,
          compressedSize: finalBuffer.length,
          compressionRatio: stats.compressionRatio,
        });
      } catch (dbErr) {
        console.warn("DB record creation failed, continuing anyway:", dbErr);
      }

      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Compression failed" });
    }
  });

  app.post(api.compression.decompress.path, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = req.file.path;
      const fileBuffer = fs.readFileSync(filePath);
      
      // Read Metadata Length
      if (fileBuffer.length < 4) throw new Error("Invalid file format");
      const metadataLength = fileBuffer.readUInt32LE(0);
      
      // Read Metadata
      const metadataEnd = 4 + metadataLength;
      if (fileBuffer.length < metadataEnd) throw new Error("File corrupted");
      
      const metadataBuffer = fileBuffer.subarray(4, metadataEnd);
      const metadata = JSON.parse(metadataBuffer.toString());
      
      // Read Compressed Data
      const compressedDataBuffer = fileBuffer.subarray(metadataEnd);
      
      const coder = new HuffmanCoder();
      const binaryString = coder.unpackBits(compressedDataBuffer);
      const decompressedText = coder.decompress(binaryString, metadata.freqMap);
      
      const downloadFileName = `decompressed-${metadata.originalName}`;
      const downloadPath = path.join(uploadDir, downloadFileName);
      fs.writeFileSync(downloadPath, decompressedText);
      
      res.download(downloadPath, metadata.originalName, (err) => {
        if (err) console.error("Download error:", err);
        // fs.unlinkSync(downloadPath);
        // fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Decompression failed. Is this a valid .huff file?" });
    }
  });

  // Serve compressed files for download
  app.get("/api/download/:filename", (req, res) => {
    const filePath = path.join(compressedDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  return httpServer;
}
