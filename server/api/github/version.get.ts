import { githubConfig } from '../../config/github'

export default defineEventHandler(async (event) => {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    }

    if (githubConfig.token) {
      headers['Authorization'] = `Bearer ${githubConfig.token}`
    }

    // Funkce pro získání informací o větvi
    const getBranchInfo = async (branch: string) => {
      const response = await fetch(
        `${githubConfig.apiUrl}/repos/${githubConfig.owner}/${githubConfig.repo}/commits/${branch}`,
        { headers }
      )

      if (!response.ok) {
        throw new Error(`GitHub API responded with status ${response.status} for branch ${branch}`)
      }

      const commit = await response.json()
      return {
        version: commit.sha.substring(0, 7),
        lastCommit: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
        branch
      }
    }

    // Získání informací o obou větvích
    const [mainInfo, devInfo] = await Promise.all([
      getBranchInfo('main'),
      getBranchInfo('dev').catch(() => null) // Dev větev nemusí existovat
    ])

    return {
      main: mainInfo,
      dev: devInfo
    }

  } catch (error: any) {
    console.error('Error fetching GitHub info:', error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})