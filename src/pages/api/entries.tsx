import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@root/lib/prisma";
import { Entry } from "@prisma/client";

export type Response = {
  error?: string;
  entries?: Entry[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  try {
    const entries = await prisma.entry.findMany({
      include: {
        mediaImport: true,
      },
    });

    if (!entries) {
      res.status(404).send({});
      return;
    }

    res.status(200).send({
      entries: entries.filter((e) => e.mediaImport?.isDone),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "couldn't query import",
    });
  }
}
