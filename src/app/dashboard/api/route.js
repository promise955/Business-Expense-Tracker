import prisma from "@/lib/prisma";
import { backendValidation, CustomError, CustomResponse } from "@/app/auth/confirm/route";
import { serverCode, serverError } from "@/utils/constant/constant";

export async function GET(request) {


    const { companyId,userId } = await backendValidation()
    const url = new URL(request.url)
    const searchParams = url.searchParams;

    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;

        try {

            const expenses = await prisma.expenseGroup.findMany({
                where: {
                   companyId
                },
                select: {
                    Expense: true,
                    date: true,
                    totalamount: true,
                    businessId : true,
                    business : {
                        select : {
                            businessname : true
                        }
                    }

                },
                orderBy: { createdAt: 'desc' },
               
                skip: (page - 1) * pageSize,
                take: pageSize,
            })
            
            const totalCount = await prisma.expenseGroup.count({
                where: {
                  companyId
                },
            })

            const result = {
                expenses,
                totalCount
            }
            return CustomResponse(result,200)
        } catch (error) {
   
            return CustomError(serverError,serverCode)
        }



    }


