"use client";

import { useState, useEffect } from 'react';
import { Upload, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { compressVideo } from '@/lib/utils/ffmpeg';
import { Card } from '@/components/ui/card';

export function VideoCompressor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setCompressedUrl(null);
      setProgress(0);
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    try {
      setCompressing(true);
      
      // Create a promise that resolves when compression is complete
      const compressionPromise = compressVideo(selectedFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          // Stop increasing progress at 90%
          if (prevProgress < 90) {
            return Math.min(prevProgress + Math.floor(Math.random() * 10), 90);
          }
          return prevProgress;
        });
      }, 500);

      // Wait for compression to complete
      const compressedBlob = await compressionPromise;
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      // Set progress to 100%
      setProgress(100);

      // Create object URL for the compressed video
      const url = URL.createObjectURL(compressedBlob);
      setCompressedUrl(url);
    } catch (error) {
      console.error('Error compressing video:', error);
      // Reset progress if there's an error
      setProgress(0);
    } finally {
      setCompressing(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Video Compressor</h2>
          <p className="text-muted-foreground">
            Compress your videos right in your browser
          </p>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="video-input"
          />
          <label
            htmlFor="video-input"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <span className="text-sm text-muted-foreground">
              Click to select a video or drag and drop
            </span>
          </label>
        </div>

        {selectedFile && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="text-sm">{selectedFile.name}</span>
            </div>

            <Button
              onClick={handleCompress}
              disabled={compressing}
              className="w-full"
            >
              {compressing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Compressing...
                </>
              ) : (
                'Compress Video'
              )}
            </Button>

            {(compressing || progress > 0) && (
              <div className="flex items-center space-x-2">
                <Progress value={progress} className="w-full" />
                <span className="text-sm w-12 text-right">{progress}%</span>
              </div>
            )}

            {compressedUrl && (
              <div className="space-y-4">
                <video
                  src={compressedUrl}
                  controls
                  className="w-full rounded-lg"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = compressedUrl;
                    a.download = `compressed-${selectedFile.name}`;
                    a.click();
                  }}
                >
                  Download Compressed Video
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}