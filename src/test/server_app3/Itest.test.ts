import * as generated from '../../app/server_app/data/IdGenerator'
import { Account } from '../../app/server_app/model/AuthModel'
import { Reservation } from '../../app/server_app/model/ReservationModel'
import { HTTP_CODES, HTTP_METHODS } from '../../app/server_app/model/ServerModel'
import { Server } from '../../app/server_app/server/Server'

xdescribe('Server app integration tests', () => {
  let server: Server

  beforeAll(() => {
    server = new Server()
    server.startServer()
  })

  afterAll(() => {
    server.stopServer()
  })

  const someUser: Account = {
    id: '',
    userName: 'someUserName',
    password: 'somePassword',
  }

  const someReservation: Reservation = {
    id: '',
    user: 'someUser',
    room: 'someRoom',
    startDate: 'someStartDate',
    endDate: 'someEndDate',
  }

  it('should register new user', async () => {
    const result = await fetch('http://localhost:8080/register', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someUser),
    })

    const resultBody = await result.json()

    expect(result.status).toBe(HTTP_CODES.CREATED)
    expect(resultBody.userId).toBeDefined()
    console.log(`connecting to address: ${process.env.HOST}`)
  })

  let token: string
  it('should login a register user', async () => {
    const result = await fetch('http://localhost:8080/login', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someUser),
    })

    const resultBody = await result.json()

    expect(result.status).toBe(HTTP_CODES.CREATED)
    expect(resultBody.token).toBeDefined()
    token = resultBody.token
  })

  let createdReservationId: string
  it('should create reservation if authorized', async () => {
    const result = await fetch('http://localhost:8080/reservation', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someReservation),
      headers: {
        authorization: token,
      },
    })

    const resultBody = await result.json()

    expect(result.status).toBe(HTTP_CODES.CREATED)
    expect(resultBody.reservationId).toBeDefined()
    createdReservationId = resultBody.reservationId
  })

  it('should get reservation if authorized', async () => {
    const result = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.GET,
        headers: {
          authorization: token,
        },
      }
    )

    const resultBody = await result.json()
    const expectedReservation = { ...someReservation, id: createdReservationId }

    expect(result.status).toBe(HTTP_CODES.OK)
    expect(resultBody).toEqual(expectedReservation)
  })

  it('should create and retrieve multiple reservations if authorized', async () => {
    await fetch('http://localhost:8080/reservation', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someReservation),
      headers: {
        authorization: token,
      },
    })
    await fetch('http://localhost:8080/reservation', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someReservation),
      headers: {
        authorization: token,
      },
    })
    await fetch('http://localhost:8080/reservation', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someReservation),
      headers: {
        authorization: token,
      },
    })

    const getAllResult = await fetch('http://localhost:8080/reservation/all', {
      method: HTTP_METHODS.GET,
      headers: {
        authorization: token,
      },
    })

    const resultBody = await getAllResult.json()

    expect(getAllResult.status).toBe(HTTP_CODES.OK)
    expect(resultBody).toHaveLength(4)
  })

  it('should update reservation if authorized', async () => {
    const updateResult = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.PUT,
        body: JSON.stringify({
          startDate: 'otherStartDate',
        }),
        headers: {
          authorization: token,
        },
      }
    )

    expect(updateResult.status).toBe(HTTP_CODES.OK)

    const getResult = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.GET,
        headers: {
          authorization: token,
        },
      }
    )

    const getResultBody: Reservation = await getResult.json()
    const expectedReservation = {
      ...someReservation,
      id: createdReservationId,
      startDate: 'otherStartDate',
    }

    expect(getResult.status).toBe(HTTP_CODES.OK)
    expect(getResultBody.startDate).toBe('otherStartDate')

    expect(getResultBody).toEqual(expectedReservation)
  })

  it('should delete reservation if authorized', async () => {
    const deleteResult = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.DELETE,
        headers: {
          authorization: token,
        },
      }
    )

    expect(deleteResult.status).toBe(HTTP_CODES.OK)

    const getResult = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.GET,
        headers: {
          authorization: token,
        },
      }
    )
    expect(getResult.status).toBe(HTTP_CODES.NOT_fOUND)
  })

  it('snapshot demo', async () => {
    jest.spyOn(generated, 'generateRandomId').mockReturnValueOnce('12345')

    await fetch('http://localhost:8080/reservation', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someReservation),
      headers: {
        authorization: token,
      },
    })

    const getResult = await fetch(`http://localhost:8080/reservation/12345`, {
      method: HTTP_METHODS.GET,
      headers: {
        authorization: token,
      },
    })

    const getResultBody: Reservation = await getResult.json()
    expect(getResultBody).toMatchSnapshot()
  })
})
