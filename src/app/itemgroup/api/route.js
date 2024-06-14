'use server'
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server'
import { readUserSession } from "@/lib/action";



export async function DELETE(request) {

    try {

        const url = new URL(request.url)

        const searchParams = url.searchParams;

        const itemId = searchParams.get('id');
        const userId = searchParams.get('user');

        const { user, error } = await readUserSession()

        if (error) return new NextResponse(JSON.stringify({ message: error.message }), { status: 400 })

        const { id } = await prisma.user.findFirst({
            where: {
                email: user.email
            },
            select: {
                id: true
            }
        })
        if (!id) return new NextResponse(JSON.stringify({ message: "Invalid credentials or seesion expired" }), { status: 400 })

        await prisma.itemGroup.update({
            where: { deleted: false, userId: id, id: itemId },
            data: {
                deleted: true
            }

        })


        return new Response(JSON.stringify({ message: 'Deleted Sucessfully' }), {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200
        })
    } catch (error) {

        return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 500 })
    }


}

export async function PATCH(request) {

    try {
        const payload = await request.json()
        const { user, error } = await readUserSession()

        if (error) return new NextResponse(JSON.stringify({ message: error.message }), { status: 400 })

        const { id } = await prisma.user.findFirst({
            where: {
                email: user.email
            },
            select: {
                id: true
            }
        })
        if (!id) return new NextResponse(JSON.stringify({ message: "Invalid credentials or seesion expired" }), { status: 400 })

        
        const groupId = await prisma.itemGroup.findFirst({
            where: {
                itemgroupname: payload.itemgroupname
            },
            select: {
                id: true
            }
        })

        if (groupId) return new NextResponse(JSON.stringify({ message: 'Item Group Exist Already' }), { status: 400 })

        await prisma.itemGroup.update({
            where: { deleted: false, userId: id, id: payload.id },
            data: {
                itemgroupname: payload.itemgroupname
            }
        })


        return new Response(JSON.stringify({ message: 'Update Sucessfully' }), {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200
        })
    } catch (error) {

        return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 400 })
    }


}


export async function GET(request) {

    try {
        const url = new URL(request.url)
        const searchParams = url.searchParams;
        const page = Number(searchParams.get('page')) || 1;
        const pageSize = Number(searchParams.get('pageSize')) || 10;
        const { user, error } = await readUserSession()

        if (error) return new NextResponse(JSON.stringify({ message: error.message }), { status: 400 })

        const { id, businessname } = await prisma.user.findFirst({
            where: {
                email: user.email
            },
            select: {
                id: true,
                businessname: true
            }
        })
        if (!id) return new NextResponse(JSON.stringify({ message: "Invalid credentials or seesion expired" }), { status: 400 })

        const itemgroups = await prisma.itemGroup.findMany({
            where: {
                OR: [
                    {
                        deleted: false,
                        userId: id,
                    },
                    {
                        deleted: true,
                        businessname: businessname,
                    },
                ],
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,

        });

        const totalCount = await prisma.itemGroup.count({
            where: {
                OR: [
                    { deleted: false, userId: id },
                    { deleted: true, businessname: businessname },
                ],
            },
        });

        const result = {
            itemgroups,
            totalCount
        }

        return new Response(JSON.stringify({ message: result }), {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200
        })
    } catch (error) {

        return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 500 })
    }

}

export async function POST(request) {

    try {
        const supabase = createClient()

        const payload = await request.json()

        const { error, data: { user } } = await supabase.auth.getUser()


        if (error) return new NextResponse(JSON.stringify({ message: "Invalid request" }), { status: 400 })

        const { id, businessname } = await prisma.user.findFirst({
            where: {
                email: user.email
            },
            select: {
                id: true,
                businessname: true
            }
        })

        if (!id) return new NextResponse(JSON.stringify({ message: 'Invalid credentials or seesion expired' }), { status: 400 })


        const groupId = await prisma.itemGroup.findFirst({
            where: {
                itemgroupname: payload.itemgroupname
            },
            select: {
                id: true
            }
        })

        if (groupId) return new NextResponse(JSON.stringify({ message: 'Item Group Exist Already' }), { status: 400 })

        await prisma.itemGroup.create({
            data: {
                ...payload,
                userId: id,
                businessname: businessname
            }
        })

        return new Response(JSON.stringify({ message: 'Item Group Created Sucessfully' }), {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200
        })


    } catch (error) {
        console.log(error);

        return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 500 })
    }

}