/**
 * Mock Supabase Client for local development without Supabase keys
 */

// Helper to check if cookies are available (client vs server)
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return
  const d = new Date()
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = `expires=${d.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/`
}

// Global mock state persistence
const GLOBAL_KEY = '__NOVA_MOCK_DB__'

const defaultDB = {
  user_roles: [
    { id: 'role-student', name: 'student', permissions_level: 1 },
    { id: 'role-volunteer', name: 'volunteer', permissions_level: 2 },
    { id: 'role-oc', name: 'oc_team', permissions_level: 3 },
    { id: 'role-admin', name: 'admin', permissions_level: 4 },
    { id: 'role-super', name: 'super_admin', permissions_level: 5 }
  ],
  user_types: [
    { id: 'type-student', name: 'iimb_student', description: 'IIMB Student' },
    { id: 'type-faculty', name: 'iimb_faculty', description: 'IIMB Faculty' }
  ],
  users: [
    {
      id: 'mock-admin-id',
      full_name: 'Mock Administrator',
      email: 'admin@nova.test',
      phone: '+91 99999 99999',
      pincode: '560076',
      state: 'Karnataka',
      city: 'Bangalore',
      batch: '2026',
      zone: 'South',
      type_id: 'type-student',
      role_id: 'role-super',
      payment_status: 'approved',
      entry_code: 'mock-admin-code',
      entry_status: 'approved',
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-student-id',
      full_name: 'Mock Student Participant',
      email: 'student@nova.test',
      phone: '+91 88888 88888',
      pincode: '560076',
      state: 'Karnataka',
      city: 'Bangalore',
      batch: '2026',
      zone: 'South',
      type_id: 'type-student',
      role_id: 'role-student',
      payment_status: 'approved',
      entry_code: 'mock-student-code',
      entry_status: 'approved',
      created_at: new Date().toISOString()
    }
  ],
  categories: [
    { id: 'cat-cultural', title: 'Cultural', status: 'active', description: 'Music, Dance, Drama, Arts' },
    { id: 'cat-technical', title: 'Technical', status: 'active', description: 'Hackathons, Coding, Case Study' },
    { id: 'cat-sports', title: 'Sports', status: 'active', description: 'Cricket, Football, Basketball' }
  ],
  events: [
    {
      id: 'ev-1',
      title: 'Battle of Bands',
      description: 'The ultimate rock show and musical showdown',
      banner_url: null,
      category_id: 'cat-cultural',
      category: 'cultural',
      participation_type: 'team',
      team_size_min: 3,
      team_size_max: 8,
      rulebook_url: '#',
      organizer_name: 'John Doe',
      organizer_contact: '9876543210',
      group_join_link: '#',
      venue: 'Auditorium',
      start_time: '2026-06-15T18:00:00Z',
      end_time: '2026-06-15T22:00:00Z',
      is_active: true,
      created_by: 'mock-admin-id',
      created_at: '2026-05-01T00:00:00Z'
    },
    {
      id: 'ev-2',
      title: 'Dev Hackathon',
      description: 'Build premium web apps in 24 hours',
      banner_url: null,
      category_id: 'cat-technical',
      category: 'technical',
      participation_type: 'individual',
      team_size_min: 1,
      team_size_max: 1,
      rulebook_url: '#',
      organizer_name: 'Jane Smith',
      organizer_contact: '9876543211',
      group_join_link: '#',
      venue: 'MDC Hall',
      start_time: '2026-06-16T10:00:00Z',
      end_time: '2026-06-17T10:00:00Z',
      is_active: true,
      created_by: 'mock-admin-id',
      created_at: '2026-05-02T00:00:00Z'
    },
    {
      id: 'ev-3',
      title: 'Nova Volleyball Cup',
      description: '6v6 volleyball tournament',
      banner_url: null,
      category_id: 'cat-sports',
      category: 'sports',
      participation_type: 'team',
      team_size_min: 6,
      team_size_max: 8,
      rulebook_url: '#',
      organizer_name: 'Bob Johnson',
      organizer_contact: '9876543212',
      group_join_link: '#',
      venue: 'Sports Ground',
      start_time: '2026-06-17T14:00:00Z',
      end_time: '2026-06-17T18:00:00Z',
      is_active: true,
      created_by: 'mock-admin-id',
      created_at: '2026-05-03T00:00:00Z'
    }
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'Welcome to Nova Unplugged 26!',
      body: 'We are thrilled to launch the new platform. Please complete your registration and pay the entry fee.',
      posted_by: 'mock-admin-id',
      created_at: '2026-05-24T12:00:00Z'
    }
  ],
  payment_submissions: [
    {
      id: 'pay-1',
      user_id: 'mock-student-id',
      utr_number: 'UTR123456789',
      screenshot_url: 'https://placeholder.svg',
      status: 'approved',
      admin_note: 'Validated',
      reviewed_by: 'mock-admin-id',
      created_at: '2026-05-24T13:00:00Z'
    }
  ],
  scanner_log: [] as any[],
  teams: [] as any[],
  team_members: [] as any[],
  registrations: [] as any[]
}

