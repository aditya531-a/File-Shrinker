import { useMutation } from "@tanstack/react-query";
import { api, type CompressionStats } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCompressFile() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(api.compression.upload.path, {
        method: api.compression.upload.method,
        body: formData,
        // No Content-Type header needed for FormData, browser sets it with boundary
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to compress file");
      }

      const data = await res.json();
      return api.compression.upload.responses[200].parse(data);
    },
    onError: (error) => {
      toast({
        title: "Compression Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDecompressFile() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(api.compression.decompress.path, {
        method: api.compression.decompress.method,
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to decompress file");
      }

      // Return blob for download
      return await res.blob();
    },
    onSuccess: (blob, variables) => {
      // Create a download link programmatically
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Heuristic for filename: replace extension or append .restored
      const originalName = variables.name;
      const downloadName = originalName.replace(/\.(huff|bin)$/, "") || `restored-${originalName}`;
      
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "File decompressed and downloaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Decompression Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
