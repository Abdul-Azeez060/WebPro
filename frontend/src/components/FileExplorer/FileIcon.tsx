import React from "react";
import { File, Folder } from "lucide-react";

interface FileIconProps {
  type: "file" | "folder";
}

export function FileIcon({ type }: FileIconProps) {
  return type === "file" ? (
    <File size={16} className="text-gray-400" />
  ) : (
    <Folder size={16} className="text-blue-400" />
  );
}
