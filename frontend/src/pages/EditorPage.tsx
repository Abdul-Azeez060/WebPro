import React, { useEffect, useState } from "react";
import { Steps } from "../components/Steps";
import { Editor } from "../components/Editor";
import { FileExplorer } from "../components/FileExplorer/FileExplorer";
// import { useFileSystem } from "../hooks/useFileSystem";
import { BACKEND_URL } from "../backend";
import axios from "axios";
import { Status, Step, StepType } from "../types/step";
import { parser, stepsParser } from "../steps";
import { useLocation } from "react-router-dom";
import { FileStructure } from "../types/file";
import { WebContainer } from "@webcontainer/api";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
export function EditorPage() {
  const location = useLocation();
  const { prompt } = location.state || {};
  const [webcontainerInstance, setwebcontainerinstance] =
    useState<WebContainer>();
  async function initWeb() {
    const webcontainerInstance = await WebContainer.boot();
    setwebcontainerinstance(webcontainerInstance);
  }
  useEffect(() => {
    initWeb();
  }, []);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileStructure[]>([]);
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [selectFile, setSelectFile] = useState<FileStructure | null>();
  const [llmMessages, setllmMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewLoader, setPreviewLoader] = useState<boolean>(true);

  async function init() {
    setLoading(true);
    setPreviewLoader(true);
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt,
    });
    // console.log("these are the prompts", response.data.prompts]);
    const messages: string[] = response.data.prompts;
    setllmMessages([...messages, prompt]);
    const steps = stepsParser(response.data.uiPrompts);
    setSteps(steps);
    setLoading(false);

    const result = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [
        ...messages,
        `  <bolt_running_commands>\n</bolt_running_commands>\n\n${prompt}\n\n# File Changes\n\nHere is a list of all files that have been modified since the start of the conversation.\nThis information serves as the true contents of these files!\n\nThe contents include either the full file contents or a diff (when changes are smaller and localized).\n\nUse it to:\n - Understand the latest file modifications\n - Ensure your suggestions build upon the most recent version of the files\n - Make informed decisions about changes\n - Ensure suggestions are compatible with existing code\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - /home/project/.bolt/config.json`,
      ],
    });
    setllmMessages((prevRes) => [...prevRes, result.data]);
    const newSteps = parser(result.data);
    setSteps((steps) => mergeSteps(steps, newSteps));
    setPreviewLoader(false);
  }

  const mergeSteps = (existingSteps: Step[], newSteps: Step[]) => {
    // Create a map of existing steps by title for quick lookup
    const stepMap = new Map(existingSteps.map((step) => [step.title, step]));

    // Add or replace steps from newSteps
    newSteps.forEach((newStep) => {
      stepMap.set(newStep.title, newStep);
    });

    // Convert map back to array
    return Array.from(stepMap.values());
  };

  useEffect(() => {
    console.log(files, "these are the files");
    // Copying the current files state into a new array to avoid mutating the original files directly
    let originalFiles = [...files];
    let updateHappened = false; // Flag to track if any updates occurred

    // Filtering steps with status 'pending' and processing each one
    steps
      .filter(({ status }) => status == Status.pending)
      .map((step) => {
        updateHappened = true; // Since a step is being processed, updates are happening
        if (step.stepType === StepType.CreateFile) {
          // Check if the step is of type "CreateFile"
          let parsedPath = step.path?.split("/") ?? []; // Split the path into parts (e.g., "/src/components/NewFile.tsx" -> ["src", "components", "NewFile.tsx"])
          let currentFileStructure = [...originalFiles]; // Create a working copy of the file structure
          let finalAnswerRef = currentFileStructure; // Maintain a reference to the top-level structure

          let currentFolder = ""; // Initialize a string to build folder paths during traversal
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`; // Build the path incrementally
            let currentFolderName = parsedPath[0]; // Get the current segment of the path
            parsedPath = parsedPath.slice(1); // Remove the processed segment from the path array

            if (!parsedPath.length) {
              // If this is the last segment, it represents the final file
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              ); // Check if the file already exists
              if (!file) {
                // If the file doesn't exist, create it
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code, // Add the content from the step
                });
              } else {
                // If the file exists, update its content
                file.content = step.code;
              }
            } else {
              // If this is not the last segment, it's a folder
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              ); // Check if the folder exists
              if (!folder) {
                // If the folder doesn't exist, create it
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [], // Folders have an empty children array initially
                });
              }
              // Move the current file structure pointer to the children of the current folder
              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }

          originalFiles = finalAnswerRef; // Update the original files structure with the new changes
        }
      });

    if (updateHappened) {
      // If any updates occurred, update the state
      setFiles(originalFiles); // Update the files state with the modified file structure
      setSteps((steps) =>
        steps.map((s) =>
          // Mark all steps as "completed"
          ({ ...s, status: Status.completed })
        )
      );
    }

    // console.log(files); // Log the updated file structure for debugging
  }, [steps, files]); // Dependencies: Runs when steps or files change

  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    if (webcontainerInstance && files.length > 0) {
      const fileStructure = {};
      getFileStructure(files, fileStructure);
      console.log(fileStructure, "this is the file structure");
      webcontainerInstance
        .mount(fileStructure)
        .then(() => console.log("Mounted file structure successfully"))
        .catch((error) => console.error("Mounting failed:", error));
    }
  }, [files, webcontainerInstance]);
  function getFileStructure(
    originalFiles: FileStructure[],
    changedFiles: Record<string, any>
  ) {
    originalFiles.forEach((x) => {
      if (x.type === "folder") {
        changedFiles[x.name] = { directory: {} };
        getFileStructure(x.children || [], changedFiles[x.name].directory);
      } else if (x.type === "file") {
        changedFiles[x.name] = { file: { contents: x.content } };
      }
    });
  }

  return (
    <div className="h-screen bg-gray-900 flex">
      <div className="w-[30%] border-r border-gray-700 flex flex-col justify-between">
        <Steps steps={steps} />
        <div className="grid w-full gap-2">
          <Textarea
            placeholder="Type your prompt here."
            className=" bg-gray-800 text-gray-400"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          />
          <Button
            className="bg-blue-600 hover:bg-blue-800"
            onClick={async () => {
              setLoading(true);
              console.log("button clicked");
              const result = await axios.post(`${BACKEND_URL}/chat`, {
                messages: [...llmMessages, userPrompt],
              });
              setUserPrompt("");
              const newParsedSteps = parser(result.data);
              setllmMessages((prev) => [...prev, result.data]);
              setSteps((steps) => mergeSteps(steps, newParsedSteps));
              setLoading(false);
            }}
            defaultChecked={loading ? false : true}
            disabled={loading}>
            {loading ? (
              <div className="animate-spin">
                <Loader2 />
              </div>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </div>
      <div className="flex-1 flex">
        <div className="w-[25%] border-l border-gray-700">
          <FileExplorer
            files={files}
            onFileSelect={setSelectFile}
            selectedFile={selectFile || null}
          />
        </div>
        <div className="flex-1 p-6">
          <Editor
            currentFile={selectFile!}
            webcontainer={webcontainerInstance!}
            files={files}
            previewLoader={previewLoader}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
