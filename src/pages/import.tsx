import type { NextPage } from "next";
import { useEffect, useState } from "react";

import { styled } from "@root/stitches.config";
import { Input } from "@/components/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";
import { Entry } from "./api/scan-media-files";
import { MediaImportPreview } from "../components/MediaImportPreview";

const Container = styled("div", {
  width: "100vw",
  height: "100vh",

  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  flexDirection: "column",
  marginTop: "200px",
});

const Title = styled("h1", {
  fontSize: "48px",
});

const TabTitle = styled("h2", {
  fontSize: "24px",
});

const EntriesTable = styled("div", {
  width: "100%",
  display: "flex",
  flexDirection: "column",
});

const EntriesRow = styled("div", {
  width: "100%",
  display: "flex",
  gap: "16px",
});

const EntriesFileName = styled("div", {
  flex: 1,
});

const EntriesHasLang = styled("div", {
  variants: {
    has: {
      true: {
        color: "LightGreen",
      },
      false: {
        color: "Coral",
      },
    },
  },
});

const Import: NextPage = () => {
  const [mediaName, setMediaName] = useState("");
  const [mediaPath, setMediaPath] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);

  const scanMediaFiles = async () => {
    if (mediaPath.length > 0) {
      try {
        const res = await fetch(
          "/api/scan-media-files?" +
            new URLSearchParams({
              path: mediaPath,
            })
        );

        const json = await res.json();
        const entries = json.entries;

        if (!entries || !entries.length) {
          setEntries([]);
          return;
        }

        setEntries(entries);
      } catch (err) {
        setEntries([]);
        console.error(err);
      }
    }
  };

  useEffect(() => {
    scanMediaFiles();
  }, [mediaPath]);

  return (
    <Container>
      <Title>Import content</Title>

      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Import settings</TabsTrigger>
          <TabsTrigger value="tab2">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="tab1">
          <Input
            type="text"
            label="Media name"
            labelActiveBgColor="#fff"
            value={mediaName}
            onChange={setMediaName}
          />

          <Input
            type="text"
            label="Media path"
            labelActiveBgColor="#fff"
            value={mediaPath}
            onChange={setMediaPath}
          />

          <EntriesTable>
            {entries.map((entry) => (
              <EntriesRow key={entry.filename}>
                <EntriesFileName>{entry.filename}</EntriesFileName>
                <EntriesHasLang
                  has={!!entry.subtitles.find((s) => s.language === "jap")}
                >
                  Japanese subs
                </EntriesHasLang>
                <EntriesHasLang
                  has={!!entry.subtitles.find((s) => s.language === "eng")}
                >
                  English subs
                </EntriesHasLang>
              </EntriesRow>
            ))}
          </EntriesTable>
        </TabsContent>
        <TabsContent value="tab2">
          <MediaImportPreview
            entries={entries}
            mediaName={mediaName}
            root={mediaPath}
          />
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default Import;
