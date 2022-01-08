import os from "os";
import fs from "fs";
import fse from "fs-extra";
import { spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

const ffmpeg = async (
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

export type Response =
  | Buffer
  | {
      error?: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (
    typeof req.body.root !== "string" ||
    typeof req.body.filename !== "string" ||
    typeof req.body.start !== "number" ||
    typeof req.body.end !== "number"
  ) {
    res.status(400).json({
      error: "invalid body",
    });

    return;
  }

  const mp3Path = path.join(
    os.homedir(),
    ".local",
    "share",
    "subs2bank",
    "temp.mp3"
  );

  fse.ensureDirSync(path.join(os.homedir(), ".local", "share", "subs2bank"));
  if (fs.existsSync(mp3Path)) {
    fse.removeSync(mp3Path);
  }

  try {
    await ffmpeg(
      path.join(req.body.root, req.body.filename),
      req.body.start / 1000,
      req.body.end / 1000,
      ["-vn", "-sn", "-b:a", "128k", mp3Path]
    );

    console.log("done");

    var data = fs.readFileSync(mp3Path);

    res.setHeader("Content-Type", "audio/mp3");
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "couldn't generate audio",
    });
  }
}
