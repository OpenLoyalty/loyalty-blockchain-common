const { Context } = require('fabric-contract-api');
const { ExpiringStandaloneUtilityAsset, types } = require('../assets');
const { ExpiringAssetBase } = require('.');
const utils = require('../utils');

class ExpiringStandaloneUtilityAssetBase extends ExpiringAssetBase {
  /**
   * Formats the asset record into an ExpiringStandaloneUtilityAsset object
   *
   * @param {Context} ctx - The transaction context
   * @param {Object} assetRecord - The asset record to format
   * @returns {ExpiringStandaloneUtilityAsset|undefined} - The formatted asset object or undefined if not spendable
   */
  _formatAsset(ctx, assetRecord) {
    const txTimeSeconds = utils.getTxTimestampSeconds(ctx);
    const { objectType, attributes } = ctx.stub.splitCompositeKey(assetRecord.value.key);

    console.log(`objectType: ${objectType} attributes: ${attributes}`);
    if (attributes.length !== 1) {
      console.log('expected composite key with one part (assetKey)');
      return;
    }
    const assetKey = attributes[0];

    if (assetRecord.value.value.isNull) {
      throw new Error(`asset ${assetKey} has no value`);
    }

    const chainAssetString = Buffer.from(assetRecord.value.value.toString()).toString('utf8');
    let chainAsset;
    try {
      chainAsset = JSON.parse(chainAssetString);
    } catch (err) {
      throw new Error(`failed to parse value of ${assetKey} composite key ${err}`);
    }
    if (this._isAssetSpendable(chainAsset, txTimeSeconds)) {
      return new ExpiringStandaloneUtilityAsset(
        assetKey,
        chainAsset.owner,
        chainAsset.type,
        chainAsset.utility,
        chainAsset.remainingUses,
        parseInt(chainAsset.enforcementDate, 10),
        parseInt(chainAsset.expirationDate, 10),
        chainAsset.metadata || {},
        chainAsset.state || types.AssetState.LIQUID
      );
    }
  }

  /**
   * Asserts the validity of an asset
   *
   * @param {Object} asset - The asset object
   * @param {number} txTimeSeconds - The transaction time in seconds
   * @throws {Error} - If the asset is invalid or expired
   */
  _assertAssetValid(asset, txTimeSeconds) {
    if (
      !Object.prototype.hasOwnProperty.call(asset, 'enforcementDate') ||
      !Object.prototype.hasOwnProperty.call(asset, 'expirationDate') ||
      !Object.prototype.hasOwnProperty.call(asset, 'owner') ||
      !Object.prototype.hasOwnProperty.call(asset, 'remainingUses') ||
      !Object.prototype.hasOwnProperty.call(asset, 'utility')
    ) {
      throw new Error('asset invalid due to lack of required fields');
    }
    if (asset.remainingUses <= 0) {
      throw new Error('no uses remaining for the asset');
    }
    if (asset.enforcementDate > txTimeSeconds) {
      throw new Error(
        `asset ${asset.key} is not enforced yet (enforcement timestamp: ${asset.enforcementDate} txTimestamp: ${txTimeSeconds})`
      );
    }
    if (asset.expirationDate < txTimeSeconds) {
      throw new Error(
        `asset ${asset.key} has expired (expiration timestamp: ${asset.expirationDate} txTimestamp: ${txTimeSeconds})`
      );
    }
  }

  /**
   * Asserts the conditions for minting an asset
   *
   * @param {Object} asset - The asset object
   * @param {number} txTimeSeconds - The transaction time in seconds
   * @throws {Error} - If the mint conditions are not met
   */
  _assertMintConditions(asset, txTimeSeconds) {
    if (asset.remainingUses <= 0) {
      throw new Error('mint remainingUses must be a positive integer');
    }
    if (asset.enforcementDate <= 0) {
      throw new Error('mint enforcement date must be a positive integer');
    }
    if (asset.enforcementDate > asset.expirationDate) {
      throw new Error('be real. enforcement date cannot be bigger than the expiration date');
    }
    if (asset.expirationDate < txTimeSeconds) {
      throw new Error('There is no point in creating an already expired asset!');
    }
  }
}

module.exports = {
  ExpiringStandaloneUtilityAssetBase,
};
