import type { NextPage } from "next";
import { useEffect, useState } from "react";

import { styled } from "@root/stitches.config";
import { Input } from "@/components/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";

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

const Import: NextPage = () => {
  const [mediaName, setMediaName] = useState("");
  const [mediaPath, setMediaPath] = useState("");

  const scanMediaFiles = async () => {
    if (mediaPath.length > 0) {
      const res = await fetch(
        "/api/scan-media-files?" +
          new URLSearchParams({
            path: mediaPath,
          })
      );

      const json = await res.json();
      console.log(json);
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
          <TabsTrigger value="tab2">Audio settings</TabsTrigger>
          <TabsTrigger value="tab3">Image settings</TabsTrigger>
          <TabsTrigger value="tab4">Preview</TabsTrigger>
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
        </TabsContent>
        <TabsContent value="tab2">
          <TabTitle>Audio settings</TabTitle>
        </TabsContent>
        <TabsContent value="tab3">
          <TabTitle>Image settings</TabTitle>
        </TabsContent>
        <TabsContent value="tab4">
          <TabTitle>Preview</TabTitle>
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default Import;
