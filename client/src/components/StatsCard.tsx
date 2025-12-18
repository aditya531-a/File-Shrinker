import { motion } from "framer-motion";
import { type CompressionStats } from "@shared/schema";
import { Download, ArrowRight, Database, FileDigit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatsCardProps {
  stats: CompressionStats;
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6"
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <h3 className="text-lg font-semibold text-foreground">Compression Results</h3>
        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-bold border border-green-500/20">
          Success
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Database className="w-4 h-4" />
            Original Size
          </div>
          <p className="text-2xl font-mono font-bold text-foreground">
            {stats.originalSize} B
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <FileDigit className="w-4 h-4" />
            Compressed Size
          </div>
          <p className="text-2xl font-mono font-bold text-primary">
            {stats.compressedSize} B
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <ArrowRight className="w-4 h-4" />
            Ratio
          </div>
          <p className="text-2xl font-mono font-bold text-accent-foreground">
            {stats.compressionRatio}
          </p>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          className="w-full sm:w-auto gap-2 text-base font-medium h-12 px-8 shadow-lg shadow-primary/20"
          onClick={() => {
            const link = document.createElement('a');
            link.href = stats.downloadUrl;
            link.download = stats.compressedName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <Download className="w-4 h-4" />
          Download Compressed File
        </Button>
      </div>
    </motion.div>
  );
}
