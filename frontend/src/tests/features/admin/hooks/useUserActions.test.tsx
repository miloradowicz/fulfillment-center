/* eslint-disable */
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import useUserActions from '@/features/admin/hooks/useUserActions'

// Мокируем toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Мокируем thunks
const mockFetchUsers = jest.fn()
const mockFetchUserById = jest.fn()
const mockArchiveUser = jest.fn()
const mockFetchArchivedUsers = jest.fn()

jest.mock('@/store/thunks/userThunk', () => ({
  fetchUsers: () => mockFetchUsers,
  fetchUserById: (id: string) => mockFetchUserById,
  archiveUser: (id: string) => mockArchiveUser,
  fetchArchivedUsers: () => mockFetchArchivedUsers,
}))

// Мокируем react-router-dom
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: undefined }),
}))

// Мокируем селекторы
jest.mock('@/store/slices/userSlice', () => ({
  selectUsersLoading: jest.fn(() => false),
  selectUsersError: jest.fn(() => null),
  selectAllUsers: jest.fn(() => []),
  selectSelectedUser: jest.fn(() => null),
}))

jest.mock('@/store/slices/authSlice', () => ({
  selectUser: jest.fn(() => ({ _id: 'current-user' })),
  unsetUser: jest.fn(),
}))

// Создаем мок store
const mockStore = configureStore({
  reducer: {
    users: (state = { users: [], loading: false, error: null }) => state,
    auth: (state = { user: { _id: 'current-user' } }) => state,
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={mockStore}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  )
}

describe('useUserActions hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchUsers.mockResolvedValue({ type: 'fulfilled' })
    mockFetchUserById.mockResolvedValue({ type: 'fulfilled' })
    mockArchiveUser.mockResolvedValue({ type: 'fulfilled' })
    mockFetchArchivedUsers.mockResolvedValue({ type: 'fulfilled' })
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useUserActions(true), { wrapper })

    expect(result.current.open).toBe(false)
    expect(result.current.confirmationOpen).toBe(false)
    expect(result.current.selectedUser).toBe(null)
    expect(result.current.userToArchiveId).toBe(null)
  })

  it('should handle opening modal', () => {
    const { result } = renderHook(() => useUserActions(true), { wrapper })

    act(() => {
      result.current.handleOpen()
    })

    expect(result.current.open).toBe(true)
  })

  it('should handle opening modal with user', () => {
    const { result } = renderHook(() => useUserActions(true), { wrapper })
    const testUser = {
      _id: '1',
      displayName: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    }

    act(() => {
      result.current.handleOpen(testUser as any)
    })

    expect(result.current.open).toBe(true)
    expect(result.current.selectedUser).toEqual(testUser)
  })

  it('should handle closing modal', () => {
    const { result } = renderHook(() => useUserActions(true), { wrapper })

    act(() => {
      result.current.handleOpen()
    })

    expect(result.current.open).toBe(true)

    act(() => {
      result.current.handleClose()
    })

    expect(result.current.open).toBe(false)
  })

  it('should handle opening confirmation modal', () => {
    const { result } = renderHook(() => useUserActions(true), { wrapper })

    act(() => {
      result.current.handleConfirmationOpen('user-id')
    })

    expect(result.current.confirmationOpen).toBe(true)
    expect(result.current.userToArchiveId).toBe('user-id')
  })

  it('should handle closing confirmation modal', () => {
    const { result } = renderHook(() => useUserActions(true), { wrapper })

    act(() => {
      result.current.handleConfirmationOpen('user-id')
    })

    expect(result.current.confirmationOpen).toBe(true)

    act(() => {
      result.current.handleConfirmationClose()
    })

    expect(result.current.confirmationOpen).toBe(false)
    expect(result.current.userToArchiveId).toBe(null)
  })

  it('should handle confirmation archive', async () => {
    const { result } = renderHook(() => useUserActions(true), { wrapper })

    act(() => {
      result.current.handleConfirmationOpen('user-id')
    })

    await act(async () => {
      await result.current.handleConfirmationArchive()
    })

    expect(result.current.confirmationOpen).toBe(false)
    expect(result.current.userToArchiveId).toBe(null)
  })

  it('should provide fetchAllUsers function', () => {
    const { result } = renderHook(() => useUserActions(true), { wrapper })

    expect(typeof result.current.fetchAllUsers).toBe('function')
  })

  it('should provide fetchUser function', () => {
    const { result } = renderHook(() => useUserActions(true), { wrapper })

    expect(typeof result.current.fetchUser).toBe('function')
  })

  it('should provide archiveOneUser function', () => {
    const { result } = renderHook(() => useUserActions(true), { wrapper })

    expect(typeof result.current.archiveOneUser).toBe('function')
  })
}) 