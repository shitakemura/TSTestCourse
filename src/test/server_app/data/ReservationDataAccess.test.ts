import { ReservationsDataAccess } from '../../../app/server_app/data/ReservationsDataAccess'
import { DataBase } from '../../../app/server_app/data/DataBase'
import { Reservation } from '../../../app/server_app/model/ReservationModel'
import * as IdGenerator from '../../../app/server_app/data/IdGenerator'

const mockInsert = jest.fn()
const mockGetBy = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockGetAllElements = jest.fn()

jest.mock('../../../app/server_app/data/DataBase', () => {
  return {
    DataBase: jest.fn().mockImplementation(() => {
      return {
        insert: mockInsert,
        getBy: mockGetBy,
        update: mockUpdate,
        delete: mockDelete,
        getAllElements: mockGetAllElements,
      }
    }),
  }
})

describe('ReservationsDataAccess test suite', () => {
  let sut: ReservationsDataAccess

  const someId = '1234'

  const someReservation: Reservation = {
    id: '',
    room: 'someRoom',
    user: 'someUser',
    startDate: 'someStartDate',
    endDate: 'someEndDate',
  }

  beforeEach(() => {
    sut = new ReservationsDataAccess()
    expect(DataBase).toHaveBeenCalledTimes(1)
    jest.spyOn(IdGenerator, 'generateRandomId').mockReturnValueOnce(someId)
  })

  afterEach(() => {
    jest.clearAllMocks()
    someReservation.id = ''
  })

  it('should return the id of newly created reservation', async () => {
    mockInsert.mockResolvedValueOnce(someId)

    const actual = await sut.createReservation(someReservation)

    expect(mockInsert).toBeCalledWith(someReservation)
    expect(actual).toBe(someId)
  })

  it('should make the update reservation call', async () => {
    await sut.updateReservation(someId, 'endDate', 'someOtherEndDate')

    expect(mockUpdate).toBeCalledWith(someId, 'endDate', 'someOtherEndDate')
  })

  it('should make the delete reservation call', async () => {
    await sut.deleteReservation(someId)

    expect(mockDelete).toBeCalledWith(someId)
  })

  it('should return reservation by id', async () => {
    mockGetBy.mockResolvedValueOnce(someReservation)

    let actual = await sut.getReservation(someId)

    expect(mockGetBy).toBeCalledWith('id', someId)
    expect(actual).toEqual(someReservation)
  })

  it('should return all reservations', async () => {
    mockGetAllElements.mockResolvedValueOnce([someReservation])

    let actual = await sut.getAllReservations()

    expect(mockGetAllElements).toBeCalledTimes(1)
    expect(actual).toEqual([someReservation])
  })
})
