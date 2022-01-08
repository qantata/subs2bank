import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@root/lib/prisma";

export type Response = {
  error?: string;
  id?: number;
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
    const entry = await prisma.mediaImport.findUnique({
      where: {
        id: req.body.id,
      },
    });

    if (!entry) {
      res.status(404).send({});
      return;
    }

    res.status(200).send({
      id: req.body.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "couldn't query import",
    });
  }
}
