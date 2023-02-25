const { sortKeysRecursive } = require('sort-keys-recursive');
const { StandaloneUtilityAsset } = require('./standalone-utility-asset');

/**
 * ExpiringStandaloneUtilityAsset class
 * Represents an expiring standalone utility asset.
 */
class ExpiringStandaloneUtilityAsset extends StandaloneUtilityAsset {
  /**
   * Constructs an ExpiringStandaloneUtilityAsset object.
   *
   * @param {String} key - The asset's unique key.
   * @param {String} owner - The asset's current owner.
   * @param {AssetType} type - The asset type.
   * @param {Object} utility - Key-value pairs for supported utilities.
   * @param {number} remainingUses - The remaining asset usage permission.
   * @param {number} enforcementDate - The timestamp since when the tokens are spendable.
   * @param {number} expirationDate - The timestamp of the tokens' expiration date.
   * @param {Object} metadata - Extra information about the token.
   * @param {number} state - The asset state.
   */
  constructor(key, owner, type, utility, remainingUses, enforcementDate, expirationDate, metadata, state) {
    super(key, owner, type, utility, remainingUses, metadata, state);
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
  ExpiringStandaloneUtilityAsset,
};
