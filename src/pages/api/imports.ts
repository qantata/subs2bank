import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@root/lib/prisma";

export type Import = {
  id: number;
  name: string;
  nrItems: number;
};

export type Response = {
  error?: string;
  imports?: Import[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  try {
    const imports = await prisma.mediaImport.findMany({
      include: {
        files: true,
      },
    });

    if (!imports) {
      res.status(404).send({});
      return;
    }

    const result: Import[] = [];

    for (const i of imports) {
      const entries = await prisma.entry.findMany({
        where: {
          mediaImportId: i.id,
        },
      });

      if (!entries) {
        res.status(500).send({
          error: "couldnt load entries",
        });
        return;
      }

      result.push({
        id: i.id,
        name: i.name,
        nrItems: entries.length,
      });
    }

    res.status(200).send({
      imports: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "couldn't query import",
    });
  }
}
