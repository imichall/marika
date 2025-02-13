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
      // Získat commit
      const commitResponse = await fetch(
        `${githubConfig.apiUrl}/repos/${githubConfig.owner}/${githubConfig.repo}/commits/${branch}`,
        { headers }
      )

      if (!commitResponse.ok) {
        throw new Error(`GitHub API responded with status ${commitResponse.status} for branch ${branch}`)
      }

      const commit = await commitResponse.json()

      // Získat tag pro tento commit
      const tagsResponse = await fetch(
        `${githubConfig.apiUrl}/repos/${githubConfig.owner}/${githubConfig.repo}/tags`,
        { headers }
      )

      let tag = null
      if (tagsResponse.ok) {
        const tags = await tagsResponse.json()
        const matchingTag = tags.find((t: any) => t.commit.sha === commit.sha)
        if (matchingTag) {
          tag = matchingTag.name
        }
      }

      return {
        version: commit.sha.substring(0, 7),
        lastCommit: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
        branch,
        tag
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