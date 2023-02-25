const { Contract, Context } = require('fabric-contract-api');
const { Iterators } = require('fabric-shim-api');
const { types } = require('../assets');
const utils = require('../utils');

/**
 * ExpiringAssetBase class
 * Base class for expiring assets contract
 */
class ExpiringAssetBase extends Contract {
  /**
   * Sanity check function to verify that chaincode is reachable and operational
   *
   * @param {Context} ctx - The transaction context
   * @returns {String} - Pong
   */
  // eslint-disable-next-line no-unused-vars
  async Ping(ctx) {
    return JSON.stringify({ Ping: 'Pong' });
  }

  /**
   * GetBalance returns the current available balance of an asset if owned by the calling user
   *
   * @param {Context} ctx - The transaction context
   * @param {String} assetId - The queried asset ID
   * @param {number} verbosity - The verbosity level that influences the return value:
   *                            - (0) returns just the available balance
   *                            - (1) returns the balance split by expiration date
   *                            - (2) returns the balance split by enforcement and expiration dates
   * @returns {number} - The balance of the asset
   */
  async GetBalance(ctx, assetId, verbosity) {
    // Validate the verbosity level
    if (verbosity > 2 || verbosity < 0) {
      throw new Error('verbosity levels supported: <0,2>');
    }
    // TODO: Implement verbosity
    const clientID = this._getClientID(ctx);
    const txTimeSeconds = utils.getTxTimestampSeconds(ctx);

    // Query assets by expiration date
    const clientAssetsIterator = await this._queryAssetsByExpirationDate(ctx, clientID, txTimeSeconds);

    let clientAsset = await clientAssetsIterator.next();
    let balance = 0;

    while (!clientAsset.done) {
      clientAsset = this._formatAsset(ctx, clientAsset);
      this._assertAssetSpendable(clientAsset, txTimeSeconds);
      balance += parseInt(clientAsset.amount, 10);

      // eslint-disable-next-line no-await-in-loop
      clientAsset = await clientAssetsIterator.next();
    }

    return JSON.stringify({ balance });
  }

  /**
   * _queryAssetsByExpirationDate returns the wallet's UTXOs in the order defined by expiration date (ascending)
   *
   * @param {Context} ctx - The transaction context
   * @param {String} clientID - The user ID (base64 encoded clientId aka X509 certificate)
   * @param {number} maxTxTimeSeconds - The maximum transaction time in seconds
   * @param {number} minTxTimeSeconds - The minimum transaction time in seconds
   * @returns {Promise<Iterators.StateQueryIterator>} - The query result iterator
   */
  async _queryAssetsByExpirationDate(ctx, clientID, maxTxTimeSeconds, minTxTimeSeconds) {
    const query = {
      selector: {
        enforcementDate: { $lt: maxTxTimeSeconds },
        expirationDate: { $gt: minTxTimeSeconds },
        state: { $eq: types.AssetState.LIQUID },
        owner: { $eq: clientID },
      },
      use_index: '_design/smart-index',
    };

    return ctx.stub.getQueryResult(JSON.stringify(query));
  }

  /**
   * _getClientRole returns the client's role
   *
   * @param {Context} ctx - The transaction context
   * @returns {string} - The client's role
   */
  _getClientRole(ctx) {
    return ctx.clientIdentity.getAttributeValue('role').toString();
  }

  /**
   * _getClientID returns the client's ID
   *
   * @param {Context} ctx - The transaction context
   * @returns {string} - The client's ID
   */
  _getClientID(ctx) {
    return ctx.clientIdentity.getAttributeValue('userUuid').toString();
  }

