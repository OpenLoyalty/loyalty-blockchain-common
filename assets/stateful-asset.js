const sortKeysRecursive = require('sort-keys-recursive');
const { Asset } = require('./asset');
const { AssetState } = require('./types');

/**
 * StatefulAsset class
 * Represents a stateful asset.
 */
class StatefulAsset extends Asset {
  /**
   * Constructs a StatefulAsset object.
   *
   * @param {String} key - The asset's unique key.
   * @param {String} owner - The asset's current owner.
   * @param {AssetType} type - The asset type.
   * @param {Object} metadata - Extra information about the token.
   * @param {number} state - The asset state.
   */
  constructor(key, owner, type, metadata, state) {
    super(key, owner, type, metadata);
    this.state = state;
  }

  /**
   * Returns the chain representation of the object.
   *
   * @returns {Object} - The chain representation of the object.
   */
  chainRepr() {
    return sortKeysRecursive({
      ...super.chainRepr(),
      state: this.state || AssetState.LIQUID,
    });
  }
}

module.exports = {
  StatefulAsset,
};
