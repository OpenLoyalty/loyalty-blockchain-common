const { sortKeysRecursive } = require('sort-keys-recursive');
const { StandaloneValueAsset } = require('./standalone-value-asset');
const { AssetState } = require('./types');

/**
 * ExpiringStandaloneValueAsset class
 * Represents an expiring standalone value asset.
 */
class ExpiringStandaloneValueAsset extends StandaloneValueAsset {
  /**
   * Constructs an ExpiringStandaloneValueAsset object.
   *
   * @param {String} key - The asset's unique key.
   * @param {String} owner - The asset's current owner.
   * @param {AssetType} type - The asset type.
   * @param {number} amount - The value representation.
   * @param {String} currency - The currency in which the asset value is represented.
   * @param {number} enforcementDate - The timestamp since when the tokens are spendable.
   * @param {number} expirationDate - The timestamp of the tokens' expiration date.
   * @param {Object} metadata - Extra information about the token.
   * @param {number} state - The asset state.
   */
  constructor(
    key,
    owner,
    type,
    amount,
    currency,
    enforcementDate,
    expirationDate,
    metadata = {},
    state = AssetState.LIQUID
  ) {
    super(key, owner, type, amount, currency, metadata, state);
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
  ExpiringStandaloneValueAsset,
};
