// Theme management utility
export const theme = {
  init() {
    const savedTheme = localStorage.getItem('theme') || 'light'
    this.setTheme(savedTheme)
  },

  setTheme(themeName) {
    const root = document.documentElement
    if (themeName === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', themeName)
  },

  toggle() {
    const currentTheme = localStorage.getItem('theme') || 'light'
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    this.setTheme(newTheme)
    return newTheme
  },

  getCurrentTheme() {
    return localStorage.getItem('theme') || 'light'
  }
}
