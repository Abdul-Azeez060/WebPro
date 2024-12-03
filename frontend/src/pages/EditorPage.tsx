import React, { useEffect, useState } from "react";
import { Steps } from "../components/Steps";
import { Editor } from "../components/Editor";
import { FileExplorer } from "../components/FileExplorer/FileExplorer";
import { useFileSystem } from "../hooks/useFileSystem";
import { BACKEND_URL } from "../backend";
import axios from "axios";
import { Step } from "../types/step";
import { stepsParser } from "../steps";
import { useLocation } from "react-router-dom";

export function EditorPage() {
  const location = useLocation();
  const { prompt } = location.state || {};
  const { files, currentFile, selectFile } = useFileSystem();
  const [steps, useSteps] = useState<Step[]>([]);

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt,
    });
    console.log("these are the prompts", response.data.prompts);
    const messages = response.data.prompts;

    console.log("these are the uiprompts", response.data.uiPrompts);
    const steps = stepsParser(response.data.uiPrompts);
    useSteps(steps);

    // axios.post(`${BACKEND_URL}/chat`, {
    //   messages: [...messages, `<bolt_running_commands>\n</bolt_running_commands>\n\n${prompt}\n\n# File Changes\n\nHere is a list of all files that have been modified since the start of the conversation.\nThis information serves as the true contents of these files!\n\nThe contents include either the full file contents or a diff (when changes are smaller and localized).\n\nUse it to:\n - Understand the latest file modifications\n - Ensure your suggestions build upon the most recent version of the files\n - Make informed decisions about changes\n - Ensure suggestions are compatible with existing code\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - /home/project/.bolt/config.json`],
    // }).then(res => console.log(res)).catch(err => console.log(err))
  }
  useEffect(() => {}, [steps]);

  useEffect(() => {
    init();
  }, []);

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
            onFileSelect={selectFile}
            selectedFile={currentFile}
          />
        </div>
        <div className="flex-1 p-6">
          <Editor currentFile={currentFile} />
        </div>
      </div>
    </div>
  );
}
