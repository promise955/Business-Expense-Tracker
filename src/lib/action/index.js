'use server'
import { createClient } from "@/utils/supabase/server"

export async function readUserSession() {

    const supabase = createClient()

    const { error, data: { user } } = await supabase.auth.getUser()

    supabase.auth.onAuthStateChange(async (event, session) => {
        if (session == null) return { error: 'Auth session Missing' }
    });
    return { error, user }


}