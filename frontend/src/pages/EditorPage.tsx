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
import { PreviewFrame } from "../components/FileExplorer/PreviewFile";

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
  // const { files, currentFile, selectFile } = useFileSystem();
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileStructure[]>([]);
  const [selectFile, setSelectFile] = useState<FileStructure | null>();
  const [currentFile, setCurrentFile] = useState<FileStructure | null>();
  const [newFileStructure, setNewFileStructure] = useState({});

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt,
    });
    // console.log("these are the prompts", response.data.prompts);
    const messages = response.data.prompts;

    const steps = stepsParser(response.data.uiPrompts);
    setSteps(steps);

    const result = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [
        ...messages,
        `  <bolt_running_commands>\n</bolt_running_commands>\n\n${prompt}\n\n# File Changes\n\nHere is a list of all files that have been modified since the start of the conversation.\nThis information serves as the true contents of these files!\n\nThe contents include either the full file contents or a diff (when changes are smaller and localized).\n\nUse it to:\n - Understand the latest file modifications\n - Ensure your suggestions build upon the most recent version of the files\n - Make informed decisions about changes\n - Ensure suggestions are compatible with existing code\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - /home/project/.bolt/config.json`,
      ],
    });
    console.log(result.data, "this is the data from the result");
    const newSteps = parser(result.data);
    console.log(newSteps, "these are the new steps");
    // console.log(newSteps, "these are the new steps");
    setSteps((steps) => [...steps, ...newSteps]);
    console.log(steps, "these are updated steps");
  }
  useEffect(() => {
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

  if (steps.length == 0) {
    return <div>Loading</div>;
  }
  return (
    <div className="h-screen bg-gray-900 flex">
      <div className="w-[40%] border-r border-gray-700">
        <Steps steps={steps} />
      </div>
      <div className="flex-1 flex">
        <div className="w-[20%] border-l border-gray-700">
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
          />
        </div>
      </div>
    </div>
  );
}
