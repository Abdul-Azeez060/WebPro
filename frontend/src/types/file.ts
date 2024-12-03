export interface FileStructure {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileStructure[];
  content?: string;
}

export interface SelectedFile {
  currentFile: FileStructure | null;
}
