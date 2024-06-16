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

        const budgetId = searchParams.get('id');
        const { id } = await backendValidation()

        // const budget = await prisma.budgetCategory.delete({
        //     where: { deleted: false, userId: id, id: budgetId },

        // })
        await prisma.budgetCategory.update({
            where: { deleted: false, userId: id, id: budgetId },
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

        const { id } = await backendValidation()

        const budgetId = await prisma.budgetCategory.findFirst({
            where: {
                categoryname: payload.categoryname,
                monthyear: payload.monthyear
            },
            select: {
                id: true
            }
        })

        if (budgetId) return new NextResponse(JSON.stringify({ message: 'Budget Category Exist Already' }), { status: 400 })

        await prisma.budgetCategory.update({
            where: { deleted: false, userId: id, id: payload.id },
            data: {
                categoryname: payload.categoryname,
                monthyear: payload.monthyear,
                budgetamount: Number(payload.budgetamount),
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
        const { id,businessname } = await backendValidation()


        const budgets = await prisma.budgetCategory.findMany({
            where: {   OR: [
                { deleted: false, userId: id },
                { deleted: false, businessname: businessname },
            ],},
            orderBy: { monthyear: 'asc' },
            skip: (page - 1) * pageSize,
            take: pageSize,

        });

        const totalCount = await prisma.budgetCategory.count({
            where: {
                OR: [
                    { deleted: false, userId: id },
                    { deleted: false, businessname: businessname },
                ],
            },
        });

        const result = {
            budgets,
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

        const { id,businessname } = await backendValidation()

        const budgetId = await prisma.budgetCategory.findFirst({
            where: {
                categoryname: payload.categoryname,
                monthyear: payload.monthyear
            },
            select: {
                id: true
            }
        })

        if (budgetId) return new NextResponse(JSON.stringify({ message: 'Budget Category Exist Already' }), { status: 400 })

        await prisma.budgetCategory.create({
            data: {
                ...payload,
                userId: id,
                budgetamount: Number(payload.budgetamount),
                businessname : businessname
            }
        })


        return new Response(JSON.stringify({ message: 'Budget Created Sucessfully' }), {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200
        })


    } catch (error) {
        return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 500 })
    }

}