  /**
   * _formatAsset requires reimplementation in child class!
   *
   * @param {Context} ctx - The transaction context
   * @param {Object} assetRecord - The asset record to format
   * @throws {Error} - Function requires reimplementation in child class
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _formatAsset(ctx, assetRecord) {
    throw new Error('function _formatAsset requires reimplementation in child class!');
  }

  /**
   * _retrieveAssetByKey requires reimplementation in child class!
   *
   * @param {Context} ctx - The transaction context
   * @param {String} assetKey - The asset key
   * @throws {Error} - Function requires reimplementation in child class
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async _retrieveAssetByKey(ctx, assetKey) {
    throw new Error('function _retrieveAssetByKey requires reimplementation in child class!');
  }

  /**
   * _assertSignerIsAdmin asserts that the (signer) of the transaction is an admin
   *
   * @param {Context} ctx - The transaction context
   * @throws {Error} - Access forbidden if user is not an admin
   */
  _assertSignerIsAdmin(ctx) {
    const clientRole = this._getClientRole(ctx);
    if (clientRole !== 'admin') {
      throw new Error(`Access forbidden. User ${this._getClientID(ctx)} role is ${clientRole}. Required role: admin`);
    }
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
      !Object.prototype.hasOwnProperty.call(asset, 'owner')
    ) {
      throw new Error('asset invalid due to lack of required fields');
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
   * _assertAssetSpendable asserts that an asset is spendable
   *
   * @param {Object} asset - The asset object
   * @param {number} txTimeSeconds - The transaction time inHere's the continuation of the code documentation with the ESLint comments removed:

```javascript
  /**
   * _assertAssetSpendable asserts that an asset is spendable
   *
   * @param {Object} asset - The asset object
   * @param {number} txTimeSeconds - The transaction time in seconds
   * @throws {Error} - If the asset is not spendable
   */
  _assertAssetSpendable(asset, txTimeSeconds) {
    this._assertAssetValid(asset, txTimeSeconds);
    if (!Object.prototype.hasOwnProperty.call(asset, 'state')) {
      throw new Error('asset non-spendable due to lack of required fields');
    }
    if (asset.state !== types.AssetState.LIQUID) {
      throw new Error(`asset to be spent needs to be in state: ${types.AssetState.LIQUID} but it is: ${asset.state}`);
    }
  }

  /**
   * _isAssetSpendable checks if an asset is spendable
   *
   * @param {Object} asset - The asset object
   * @param {number} txTimeSeconds - The transaction time in seconds
   * @returns {boolean} - Whether the asset is spendable or not
   */
  _isAssetSpendable(asset, txTimeSeconds) {
    try {
      this._assertAssetSpendable(asset, txTimeSeconds);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        return false;
      }
      throw e; // re-throw the error unchanged
    }
  }

  /**
   * _isAssetValid checks if an asset is valid
   *
   * @param {Object} asset - The asset object
   * @param {number} txTimeSeconds - The transaction time in seconds
   * @returns {boolean} - Whether the asset is valid or not
   */
  _isAssetValid(asset, txTimeSeconds) {
    try {
      this._assertAssetValid(asset, txTimeSeconds);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        return false;
      }
      throw e; // re-throw the error unchanged
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

  /**
   * _assertIsOwner asserts that the claimed owner matches the asset's owner
   *
   * @param {Object} asset - The asset object
   * @param {string} claimedOwner - The claimed owner
   * @throws {Error} - If the claimed owner does not match the asset's owner
   */
  _assertIsOwner(asset, claimedOwner) {
    if (claimedOwner !== asset.owner) {
      throw new Error(`Owner mismatch. asset has owner ${asset.owner} while we claim it's ${claimedOwner}`);
    }
  }

  /**
   * _isOwner checks if the claimed owner matches the asset's owner
   *
   * @param {Object} asset - The asset object
   * @param {string} claimedOwner - The claimed owner
   * @returns {boolean} - Whether the claimed owner matches the asset's owner or not
   */
  _isOwner(asset, claimedOwner) {
    try {
      this._assertIsOwner(asset, claimedOwner);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        return false;
      }
      throw e; // re-throw the error unchanged
    }
  }

  /**
   * Execute atomic burn without any validation
   *
   * @param {Context} ctx - The transaction context
   * @param {Array.<Asset>} assets - The list of assets to dismiss
   * @returns {Array.<Asset>} - The list of removed assets
   */
  async _burn(ctx, assets) {
    const promises = assets.map((asset) => {
      const assetCompositeKey = ctx.stub.createCompositeKey(asset.type.toString(), [asset.key]);
      console.log(`composite key to burn: ${assetCompositeKey}`);
      return ctx.stub.deleteState(assetCompositeKey);
    });

    try {
      await Promise.all(promises);
      return assets;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to burn assets.');
    }
  }

  /**
   * Execute atomic mint without any validation
   *
   * @param {Context} ctx - The transaction context
   * @param {Array.<Asset>} assets - The list of assets to create
   * @returns {Array.<Asset>} - The list of created assets
   */
  async _mint(ctx, assets) {
    const promises = assets.map((asset) => {
      const assetCompositeKey = ctx.stub.createCompositeKey(asset.type.toString(), [asset.key]);
      // eslint-disable-next-line no-param-reassign
      asset.metadata.action = 'mint';
      console.log(`composite key to mint: ${assetCompositeKey}`);
      return ctx.stub.putState(assetCompositeKey, Buffer.from(JSON.stringify(asset.chainRepr())));
    });

    try {
      await Promise.all(promises);
      return assets;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to mint assets.');
    }
  }
}

module.exports = {
  ExpiringAssetBase,
};
