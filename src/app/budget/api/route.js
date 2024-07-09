'use server'
import prisma from "@/lib/prisma";
import { backendValidation, CustomError, CustomResponse, hasRole } from "@/app/auth/confirm/route";
import { Roles, serverCode, serverError } from "@/utils/constant/constant";

export async function DELETE(request) {


    try {

        const url = new URL(request.url)

        const searchParams = url.searchParams;

        const budgetId = searchParams.get('id');
        const { userId, companyId } = await backendValidation()
        const owner = await hasRole(userId, Roles.BUSINESSOWNER)
        if (!owner) return CustomError('Unauthorized', 403)


        await prisma.budgetCategory.update({
            where: { deleted: false, companyId, id: budgetId },
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

        const { companyId, userId } = await backendValidation()
        const owner = await hasRole(userId, Roles.BUSINESSOWNER)
        if (!owner) return CustomError('Unauthorized', 403)

        const budgetId = await prisma.budgetCategory.findFirst({
            where: {
                categoryname: payload.categoryname.toLowerCase(),
                monthyear: payload.monthyear,
                companyId,
                businessId: payload.businessId
            },
            select: {
                id: true
            }
        })

        if (budgetId) return CustomError('Budget Category Exist Already', 400)

        await prisma.budgetCategory.update({
            where: { deleted: false, companyId, id: payload.id },
            data: {
                categoryname: payload.categoryname.toLowerCase(),
                monthyear: payload.monthyear,
                budgetamount: Number(payload.budgetamount),
                businessId: payload.businessId
            }
        })


        return CustomResponse('Update Sucessfully', 200)
    } catch (error) {

        return CustomError(serverError, serverCode)
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

        const budgets = await prisma.budgetCategory.findMany({
            where: {
                deleted: false, companyId
            },
            select: {
                businessId: true,
                categoryname: true,
                budgetamount: true,
                totalincome: true,
                totalexpense: true,
                monthyear: true,
                id: true,
                business: {
                    select: {
                        businessname: true

                    }
                },

            },
            orderBy: { monthyear: 'asc' },
            skip: (page - 1) * pageSize,
            take: pageSize,

        });

        const totalCount = await prisma.budgetCategory.count({
            where: {
                deleted: false, companyId
            },
        });

        const result = {
            budgets,
            totalCount
        }
        return CustomResponse(result, 200)
    } catch (error) {

        return CustomError(serverError, serverCode)
    }


}


export async function POST(request) {

    try {

        const payload = await request.json()
        const { companyId, userId } = await backendValidation()

        const owner = await hasRole(userId, Roles.BUSINESSOWNER)
        if (!owner) return CustomError('Unauthorized', 403)

        const budgetId = await prisma.budgetCategory.findFirst({
            where: {
                categoryname: payload.categoryname.toLowerCase(),
                monthyear: payload.monthyear,
                companyId,
                businessId: payload.businessId
            },
            select: {
                id: true
            }
        })

        if (budgetId) return CustomError('Budget Category Exist Already', 400)

        await prisma.budgetCategory.create({
            data: {
                ...payload,
                budgetamount: Number(payload.budgetamount),
                categoryname: payload.categoryname.toLowerCase(),
                companyId,
                businessId: payload.businessId

            }
        })


        return CustomResponse('Budget Created Sucessfully', 200)

    } catch (error) {

        return CustomError(serverError, serverCode)
    }

}