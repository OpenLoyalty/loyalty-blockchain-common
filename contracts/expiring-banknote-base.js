const { Context } = require('fabric-contract-api');
const { ExpiringBanknote, types } = require('../assets');
const { ExpiringAssetBase } = require('.');
const utils = require('../utils');

/**
 * ExpiringBanknoteBase class
 * Base class for expiring banknote assets contract
 */
class ExpiringBanknoteBase extends ExpiringAssetBase {
  /**
   * _formatAsset formats the asset record into an ExpiringBanknote object
   *
   * @param {Context} ctx - The transaction context
   * @param {Object} assetRecord - The asset record to format
   * @returns {ExpiringBanknote|undefined} - The formatted asset object or undefined if not spendable
   */
  _formatAsset(ctx, assetRecord) {
    const txTimeSeconds = utils.getTxTimestampSeconds(ctx);
    const { attributes } = ctx.stub.splitCompositeKey(assetRecord.value.key);

    if (attributes.length !== 1) {
      console.log('expected composite key with one part (utxoKey)');
      return;
    }
    const utxoKey = attributes[0];

    if (assetRecord.value.value.isNull) {
      throw new Error(`utxo ${utxoKey} has no value`);
    }

    const chainUtxoString = Buffer.from(assetRecord.value.value.toString()).toString('utf8');
    let chainUtxo;
    try {
      chainUtxo = JSON.parse(chainUtxoString);
    } catch (err) {
      throw new Error(`failed to parse value of ${utxoKey} composite key ${err}`);
    }
    if (this._isAssetSpendable(chainUtxo, txTimeSeconds)) {
      return new ExpiringBanknote(
        utxoKey,
        chainUtxo.owner,
        parseInt(chainUtxo.amount, 10),
        parseInt(chainUtxo.enforcementDate, 10),
        parseInt(chainUtxo.expirationDate, 10),
        chainUtxo.metadata || {},
        chainUtxo.state || types.AssetState.LIQUID
      );
    }
  }

  /**
   * _prepareInputs prepares the inputs for a transaction
   *
   * @param {Context} ctx - The transaction context
   * @param {String} clientId - The client ID
   * @param {number} amount - The amount of assets to prepare
   * @param {number} txTimeSeconds - The transaction time in seconds
   * @returns {Object} - The prepared inputs
   */
  async _prepareInputs(ctx, clientId, amount, txTimeSeconds) {
    // TODO:
    // Thing is we create utxo Bob_90, Bob_5 and Alice_5 (change).
    // This is because implementation arbitrarily splits last input while it could check if split part
    // also matches previously created utxo and could be added there (in terms of expiration/enforcement dates)

    const clientUtxoIterator = await this._queryAssetsByExpirationDate(ctx, clientId, txTimeSeconds, txTimeSeconds);

    let clientUtxo = await clientUtxoIterator.next();
    let totalAmount = 0;
    const spentUtxos = [];
    let utxoToSplit = null;
    while (totalAmount < amount && !clientUtxo.done) {
      clientUtxo = this._formatAsset(ctx, clientUtxo);
      this._assertAssetSpendable(clientUtxo, txTimeSeconds);
      totalAmount += parseInt(clientUtxo.amount, 10);
      if (totalAmount > amount) {
        utxoToSplit = clientUtxo;
        break;
      }
      spentUtxos.push(clientUtxo);
      if (totalAmount === amount) {
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      clientUtxo = await clientUtxoIterator.next();
    }
    return { spentUtxos, utxoToSplit, totalAmount };
  }

  /**
   * _retrieveAssetByKey retrieves an asset by its key
   *
   * @param {Context} ctx - The transaction context
   * @param {String} assetKey - The asset key
   * @returns {ExpiringBanknote} - The retrieved asset object
   * @throws {Error} - If the asset is not found or invalid
   */
  async _retrieveAssetByKey(ctx, assetKey) {
    const utxoInputCompositeKey = ctx.stub.createCompositeKey(types.AssetType.UTXO.toString(), [assetKey]);

    // validate that client has an utxo matching the input key
    const utxoInputPropertiesJson = await ctx.stub.getState(utxoInputCompositeKey); // get the asset from chaincode state
    if (!utxoInputPropertiesJson || utxoInputPropertiesJson.length === 0) {
      throw new Error(`utxoInput ${assetKey} not found`);
    }
    const utxoInputPropertiesObject = JSON.parse(utxoInputPropertiesJson);

    return new ExpiringBanknote(
      assetKey,
      utxoInputPropertiesObject.owner,
      parseInt(utxoInputPropertiesObject.amount, 10),
      parseInt(utxoInputPropertiesObject.enforcementDate, 10),
      parseInt(utxoInputPropertiesObject.expirationDate, 10),
      utxoInputPropertiesObject.metadata || {},
      utxoInputPropertiesObject.state || types.AssetState.LIQUID
    );
  }

  /**
   * _assertAssetValid asserts the validity of an asset
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
      !Object.prototype.hasOwnProperty.call(asset, 'amount')
    ) {
      throw new Error('asset invalid due to lack of required fields');
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
   * _assertMintConditions asserts the conditions for minting an asset
   *
   * @param {Object} asset - The asset object
   * @param {number} txTimeSeconds - The transaction time in seconds
   * @throws {Error} - If the mint conditions are not met
   */
  _assertMintConditions(asset, txTimeSeconds) {
    if (asset.amount <= 0) {
      throw new Error('mint amount must be a positive integer');
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
  ExpiringBanknoteBase,
};
