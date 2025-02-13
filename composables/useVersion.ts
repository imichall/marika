import { ref } from 'vue'

interface BranchInfo {
  version: string
  lastCommit: string
  author: string
  date: string
  url: string
  branch: string
  tag?: string
}

export const useVersion = () => {
  const mainBranch = ref<BranchInfo | null>(null)
  const devBranch = ref<BranchInfo | null>(null)
  const loading = ref(false)
  const error = ref(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const fetchGitHubInfo = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/github/version')
      if (!response.ok) {
        throw new Error('Failed to fetch version info')
      }

      const data = await response.json()

      if (data.main) {
        mainBranch.value = {
          ...data.main,
          date: formatDate(data.main.date)
        }
      }

      if (data.dev) {
        devBranch.value = {
          ...data.dev,
          date: formatDate(data.dev.date)
        }
      }
    } catch (err: any) {
      console.error('Chyba při načítání informací z GitHubu:', err)
      error.value = err.message
      mainBranch.value = null
      devBranch.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    mainBranch,
    devBranch,
    loading,
    error,
    fetchGitHubInfo
  }
}