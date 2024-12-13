import React, { useState, useCallback, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { FileText, Loader2, Play } from "lucide-react";
import { Button } from "./Button";
import { FileStructure } from "../types/file";
import { WebContainer } from "@webcontainer/api";
import { downloadProjectAsZip } from "@/utils/getZip";

interface EditorProps {
  currentFile: FileStructure | null;
  webcontainer: WebContainer;
  files: FileStructure[];
  previewLoader: boolean;
  loading: boolean;
}

export function Editor({
  currentFile,
  webcontainer,
  files,
  previewLoader,
  loading,
}: EditorProps) {
  const [view, setView] = useState<"code" | "preview">("code");
  const [url, setUrl] = useState("");
  const [outputMessage, setOutputMessage] = useState("");
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
    try {
      setOutputMessage("installing all the dependencies");
      const installProcess = await webcontainer?.spawn("npm", ["install"]);
      installProcess?.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
            setOutputMessage(data);
          },
        })
      );
      setOutputMessage("Installed all the dependicies");
      await installProcess?.exit;
      setOutputMessage("running the dev script");
      await webcontainer?.spawn("npm", ["run", "dev"]);

      // Wait for `server-ready` event
      webcontainer?.on("server-ready", (port, url) => {
        // ...
        setUrl(url);
      });
    } catch (error) {
      console.log(error, "in starting the webcontainer");
    }
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
          disabled={previewLoader || loading}
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
          {previewLoader || loading ? (
            <span className="animate-spin">
              <Loader2 />
            </span>
          ) : (
            <span>
              <Play size={16} /> Preview
            </span>
          )}
        </Button>
        <Button
          variant="primary"
          onClick={() => downloadProjectAsZip(files)}
          disabled={previewLoader || loading}
          className="flex items-center gap-2">
          {previewLoader || loading ? (
            <span className=" animate-spin">
              <Loader2 />
            </span>
          ) : (
            <span>Download zip</span>
          )}
        </Button>
      </div>

      <div className="flex-1 relative">
        {view === "code" ? (
          <div className="absolute inset-0">
            <MonacoEditor
              height="100%"
              language={currentFile ? getLanguage(currentFile.path) : "txt"}
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
                renderValidationDecorations: "off",
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
              height: "100%",
              backgroundColor: "#111111",
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
              <div className="flex justify-center items-center">
                <div className="text-gray-50 animate-spin p-2">
                  <Loader2 />
                </div>

                <p className="text-gray-50 text-3xl">
                  {outputMessage} if this takes more time please retry with a
                  new prompt
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
