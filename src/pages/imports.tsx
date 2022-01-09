import { styled } from "@root/stitches.config";
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Import } from "./api/imports";

const Container = styled("div", {
  width: 600,
  margin: "200px auto",
});

const Item = styled("div", {
  width: "100%",
  borderBottom: "1px solid $grayBorder",
  padding: "24px 32px",

  "&:first-child": {
    borderTop: "1px solid $grayBorder",
  },

  cursor: "pointer",

  "&:hover": {
    backgroundColor: "$grayUIBgHover",
  },

  "> h2": {
    margin: 0,
  },

  "> p": {
    margin: 0,
  },

  transition: "background-color 0.15s ease-out",
});

const Imports: NextPage = () => {
  const [imports, setImports] = useState<Import[]>([]);

  const fetchImports = async () => {
    const res = await fetch("/api/imports", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    if (json.error) {
      console.error(json.error);
      return;
    }

    if (!json.imports) {
      return;
    }

    setImports(json.imports);
  };

  useEffect(() => {
    fetchImports();
  });

  return (
    <Container>
      {imports.map((i) => (
        <Link href={`/imports/${i.id}`}>
          <Item>
            <h2>{i.name}</h2>
            <p>{i.nrItems} items</p>
          </Item>
        </Link>
      ))}
    </Container>
  );
};

export default Imports;
