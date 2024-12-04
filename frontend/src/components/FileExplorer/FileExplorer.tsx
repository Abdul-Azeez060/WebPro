import React from "react";
import { FileStructure } from "../../types/file";
import { FileItem } from "./FileItem";

interface FileExplorerProps {
  files: FileStructure[];
  onFileSelect: (file: FileStructure) => void;
  selectedFile: FileStructure | null;
}

export function FileExplorer({
  files,
  onFileSelect,
  selectedFile,
}: FileExplorerProps) {
  return (
  <div className="h-full py-6 bg-gray-900/50 backdrop-blur-sm">
      <div className="py-2 px-4">
        {files.map((file) => (
          <FileItem
            key={file.path}
            file={file}
            depth={0}
            onSelect={onFileSelect}
            isSelected={selectedFile?.path === file.path}
          />
        ))}
      </div>
    </div>
  );
}
