import { ref } from 'vue'

export const useVersion = () => {
  const version = ref('')
  const lastCommit = ref('')
  const author = ref('')
  const date = ref('')
  const commitUrl = ref('')
  const loading = ref(false)
  const error = ref(null)

  const fetchGitHubInfo = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/github/version')
      if (!response.ok) {
        throw new Error('Failed to fetch version info')
      }

      const data = await response.json()
      version.value = data.version
      lastCommit.value = data.lastCommit
      author.value = data.author
      date.value = new Date(data.date).toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      commitUrl.value = data.url
    } catch (err: any) {
      console.error('Chyba při načítání informací z GitHubu:', err)
      error.value = err.message
      version.value = 'N/A'
      lastCommit.value = 'Informace nejsou dostupné'
    } finally {
      loading.value = false
    }
  }

  return {
    version,
    lastCommit,
    author,
    date,
    commitUrl,
    loading,
    error,
    fetchGitHubInfo
  }
}