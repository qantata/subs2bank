import { NextApiRequest, NextApiResponse } from "next";
import { parse, map } from "subtitle";
import { prisma } from "@root/lib/prisma";
import { Server } from "socket.io";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import fse from "fs-extra";
import os from "os";

import { Entry } from "./scan-media-files";
import { File, MediaImport } from "@prisma/client";
import { spawn } from "child_process";

type Sub = {
  start: number;
  end: number;
  text: string;
};

const parseSubs = async (filepath: string) => {
  return new Promise<Sub[]>((resolve, reject) => {
    const subs: Sub[] = [];

    fs.createReadStream(filepath)
      .pipe(parse())
      .pipe(
        map((node) => {
          if (typeof node.data === "string") {
            return;
          }

          subs.push({
            start: node.data.start,
            end: node.data.end,
            text: node.data.text.replace(/<.*?>/gm, "").replace(/{.*?}/gm, ""),
          });
        })
      )
      .on("error", (err) => {
        console.error(err);
        reject(err);
      })
      .on("finish", () => {
        resolve(subs);
      });
  });
};

const ffmpegAudio = async (
  filepath: string,
  start: number,
  end: number,
  args: string[]
) => {
  return new Promise<void>((resolve, reject) => {
    const processArgs = [
      "-hide_banner",
      "-loglevel",
      "fatal",
      "-ss",
      `${start}`,
      "-t",
      `${end - start}`,
      "-i",
      filepath,
      ...args,
    ];

    const process = spawn("ffmpeg", processArgs);
    console.log(["ffmpeg", ...processArgs].join(" "));

    let stdoutData: any[] = [];

    process.stdout.setEncoding("utf8");
    process.stderr.setEncoding("utf8");

    process.stdout.on("data", (data) => {
      stdoutData.push(data);
    });
    process.stderr.on("data", (data) => {});

    process.on("exit", (code) => {});
    process.on("error", (err) => reject(err));
    process.on("close", () => {
      resolve();
    });
  });
};

const ffmpegImage = async (
  filepath: string,
  timestamp: number,
  args: string[]
) => {
  return new Promise<void>((resolve, reject) => {
    const processArgs = [
      "-hide_banner",
      "-loglevel",
      "fatal",
      "-ss",
      `${timestamp}`,
      "-i",
      filepath,
      ...args,
    ];

    const process = spawn("ffmpeg", processArgs);
    console.log(["ffmpeg", ...processArgs].join(" "));

    let stdoutData: any[] = [];

    process.stdout.setEncoding("utf8");
    process.stderr.setEncoding("utf8");

    process.stdout.on("data", (data) => {
      stdoutData.push(data);
    });
    process.stderr.on("data", (data) => {});

    process.on("exit", (code) => {});
    process.on("error", (err) => reject(err));
    process.on("close", () => {
      resolve();
    });
  });
};

export type SyncedSubs = {
  [entry: string]: {
    start: number;
    end: number;
    eng: string;
    jap: string;
  }[];
};

