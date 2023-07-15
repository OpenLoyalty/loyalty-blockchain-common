const sortKeysRecursive = require('sort-keys-recursive');
const { StatefulAsset } = require('./stateful-asset');

/**
 * StandaloneValueAsset class
 * Represents a standalone value asset.
 */
class StandaloneValueAsset extends StatefulAsset {
  /**
   * Constructs a StandaloneValueAsset object.
   *
   * @param {String} key - The asset's unique key.
   * @param {String} owner - The asset's current owner.
   * @param {number} amount - The value representation of the asset.
   * @param {String} currency - The asset's currency.
   * @param {AssetType} type - The asset type.
   * @param {Object} metadata - Extra information about the token.
   * @param {number} state - The asset state.
   */
  constructor(key, owner, type, amount, currency, metadata, state) {
    super(key, owner, type, metadata, state);
    this.amount = amount;
    this.currency = currency;
  }

  /**
   * Returns the chain representation of the object.
   *
   * @returns {Object} - The chain representation of the object.
   */
  chainRepr() {
    return sortKeysRecursive({
      ...super.chainRepr(),
      amount: this.amount,
      currency: this.currency,
    });
  }
}

module.exports = {
  StandaloneValueAsset,
};
