const invoke = require('./invoke')
const isplainobject = require('lodash.isplainobject')
const _ = { isPlainObject: isplainobject }

module.exports = (payload = {}) => ({event, context}) => {
  if (!_.isPlainObject(payload)) {
    throw new Error('Payload must be an object')
  }
  return invoke(context.functionName).fireAndForget(Object.assign({}, event, payload))
}