// In Next.js SSR, we want a mock DB that persists in memory or on the global object
if (!(globalThis as any)[GLOBAL_KEY]) {
  (globalThis as any)[GLOBAL_KEY] = JSON.parse(JSON.stringify(defaultDB))
}

const getMockDB = () => (globalThis as any)[GLOBAL_KEY] as typeof defaultDB
const resetMockDB = () => {
  (globalThis as any)[GLOBAL_KEY] = JSON.parse(JSON.stringify(defaultDB))
}

export function getMockUserAndRole(cookieStore?: any) {
  let role = 'super_admin'
  let paymentStatus = 'approved'

  if (cookieStore) {
    role = cookieStore.get('nova_mock_role')?.value || 'super_admin'
    paymentStatus = cookieStore.get('nova_mock_payment_status')?.value || 'approved'
  } else if (typeof document !== 'undefined') {
    role = getCookie('nova_mock_role') || 'super_admin'
    paymentStatus = getCookie('nova_mock_payment_status') || 'approved'
  }

  const db = getMockDB()
  const user = db.users.find(u => {
    if (role === 'super_admin' || role === 'admin') {
      return u.id === 'mock-admin-id'
    }
    return u.id === 'mock-student-id'
  }) || db.users[0]

  // Update dynamic values based on cookies
  if (user) {
    if (role === 'super_admin' || role === 'admin') {
      user.role_id = 'role-super'
    } else if (role === 'volunteer') {
      user.role_id = 'role-volunteer'
    } else if (role === 'oc_team') {
      user.role_id = 'role-oc'
    } else {
      user.role_id = 'role-student'
    }
    user.payment_status = paymentStatus
  }

  return { user, role, paymentStatus }
}

class MockQueryBuilder {
  private tableName: string
  private filteredData: any[]

  constructor(tableName: string, data: any[]) {
    this.tableName = tableName
    this.filteredData = [...data]
  }

  select(columns = '*') {
    // If selecting user_roles or user_types nested relation, resolve them
    if (columns.includes('user_roles') || columns.includes('user_types')) {
      const db = getMockDB()
      this.filteredData = this.filteredData.map(item => {
        const newItem = { ...item }
        if (item.role_id) {
          newItem.user_roles = db.user_roles.find(r => r.id === item.role_id) || null
        }
        if (item.type_id) {
          newItem.user_types = db.user_types.find(t => t.id === item.type_id) || null
        }
        return newItem
      })
    }
    return this
  }

  eq(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => item[column] === value)
    return this
  }

  ilike(column: string, pattern: string) {
    const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i')
    this.filteredData = this.filteredData.filter(item => regex.test(String(item[column] ?? '')))
    return this
  }

  is(column: string, value: any) {
    if (value === null) {
      this.filteredData = this.filteredData.filter(item => item[column] == null)
    } else {
      this.filteredData = this.filteredData.filter(item => item[column] === value)
    }
    return this
  }

  not(column: string, operator: string, value: any) {
    if (operator === 'is') {
      this.filteredData = this.filteredData.filter(item => item[column] != null)
    }
    return this
  }

  match(query: Record<string, any>) {
    Object.entries(query).forEach(([col, val]) => {
      this.filteredData = this.filteredData.filter(item => item[col] === val)
    })
    return this
  }

  contains(column: string, _value: any) {
    // no-op for mock — return all
    return this
  }

  textSearch(column: string, query: string) {
    const q = query.toLowerCase()
    this.filteredData = this.filteredData.filter(item => String(item[column] ?? '').toLowerCase().includes(q))
    return this
  }

  range(from: number, to: number) {
    const total = this.filteredData.length
    this.filteredData = this.filteredData.slice(from, to + 1)
    // Attach count to the then resolver
    const sliced = this.filteredData
    return {
      then: (resolve: any) => resolve({ data: sliced, error: null, count: total }),
    }
  }

  neq(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => item[column] !== value)
    return this
  }

  in(column: string, values: any[]) {
    this.filteredData = this.filteredData.filter(item => values.includes(item[column]))
    return this
  }

  gte(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => item[column] >= value)
    return this
  }

  lte(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => item[column] <= value)
    return this
  }

  order(column: string, { ascending = true } = {}) {
    this.filteredData.sort((a, b) => {
      const valA = a[column]
      const valB = b[column]
      if (valA < valB) return ascending ? -1 : 1
      if (valA > valB) return ascending ? 1 : -1
      return 0
    })
    return this
  }

  limit(n: number) {
    this.filteredData = this.filteredData.slice(0, n)
    return this
  }

  single() {
    const data = this.filteredData[0] || null
    return {
      then: (resolve: any) => resolve({ data, error: data ? null : new Error('Not found') })
    }
  }

  maybeSingle() {
    const data = this.filteredData[0] || null
    return {
      then: (resolve: any) => resolve({ data, error: null })
    }
  }

  async insert(record: any) {
    const db = getMockDB()
    const table = db[this.tableName as keyof typeof db] as any[]
    if (table) {
      const newRecord = {
        id: record.id || Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        ...record
      }
      table.push(newRecord)
      this.filteredData = [newRecord]
    }
    return this
  }

  async update(record: any) {
    const db = getMockDB()
    const table = db[this.tableName as keyof typeof db] as any[]
    if (table) {
      this.filteredData.forEach(item => {
        const found = table.find(t => t.id === item.id)
        if (found) {
          Object.assign(found, record)
          Object.assign(item, record)
        }
      })
    }
    return this
  }

  async delete() {
    const db = getMockDB()
    const table = db[this.tableName as keyof typeof db] as any[]
    if (table) {
      const idsToDelete = this.filteredData.map(item => item.id)
      const updatedTable = table.filter(item => !idsToDelete.includes(item.id))
      ;(db as any)[this.tableName] = updatedTable
    }
    return this
  }

  then(onfulfilled: any, onrejected?: any) {
    return Promise.resolve({ data: this.filteredData, error: null, count: this.filteredData.length }).then(onfulfilled, onrejected)
  }
}

