// Supabase mock for testing

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated',
};

// Mock session data
export const mockSession = {
  user: mockUser,
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
};

// Mock profile data
export const mockJobseekerProfile = {
  id: 'test-user-id',
  full_name: 'John Doe',
  username: 'johndoe',
  email: 'test@example.com',
  phone: '+1234567890',
  date_of_birth: '1990-01-01',
  gender: 'male',
  country: 'US',
  city: 'New York',
  education_level: 'bachelor',
  experience_level: 'mid',
  skills: ['JavaScript', 'React', 'TypeScript'],
  profile_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockEmployerProfile = {
  id: 'test-employer-id',
  company_name: 'Test Company',
  company_username: 'testcompany',
  email: 'employer@example.com',
  phone: '+1234567890',
  company_website: 'https://example.com',
  company_address: '123 Test St',
  country: 'US',
  city: 'New York',
  is_verified: true,
  business_verification_status: 'approved',
  profile_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock job data
export const mockJob = {
  id: 'test-job-id',
  employer_id: 'test-employer-id',
  title: 'Senior React Developer',
  description: 'Test job description',
  location: 'Remote',
  salary_min: 80000,
  salary_max: 120000,
  job_type: 'full-time',
  category: 'engineering',
  experience_level: 'senior',
  skills_required: ['React', 'TypeScript', 'Node.js'],
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  employer_profiles: {
    company_name: 'Test Company',
    email: 'employer@example.com',
    business_verification_status: 'approved',
    premium_plan: 'professional',
    profile_image_url: null,
  },
};

// Mock application data
export const mockApplication = {
  id: 'test-application-id',
  job_id: 'test-job-id',
  jobseeker_id: 'test-user-id',
  status: 'pending',
  cover_letter: 'Test cover letter',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  jobs: {
    id: 'test-job-id',
    employer_id: 'test-employer-id',
    title: 'Senior React Developer',
    location: 'Remote',
    salary_min: 80000,
    salary_max: 120000,
    job_type: 'full-time',
    category: 'engineering',
    skills_required: ['React', 'TypeScript'],
    employer_profiles: {
      company_name: 'Test Company',
      email: 'employer@example.com',
      business_verification_status: 'approved',
      premium_plan: 'professional',
      profile_image_url: null,
    },
  },
};

// Create Supabase client mock
export const createSupabaseMock = () => {
  const mock = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: mockSession }, error: null }),
      getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: mockUser }, error: null }),
      signUp: () => Promise.resolve({ data: { user: mockUser }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      refreshSession: () => Promise.resolve({ data: { session: mockSession }, error: null }),
    },
    from: () => mock,
    select: () => mock,
    insert: () => mock,
    update: () => mock,
    delete: () => mock,
    eq: () => mock,
    neq: () => mock,
    ilike: () => mock,
    or: () => mock,
    gt: () => mock,
    lt: () => mock,
    gte: () => mock,
    lte: () => mock,
    order: () => mock,
    limit: () => mock,
    single: () => mock,
    maybeSingle: () => mock,
    range: () => mock,
    in: () => mock,
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: null }),
        remove: () => Promise.resolve({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/file.pdf' } }),
      }),
    },
  };

  return mock;
};

export const supabaseMock = createSupabaseMock();
