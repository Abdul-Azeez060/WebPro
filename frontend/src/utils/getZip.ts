import JSZip from "jszip";
import { saveAs } from "file-saver";
export const downloadProjectAsZip = (files: Array<any>) => {
  // Create a new JSZip instance
  const zip = new JSZip();
  // Add each file to the ZIP, respecting folder structure
  files.forEach((file) => {
    // Remove leading '/' and handle folder structure
    const normalizedPath = file.path.startsWith("/")
      ? file.path.substring(1)
      : file.path;

    // If it's a folder or requires folder creation, split the path
    const pathParts = normalizedPath.split("/");
    const fileName = pathParts.pop(); // Last part is the filename

    // Reconstruct folder path
    let currentFolder = zip;
    for (let i = 0; i < pathParts.length; i++) {
      currentFolder = currentFolder.folder(pathParts[i])!;
    }

    // Add file to the correct folder
    if (fileName) {
      currentFolder.file(fileName, file.content);
    }
  });
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
