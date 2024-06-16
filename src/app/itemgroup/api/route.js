'use server'
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server'
import { backendValidation } from "@/app/auth/confirm/route";



export async function DELETE(request) {

    try {

        const url = new URL(request.url)

        const searchParams = url.searchParams;

        const itemId = searchParams.get('id');
        const { id, businessname } = await backendValidation()
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
        const { id, businessname } = await backendValidation()
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

        const { id, businessname } = await backendValidation()
        const itemgroups = await prisma.itemGroup.findMany({
            where: {
                OR: [
                    {
                        deleted: false,
                        userId: id,
                    },
                    {
                        deleted: false,
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
                    { deleted: false, businessname: businessname },
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

        const payload = await request.json()

        const { id, businessname } = await backendValidation()
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
        
        return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 500 })
    }

}