export function createMockSupabaseClient(cookieStore?: any) {
  return {
    auth: {
      getUser: async () => {
        const { user } = getMockUserAndRole(cookieStore)
        return { data: { user }, error: null }
      },
      getSession: async () => {
        const { user } = getMockUserAndRole(cookieStore)
        return {
          data: {
            session: {
              access_token: 'mock-token',
              user
            }
          },
          error: null
        }
      },
      signInWithPassword: async ({ email }: { email: string }) => {
        const db = getMockDB()
        let user = db.users.find(u => u.email === email)
        if (!user) {
          // Auto create user
          user = {
            id: 'mock-student-id',
            full_name: email.split('@')[0],
            email,
            phone: '',
            pincode: '',
            state: '',
            city: '',
            batch: '2026',
            zone: '',
            type_id: 'type-student',
            role_id: 'role-student',
            payment_status: 'pending',
            entry_code: null,
            entry_status: 'not_approved',
            created_at: new Date().toISOString()
          }
          db.users.push(user)
        }
        
        // Set mock cookies
        const isMockAdmin = email.includes('admin')
        if (typeof document !== 'undefined') {
          setCookie('nova_mock_role', isMockAdmin ? 'super_admin' : 'student')
          setCookie('nova_mock_payment_status', isMockAdmin ? 'approved' : user.payment_status)
        }
        return { data: { user }, error: null }
      },
      signOut: async () => {
        if (typeof document !== 'undefined') {
          // Clear mock cookies
          setCookie('nova_mock_role', '', -1)
          setCookie('nova_mock_payment_status', '', -1)
        }
        return { error: null }
      },
      signUp: async ({ email, password, options }: any) => {
        const db = getMockDB()
        const meta = options?.data || {}
        const newUser = {
          id: Math.random().toString(36).substr(2, 9),
          full_name: meta.full_name || email.split('@')[0],
          email,
          phone: meta.phone || '',
          pincode: meta.pincode || '',
          state: meta.state || '',
          city: meta.city || '',
          batch: meta.batch || '2026',
          zone: meta.zone || '',
          type_id: 'type-student',
          role_id: 'role-student',
          payment_status: 'pending',
          entry_code: null,
          entry_status: 'not_approved',
          created_at: new Date().toISOString()
        }
        db.users.push(newUser)
        if (typeof document !== 'undefined') {
          setCookie('nova_mock_role', 'student')
          setCookie('nova_mock_payment_status', 'pending')
        }
        return { data: { user: newUser }, error: null }
      },
      onAuthStateChange: (callback: any) => {
        // No-op for events, trigger immediately
        const { user } = getMockUserAndRole(cookieStore)
        callback('SIGNED_IN', { user })
        return { data: { subscription: { unsubscribe: () => {} } } }
      }
    },
    from: (tableName: string) => {
      const db = getMockDB()
      let data = db[tableName as keyof typeof db] || []
      // If querying users, apply current state from cookies
      if (tableName === 'users') {
        const { user } = getMockUserAndRole(cookieStore)
        data = db.users.map(u => {
          if (u.id === user.id) {
            return user
          }
          return u
        })
      }
      return new MockQueryBuilder(tableName, data)
    },
    storage: {
      from: (bucketName: string) => ({
        upload: async (path: string) => {
          return { data: { path }, error: null }
        },
        getPublicUrl: (path: string) => {
          return { data: { publicUrl: `https://placeholder.co/${bucketName}/${path}` } }
        }
      })
    }
  }
}
