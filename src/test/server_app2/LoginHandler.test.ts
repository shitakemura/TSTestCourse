import { DataBase } from '../../app/server_app/data/DataBase'
import { Account } from '../../app/server_app/model/AuthModel'
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

const someAccount: Account = {
  id: '',
  userName: 'someUserName',
  password: 'somePassword',
}

const someToken = '1234'

describe.skip('LoginRequests test suit', () => {
  const insertSpy = jest.spyOn(DataBase.prototype, 'insert')
  const getBySpy = jest.spyOn(DataBase.prototype, 'getBy')

  afterEach(() => {
    requestWrapper.clearFields()
    responseWrapper.clearFields()
    jest.clearAllMocks()
  })

  it('should login user with valid credentials', async () => {
    requestWrapper.method = HTTP_METHODS.POST
    requestWrapper.body = someAccount
    requestWrapper.url = 'localhost:8080/login'
    getBySpy.mockResolvedValueOnce(someAccount)
    insertSpy.mockResolvedValue(someToken)

    await new Server().startServer()
    await new Promise(process.nextTick)

    expect(responseWrapper.statusCode).toBe(HTTP_CODES.CREATED)
    expect(responseWrapper.body).toEqual({
      token: someToken,
    })
  })

  it('should not login user with invalid credentials', async () => {
    requestWrapper.method = HTTP_METHODS.POST
    requestWrapper.body = someAccount
    requestWrapper.url = 'localhost:8080/login'
    getBySpy.mockResolvedValueOnce({
      userName: 'someOtherUserName',
      password: 'someOtherPassword',
    })

    await new Server().startServer()
    await new Promise(process.nextTick)

    expect(responseWrapper.statusCode).toBe(HTTP_CODES.NOT_fOUND)
    expect(responseWrapper.body).toBe('wrong username or password')
  })

  it('should return bad request if no credentials in request', async () => {
    requestWrapper.method = HTTP_METHODS.POST
    requestWrapper.body = {}
    requestWrapper.url = 'localhost:8080/login'

    await new Server().startServer()
    await new Promise(process.nextTick)

    expect(responseWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
    expect(responseWrapper.body).toBe('userName and password required')
  })

  it('should do nothing for not supported methods', async () => {
    requestWrapper.method = HTTP_METHODS.DELETE
    requestWrapper.body = {}
    requestWrapper.url = 'localhost:8080/login'

    await new Server().startServer()
    await new Promise(process.nextTick)

    expect(responseWrapper.statusCode).toBeUndefined()
    expect(responseWrapper.body).toBeUndefined()
  })
})
