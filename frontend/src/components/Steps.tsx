import { useLocation } from "react-router-dom";
import { Status, Step } from "../types/step";
import { CheckCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
export function Steps({ steps }: { steps: Step[] }) {
  const location = useLocation();
  const { prompt } = location.state || {};

  return (
    <>
      <div className="p-6 text-gray-200">
        <h2 className="text-xl font-semibold mb-4">Generation Steps</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Your Prompt</h3>
            <p className="text-gray-400">{prompt || "No prompt provided"}</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg h-[20rem] overflow-scroll">
            <h3 className="font-medium mb-2">Steps</h3>
            {steps.length != 0 ? (
              <ul className="list-decimal list-inside space-y-2 text-gray-400">
                {steps.map((step) => (
                  <p className="flex ">
                    {step.status == Status.completed ? (
                      <span className="text-green-600 mr-6 size-1">
                        <CheckCircle />
                      </span>
                    ) : (
                      <span className=" animate-spin mr-2 text-white ">
                        <Loader2 />
                      </span>
                    )}

                    {step.title}
                  </p>
                ))}
              </ul>
            ) : (
              <div className="flex justify-center items-center">
                <span className=" animate-spin">
                  <Loader2 />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
