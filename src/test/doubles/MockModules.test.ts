import * as OtherUtils from '../../app/doubles/OtherUtils'

jest.mock('../../app/doubles/OtherUtils', () => ({
  ...jest.requireActual('../../app/doubles/OtherUtils'),
  calculateComplexity: () => {
    return 10
  },
}))

jest.mock('uuid', () => ({
  v4: () => '123',
}))

describe('module tests', () => {
  test('calculate complexity', () => {
    const result = OtherUtils.calculateComplexity({} as any)
    expect(result).toBe(10)
  })

  test('keep other functions', () => {
    const result = OtherUtils.toUpperCase('abc')
    expect(result).toBe('ABC')
  })

  test('string with id', () => {
    const result = OtherUtils.toLoserCaseWithId('ABC')
    expect(result).toBe('abc123')
  })
})
