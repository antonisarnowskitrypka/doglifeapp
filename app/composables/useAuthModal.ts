/**
 * Controls the global auth modal (login / signup). Auth is presented as a modal overlay,
 * not a full-screen page — open it from anywhere via this composable.
 */
export function useAuthModal() {
  const state = useState('auth-modal', () => ({ open: false, mode: 'login' }))

  function openLogin() {
    state.value = { open: true, mode: 'login' }
  }
  function openSignup() {
    state.value = { open: true, mode: 'signup' }
  }
  function close() {
    state.value = { ...state.value, open: false }
  }

  return { state, openLogin, openSignup, close }
}
