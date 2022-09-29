import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer, feeAccount } = await getNamedAccounts();

  // const Token = hre.artifacts.readArtifactSync("Token");
  // const Token = await deployments.get("Token");

  console.log({ deployer, feeAccount });

  const feePercentage = 10;

  await deploy("Exchange", {
    from: deployer,
    args: [feeAccount, feePercentage],
    log: true,
  });
};
export default func;

func.tags = ["Exchange"];
func.dependencies = ["Token"];
