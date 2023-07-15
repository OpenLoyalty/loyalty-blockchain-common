const { Context } = require('fabric-contract-api');

/**
 * Returns an array of keys from an enum type.
 *
 * @param {Object} enumType - The enum type
 * @returns {Array} - The array of keys
 */
const getEnumKeys = (enumType) => Object.keys(enumType);

/**
 * Returns an array of values from an enum type.
 *
 * @param {Object} enumType - The enum type
 * @returns {Array} - The array of values
 */
const getEnumValues = (enumType) => getEnumKeys(enumType).map((key) => enumType[key]);

/**
 * Returns the value of an enum given its key.
 *
 * @param {Object} enumType - The enum type
 * @param {string} key - The key to find the value for
 * @returns {*} - The value of the enum
 */
const getEnumValue = (enumType, key) =>
  enumType[
    getEnumKeys(enumType)
      .filter((k) => key === k)
      .pop() || ''
  ];

/**
 * Returns the key of an enum given its value.
 *
 * @param {Object} enumType - The enum type
 * @param {*} value - The value to find the key for
 * @returns {string|undefined} - The key of the enum or undefined if not found
 */
const getEnumKey = (enumType, value) =>
  Object.keys(enumType)[
    getEnumValues(enumType)
      .filter((k) => parseInt(value, 10) === k)
      .pop() - 1
  ];

/**
 * Returns the transaction timestamp in seconds.
 *
 * @param {Context} ctx - The transaction context
 * @returns {number} - The transaction timestamp in seconds
 */
const getTxTimestampSeconds = (ctx) => {
  const timestampSeconds = ctx.stub.getTxTimestamp().array[0];
  console.log(`Timestamp in seconds: ${timestampSeconds}`);
  return timestampSeconds;
};

/**
 * Wraps the payload into an event object with transaction information.
 *
 * @param {Context} ctx - The transaction context
 * @param {*} payload - The payload to wrap
 * @returns {Buffer} - The wrapped event payload as a buffer
 */
const wrapEvent = async (ctx, payload) => {
  const txTimeSeconds = getTxTimestampSeconds(ctx);
  const eventPayload = {
    txId: ctx.stub.getTxID(),
    txTime: txTimeSeconds,
    txData: payload,
  };
  // console.log(`publish event:\n${JSON.stringify(eventPayload, null, 2)}`);
  return Buffer.from(JSON.stringify(eventPayload));
};

module.exports = {
  getEnumValue,
  getEnumKey,
  wrapEvent,
  getTxTimestampSeconds,
};
