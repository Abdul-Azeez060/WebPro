import JSZip, { file } from "jszip";
import { saveAs } from "file-saver";
export const downloadProjectAsZip = (files: Array<any>) => {
  console.log("download the zip");
  // Create a new JSZip instance
  const zip = new JSZip();
  createZipFolder(files, zip);

  // Generate the ZIP file
  zip
    .generateAsync({ type: "blob" })
    .then((content) => {
      // Use FileSaver to download the ZIP
      saveAs(content, "webPro.zip");
    })
    .catch((error) => {
      console.error("Error creating ZIP file:", error);
    });
};

// const files = [
//   {content:"<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Vite + React + TS</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>"
//     name:"index.html"
//     path : "/idex.html"
//     type: "file"
//   },
//   {
//     children:(3)[{…}, {…}, {…}]
//     name:"src"
//     path:"/src"
//     type:"folder"}
// ]

function createZipFolder(files: Array<any>, zip: JSZip) {
  files.forEach((file) => {
    if (file.type == "file") {
      zip.file(file.name, file.content);
    } else {
      let newZipInstance = zip.folder(file.name);
      createZipFolder(file.children, newZipInstance || zip);
    }
  });
}
