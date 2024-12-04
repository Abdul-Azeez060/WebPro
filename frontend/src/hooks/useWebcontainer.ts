import { WebContainer } from "@webcontainer/api";
import { useState, useEffect } from "react";

export function useWebcontainers() {
  const [webcontainer, setWebcontainer] = useState<WebContainer>();
  async function main() {
    const webcontainerInstance = await WebContainer.boot();
    setWebcontainer(webcontainerInstance);
    return webcontainer;
  }
  useEffect(() => {
    main();
  }, []);
}
