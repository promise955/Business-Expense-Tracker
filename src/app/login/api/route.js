
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {

    try {
        const supabase = createClient()

        const { email, password } = await request.json()

        const { error, data: { user } } = await supabase.auth.signInWithPassword({ email: email, password: password })

        if (error)return new NextResponse(JSON.stringify({ message: error.message }), { status: 400 })
           
        const id = await prisma.user.findFirst({
            where: {
                email: user.email
            },
            select: {
                id: true
            }
        })
     
        if (!id) return new NextResponse(JSON.stringify({ message: 'Invalid credentials' }), { status: 400 })
    
        return new Response(JSON.stringify({ message: user }), {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200
        })


    } catch (error) {

        return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 500 })
    }


}

