const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const hre = require('hardhat');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('WavePortal', function () {
  // すべてのテストで同じセットアップを再利用するためにフィクスチャーを定義します。
  async function deployProjectFixture() {
    const wavePortalFactory = await ethers.getContractFactory('WavePortal');

    // コントラクトは、デフォルトで最初の署名者/アカウント（ここではowner）を使用してデプロイされます。
    const [owner, user] = await ethers.getSigners();

    const wavePortal = await wavePortalFactory.deploy();

    await wavePortal.deployed();

    // waveを2回実行する関数を定義します。
    const sendTwoWaves = async () => {
      await wavePortal.connect(owner).wave('This is wave #1');
      await wavePortal.connect(user).wave('This is wave #2');
    };

    return { wavePortal, sendTwoWaves, owner, user };
  }

  // テストケース
  describe('getTotalWaves', function () {
    it('should return total waves', async function () {
      this.timeout(60000);
      /** 準備 */
      const { wavePortal, sendTwoWaves } = await loadFixture(
        deployProjectFixture,
      );
      await sendTwoWaves();

      /** 実行 */
      const totalWaves = await wavePortal.getTotalWaves();

      /** 検証 */
      expect(totalWaves).to.equal(2);
    });
  });

  describe('getAllWaves', function () {
    it('should return all waves', async function () {
      /** 準備 */
      const { wavePortal, sendTwoWaves, owner, user } = await loadFixture(
        deployProjectFixture,
      );
      await sendTwoWaves();

      /** 実行 */
      const allWaves = await wavePortal.getAllWaves();

      /** 検証 */
      expect(allWaves[0].waver).to.equal(owner.address);
      expect(allWaves[0].message).to.equal('This is wave #1');
      expect(allWaves[0].owner_approved).to.equal(false);
      expect(allWaves[1].waver).to.equal(user.address);
      expect(allWaves[1].message).to.equal('This is wave #2');
      expect(allWaves[1].owner_approved).to.equal(false);
    });
  });

  describe('wave', function () {
    it('reverts', async function () {
      /** 準備 */
      const { wavePortal, user } = await loadFixture(deployProjectFixture);

      /** 実行 */
      await wavePortal.connect(user).wave('This is wave #1');

      /** 検証 */
      await expect(
        wavePortal.connect(user).wave('This is wave #2'),
      ).to.be.revertedWith('Wait 15m');
    });
  });

  describe('approve message', function () {
    it('should be approved by only owner.', async function () {
      /** 準備 */
      const { wavePortal, sendTwoWaves, owner, user } = await loadFixture(
        deployProjectFixture,
      );
      await sendTwoWaves();

      /** 実行 */
      const allWaves1 = await wavePortal.getAllWaves();

      /** 検証 */
      expect(allWaves1[0].owner_approved).to.equal(false);
      expect(allWaves1[1].owner_approved).to.equal(false);

      await wavePortal.connect(owner).setApproveMessage(1, true);
      const allWaves2 = await wavePortal.getAllWaves();
      expect(allWaves2[0].owner_approved).to.equal(false);
      expect(allWaves2[1].owner_approved).to.equal(true);

      await expect(
        wavePortal.connect(user).setApproveMessage(1, false)
      ).to.be.reverted;
      const allWaves3 = await wavePortal.getAllWaves();
      expect(allWaves3[0].owner_approved).to.equal(false);
      expect(allWaves3[1].owner_approved).to.equal(true);

      await wavePortal.connect(owner).setApproveMessage(1, false);
      const allWaves4 = await wavePortal.getAllWaves();
      expect(allWaves4[0].owner_approved).to.equal(false);
      expect(allWaves4[1].owner_approved).to.equal(false);

    });
  });
});