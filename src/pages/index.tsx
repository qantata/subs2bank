import { Entry } from "@prisma/client";
import { styled } from "@root/stitches.config";
import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

const Container = styled("div", {
  width: "100%",
  marginTop: 200,
});

const SearchContainer = styled("div", {
  width: "800px",
  height: "50px",
  margin: "0 auto",
  marginBottom: "32px",
  display: "flex",
  gap: "32px",
  alignItems: "center",
});

const TableContainer = styled("div", {
  width: "100%",
  height: "calc(100vh - 200px - 32px - 50px)",
  overflowY: "auto",
});

const LoadingText = styled("h3", {
  margin: "0 auto",
  width: "800px",
  height: "600px",
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
  alignItems: "stretch",
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

const RowData = styled("div", {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "flex-start",

  "> div": {
    flex: 1,

    "> *": {
      margin: 0,
    },
  },

  "> button": {
    width: "auto",
    marginBottom: 4,
  },
});

const Home: NextPage = () => {
  const [searchValue, setSearchValue] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeEntries, setActiveEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchEntries = async () => {
    const res = await fetch("/api/entries", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    if (json.error) {
      console.error(json.error);
      setIsLoading(false);
      return;
    }

    if (!json.entries) {
      setIsLoading(false);
      return;
    }

    setEntries(json.entries);
    setActiveEntries(json.entries);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    const value = searchValue.trim();

    if (value === "") {
      setActiveEntries(entries);
    } else {
      setActiveEntries(
        entries.filter(
          (e) => e.jap.includes(searchValue) || e.eng.includes(searchValue)
        )
      );
    }
  }, [entries, searchValue]);

  const onPlayAudioClick = async (id: number) => {
    const res = await fetch(`http://localhost:3000/api/audio?id=${id}`, {
      method: "POST",
      headers: {
        Accept: "blob",
        "Content-Type": "application/json",
      },
    });

    const blob = await res.blob();
    audioRef.current!.src = URL.createObjectURL(blob);
    audioRef.current!.play();
  };

  return (
    <Container>
      <SearchContainer>
        <Input
          type="text"
          label="Search"
          labelActiveBgColor="#fff"
          value={searchValue}
          onChange={setSearchValue}
        />
        {activeEntries.length} sentences
      </SearchContainer>

      <audio ref={audioRef}></audio>

      {isLoading && <LoadingText>Loading...</LoadingText>}

      {!isLoading && (
        <TableContainer>
          <Table>
            {activeEntries.map((e) => (
              <Row key={e.id}>
                <RowImage>
                  <img src={`http://localhost:3000/api/image?id=${e.id}`} />
                </RowImage>

                <RowData>
                  <div>
                    <h3>{e.jap}</h3>
                    <p>{e.eng}</p>
                  </div>
                  <Button onPress={() => onPlayAudioClick(e.id)}>
                    Play audio
                  </Button>
                </RowData>
              </Row>
            ))}
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Home;
