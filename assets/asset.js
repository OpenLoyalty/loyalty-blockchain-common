const { AssetType } = require('./types');

/**
 * Asset class
 * Represents an asset with a unique key, owner, type, and metadata.
 */
class Asset {
  /**
   * Constructs an Asset object.
   *
   * @param {String} key - The asset's unique key.
   * @param {String} owner - The asset's current owner.
   * @param {AssetType} type - The asset's type.
   * @param {Object} metadata - Extra information about the asset (optional).
   */
  constructor(key, owner, type, metadata) {
    this.key = key;
    this.owner = owner;
    this.metadata = metadata || {};
    this.type = type || AssetType.UTXO;
  }

  /**
   * Returns the chain representation of the object.
   *
   * @returns {Object} - The chain representation of the object.
   */
  chainRepr() {
    return {
      metadata: this.metadata || {},
      owner: this.owner,
      type: this.type || AssetType.UTXO,
    };
  }
}

module.exports = {
  Asset,
};
