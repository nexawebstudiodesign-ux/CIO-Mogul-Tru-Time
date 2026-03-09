const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiService {
  constructor() {
    this.baseURL = API_URL
  }

  // 🔐 Always read Supabase access_token
  getAuthHeaders() {
    const token = localStorage.getItem('access_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`

    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      // If unauthorized, auto logout
      if (response.status === 401) {
        this.logout()
        throw new Error('Unauthorized')
      }

      let data
      try {
        const contentType = response.headers.get('content-type')
        const isJson = contentType && contentType.includes('application/json')
        data = isJson ? await response.json() : { message: (await response.text()) || 'Request failed' }
      } catch {
        data = { message: 'Invalid response from server' }
      }

      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }

      return data
    } catch (error) {
      if (error.name === 'TypeError' && (error.message === 'Failed to fetch' || error.cause?.code === 'ECONNREFUSED')) {
        console.error('API Error: cannot reach server', error)
        throw new Error(`Cannot reach server. Is the backend running at ${this.baseURL}?`)
      }
      console.error('API Error:', error)
      throw error
    }
  }

  // ========================
  // AUTH
  // ========================

  // (Keep only if still using backend login for users)
  async login(employeeId, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ employeeId, password }),
    })

    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('ciomogul_user', JSON.stringify(data.user))
    }

    return data
  }

  async adminSignup(name, email, employeeId, password, setupToken) {
    return this.request('/auth/admin-signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, employeeId, password, setupToken }),
    })
  }

  async adminEmailLogin(email, password) {
    const data = await this.request('/auth/email-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('ciomogul_user', JSON.stringify(data.user))
    }

    return data
  }

  // ========================
  // USERS
  // ========================

  async getMe() {
    return this.request('/users/me')
  }

  async getUsers() {
    return this.request('/users')
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    })
  }

  async restoreUser(userId) {
    return this.request(`/users/${userId}/restore`, {
      method: 'PATCH',
    })
  }

  async permanentlyDeleteUser(userId) {
    return this.request(`/users/${userId}/permanent`, {
      method: 'DELETE',
    })
  }

  async updateLeaveBalance(userId, leaveBalanceOrPayload) {
    const payload =
      typeof leaveBalanceOrPayload === 'number'
        ? { leaveBalance: leaveBalanceOrPayload }
        : leaveBalanceOrPayload

    return this.request(`/users/${userId}/leave-balance`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  async resetPassword(userId, password) {
    return this.request(`/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  }

  // ========================
  // ATTENDANCE
  // ========================

  async createAttendance(attendanceData) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    })
  }

  async getMyAttendance(month, year) {
    const params = new URLSearchParams()
    if (month) params.append('month', month)
    if (year) params.append('year', year)
    return this.request(`/attendance/me?${params}`)
  }

  async getAllAttendance(month, year, userId) {
    const params = new URLSearchParams()
    if (month) params.append('month', month)
    if (year) params.append('year', year)
    if (userId) params.append('userId', userId)
    return this.request(`/attendance?${params}`)
  }

  // ========================
  // PUBLIC HOLIDAYS
  // ========================

  async getHolidays() {
    return this.request('/holidays')
  }

  async createHoliday(holidayData) {
    return this.request('/holidays', {
      method: 'POST',
      body: JSON.stringify(holidayData),
    })
  }

  async updateHoliday(holidayId, holidayData) {
    return this.request(`/holidays/${holidayId}`, {
      method: 'PATCH',
      body: JSON.stringify(holidayData),
    })
  }

  async deleteHoliday(holidayId) {
    return this.request(`/holidays/${holidayId}`, {
      method: 'DELETE',
    })
  }

  // ========================
  // LEAVE
  // ========================

  async applyLeave(leaveData) {
    return this.request('/leave', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    })
  }

  async getMyLeaves() {
    return this.request('/leave/me')
  }

  async getAllLeaves() {
    return this.request('/leave')
  }

  async updateLeaveStatus(leaveId, status) {
    const normalizedStatus = String(status ?? '').toUpperCase()

    return this.request(`/leave/${leaveId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: normalizedStatus }),
    })
  }

  async adminCreateLeave(leaveData) {
    const payload = {
      userId: leaveData.userId,
      leaveType: String(leaveData.leaveType ?? leaveData.type ?? '').toUpperCase(),
      fromDate: leaveData.fromDate ?? leaveData.startDate,
      toDate: leaveData.toDate ?? leaveData.endDate,
      reason: leaveData.reason,
      status: String(leaveData.status ?? 'PENDING').toUpperCase(),
    }

    return this.request('/leave/admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async adminUpdateLeave(leaveId, leaveData) {
    const payload = {
      userId: leaveData.userId,
      leaveType: leaveData.leaveType
        ? String(leaveData.leaveType).toUpperCase()
        : leaveData.type
          ? String(leaveData.type).toUpperCase()
          : undefined,
      fromDate: leaveData.fromDate ?? leaveData.startDate,
      toDate: leaveData.toDate ?? leaveData.endDate,
      reason: leaveData.reason,
      status: leaveData.status ? String(leaveData.status).toUpperCase() : undefined,
    }

    return this.request(`/leave/${leaveId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  async deleteLeave(leaveId) {
    return this.request(`/leave/${leaveId}`, {
      method: 'DELETE',
    })
  }

  async cancelLeave(leaveId) {
    return this.request(`/leave/cancel/${leaveId}`, {
      method: 'DELETE',
    })
  }

  // ========================
  // SALARY
  // ========================

  async createSalary(salaryData) {
    return this.request('/salary', {
      method: 'POST',
      body: JSON.stringify(salaryData),
    })
  }

  async getAllSalaries(month, userId) {
    const params = new URLSearchParams()
    if (month) params.append('month', month)
    if (userId) params.append('userId', userId)
    return this.request(`/salary?${params}`)
  }

  async getSalary(salaryId) {
    return this.request(`/salary/${salaryId}`)
  }

  async getMySalaries(month) {
    const params = new URLSearchParams()
    if (month) params.append('month', month)
    return this.request(`/salary/me?${params}`)
  }

  async updateSalary(salaryId, salaryData) {
    return this.request(`/salary/${salaryId}`, {
      method: 'PATCH',
      body: JSON.stringify(salaryData),
    })
  }

  async deleteSalary(salaryId) {
    return this.request(`/salary/${salaryId}`, {
      method: 'DELETE',
    })
  }

  // ========================
  // REPORTS
  // ========================

  async getMonthlySummaryReport(month) {
    const params = new URLSearchParams()
    if (month) params.append('month', month)
    return this.request(`/reports/monthly-summary?${params}`)
  }

  async downloadMonthlySummaryReportCsv(month) {
    const params = new URLSearchParams()
    if (month) params.append('month', month)
    const url = `${this.baseURL}/reports/monthly-summary/csv?${params}`
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error('Failed to download report')
    }
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = `monthly-report-${month}.csv`
    link.click()
    window.URL.revokeObjectURL(objectUrl)
  }

  async emailMonthlySummaryReport(month, to) {
    return this.request('/reports/monthly-summary/email', {
      method: 'POST',
      body: JSON.stringify({ month, to }),
    })
  }

  // ========================
  // LOGOUT
  // ========================

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('ciomogul_user')
    localStorage.removeItem('ciomogul_user_id')
  }
}

export const apiService = new ApiService()
