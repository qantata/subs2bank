import { styled } from "@root/stitches.config";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { SyncedSubs } from "../pages/api/generate-previews";
import { Entry } from "../pages/api/scan-media-files";
import { Button } from "./Button";
import { Select } from "./Select";

const Table = styled("div", {
  width: "100%",
  height: "600px",
  overflowY: "auto",
  marginTop: "32px",
});

const TableRow = styled("div", {
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

const RowButtons = styled("div", {
  width: "110px",
  aspectRatio: "16 / 9",
  gap: "8px",

  "> button": {
    width: "100%",
    textAlign: "center",
    justifyContent: "center",
    height: "32px",

    "&:first-child": {
      marginBottom: "8px",
    },
  },

  "> img": {
    height: "100%",
    aspectRatio: "16 / 9",
  },
});

const RowJap = styled("div", {
  flex: 1,
  display: "flex",
  alignItems: "center",
});

const RowEng = styled("div", {
  flex: 1,
  display: "flex",
  alignItems: "center",
});

type Props = {
  mediaName: string;
  root: string;
  entries: Entry[];
};

export const MediaImportPreview: React.FC<Props> = ({
  mediaName,
  root,
  entries,
}) => {
  const [entry, setEntry] = useState<Entry | null>(
    entries.length ? entries[0] : null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [synced, setSynced] = useState<SyncedSubs>({});
  const tableRef = useRef<HTMLDivElement>(null);
  const [previewImageSrc, setPreviewImageSrc] = useState("");
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  const fetchPreviews = async () => {
    try {
      const res = await fetch("/api/generate-previews", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          root,
          entries,
        }),
      });

      const json = await res.json();

      if (json.error) {
        setError(json.error);
        return;
      }

      setSynced(json.entries);
      setIsLoading(false);
      setTimeout(() => {
        tableRef.current!.scrollTo({
          top: 0,
        });
      });
    } catch (err) {
      console.error(err);
    }
  };

  const onImageButtonClick = async (
    root: string,
    filepath: string,
    timestamp: number
  ) => {
    try {
      const res = await fetch("/api/generate-preview-image", {
        method: "POST",
        headers: {
          Accept: "blob",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          root,
          filename: filepath,
          timestamp,
        }),
      });

      const blob = await res.blob();
      setPreviewImageSrc(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    }
  };

  const onAudioButtonClick = async (
    root: string,
    filepath: string,
    start: number,
    end: number
  ) => {
    try {
      const res = await fetch("/api/generate-preview-audio", {
        method: "POST",
        headers: {
          Accept: "blob",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          root,
          filename: filepath,
          start,
          end,
        }),
      });

      const blob = await res.blob();
      previewAudioRef.current!.src = URL.createObjectURL(blob);
      previewAudioRef.current!.play();
    } catch (err) {
      console.error(err);
    }
  };

  const onStartImportClick = async () => {
    try {
      const res = await fetch("/api/start-processing", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          root,
          entries,
          importName: mediaName,
        }),
      });

      const json = await res.json();

      if (json.error) {
        setError(json.error);
        return;
      }

      if (!json.importId) {
        setError("No import id");
        return;
      }

      router.push(`/imports/${json.importId}`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!tableRef.current) {
      return;
    }

    setTimeout(() => {
      tableRef.current!.scrollTo({
        top: 0,
      });
    });
  }, [entry]);

  useEffect(() => {
    fetchPreviews();

    return () => {};
  }, [entries]);

  if (error !== "") {
    return <p style={{ color: "coral" }}>{error}</p>;
  }

  if (isLoading) {
    return <p>Loading</p>;
  }

  if (!entry) {
    return <p>No files</p>;
  }

  return (
    <>
      <h2>{mediaName}</h2>

      <Select
        options={entries.map((e) => e.filename)}
        value={entry.filename}
        onChange={(value) =>
          setEntry(entries.find((e) => e.filename === value)!)
        }
      />

      <Table ref={tableRef}>
        <TableRow css={{ position: "sticky", top: 0, backgroundColor: "#fff" }}>
          <RowButtons>
            <img src={previewImageSrc} />
            <audio ref={previewAudioRef}></audio>
          </RowButtons>
          <RowJap>Japanese</RowJap>
          <RowJap>English</RowJap>
        </TableRow>

        {synced[entry.filename].map((syncedEntry) => (
          <TableRow
            key={`${syncedEntry.jap}${syncedEntry.eng}${syncedEntry.start}${syncedEntry.end}`}
          >
            <RowButtons>
              <Button
                onPress={() =>
                  onImageButtonClick(root, entry.filename, syncedEntry.start)
                }
              >
                Show image
              </Button>
              <Button
                onPress={() =>
                  onAudioButtonClick(
                    root,
                    entry.filename,
                    syncedEntry.start,
                    syncedEntry.end
                  )
                }
              >
                Play audio
              </Button>
            </RowButtons>
            <RowJap>{syncedEntry.jap}</RowJap>
            <RowJap>{syncedEntry.eng}</RowJap>
          </TableRow>
        ))}
      </Table>

      <div style={{ marginTop: 32 }}>
        <Button onPress={onStartImportClick}>Start import</Button>
      </div>
    </>
  );
};
