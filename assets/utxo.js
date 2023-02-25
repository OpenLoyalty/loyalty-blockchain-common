const { sortKeysRecursive } = require('sort-keys-recursive');
const { StatefulAsset } = require('./stateful-asset');
const { AssetType } = require('./types');

class UTXO extends StatefulAsset {
  /**
   * Constructs UTXO (Unspent Transaction Output) asset
   *
   * @param {String} key - Asset unique key
   * @param {String} owner - Asset current owner
   * @param {Object} metadata - Extra information about the token
   * @param {number} state - Asset state
   * @param {number} amount - Value representation of the asset
   */
  constructor(key, owner, metadata, state, amount) {
    super(key, owner, AssetType.UTXO, metadata, state);
    this.amount = amount;
  }

  /**
   * Returns the chain representation of the object
   *
   * @returns {Object} Chain representation of the object
   */
  chainRepr() {
    return sortKeysRecursive({
      ...super.chainRepr(),
      amount: this.amount,
    });
  }
}

module.exports = {
  UTXO,
};
