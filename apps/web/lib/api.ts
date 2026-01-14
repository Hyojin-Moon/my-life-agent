const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // Profile
  async getProfile() {
    return this.request('/api/profile')
  }

  async updateProfile(data: any) {
    return this.request('/api/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePreferences(data: any) {
    return this.request('/api/profile/preferences', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Recommendations
  async getRecommendations(params: {
    type: 'travel' | 'food' | 'exercise'
    context?: string
    limit?: number
  }) {
    return this.request('/api/recommendations', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async sendFeedback(id: string, liked: boolean, reason?: string) {
    return this.request(`/api/recommendations/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ liked, reason }),
    })
  }

  // Records
  async getRecords(params?: { type?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams()
    if (params?.type) query.set('type', params.type)
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.offset) query.set('offset', params.offset.toString())
    return this.request(`/api/records?${query}`)
  }

  async createRecord(data: any) {
    return this.request('/api/records', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRecord(id: string, data: any) {
    return this.request(`/api/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteRecord(id: string) {
    return this.request(`/api/records/${id}`, {
      method: 'DELETE',
    })
  }

  async getStats() {
    return this.request('/api/records/stats/summary')
  }
}

export const api = new ApiClient(API_BASE_URL)
