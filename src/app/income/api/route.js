'use server'
import prisma from "@/lib/prisma";
import { backendValidation, CustomError, CustomResponse, hasRole } from "@/app/auth/confirm/route";
import { Roles, serverCode, serverError } from "@/utils/constant/constant";



export async function DELETE(request) {

    try {

        const url = new URL(request.url)
        const searchParams = url.searchParams;
        const incomeId = searchParams.get('id');

        const { companyId,userId } = await backendValidation()
        
        const owner = await hasRole(userId, Roles.BUSINESSOWNER)
        if (!owner) return CustomError('Unauthorized', 403)
        await prisma.income.update({
            where: { deleted: false, companyId, id: incomeId },
            data: {
                deleted: true
            }
        })

        return CustomResponse('Deleted Sucessfully', 200)
    } catch (error) {

        return CustomError(serverError, serverCode)
    }


}
export async function PATCH(request) {

    try {
        const payload = await request.json()

        const { companyId,userId} = await backendValidation()

        const owner = await hasRole(userId, Roles.BUSINESSOWNER)
        if (!owner) return CustomError('Unauthorized', 403)

        const incomeId = await prisma.income.findFirst({
            where: {
                incomename: payload.incomename.toLowerCase(),
                budgetCatergoryId: payload.budgetCatergoryId,
                amount: Number(payload.amount),
                date: payload.date,
                companyId,
                businessId : payload.businessId
            },
            select: {
                id: true
            }
        })

        if (incomeId) return CustomError('Income Exist Already',400)

        await prisma.income.update({
            where: { deleted: false, companyId, id: payload.id },
            data: {
                incomename: payload.incomename.toLowerCase(),
                budgetCatergoryId: payload.budgetCatergoryId,
                amount: Number(payload.amount),
                date: payload.date,
                businessId : payload.businessId
            }
        })

        return CustomResponse('Update Sucessfully',200)
    } catch (error) {

        return CustomError(serverError,serverCode)
    }


}



export async function GET(request) {

    try {
        const url = new URL(request.url)
        const searchParams = url.searchParams;
        const page = Number(searchParams.get('page')) || 1;
        const pageSize = Number(searchParams.get('pageSize')) || 10;

        const { userId, companyId } = await backendValidation()

        const owner = await hasRole(userId, Roles.BUSINESSOWNER)
        if (!owner) return CustomError('Unauthorized', 403)

        const incomes = await prisma.income.findMany({
            where: {
                deleted: false,
                companyId
            },
            select :{
                id : true,
                businessId : true,
                amount : true,
                incomename : true,
                budgetCategoryId : true,
                date : true,
                business : {
                    select : {
                        businessname : true
                    }
                }

            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,

        });

        const totalCount = await prisma.income.count({
            where: {
                deleted: false,
                 companyId
            },
        });

        const result = {
            incomes,
            totalCount
        }


        return CustomResponse(result,200)
    } catch (error) {

        return CustomError(serverError,serverCode)
    }

}


export async function POST(request) {

    try {

        const payload = await request.json()
        const { companyId ,userId} = await backendValidation()
        
        const owner = await hasRole(userId, Roles.BUSINESSOWNER)
        if (!owner) return CustomError('Unauthorized', 403)

        const incomeId = await prisma.income.findFirst({
            where: {
                incomename: payload.incomename.toLowerCase(),
                budgetCategoryId: payload.budgetCategoryId,
                amount: Number(payload.amount),
                date: payload.date,
                businessId: payload.businessId,
                companyId
            },
            select: {
                id: true
            }
        })

        if (incomeId) return CustomError('Income Exist Already', 400)

        const response = await prisma.budgetCategory.findFirst({
            where: {
                id: payload.budgetCategoryId.toLowerCase(),
                companyId,
                businessId: payload.businessId
            },
            select: {
                totalincome: true
            }
        })

        if (!response) return CustomError('Invalid Budget', 400)
        const newTotalIncome = Number(response.totalincome) + Number(payload.amount)

        await prisma.budgetCategory.update({
            where: {
                id: payload.budgetCategoryId,
                companyId,
                businessId: payload.businessId
            },
            data: {
                totalincome: newTotalIncome
            }

        })


        await prisma.income.create({
            data: {
                ...payload,
                incomename: payload.incomename.toLowerCase(),
                amount: Number(payload.amount),
                companyId
            }
        })

        return CustomResponse('Income Created Sucessfully', 200)
    } catch (error) {

        return CustomError(serverError, serverCode)
    }

}