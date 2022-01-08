import os from "os";
import fs from "fs";
import fse from "fs-extra";
import { spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

const ffmpeg = async (filepath: string, timestamp: number, args: string[]) => {
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
    typeof req.body.timestamp !== "number"
  ) {
    res.status(400).json({
      error: "invalid body",
    });

    return;
  }

  const jpgPath = path.join(
    os.homedir(),
    ".local",
    "share",
    "subs2bank",
    "temp.jpg"
  );

  fse.ensureDirSync(path.join(os.homedir(), ".local", "share", "subs2bank"));
  if (fs.existsSync(jpgPath)) {
    fse.removeSync(jpgPath);
  }

  try {
    await ffmpeg(
      path.join(req.body.root, req.body.filename),
      Math.floor(req.body.timestamp / 1000),
      ["-vframes", "1", "-q:v", "5", "-vf", `scale=1280:-2`, jpgPath]
    );

    var data = fs.readFileSync(jpgPath);

    res.setHeader("Content-Type", "image/jpg");
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "couldn't generate image",
    });
  }
}
