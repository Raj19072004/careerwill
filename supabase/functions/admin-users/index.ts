/*
  # Admin Users Management Function

  1. Functionality
    - GET: List all users with their profiles and metadata
    - PUT: Update user role (admin/user)
    - DELETE: Delete a user account
  
  2. Security
    - Requires authenticated user with 'admin' role
    - Uses service role key for admin operations
    - Validates permissions before each operation
  
  3. CORS
    - Handles preflight OPTIONS requests
    - Allows cross-origin requests from frontend
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client to verify the requesting user
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user is authenticated and get user data
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Check if user is admin
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient permissions. Admin role required.',
          code: 'not_admin',
          message: 'User not allowed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    const method = req.method

    if (method === 'GET') {
      // List all users with their profiles
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (authError) {
        console.error('Error fetching users:', authError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }

      // Get user profiles
      const userIds = authUsers.users.map(user => user.id)
      const { data: profiles } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .in('id', userIds)

      // Combine auth data with profile data
      const combinedUsers = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id)
        return {
          id: authUser.id,
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name || profile?.first_name || '',
          last_name: authUser.user_metadata?.last_name || profile?.last_name || '',
          phone: authUser.user_metadata?.phone || profile?.phone || '',
          role: authUser.user_metadata?.role || 'user',
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          email_confirmed_at: authUser.email_confirmed_at,
          updated_at: profile?.updated_at || authUser.updated_at
        }
      })

      return new Response(
        JSON.stringify({ users: combinedUsers }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (method === 'PUT') {
      // Update user role
      const { userId, role } = await req.json()
      
      if (!userId || !role) {
        return new Response(
          JSON.stringify({ error: 'Missing userId or role' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }

      if (!['user', 'admin'].includes(role)) {
        return new Response(
          JSON.stringify({ error: 'Invalid role. Must be "user" or "admin"' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }

      // Get current user data to preserve existing metadata
      const { data: currentUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId)
      
      if (getUserError || !currentUser.user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        )
      }

      // Update user metadata while preserving existing data
      const updatedMetadata = {
        ...currentUser.user.user_metadata,
        role
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: updatedMetadata
        }
      )

      if (updateError) {
        console.error('Error updating user role:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update user role' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'User role updated successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (method === 'DELETE') {
      // Delete user
      const { userId } = await req.json()
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }

      // Prevent admin from deleting themselves
      if (userId === user.id) {
        return new Response(
          JSON.stringify({ error: 'Cannot delete your own account' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }

      // Delete user (this will cascade to user_profiles due to foreign key)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (deleteError) {
        console.error('Error deleting user:', deleteError)
        return new Response(
          JSON.stringify({ error: 'Failed to delete user' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'User deleted successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})