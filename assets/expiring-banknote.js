const { sortKeysRecursive } = require('sort-keys-recursive');
const { UTXO } = require('./utxo');
const { AssetState } = require('./types');

/**
 * ExpiringBanknote class
 * Represents an expiring banknote asset.
 */
class ExpiringBanknote extends UTXO {
  /**
   * Constructs an ExpiringBanknote asset.
   *
   * @param {String} key - The asset's unique key.
   * @param {String} owner - The asset's owner.
   * @param {number} amount - The value representation.
   * @param {number} enforcementDate - The timestamp since when the tokens are spendable.
   * @param {number} expirationDate - The timestamp of the tokens' expiration date.
   * @param {Object} metadata - Extra information about the token (optional).
   * @param {number} state - The asset state (optional).
   */
  constructor(key, owner, amount, enforcementDate, expirationDate, metadata = {}, state = AssetState.LIQUID) {
    super(key, owner, metadata, state, amount);
    this.enforcementDate = enforcementDate;
    this.expirationDate = expirationDate;
  }

  /**
   * Returns the chain representation of the object.
   *
   * @returns {Object} - The chain representation of the object.
   */
  chainRepr() {
    return sortKeysRecursive({
      ...super.chainRepr(),
      enforcementDate: this.enforcementDate,
      expirationDate: this.expirationDate,
    });
  }
}

module.exports = {
  ExpiringBanknote,
};
