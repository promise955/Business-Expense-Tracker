
'use server'
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server'
import { backendValidation } from "@/app/auth/confirm/route";


export async function GET(request) {

    try {
        // const url = new URL(request.url)
        // const searchParams = url.searchParams;
        // const page = Number(searchParams.get('page')) || 1;
        // const pageSize = Number(searchParams.get('pageSize')) || 10;
        const { id, businessname } = await backendValidation()

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
            select: {
                id: true,
                itemname: true,
                price: true,
                itemGroupId: true,
                itemGroup: {
                    select: {
                        itemgroupname: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            // skip: (page - 1) * pageSize,
            // take: pageSize,

        });

        // const totalCount = await prisma.item.count({
        //     where: {
        //         OR: [
        //             { deleted: false, userId: id },
        //             { deleted: true, businessname: businessname },
        //         ],
        //     },
        // });

        // const result = {
        //     items,
        //     totalCount
        // }

        return new Response(JSON.stringify({ message: items }), {
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
        const items = await prisma.item.findMany({
            where: { id: { in: payload.itemId } },
            select: { id: true }
        });

        if (!items) new NextResponse(JSON.stringify({ message: 'Item not found' }), { status: 400 })

        const orderedData = payload.itemId.map((id, index) => ({
            id,
            quantity: payload.quantity[index],
            name: payload.name[index],
            price: payload.price[index],
            itemId: payload.itemId[index],
            itemGroupId: payload.itemGroupId[index]
        })).sort((a, b) => a.id - b.id);


        const expenseGroup = await prisma.expenseGroup.create({
            data: {
                date: payload.date,
                totalamount: Number(payload.amount),
                userId: id,
                businessname: businessname

            }
        })

        if (!expenseGroup) return new NextResponse(JSON.stringify({ message: 'An error occured' }), { status: 500 })

        const budgetCategory = await prisma.budgetCategory.findFirst({
            where: { id: payload.budgetCategoryId },
            select: { totalexpense: true }
        })

        if (!budgetCategory) return new NextResponse(JSON.stringify({ message: 'Invalid Budget' }), { status: 400 })


        const newItems = orderedData.map(item => ({
            total: Number(item.price) * Number(item.quantity),
            expensename: item.name,
            amount: item.price,
            quantity: item.quantity,
            itemId: item.itemId,
            itemGroupId: item.itemGroupId,
            budgetCategoryId: payload.budgetCategoryId,
            date: payload.date,
            grandtotal: Number(payload.amount),
            userId: id,
            expenseGroupId : expenseGroup.id,
            businessname: businessname
        }));

        const createdOrder = await prisma.expense.createMany({
            data: newItems
        });

        if (!createdOrder) {
            return new NextResponse(JSON.stringify({ message: 'Expense Creation Failed' }), { status: 500 });
        }
        const newTotalExpense = Number(budgetCategory.totalexpense) + Number(payload.amount)

        await prisma.budgetCategory.update({
            where: {
                id: payload.budgetCategoryId
            },
            data: {
                totalexpense: newTotalExpense
            }

        })

        return new Response(JSON.stringify({ message: 'Expense Created Sucessfully' }), {
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