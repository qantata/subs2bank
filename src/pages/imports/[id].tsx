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

const Import = () => {
  const [progress, setProgress] = useState(0);

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

    const socket = io("http://localhost:3003");
    console.log("Connect to socket");
    socket.on("progress", (data) => {
      setProgress(data.progress);
    });
    socket.on("done", () => {
      console.log("Finished");
      socket.close();
    });
  };

  useEffect(() => {
    if (id === undefined) {
      return;
    }

    fetchAndConnectImport();
  }, [id]);

  return (
    <ProgressText>
      <h1>Progress: {progress.toFixed(1)}%</h1>
    </ProgressText>
  );
};

export default Import;
