require("dotenv").config();
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({});

async function main() {
  console.log("my main is running");
  try {
    await client.messages
      .stream({
        messages: [{ role: "user", content: "Hello" }],
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
      })
      .on("text", (text) => {
        console.log(text);
      });

    console.log("this is the message");
  } catch (error) {
    console.log("this is the error", error);
  }
}

main();
