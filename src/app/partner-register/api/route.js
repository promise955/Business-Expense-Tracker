
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { CustomError, assignRoleToUser } from '@/app/auth/confirm/route'
import { Roles, serverCode, serverError } from '@/utils/constant/constant'
import bcrypt from 'bcrypt'


export async function POST(request) {

    try {
        const supabase = createClient()

        const { email, password, businesscode } = await request.json()

        const hashedPassword = bcrypt.hashSync(password, 10);

        const { foundUser, existingBusiness } = await prisma.$transaction(async (prisma) => {

            const foundUser = await prisma.user.findUnique({
                where: { email }, select: { id: true }
            })
            const existingBusiness = await prisma.business.findUnique({
                where: { businesscode, expired: { gt : new Date()} },
                select: { id: true, companyId: true }
            })

            return { foundUser, existingBusiness }
        })

        if (foundUser) {
            return new NextResponse(JSON.stringify({ message: 'Email or Invalid Business Token' }), { status: 404 });
        }
        if (!existingBusiness) {
            return new NextResponse(JSON.stringify({ message: 'Invalid Business Code' }), { status: 404 });
        }

        const { error, data: { user } } = await supabase.auth.signUp({
            email: email, password: password,

            options: {
                emailRedirectTo: process.env.HOST_URL
            },
        })

        if (error) return new NextResponse(JSON.stringify({ message: error.message }), { status: 400 })

        const businessPartner = await prisma.$transaction(async (prisma) => {
            const localUser = await prisma.user.create({
                 data: { email: user.email, password: hashedPassword },
                select: { id: true }
            })
            const createdPartner = await prisma.partner.create({
                data: {
                    companyId: existingBusiness.companyId, userId: localUser.id,
                    businessId: existingBusiness.id
                },
                select: { id: true }
            });

            return { createdPartner, localUser };
        });

        await assignRoleToUser(businessPartner.localUser.id, Roles.PARTNER)
        return new Response(JSON.stringify({ message: 'Registration Successful' }), { status: 200 })


    } catch (error) {
        return CustomError(serverError,serverCode)
    }


}