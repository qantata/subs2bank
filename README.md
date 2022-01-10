## subs2bank

A tool to create a sentence bank from subtitles & video files.

There's no releases created yet, but it's usable by just cloning the repo and running it in development mode.

### What does it do

subs2bank lets you import subtitle lines from subtitle files and generate a bank of sentences with their translations from them. It also uses video files that correspond to those subtitles to create audio and images for the sentences.

subs2bank currently only works with Japanese -> English sentence banks (Japanese sentences with English translations) and requires both of those subtitles to be available in `srt` format as files (not embedded in the video files). 

You can easily convert your `.ass` subtitles to `.srt` with ffmpeg: `for i in *.ass; do ffmpeg -i "$i" "${i%.*}.srt"; done`.

You can also easily export your english subtitles from all your video files with ffmpeg: `for i in *.mkv; do ffmpeg -i "$i" -map 0:s:0 "${i%.*}.eng.srt"; done`. This will export the first subtitle in each mkv file in the directory.

### Installation & setup

The project uses [pnpm](https://pnpm.io/) but you can also use `npm` or `yarn` if you update the scripts in `package.json` to not use `pnpx`.

Install and clone the repo. Then run:

```
pnpm install
```

By default subs2bank will create a database file inside the project but you should update the path to be somewhere outside of the project. Create a `.env.development.local` file and set the `DATABASE_URL` value to where you want the database file to be created. Look into the `.env.development` file to see how to set this value.

To create the database and initialize it, run:
```
pnpm p:push
pnpm p:generate
```

### Usage

To run the project, run:
```
pnpm start:dev
```

The web interface is then available at `http://localhost:3000`.

The home page has your bank of sentences. It'll be empty in the beginning.

To import content, go to `http://localhost:3000/import`. Give the import a name and enter the path to the folder where your video files & corresponding subtitle files are. They should all be in the same directory, subs2bank doesn't currently search for files recursively. All files should have Japanese & English subtitles available. The Japanese subs should be named `video-file-name.ja.srt` and for English `video-file-name.eng.srt`. The import page will list all the files found, and show in green or red whether or not each video file has subtitles. Make sure all of them are green before importing.

When all video files are shown and both Japanese & English subs show as green, go to the preview tab and go through all the files to check that everything looks good. You can preview images & audio for each sentence that will be imported. If timings are off or subtitles don't match, fix your subtitle files. subs2bank doesn't currently do any retiming or audio padding. It does filter out most non-matching subtitle lines, but sometimes some bad matches can fall through.

To start the import, click the "Start import" button at the bottom. You'll be taken to the import page where you can see the progress. Make sure not to shut down the server during this. You can close the browser tab, however, as the import isn't running in the browser but on the server instead.

Once the import is complete, you can see all its items on the same import page. The items should also be in your bank now on the home page. There you can search for sentences.
