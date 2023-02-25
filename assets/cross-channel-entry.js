const { sortKeysRecursive } = require('sort-keys-recursive');

/**
 * CrossChannelEntry class
 * Represents a cross-channel entry with transaction details and asset data.
 */
class CrossChannelEntry {
  /**
   * Constructs a CrossChannelEntry object.
   *
   * @param {String} txId - The transaction ID.
   * @param {Object} assetData - The asset data.
   * @param {String} fromUser - The unique UUID of the sending user.
   * @param {String} fromChannel - The sending channel.
   * @param {String} toUser - The unique UUID of the receiving user.
   * @param {String} toChannel - The receiving channel.
   * @param {number} timeout - The deadline for CrossChannel execution finalization.
   */
  constructor(txId, assetData, fromUser, fromChannel, toUser, toChannel, timeout) {
    this.txId = txId;
    this.assetData = assetData;
    this.fromUser = fromUser;
    this.fromChannel = fromChannel;
    this.toUser = toUser;
    this.toChannel = toChannel;
    this.timeout = timeout;
  }

  /**
   * Returns the chain representation of the object.
   *
   * @returns {Object} - The chain representation of the object.
   */
  chainRepr() {
    return sortKeysRecursive({
      txId: this.txId,
      assetData: this.assetData,
      fromUser: this.fromUser,
      fromChannel: this.fromChannel,
      toUser: this.toUser,
      toChannel: this.toChannel,
      timeout: this.timeout,
    });
  }
}

module.exports = {
  CrossChannelEntry,
};
