import fs from 'fs';
import path from 'path';

export function resolveAttachments(baseDir: string): { cvPath?: string; photoPath?: string } {
  const cvPath = process.env.CV_FILE
    ? path.resolve(process.env.CV_FILE)
    : path.join(baseDir, 'cv.pdf');

  const photoPath = process.env.PHOTO_FILE
    ? path.resolve(process.env.PHOTO_FILE)
    : ['photo.jpg', 'photo.jpeg', 'photo.png']
        .map(f => path.join(baseDir, f))
        .find(f => fs.existsSync(f));

  return {
    cvPath: cvPath && fs.existsSync(cvPath) ? cvPath : undefined,
    photoPath: photoPath && fs.existsSync(photoPath) ? photoPath : undefined,
  };
}
