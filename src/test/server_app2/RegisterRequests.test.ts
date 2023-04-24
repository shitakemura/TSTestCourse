import { DataBase } from '../../app/server_app/data/DataBase'
import { HTTP_CODES, HTTP_METHODS } from '../../app/server_app/model/ServerModel'
import { Server } from '../../app/server_app/server/Server'
import { RequestTestWrapper } from './test_utils/RequestTestWrapper'
import { ResponseTestWrapper } from './test_utils/ResponseTestWrapper'

jest.mock('../../app/server_app/data/DataBase')

const requestWrapper = new RequestTestWrapper()
const responseWrapper = new ResponseTestWrapper()

const fakeServer = {
  listen: () => {},
  close: () => {},
}

jest.mock('http', () => ({
  createServer: (cb: Function) => {
    cb(requestWrapper, responseWrapper)
    return fakeServer
  },
}))

describe('RegisterRequests test suite', () => {
  afterEach(() => {
    requestWrapper.clearFields()
    requestWrapper.clearFields()
  })

  it('should register new users', async () => {
    requestWrapper.method = HTTP_METHODS.POST
    requestWrapper.body = {
      userName: 'someUserName',
      password: 'somePassword',
    }
    requestWrapper.url = 'localhost:8080/register'
    jest.spyOn(DataBase.prototype, 'insert').mockResolvedValueOnce('1234')

    await new Server().startServer()

    await new Promise(process.nextTick) // timing issues: https://stackoverflow.com/questions/44741102/how-to-make-jest-wait-for-all-asynchronous-code-to-finish-execution-before-expec

    expect(responseWrapper.statusCode).toBe(HTTP_CODES.CREATED)
    expect(responseWrapper.body).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
      })
    )
  })
})
