const { Context } = require('fabric-contract-api');
const { ExpiringStandaloneValueAsset, types } = require('../assets');
const { ExpiringAssetBase } = require('.');
const { currencies } = require('../currencies');
const utils = require('../utils');

/**
 * ExpiringStandaloneValueAssetBase class
 * Base class for expiring standalone value asset contracts
 */
class ExpiringStandaloneValueAssetBase extends ExpiringAssetBase {
  /**
   * Formats the asset record into an ExpiringStandaloneValueAsset object
   *
   * @param {Context} ctx - The transaction context
   * @param {Object} assetRecord - The asset record to format
   * @returns {ExpiringStandaloneValueAsset|undefined} - The formatted asset object or undefined if not spendable
   * @throws {Error} - If the asset record is invalid or cannot be formatted
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
      return new ExpiringStandaloneValueAsset(
        assetKey,
        chainAsset.owner,
        chainAsset.type,
        parseInt(chainAsset.amount, 10),
        chainAsset.currency,
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
      !Object.prototype.hasOwnProperty.call(asset, 'currency') ||
      !Object.prototype.hasOwnProperty.call(asset, 'amount')
    ) {
      throw new Error('asset invalid due to lack of required fields');
    }
    if (!(asset.currency in currencies)) {
      throw new Error('asset currency invalid');
    }
    if (asset.amount <= 0) {
      throw new Error('asset amount must be a positive integer.');
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
   * Asserts the mint conditions for creating an asset
   *
   * @param {Object} asset - The asset object
   * @param {number} txTimeSeconds - The transaction time in seconds
   * @throws {Error} - If the mint conditions are not met
   */
  _assertMintConditions(asset, txTimeSeconds) {
    if (asset.amount <= 0) {
      throw new Error('mint amount must be a positive integer');
    }
    if (!(asset.currency in currencies)) {
      throw new Error('asset currency invalid');
    }
    if (asset.enforcementDate <= 0) {
      throw new Error('mint enforcement date must be a positive integer');
    }
    if (asset.enforcementDate > asset.expirationDate) {
      throw new Error('be real. enforcement date cannot be bigger then expiration date');
    }
    if (asset.expirationDate < txTimeSeconds) {
      throw new Error('There is no point in creating already expired asset!');
    }
  }
}

module.exports = {
  ExpiringStandaloneValueAssetBase,
};
