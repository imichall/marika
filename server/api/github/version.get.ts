import { githubConfig } from '../../config/github'

export default defineEventHandler(async (event) => {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    }

    if (githubConfig.token) {
      headers['Authorization'] = `Bearer ${githubConfig.token}`
    }

    const response = await fetch(
      `${githubConfig.apiUrl}/repos/${githubConfig.owner}/${githubConfig.repo}/commits`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`)
    }

    const commits = await response.json()

    if (commits.length > 0) {
      const latestCommit = commits[0]
      return {
        version: latestCommit.sha.substring(0, 7),
        lastCommit: latestCommit.commit.message,
        author: latestCommit.commit.author.name,
        date: latestCommit.commit.author.date,
        url: latestCommit.html_url
      }
    }

    throw new Error('No commits found')
  } catch (error: any) {
    console.error('Error fetching GitHub info:', error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})