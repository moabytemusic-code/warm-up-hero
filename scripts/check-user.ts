
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkUser(email: string) {
    console.log(`Checking user: ${email}...`)

    // 1. Get User ID from Auth Admin
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
        console.error('Auth Error:', authError)
        return
    }

    const user = users.find(u => u.email === email)

    if (!user) {
        console.log('User NOT found in Auth System.')
        return
    }

    console.log('User FOUND in Auth System:')
    console.log(`- ID: ${user.id}`)
    console.log(`- Email: ${user.email}`)
    console.log(`- Confirmed At: ${user.confirmed_at}`)
    console.log(`- Last Sign In: ${user.last_sign_in_at}`)
    console.log(`- App Metadata:`, user.app_metadata)
    console.log(`- User Metadata:`, user.user_metadata)

    // 2. Check Public Profile
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.log('Profile NOT found in public.users table (or error):', profileError.message)
    } else {
        console.log('Profile FOUND in public.users:')
        console.log(profile)
    }
}

const email = process.argv[2]
if (!email) {
    console.error('Please provide an email address.')
} else {
    checkUser(email)
}
