import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function getFFmpeg() {
  if (ffmpeg) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${window.location.origin}/ffmpeg/ffmpeg-core.js`,
        'text/javascript',
      ),
      wasmURL: await toBlobURL(
        `${window.location.origin}/ffmpeg/ffmpeg-core.wasm`,
        'application/wasm',
      ),
    });
  }

  return ffmpeg;
}

export async function compressVideo(
  videoFile: File,
  compressionLevel: 'low' | 'medium' | 'high' = 'medium',
): Promise<Blob> {
  const ffmpeg = await getFFmpeg();
  const inputFileName = 'input.mp4';
  const outputFileName = 'output.mp4';

  // Create a URL from the video file
  const videoUrl = URL.createObjectURL(videoFile);
  const response = await fetch(videoUrl);
  const videoData = await response.arrayBuffer();

  // Write the video data to FFmpeg's virtual file system
  await ffmpeg.writeFile(inputFileName, new Uint8Array(videoData));

  // Set compression parameters based on level
  const crf = compressionLevel === 'low' ? '28' : compressionLevel === 'medium' ? '23' : '18';

  // Run FFmpeg command
  await ffmpeg.exec([
    '-i', inputFileName,
    '-c:v', 'libx264',
    '-crf', crf,
    '-preset', 'medium',
    '-c:a', 'aac',
    '-b:a', '128k',
    outputFileName
  ]);

  // Read the result
  const data = await ffmpeg.readFile(outputFileName);
  const compressedBlob = new Blob([data], { type: 'video/mp4' });

  // Cleanup
  URL.revokeObjectURL(videoUrl);
  await ffmpeg.deleteFile(inputFileName);
  await ffmpeg.deleteFile(outputFileName);

  return compressedBlob;
}