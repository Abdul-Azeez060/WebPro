import { useState } from "react";
import { FileStructure, FileState } from "../types/file";

const initialFiles: FileStructure[] = [
  {
    name: "src",
    path: "/src",
    type: "folder",
    children: [
      {
        name: "App.tsx",
        path: "/src/App.tsx",
        type: "file",
        content: `import React from 'react';\n// App component code...`,
      },
      {
        name: "components",
        path: "/src/components",
        type: "folder",
        children: [
          {
            name: "Button.tsx",
            path: "/src/components/Button.tsx",
            type: "file",
            content: `import React from 'react';\n// Button component code...`,
          },
        ],
      },
    ],
  },
  {
    name: "package.json",
    path: "/package.json",
    type: "file",
    content: `{\n  "name": "my-project",\n  "version": "1.0.0"\n}`,
  },
];

export function useFileSystem() {
  const [fileState, setFileState] = useState<FileState>({
    files: initialFiles,
    currentFile: null,
  });

  const selectFile = (file: FileStructure) => {
    if (file.type === "file") {
      setFileState((prev) => ({
        ...prev,
        currentFile: file,
      }));
    }
  };

  return {
    files: fileState.files,
    currentFile: fileState.currentFile,
    selectFile,
  };
}
