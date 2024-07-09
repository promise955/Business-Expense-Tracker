
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { CustomError, CustomResponse, assignRoleToUser } from '@/app/auth/confirm/route'
import { Roles } from '@/utils/constant/constant'
import bcrypt from 'bcrypt'

export async function POST(request) {

    try {

        const supabase = createClient()
        const { email, password, businessname, companyname } = await request.json()

        const hashedPassword = bcrypt.hashSync(password, 10);


        const { foundUser, existingBusiness, existingCompany } = await prisma.$transaction(async (prisma) => {

            const foundUser = await prisma.user.findUnique({
                where: { email: email }
            })
            const existingBusiness = await prisma.business.findUnique({
                where: { businessname },
                select: { id: true }
            })
            const existingCompany = await prisma.company.findUnique({
                where: { companyname },
                select: { id: true }
            })

            return { foundUser, existingBusiness, existingCompany }
        })


        if (foundUser) {
            return new NextResponse(JSON.stringify({ message: 'Email or Company exist' }), { status: 404 });
        }
        if (existingBusiness) {
            return new NextResponse(JSON.stringify({ message: 'Buiness Name already taken' }), { status: 404 });
        }
        if (existingCompany) {
            return new NextResponse(JSON.stringify({ message: 'Company Name already taken' }), { status: 404 });
        }

        const { error, data: { user } } = await supabase.auth.signUp({
            email: email, password: password,

            options: {
                emailRedirectTo: process.env.HOST_URL
            },
        })

        if (error) return new NextResponse(JSON.stringify({ message: error.message }), { status: 400 })

        const company = await prisma.$transaction(async (prisma) => {
            const localUser = await prisma.user.create({
               data: { email: user.email, password: hashedPassword },
                select: { id: true }
            })
            const createdCompany = await prisma.company.create({
                data: { companyname,companyownerId : localUser.id },
                select: { id: true }
            });

            const createdBusiness= await prisma.business.create({
                data: {
                    businessname,
                    companyId: createdCompany.id
                },
                select: { id: true }
            });

            return { createdBusiness, createdCompany,localUser };
        });


        await assignRoleToUser(company.localUser.id, Roles.BUSINESSOWNER)

        return CustomResponse('Registration Successful',200)

    } catch (error) {
      
        return CustomError('An unexpected error occurred. Please try again later',500)
    }


}

