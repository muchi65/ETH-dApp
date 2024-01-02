const main = async () => {
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
  const [owner, user] = await ethers.getSigners();
  const waveContract = await waveContractFactory.deploy();
  await waveContract.deployed();
  console.log('Contract deployed to: ', waveContract.address);

  /*
   * 2回 waves を送るシミュレーションを行う
   */
  const waveTxn = await waveContract.connect(owner).wave('This is wave #1');
  await waveTxn.wait();
  
  const waveTxn2 = await waveContract.connect(user).wave('This is wave #2');
  await waveTxn2.wait();

  const waveTxn3 = await waveContract.setApproveMessage(1,true);
  await waveTxn3.wait();

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();