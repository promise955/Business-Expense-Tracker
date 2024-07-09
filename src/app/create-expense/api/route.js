
'use server'
import prisma from "@/lib/prisma";

import { backendValidation, CustomError, CustomResponse } from "@/app/auth/confirm/route";
import { invalidRequest, invalidRequestCode, serverCode, serverError } from "@/utils/constant/constant";



const getItems = async (data, businessId) => {
    const { companyId, roles, userId } = data;
    try {
        const items = await prisma.item.findMany({
            where: {
                deleted: false,
                companyId,
                businessId
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

        });

        return items
    } catch (error) {

        return error
    }
};
const getBudgets = async (data, businessId) => {
    const { companyId, roles, userId } = data;
    try {
        const budgets = await prisma.budgetCategory.findMany({
            where: {
                deleted: false,
                companyId,
                businessId
            },
            select: {
                id: true,
                categoryname: true,
                monthyear: true

            },
            orderBy: { createdAt: 'desc' },

        });
        return budgets
    } catch (error) {

        return error
    }
};



export async function GET(request) {

    try {

        const url = new URL(request.url)

        const searchParams = url.searchParams;

        const businessId = searchParams.get('businessId');
        const action = searchParams.get('action');

        const data = await backendValidation()

        switch (action) {
            case 'getBudgets':

                try {
                    const budgets = await getBudgets(data, businessId);
                    return CustomResponse({ budgets }, 200)
                } catch (error) {
                    return CustomError(serverError, serverCode)
                }

            case 'getItems':
                try {
                    const items = await getItems(data, businessId);
                    return CustomResponse(items, 200)
                } catch (error) {
                    return CustomError(serverError, serverCode)
                }
            default:
                return CustomError(invalidRequest, invalidRequestCode)
        }


    } catch (error) {

        return CustomError(serverError, serverCode)
    }

}


export async function POST(request) {

    try {

        const payload = await request.json()
        const { companyId, userId } = await backendValidation()

        const items = await prisma.item.findMany({
            where: {
                id: { in: payload.itemId },
                companyId,
                businessId: payload.businessId

            },
            select: { id: true }
        });

        if (!items) CustomError('Item not found', 400)

        const budgetCategory = await prisma.budgetCategory.findFirst({
            where: { id: payload.budgetCategoryId },
            select: { totalexpense: true }
        })

        if (!budgetCategory) return CustomError('Invalid Budget', 400)

        const orderedDatas = payload.itemId.map((id, index) => ({
            id,
            quantity: payload.quantity[index],
            name: payload.name[index].toLowerCase(),
            price: payload.price[index],
            itemId: payload.itemId[index],
            itemGroupId: payload.itemGroupId[index]
        })).sort((a, b) => a.id - b.id);


        let expenseGroup = null
        expenseGroup = await prisma.expenseGroup.findFirst({
            where: {
                date: payload.date,
                companyId,
                businessId: payload.businessId
            },
            select: { id: true, totalamount: true }
        })

        if (expenseGroup) {
            const existingExpenses = await prisma.expense.findMany({
                where: {
                    companyId,
                    businessId: payload.businessId,
                    expenseGroupId: expenseGroup.id,

                },
                select: {
                    id: true,
                    amount: true,
                    quantity: true,
                    grandtotal: true,
                    itemId: true,
                    total: true

                }
            })
            if (!existingExpenses) return CustomError('Expense not found', 404)
            const updates = {};

            for (const orderedData of orderedDatas) {

                for (const existingExpense of existingExpenses) {

                    if (orderedData.itemId !== existingExpense.itemId) continue
                    const oldTotal = Number(orderedData.price) * Number(orderedData.quantity);
                    const total = (updates[existingExpense.id]?.total || existingExpense.total) + oldTotal;

                    const oldQuantity = Number(orderedData.quantity);
                    const quantity = (updates[existingExpense.id]?.quantity || existingExpense.quantity) + oldQuantity;

                    const grandtotal = (updates[existingExpense.id]?.grandtotal || existingExpense.grandtotal) + Number(payload.amount);

                    updates[existingExpense.id] = {
                        total,
                        quantity,
                        grandtotal,
                    };
                }

            }

            const updatePromises = Object.entries(updates).map(([id, data]) =>
                prisma.expense.update({
                    where: { id },
                    data,
                })
            );

            const newTotalAmount = expenseGroup.totalamount + Number(payload.amount)
            await Promise.all(updatePromises);
            await prisma.expenseGroup.update({
                where: { id: expenseGroup.id },
                data: {
                    totalamount: newTotalAmount
                }
            })

        } else {

            expenseGroup = await prisma.expenseGroup.create({
                data: {
                    date: payload.date,
                    totalamount: Number(payload.amount),
                    companyId,
                    businessId: payload.businessId

                }
            })

            if (!expenseGroup) return CustomError(serverError, serverCode)

            const newItems = orderedDatas.map(item => ({
                total: Number(item.price) * Number(item.quantity),
                expensename: item.name.toLowerCase(),
                amount: item.price,
                quantity: item.quantity,
                itemId: item.itemId,
                itemGroupId: item.itemGroupId,
                budgetCategoryId: payload.budgetCategoryId,
                date: payload.date,
                grandtotal: Number(payload.amount),
                companyId,
                businessId: payload.businessId,
                expenseGroupId: expenseGroup.id
            }));


            const createdOrder = await prisma.expense.createMany({
                data: newItems
            });

            if (!createdOrder) {
                return CustomError('Expense Creation Failed', 500)
            }

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

        return CustomResponse('Expense Created Sucessfully', 200)
    } catch (error) {

        return CustomError(serverError, serverCode)
    }

}