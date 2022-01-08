import { NextApiRequest, NextApiResponse } from "next";
import { parse, map } from "subtitle";
import fs from "fs";
import path from "path";

import { Entry } from "./scan-media-files";

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

export type SyncedSubs = {
  [entry: string]: {
    start: number;
    end: number;
    eng: string;
    jap: string;
  }[];
};

export type Response = {
  entries?: SyncedSubs;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (
    typeof req.body.root !== "string" ||
    !Array.isArray(req.body.entries) ||
    !req.body.entries.length
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

  res.status(200).json({
    entries: synced,
  });
}
