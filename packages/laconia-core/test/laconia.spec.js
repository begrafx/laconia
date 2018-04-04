const laconia = require('../src/laconia')

describe('handler', () => {
  let callback

  beforeEach(() => {
    callback = jest.fn()
  })

  it('should call Lambda callback with null when there is no value returned', async () => {
    await laconia(() => {})({}, {}, callback)
    expect(callback).toBeCalledWith(null, undefined)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should delegate AWS parameters to handler function', async () => {
    const handler = jest.fn()
    await laconia(handler)({foo: 'event'}, {fiz: 'context'}, callback)
    expect(handler).toBeCalledWith({event: {foo: 'event'}, context: {fiz: 'context'}})
  })

  describe('when synchronous code is returned', () => {
    it('should call Lambda callback with the handler return value to Lambda callback', async () => {
      await laconia(() => 'value')({}, {}, callback)
      expect(callback).toBeCalledWith(null, 'value')
    })

    it('should call Lambda callback with the error thrown', async () => {
      const error = new Error('boom')
      await laconia(() => { throw error })({}, {}, callback)
      expect(callback).toBeCalledWith(error)
    })
  })

  describe('when promise is returned', () => {
    it('should call Lambda callback with the handler return value to Lambda callback', async () => {
      await laconia(() => Promise.resolve('value'))({}, {}, callback)
      expect(callback).toBeCalledWith(null, 'value')
    })

    it('should call Lambda callback with the error thrown', async () => {
      const error = new Error('boom')
      await laconia(() => Promise.reject(error))({}, {}, callback)
      expect(callback).toBeCalledWith(error)
    })
  })

  describe('when function is returned', () => {
    it('should call the function with laconiaContext', async () => {
      const fn = jest.fn()
      await laconia(() => fn)({}, {}, callback)
      expect(fn).toBeCalledWith({event: {}, context: {}})
    })

    it('should call Lambda callback with the function return value to Lambda callback', async () => {
      const fn = jest.fn().mockReturnValue('value')
      await laconia(() => fn)({}, {}, callback)
      expect(callback).toBeCalledWith(null, 'value')
    })

    it('should call Lambda callback with the function Promise return value to Lambda callback', async () => {
      const fn = jest.fn().mockReturnValue(Promise.resolve('value'))
      await laconia(() => fn)({}, {}, callback)
      expect(callback).toBeCalledWith(null, 'value')
    })

    it('should call Lambda callback with the error thrown inside the function', async () => {
      const error = new Error('boom')
      const fn = jest.fn().mockImplementation(() => { throw error })
      await laconia(() => fn)({}, {}, callback)
      expect(callback).toBeCalledWith(error)
    })
  })
})
