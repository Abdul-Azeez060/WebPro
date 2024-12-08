import React, { useState, useCallback, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { FileText, Play } from "lucide-react";
import { Button } from "./Button";
import { FileStructure } from "../types/file";
import axios from "axios";
import { BACKEND_URL } from "../backend";
import { useLocation } from "react-router-dom";

interface EditorProps {
  currentFile: FileStructure | null;
}

export function Editor({ currentFile }: EditorProps) {
  const location = useLocation();
  const { prompt } = location.state || {};
  const [view, setView] = useState<"code" | "preview">("code");
  const [code, setCode] = useState(
    currentFile?.content || "// Select a file to edit"
  );
  const [isEditorReady, setIsEditorReady] = useState(false);

  React.useEffect(() => {
    if (currentFile?.content) {
      setCode(currentFile.content);
    }
  }, [currentFile]);

  const handleEditorDidMount = useCallback(() => {
    setIsEditorReady(true);
  }, []);

  const getLanguage = useCallback((filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
        return "javascript";
      case "ts":
        return "typescript";
      case "tsx":
        return "typescript";
      case "jsx":
        return "javascript";
      case "json":
        return "json";
      case "css":
        return "css";
      case "html":
        return "html";
      default:
        return "typescript";
    }
  }, []);

  useEffect(() => {
    let messages = [];
    const response = axios
      .post(`${BACKEND_URL}/template`, {
        prompt,
      })
      .then((res) => (messages = res.data.prompts))
      .catch((err) => console.log(err));

    axios.post(`${BACKEND_URL}/chat`, {
      messages: [],
    });
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
      <div className="border-b border-gray-700 p-4 flex gap-4">
        <Button
          variant={view === "code" ? "primary" : "secondary"}
          onClick={() => setView("code")}
          className="flex items-center gap-2">
          <FileText size={16} />
          Code
        </Button>
        <Button
          variant={view === "preview" ? "primary" : "secondary"}
          onClick={() => setView("preview")}
          className="flex items-center gap-2">
          <Play size={16} />
          Preview
        </Button>
      </div>

      <div className="flex-1 relative">
        {view === "code" ? (
          <div className="absolute inset-0">
            <MonacoEditor
              height="100%"
              defaultLanguage="typescript"
              language={
                currentFile ? getLanguage(currentFile.path) : "typescript"
              }
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 2,
                wordWrap: "on",
              }}
              path={currentFile?.path}
              loading={
                <div className="flex items-center justify-center h-full text-gray-400">
                  Loading editor...
                </div>
              }
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-white">
            <iframe
              title="Preview"
              srcDoc={code}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
