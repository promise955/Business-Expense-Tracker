'use server'
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server'
import { backendValidation } from "@/app/auth/confirm/route";




export async function DELETE(request) {

    try {

        const url = new URL(request.url)

        const searchParams = url.searchParams;

        const incomeId = searchParams.get('id');

        const { id } = await backendValidation()
        await prisma.income.update({
            where: { deleted: false, userId: id, id: incomeId },
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

        const incomeId = await prisma.income.findFirst({
            where: {
                incomename: payload.incomename,
                budgetCatergoryId: payload.budgetCatergoryId,
                amount: Number(payload.amount),
                date: payload.date
            },
            select: {
                id: true
            }
        })

        if (incomeId) return new NextResponse(JSON.stringify({ message: 'Income Exist Already' }), { status: 400 })

        await prisma.income.update({
            where: { deleted: false, userId: id, id: payload.id },
            data: {
                incomename: payload.incomename,
                budgetCatergoryId: payload.budgetCatergoryId,
                amount: Number(payload.amount),
                date: payload.date
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

        const incomes = await prisma.income.findMany({
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

        const totalCount = await prisma.income.count({
            where: {
                OR: [
                    { deleted: false, userId: id },
                    { deleted: false, businessname: businessname },
                ],
            },
        });

        const result = {
            incomes,
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
        const { id, businessname } = await backendValidation()

        const incomeId = await prisma.income.findFirst({
            where: {
                incomename: payload.incomename,
                budgetCategoryId: payload.budgetCategoryId,
                amount: Number(payload.amount),
                date: payload.date,
            },
            select: {
                id: true
            }
        })

        if (incomeId) return new NextResponse(JSON.stringify({ message: 'Income Exist Already' }), { status: 400 })

        const response = await prisma.budgetCategory.findFirst({
            where: {
                id: payload.budgetCategoryId
            },
            select: {
                totalincome: true
            }
        })

        if (!response) return new NextResponse(JSON.stringify({ message: 'Invalid Budget' }), { status: 400 })
        const newTotalIncome = Number(response.totalincome) + Number(payload.amount)

        await prisma.budgetCategory.update({
            where: {
                id: payload.budgetCategoryId
            },
            data: {
                totalincome: newTotalIncome
            }

        })

        
        await prisma.income.create({
            data: {
                ...payload,
                userId: id,
                businessname: businessname,
                amount: Number(payload.amount)
            }
        })

        return new Response(JSON.stringify({ message: 'Income Created Sucessfully' }), {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200
        })

    } catch (error) {
     
        return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 500 })
    }

}