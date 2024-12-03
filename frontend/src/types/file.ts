export interface FileStructure {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileStructure[];
  content?: string;
}

export interface FileState {
  files: FileStructure[];
  currentFile: FileStructure | null;
}
