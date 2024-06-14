'use server'
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server'
import { readUserSession } from "@/lib/action";
import { backendValidation } from "@/app/auth/confirm/route";




export async function DELETE(request) {

    try {

        const url = new URL(request.url)

        const searchParams = url.searchParams;

        const itemId = searchParams.get('id');

        const {id,businessname} = await backendValidation()
        await prisma.item.update({
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

        const {id,businessname} = await backendValidation()
  
        const itemId = await prisma.item.findFirst({
            where: {
                itemname: payload.itemname,
                itemGroupId : payload.itemGroupId,
                price : Number(payload.price),
            },
            select: {
                id: true
            }
        })

        if (itemId) return new NextResponse(JSON.stringify({ message: 'Item Exist Already' }), { status: 400 })


        await prisma.item.update({
            where: { deleted: false, userId: id, id: payload.id },
            data: {
                itemname: payload.itemname,
                itemGroupId : payload.itemGroupId,
                price : Number(payload.price),
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

        const {id,businessname} = await backendValidation()

        const items = await prisma.item.findMany({
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
            include: {
                itemGroup: {
                    select: {
                        itemgroupname: true
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,

        });

        const totalCount = await prisma.item.count({
            where: {
                OR: [
                    { deleted: false, userId: id },
                    { deleted: false, businessname: businessname },
                ],
            },
        });

        const result = {
            items,
            totalCount
        }


        return new Response(JSON.stringify({ message: result }), {
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


export async function POST(request) {

    try {

        const payload = await request.json()
        const {id,businessname} = await backendValidation()

        const itemId = await prisma.item.findFirst({
            where: {
                itemname: payload.itemname,
                itemGroupId : payload.itemGroupId,
                price : Number(payload.price),
            },
            select: {
                id: true
            }
        })

        if (itemId) return new NextResponse(JSON.stringify({ message: 'Item Exist Already' }), { status: 400 })

        await prisma.item.create({
            data: {
                ...payload,
                userId: id,
                businessname: businessname,
                price : Number(payload.price)
            }
        })

        return new Response(JSON.stringify({ message: 'Item Created Sucessfully' }), {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200
        })

    } catch (error) {

        return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 500 })
    }

}