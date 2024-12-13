import React from "react";
import { FileStructure } from "../../types/file";
import { FileIcon } from "./FileIcon";

interface FileItemProps {
  file: FileStructure;
  depth: number;
  onSelect: (file: FileStructure) => void;
  isSelected: boolean;
}

export function FileItem({ file, depth, onSelect, isSelected }: FileItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = () => {
    if (file.type === "folder") {
      setIsOpen(!isOpen);
    } else {
      onSelect(file);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center px-4 py-1 cursor-pointer hover:bg-gray-800 ${
          isSelected ? "bg-gray-800" : ""
        }`}
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={handleClick}>
        <FileIcon type={file.type} />
        <span className="ml-2 text-gray-300 text-sm">{file.name}</span>
      </div>
      {file.type === "folder" &&
        isOpen &&
        file.children?.map((child) => (
          <FileItem
            key={child.path}
            file={child}
            depth={depth + 1}
            onSelect={onSelect}
            isSelected={false}
          />
        ))}
    </div>
  );
}
