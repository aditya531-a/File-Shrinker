import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileType, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  accept?: Record<string, string[]>;
  isProcessing?: boolean;
}

export function DropZone({ onFileSelect, selectedFile, onClear, accept, isProcessing }: DropZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            {...getRootProps()}
            className={`
              relative group cursor-pointer
              border-2 border-dashed rounded-2xl p-10
              transition-all duration-300 ease-in-out
              flex flex-col items-center justify-center text-center
              h-64
              ${isDragActive 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted/30"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {isDragActive ? "Drop file here" : "Drag & drop your file"}
            </h3>
            <p className="text-sm text-muted-foreground">
              or click to browse from your computer
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileType className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                disabled={isProcessing}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {isProcessing && (
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute bottom-0 left-0 h-1 bg-primary/50"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
