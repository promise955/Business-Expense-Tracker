
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { assignRoleToUser, CustomError, CustomResponse } from '@/app/auth/confirm/route'
import { Roles, serverCode, serverError } from '@/utils/constant/constant'

export async function POST(request) {

    try {
        const supabase = createClient()

        const { email, password } = await request.json()

        const { error, data: { user } } = await supabase.auth.signInWithPassword({ email: email, password: password })

        if (error) return new NextResponse(JSON.stringify({ message: error.message }), { status: 400 })

        const localuser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true }
        });


        const [userRoles, company, partnerGroups] = await Promise.all([
            prisma.userRole.findMany({
                where: { userId: localuser.id },
                include: { role: true },
            }),
            prisma.company.findFirst({
                where: {
                    OR: [{ companyownerId: localuser.id }, {
                        Partner: {
                            some: {
                                userId: localuser.id,
                                approved: true,
                              },
                        }
                    }]
                },

                select: {
                    id: true,
                    companyname: true,
                    Partner : true

                }
            }),
            prisma.partner.findMany({
                where: { approved: true, userId: localuser.id },
                select: {
                    id: true,
                    business: true
                }
            })
        ]);


        const roles = userRoles.map((userRole) => userRole.role.name);

        const partners = partnerGroups.map((partner) => partner.business.businessname);

        const loggedIn = {
            email: user.email,
            //businesses: businesses,
            roles: roles,
            companyname : company.companyname
        };


        return CustomResponse(loggedIn,200)

    } catch (error) {
     
        return CustomError(serverError,serverCode)
    }


}

