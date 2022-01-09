import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import os from "os";

import { prisma } from "@root/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== "string") {
    res.status(400).json({});
    return;
  }

  const entry = await prisma.entry.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  const mp3Path = path.join(
    os.homedir(),
    ".local",
    "share",
    "subs2bank",
    "imports",
    `${entry?.mediaImportId}`,
    `${entry?.id}.mp3`
  );

  var data = fs.readFileSync(mp3Path);
  res.setHeader("Content-Type", "audio/mp3");
  res.send(data);
}
