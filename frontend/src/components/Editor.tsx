import React, { useState, useCallback, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { FileText, Play } from "lucide-react";
import { Button } from "./Button";
import { FileStructure } from "../types/file";
import { WebContainer } from "@webcontainer/api";

interface EditorProps {
  currentFile: FileStructure | null;
  webcontainer: WebContainer;
}

export function Editor({ currentFile, webcontainer }: EditorProps) {
  const [view, setView] = useState<"code" | "preview">("code");
  const [url, setUrl] = useState("");
  const [code, setCode] = useState<string>(
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
  const startDevServer = useCallback(async () => {
    console.log("webcontainer is present, spawning the process npm i ");
    const installProcess = await webcontainer?.spawn("npm", ["install"]);
    console.log("installed all the dependencies");
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      })
    );
    await installProcess.exit;
    console.log("running npm run dev");
    await webcontainer.spawn("npm", ["run", "dev"]);
    console.log("ran npm run dev, starting the server");

    // Wait for `server-ready` event
    webcontainer.on("server-ready", (port, url) => {
      // ...
      console.log(url);
      console.log(port);
      setUrl(url);
    });
  }, [webcontainer]);

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
          onClick={() => {
            console.log("clicked the preview buttono");
            startDevServer()
              .then(() => console.log("server startede successfull"))
              .catch(() =>
                console.log("there was an error in starting the server")
              );
            console.log("successful set the state to preview");
            setView("preview");
          }}
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
          <div
            style={{
              width: "100%",
              height: "500px",
              border: "1px solid #ccc",
            }}>
            {url ? (
              <iframe
                src={url}
                width="100%"
                height="100%"
                title="Webcontainer API Content"
              />
            ) : (
              <p>Loading...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
