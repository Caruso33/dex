import { HardhatRuntimeEnvironment } from "hardhat/types";

async function listenEvents(taskArgs: any, hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;

  const { exchange: exchangeAddress } = taskArgs;

  const accounts = await ethers.getSigners();
  const sender = accounts[0];

  const Exchange = hre.artifacts.readArtifactSync("Exchange");

  const exchange = await new ethers.Contract(
    exchangeAddress,
    Exchange.abi,
    sender
  );

  console.log("Listening to events...");

  const fromBlock = "earliest";
  const lastBlock = "latest";
  console.log("Setting query filters on:\n");

  console.log("Querying for the event name MakeOrderEvent");
  const eventFilterMakeOrderEvent = exchange.filters.MakeOrderEvent();

  exchange
    .queryFilter(eventFilterMakeOrderEvent, fromBlock, lastBlock)
    .then((events) => {
      events.forEach((event) => {
        console.log("Event:");
        console.log(event);

        const data = event.data;
        const topics = event.topics;

        console.log("Packed data:");
        console.log(data);

        console.log("Packed topics:");
        console.log(topics);

        const parsedEvent = exchange.interface.parseLog({
          topics: topics,
          data: data,
        });

        console.log("Parsed Event using interface:");
        console.log({ parsedEvent });
      });
    });
  console.log("Querying for the event name MakeOrderEvent");

  ethers.provider.on("MakeOrderEvents", (event) => {
    console.log(event);
  });
}

export default listenEvents;
