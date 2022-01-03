import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

export type EntrySubtitle = {
  language: "jap" | "eng";
  filename: string;
};

export type Entry = {
  filename: string;
  subtitles: EntrySubtitle[];
};

export type ScanMediaFilesResponse = {
  entries?: Entry[];
  error?: string;
};

const isPathDirectory = async (path: string) => {
  return new Promise<boolean>((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(stats.isDirectory());
    });
  });
};

const supportedVideoExtensions = [
  ".mkv",
  ".mp4",
  ".mov",
  ".avi",
  ".wmv",
  ".flv",
  ".f4v",
  ".webm",
];

const supportedSubtitleExtensions = [".srt"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScanMediaFilesResponse>
) {
  const { path: dir } = req.query;

  if (typeof dir !== "string") {
    res.status(400).json({
      error: "path is invalid",
    });

    return;
  }

  const isDirectory = await isPathDirectory(dir);
  if (!isDirectory) {
    res.status(404).json({});
    return;
  }

  return new Promise<void>((resolve) => {
    fs.readdir(dir, async (err, files) => {
      if (err) {
        console.error(err);
        res.status(400).send({
          entries: [],
          error: "Path was invalid or there was an IO error",
        });
        resolve();
        return;
      }

      const entries: Entry[] = [];
      for (const file of files) {
        // Ignore hidden files
        if (file.startsWith(".")) {
          continue;
        }

        let isValidVideoFile = false;
        let extension = "";
        for (const ext of supportedVideoExtensions) {
          if (file.endsWith(ext)) {
            isValidVideoFile = true;
            extension = ext;
            break;
          }
        }

        if (!isValidVideoFile) {
          continue;
        }

        const entry: Entry = {
          filename: file,
          subtitles: [],
        };

        const engCodes = ["eng"];
        const japCodes = ["ja", "jp", "jap"];

        // English
        for (const code of engCodes) {
          for (const ext of supportedSubtitleExtensions) {
            const subFilename = file.replace(extension, `.${code}.${ext}`);
            const subPath = path.join(dir, subFilename);

            if (fs.existsSync(subPath)) {
              entry.subtitles.push({
                language: "eng",
                filename: subFilename,
              });

              // Just go with the first found subtitle
              break;
            }
          }
        }

        // Japanese
        for (const code of japCodes) {
          for (const ext of supportedSubtitleExtensions) {
            const subFilename = file.replace(extension, `.${code}.${ext}`);
            const subPath = path.join(dir, subFilename);

            if (fs.existsSync(subPath)) {
              entry.subtitles.push({
                language: "jap",
                filename: subFilename,
              });

              break;
            }
          }
        }

        entries.push(entry);
      }

      res.status(200).send({
        entries,
      });
      resolve();
    });
  });
}
