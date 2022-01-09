import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@root/lib/prisma";
import { Entry, MediaImport } from "@prisma/client";

export type Response = {
  error?: string;
  import?: MediaImport;
  entries?: Entry[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (typeof req.body.id !== "number") {
    res.status(400).json({
      error: "invalid body",
    });

    return;
  }

  try {
    const mediaImport = await prisma.mediaImport.findUnique({
      where: {
        id: req.body.id,
      },
    });

    if (!mediaImport) {
      res.status(404).send({});
      return;
    }

    const entries = await prisma.entry.findMany({
      where: {
        mediaImportId: mediaImport.id,
      },
    });

    if (!entries) {
      res.status(500).send({
        error: "couldnt load entires for media import",
      });
    }

    res.status(200).send({
      import: mediaImport,
      entries,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "couldn't query import",
    });
  }
}
