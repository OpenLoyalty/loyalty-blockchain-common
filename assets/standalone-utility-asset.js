const sortKeysRecursive = require('sort-keys-recursive');
const { StatefulAsset } = require('./stateful-asset');

/**
 * StandaloneUtilityAsset class
 * Represents a standalone utility asset.
 */
class StandaloneUtilityAsset extends StatefulAsset {
  /**
   * Constructs a StandaloneUtilityAsset object.
   *
   * @param {String} key - The asset's unique key.
   * @param {String} owner - The asset's current owner.
   * @param {AssetType} type - The asset type.
   * @param {Object} utility - Key-value pairs for supported utilities.
   * @param {number} remainingUses - The remaining token uses.
   * @param {Object} metadata - Extra information about the token.
   * @param {number} state - The asset state.
   */
  constructor(key, owner, type, utility, remainingUses, metadata, state) {
    super(key, owner, type, metadata, state);
    this.utility = utility;
    this.remainingUses = remainingUses;
  }

  /**
   * Returns the chain representation of the object.
   *
   * @returns {Object} - The chain representation of the object.
   */
  chainRepr() {
    return sortKeysRecursive({
      ...super.chainRepr(),
      utility: this.utility,
      remainingUses: this.remainingUses,
    });
  }
}

module.exports = {
  StandaloneUtilityAsset,
};
