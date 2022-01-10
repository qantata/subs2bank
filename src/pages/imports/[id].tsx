import { Entry, MediaImport } from "@prisma/client";
import { styled } from "@root/stitches.config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const ProgressText = styled("div", {
  width: "100vw",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const Container = styled("div", {
  width: "100%",
  marginTop: 200,
});

const Title = styled("h1", {
  width: "800px",
  height: "50px",
  margin: "0 auto",
  marginBottom: "32px",
});

const TableContainer = styled("div", {
  width: "100%",
  height: "calc(100vh - 200px - 32px - 50px)",
  overflowY: "auto",
});

const Table = styled("div", {
  margin: "0 auto",
  width: "800px",
  height: "600px",
});

const Row = styled("div", {
  width: "100%",
  padding: "8px 0",
  display: "flex",
  alignItems: "center",
  gap: "32px",

  borderBottom: "1px solid $grayBorder",

  "&:first-child": {
    borderTop: "1px solid $grayBorder",
  },
});

const RowImage = styled("div", {
  "> img": {
    aspectRatio: "16 / 9",
    height: "144px",
  },
});

const RowData = styled("div", {});

const Import = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaImport, setMediaImport] = useState<MediaImport | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);

  const router = useRouter();
  const { id } = router.query;

  const fetchAndConnectImport = async () => {
    if (typeof id !== "string") {
      console.error("id invalid");
      return;
    }

    const res = await fetch("/api/get-import", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: parseInt(id),
      }),
    });

    const json = await res.json();

    if (json.error) {
      console.error(json.error);
      return;
    }

    if (json.import && json.entries && json.import.isDone) {
      setMediaImport(json.import as MediaImport);
      setEntries(json.entries as Entry[]);
      setIsLoading(false);
      return;
    }

    const socket = io("http://localhost:3003");
    console.log("Connect to socket");
    socket.on("progress", (data) => {
      setProgress(data.progress);
    });
    socket.on("done", () => {
      console.log("Finished");
      socket.close();
    });
    setIsLoading(false);
  };

  useEffect(() => {
    if (id === undefined) {
      return;
    }

    fetchAndConnectImport();
  }, [id]);

  if (isLoading) {
    return (
      <ProgressText>
        <h1>Loading...</h1>
      </ProgressText>
    );
  }

  if (!mediaImport) {
    return (
      <ProgressText>
        <h1>Progress: {progress.toFixed(1)}%</h1>
      </ProgressText>
    );
  }

  return (
    <Container>
      <Title>{mediaImport.name}</Title>

      <TableContainer>
        <Table>
          {entries.map((e) => (
            <Row key={e.id}>
              <RowImage>
                <img src={`http://localhost:3000/api/image?id=${e.id}`} />
              </RowImage>

              <RowData>
                <h3>{e.jap}</h3>
                <p>{e.eng}</p>
              </RowData>
            </Row>
          ))}
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Import;
