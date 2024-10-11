import { Indexer } from "./services/Indexer";

async function main() {
  const indexer = new Indexer();

  process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await indexer.stop();
    process.exit(0);
  });

  await indexer.run();
}

main().catch((error) => {
  console.error("Error in main function:", error);
  process.exit(1);
});
