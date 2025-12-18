import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompressFile, useDecompressFile } from "@/hooks/use-compression";
import { DropZone } from "@/components/DropZone";
import { StatsCard } from "@/components/StatsCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Zap, Archive, ArrowRightLeft } from "lucide-react";
import type { CompressionStats } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"compress" | "decompress">("compress");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stats, setStats] = useState<CompressionStats | null>(null);

  const compressMutation = useCompressFile();
  const decompressMutation = useDecompressFile();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStats(null); // Reset stats on new file
  };

  const handleProcess = () => {
    if (!selectedFile) return;

    if (activeTab === "compress") {
      compressMutation.mutate(selectedFile, {
        onSuccess: (data) => {
          setStats(data);
        },
      });
    } else {
      decompressMutation.mutate(selectedFile, {
        onSuccess: () => {
          setSelectedFile(null); // Clear after successful download
        },
      });
    }
  };

  const isProcessing = compressMutation.isPending || decompressMutation.isPending;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background flex flex-col">
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight">Huffman<span className="text-primary">Press</span></h1>
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">
            Lossless Compression Tool
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-foreground"
          >
            Optimize your files with <br />
            <span className="text-gradient">algorithmic precision</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Use Huffman coding to losslessly compress your text documents. 
            Simple, fast, and efficient browser-based processing.
          </motion.p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => {
            setActiveTab(v as any);
            setSelectedFile(null);
            setStats(null);
          }}
          className="w-full"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="bg-secondary/50 p-1 border border-border rounded-full">
              <TabsTrigger 
                value="compress" 
                className="rounded-full px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <Archive className="w-4 h-4 mr-2" />
                Compress
              </TabsTrigger>
              <TabsTrigger 
                value="decompress" 
                className="rounded-full px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Decompress
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'compress' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'compress' ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="compress" className="mt-0 space-y-8">
                  <div className="bg-background rounded-3xl p-1 border border-border shadow-2xl shadow-primary/5">
                    <div className="bg-secondary/20 rounded-[22px] p-6 md:p-8 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Upload File</h3>
                        <p className="text-sm text-muted-foreground">Select a text-based file to compress (txt, md, js, etc.)</p>
                      </div>
                      
                      <DropZone 
                        selectedFile={selectedFile}
                        onFileSelect={handleFileSelect}
                        onClear={() => {
                          setSelectedFile(null);
                          setStats(null);
                        }}
                        isProcessing={isProcessing}
                      />

                      <Button
                        size="lg"
                        className="w-full text-base h-12 font-medium"
                        disabled={!selectedFile || isProcessing || !!stats}
                        onClick={handleProcess}
                      >
                        {isProcessing ? "Processing..." : "Compress Now"}
                      </Button>
                    </div>
                  </div>

                  {stats && <StatsCard stats={stats} />}
                </TabsContent>

                <TabsContent value="decompress" className="mt-0 space-y-8">
                  <div className="bg-background rounded-3xl p-1 border border-border shadow-2xl shadow-primary/5">
                    <div className="bg-secondary/20 rounded-[22px] p-6 md:p-8 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Restore File</h3>
                        <p className="text-sm text-muted-foreground">Upload a .huff or .bin file to restore it to original</p>
                      </div>
                      
                      <DropZone 
                        selectedFile={selectedFile}
                        onFileSelect={handleFileSelect}
                        onClear={() => setSelectedFile(null)}
                        accept={{ 'application/octet-stream': ['.huff', '.bin'] }}
                        isProcessing={isProcessing}
                      />

                      <Button
                        size="lg"
                        className="w-full text-base h-12 font-medium"
                        disabled={!selectedFile || isProcessing}
                        onClick={handleProcess}
                      >
                        {isProcessing ? "Restoring..." : "Decompress & Download"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40">
        <p>© 2024 HuffmanPress. Engineered for efficiency.</p>
      </footer>
    </div>
  );
}
