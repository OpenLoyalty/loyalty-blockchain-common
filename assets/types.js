/**
 * AssetState enum
 * Represents the state of an asset.
 */
const AssetState = Object.freeze({
  LIQUID: 1,
  FROZEN: 2,
  SENDING: 3,
  SENT: 4,
  SPENT: 5,
});

/**
 * AssetType enum
 * Represents the type of asset.
 */
const AssetType = Object.freeze({
  UTXO: 1,
  VOUCHER: 2,
  GIFT_CARD: 3,
  PREPAID_CARD: 4,
  UTILITY_TOKEN: 5,
});

module.exports = {
  AssetState,
  AssetType,
};