export type Response = {
  importId?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (
    typeof req.body.root !== "string" ||
    !Array.isArray(req.body.entries) ||
    !req.body.entries.length ||
    typeof req.body.importName !== "string"
  ) {
    res.status(400).json({
      error: "no body",
    });

    return;
  }

  const root = req.body.root as string;
  const entries = req.body.entries as Entry[];

  const noSubsEntry = entries.find(
    (e) =>
      !!(
        !e.subtitles.find((s) => s.language === "eng") ||
        !e.subtitles.find((s) => s.language === "jap")
      )
  );
  if (noSubsEntry) {
    res.status(400).json({
      error: "not all files have eng and jap subs",
    });
    return;
  }

  const japSubs: Sub[][] = [];
  const engSubs: Sub[][] = [];

  for (const entry of entries) {
    const japFile = path.join(
      root,
      entry.subtitles.find((s) => s.language === "jap")!.filename
    );

    const engFile = path.join(
      root,
      entry.subtitles.find((s) => s.language === "eng")!.filename
    );

    try {
      const jap = await parseSubs(japFile);
      const eng = await parseSubs(engFile);

      japSubs.push(jap);
      engSubs.push(eng);
    } catch (err) {
      res.status(500).send({
        error: `couldn't parse subtitle file ${japFile}`,
      });
      return;
    }
  }

  const synced: SyncedSubs = {};

  for (let i = 0; i < japSubs.length; i++) {
    const jap = japSubs[i];
    const eng = engSubs[i];
    synced[entries[i].filename] = [];

    for (let j = 0; j < jap.length; j++) {
      const start = jap[j].start;
      const end = jap[j].end;

      const closest = eng.sort((subA, subB) => {
        const aDiff = Math.abs(subA.start - start) + Math.abs(subA.end - end);
        const bDiff = Math.abs(subB.start - start) + Math.abs(subB.end - end);

        if (aDiff < bDiff) return -1;
        if (bDiff < aDiff) return 1;
        return 0;
      })[0];

      if (!closest) {
        continue;
      }

      if (Math.abs(closest.start - start) + Math.abs(closest.end - end) > 500) {
        continue;
      }

      synced[entries[i].filename].push({
        start,
        end,
        jap: jap[j].text,
        eng: closest.text,
      });
    }
  }

  let importEntry: (MediaImport & { files: File[] }) | null = null;

  try {
    importEntry = await prisma.mediaImport.create({
      data: {
        name: req.body.importName,
        isDone: false,
        files: {
          create: entries.map((e) => {
            return {
              path: path.join(req.body.root, e.filename),
            };
          }),
        },
      },
      include: {
        files: true,
      },
    });

    res.status(200).json({
      importId: importEntry.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Couldn't create prisma import",
    });
    return;
  }

  // This should never happen
  if (importEntry === null) {
    console.error("Import entry was somehow null");
    return;
  }

  let progress = 0;
  let total = 0;

  for (const entry of entries) {
    for (const sub of synced[entry.filename]) {
      // Image + audio
      total += 2;
    }
  }

  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {});

  httpServer.listen(3003, async () => {
    if (!importEntry) {
      httpServer.close();
      return;
    }

    const outDir = path.join(
      os.homedir(),
      ".local",
      "share",
      "subs2bank",
      "imports",
      `${importEntry.id}`
    );
    fse.ensureDirSync(outDir);

    for (const entry of entries) {
      for (const sub of synced[entry.filename]) {
        try {
          const prismaEntry = await prisma.entry.create({
            data: {
              jap: sub.jap,
              eng: sub.eng,
              mediaImport: {
                connect: {
                  id: importEntry.id,
                },
              },
            },
          });

          await ffmpegAudio(
            path.join(req.body.root, entry.filename),
            sub.start / 1000,
            sub.end / 1000,
            [
              "-vn",
              "-sn",
              "-b:a",
              "128k",
              path.join(outDir, `${prismaEntry.id}.mp3`),
            ]
          );

          progress++;
          console.log(
            "Progress",
            `${Number.parseFloat(`${(progress / total) * 100}`).toFixed(1)}%`
          );
          io.emit("progress", { progress: (progress / total) * 100 });

          await ffmpegImage(
            path.join(req.body.root, entry.filename),
            Math.floor(sub.start / 1000),
            [
              "-vframes",
              "1",
              "-q:v",
              "5",
              "-vf",
              `scale=1280:-2`,
              path.join(outDir, `${prismaEntry.id}.jpg`),
            ]
          );

          progress++;
          console.log(
            "Progress",
            `${Number.parseFloat(`${(progress / total) * 100}`).toFixed(1)}%`
          );
          io.emit("progress", { progress: (progress / total) * 100 });
        } catch (err) {
          console.error(err);
          continue;
        }
      }
    }

    try {
      await prisma.mediaImport.update({
        where: {
          id: importEntry.id,
        },
        data: {
          isDone: true,
        },
      });
    } catch (err) {
      console.error(err);
    }

    io.emit("done", {});
    console.log("Done");
    httpServer.close();
  });
}
