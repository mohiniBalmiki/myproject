import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import * as kv from './kv_store.tsx'

const app = new Hono()

// CORS configuration
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Health check endpoint
app.get('/make-server-ae5c3d62/health', async (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// User Authentication Routes
app.post('/make-server-ae5c3d62/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm since email server not configured
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Create user profile in KV store
    await kv.set(`user_profile:${data.user.id}`, {
      id: data.user.id,
      name,
      email,
      phone: '',
      pan: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    return c.json({ 
      user: data.user,
      message: 'User created successfully'
    })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Profile Management Routes
app.get('/make-server-ae5c3d62/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await kv.get(`user_profile:${userId}`)
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }

    return c.json({ profile })
  } catch (error) {
    console.log('Get profile error:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

app.put('/make-server-ae5c3d62/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const updates = await c.req.json()

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get existing profile
    const existingProfile = await kv.get(`user_profile:${userId}`) || {}
    
    // Update profile
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      updated_at: new Date().toISOString()
    }

    await kv.set(`user_profile:${userId}`, updatedProfile)

    return c.json({ 
      profile: updatedProfile,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.log('Update profile error:', error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// Connected Accounts Routes
app.get('/make-server-ae5c3d62/accounts/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const accounts = await kv.get(`user_accounts:${userId}`) || []
    return c.json({ accounts })
  } catch (error) {
    console.log('Get accounts error:', error)
    return c.json({ error: 'Failed to fetch accounts' }, 500)
  }
})

app.post('/make-server-ae5c3d62/accounts/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const accountData = await c.req.json()

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const existingAccounts = await kv.get(`user_accounts:${userId}`) || []
    
    const newAccount = {
      id: Date.now().toString(),
      ...accountData,
      status: Math.random() > 0.3 ? 'connected' : 'pending',
      balance: accountData.accountType === 'Credit Card' ? 
        `₹${Math.floor(Math.random() * 50000 + 10000).toLocaleString()} limit` :
        `₹${Math.floor(Math.random() * 500000 + 50000).toLocaleString()}`,
      created_at: new Date().toISOString()
    }

    const updatedAccounts = [...existingAccounts, newAccount]
    await kv.set(`user_accounts:${userId}`, updatedAccounts)

    return c.json({ 
      account: newAccount,
      message: 'Account connected successfully'
    })
  } catch (error) {
    console.log('Connect account error:', error)
    return c.json({ error: 'Failed to connect account' }, 500)
  }
})

app.delete('/make-server-ae5c3d62/accounts/:userId/:accountId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accountId = c.req.param('accountId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const existingAccounts = await kv.get(`user_accounts:${userId}`) || []
    const updatedAccounts = existingAccounts.filter((acc: any) => acc.id !== accountId)
    
    await kv.set(`user_accounts:${userId}`, updatedAccounts)

    return c.json({ message: 'Account disconnected successfully' })
  } catch (error) {
    console.log('Disconnect account error:', error)
    return c.json({ error: 'Failed to disconnect account' }, 500)
  }
})

// Notification Settings Routes
app.get('/make-server-ae5c3d62/notifications/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const settings = await kv.get(`user_notifications:${userId}`) || {
      taxReminders: true,
      cibilAlerts: true,
      spendingInsights: false,
      investmentTips: true
    }

    return c.json({ settings })
  } catch (error) {
    console.log('Get notifications error:', error)
    return c.json({ error: 'Failed to fetch notification settings' }, 500)
  }
})

app.put('/make-server-ae5c3d62/notifications/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const settings = await c.req.json()

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    await kv.set(`user_notifications:${userId}`, {
      ...settings,
      updated_at: new Date().toISOString()
    })

    return c.json({ 
      settings,
      message: 'Notification settings updated successfully'
    })
  } catch (error) {
    console.log('Update notifications error:', error)
    return c.json({ error: 'Failed to update notification settings' }, 500)
  }
})

// File Upload Routes
app.post('/make-server-ae5c3d62/files/upload/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    // Create bucket if it doesn't exist
    const bucketName = `make-ae5c3d62-user-files`
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false })
    }

    // Upload file to Supabase Storage
    const fileName = `${userId}/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file)

    if (uploadError) {
      console.log('File upload error:', uploadError)
      return c.json({ error: 'Failed to upload file' }, 500)
    }

    // Create signed URL for the uploaded file
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 7) // 7 days

    // Save file metadata
    const fileMetadata = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      path: fileName,
      url: signedUrlData?.signedUrl,
      uploaded_at: new Date().toISOString()
    }

    const existingFiles = await kv.get(`user_files:${userId}`) || []
    const updatedFiles = [...existingFiles, fileMetadata]
    await kv.set(`user_files:${userId}`, updatedFiles)

    return c.json({ 
      file: fileMetadata,
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.log('File upload error:', error)
    return c.json({ error: 'Failed to upload file' }, 500)
  }
})

app.get('/make-server-ae5c3d62/files/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const files = await kv.get(`user_files:${userId}`) || []
    return c.json({ files })
  } catch (error) {
    console.log('Get files error:', error)
    return c.json({ error: 'Failed to fetch files' }, 500)
  }
})

// Reports Routes
app.get('/make-server-ae5c3d62/reports/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const reports = await kv.get(`user_reports:${userId}`) || []
    return c.json({ reports })
  } catch (error) {
    console.log('Get reports error:', error)
    return c.json({ error: 'Failed to fetch reports' }, 500)
  }
})

app.post('/make-server-ae5c3d62/reports/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const reportData = await c.req.json()

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const existingReports = await kv.get(`user_reports:${userId}`) || []
    
    const newReport = {
      id: Date.now().toString(),
      ...reportData,
      created_at: new Date().toISOString()
    }

    const updatedReports = [...existingReports, newReport]
    await kv.set(`user_reports:${userId}`, updatedReports)

    return c.json({ 
      report: newReport,
      message: 'Report saved successfully'
    })
  } catch (error) {
    console.log('Save report error:', error)
    return c.json({ error: 'Failed to save report' }, 500)
  }
})

// Start server
Deno.serve(app.fetch)