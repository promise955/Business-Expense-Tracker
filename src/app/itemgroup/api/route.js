'use server'
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server'
import { CustomError, CustomResponse, backendValidation } from "@/app/auth/confirm/route";
import { Roles, invalidRequest, invalidRequestCode, serverCode, serverError } from "@/utils/constant/constant";

export async function DELETE(request) {

    try {

        const url = new URL(request.url)
        const searchParams = url.searchParams;
        const itemId = searchParams.get('id');
        const {companyId} = await backendValidation()

        await prisma.itemGroup.update({
            where: { deleted: false, companyId, id: itemId },
            data: {
                deleted: true
            }

        })
        return CustomResponse('Deleted Sucessfully',200)
    } catch (error) {

        return CustomError(serverError,serverCode)
    }


}

export async function PATCH(request) {

    try {
        const payload = await request.json()
        const { companyId } = await backendValidation()
        const groupId = await prisma.itemGroup.findFirst({
            where: {
                itemgroupname: payload.itemgroupname.toLowerCase(),
                businessId: payload.businessId,
                companyId
            },
            select: {
                id: true
            }
        })

        if (groupId) return CustomError('Item Group Exist Already',400)

        await prisma.itemGroup.update({
            where: { deleted: false, companyId, id: payload.id },
            data: {
                itemgroupname: payload.itemgroupname.toLowerCase()
            }
        })

        return CustomError('Update Sucessfully',200)
    } catch (error) {

        return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 400 })
    }


}


export async function getPartnerBusiness(userId) {
    try {
        const businessesId = await prisma.partner.findMany({
            where: { userId, approved: true },
            select: {
                id: true
            }
        })
        return businessesId
    } catch (error) {
        return error
    }
}

export async function getBusinessByRole(data){
    const { companyId, roles, userId } = data;
    try {
        let businesses = []
        if (roles.includes(Roles.BUSINESSOWNER)) {
            businesses = await prisma.business.findMany({
                where: { companyId },
                select: {
                    id: true,
                    businessname: true
                }
            })
        }
        if (roles.includes(Roles.PARTNER)) {
            const businessesId = await getPartnerBusiness(userId)
            businesses = await prisma.business.findMany({
                where: { id: { in: businessesId }, companyId },
                select: {
                    id: true,
                    businessname: true
                }
            })

        }
        return businesses
    } catch (error) {
        return error
    }
};

const getItemGroup = async (data, page, pageSize) => {
    const { companyId, roles, userId } = data;
    try {
        let itemGroups = []
        let totalCount = 0
        if (roles.includes(Roles.BUSINESSOWNER)) {
            itemGroups = await prisma.itemGroup.findMany({
                where: {
                    deleted: false,
                    companyId: companyId
                },
                select: {
                    id: true,
                    itemgroupname: true,
                    businessId : true,
                    business: {
                        select: {
                            businessname: true,
                            
                        }
                    }
                },

                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            });

            totalCount = await prisma.itemGroup.count({
                where: {
                    deleted: false,
                    companyId: companyId
                },

            });
        }

        if (roles.includes(Roles.PARTNER)) {
            const businessesId = await getPartnerBusiness(userId)
            itemGroups = await prisma.itemGroup.findMany({
                where: {
                    deleted: false,
                    companyId: companyId,
                    businessesId: {
                        in: businessesId
                    }
                },
                select: {
                    id: true,
                    itemgroupname: true,
                    businessId : true,
                    business: {
                        select: {
                            businessname: true
                        }
                    }
                },

                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            });

            totalCount = await prisma.itemGroup.count({
                where: {
                    deleted: false,
                    companyId: companyId,
                    businessesId: {
                        in: businessesId
                    }
                },

            });
        }
        const result = {
            itemGroups,
            totalCount
        }
        return result
    } catch (error) {
        return error
    }
};


export async function GET(request) {


    const url = new URL(request.url)
    const searchParams = url.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const action = searchParams.get('action')
    const data = await backendValidation()

    switch (action) {
        case 'getBusinessByRole':

            try {
                const businesses = await getBusinessByRole(data);
                return CustomResponse({ businesses }, 200)
            } catch (error) {
                return CustomError(serverError, serverCode)
            }
            break;
        case 'getItemGroup':
            try {
                const { itemGroups, totalCount } = await getItemGroup(data, page, pageSize);
                return CustomResponse({ itemGroups, totalCount }, 200)
            } catch (error) {
                return CustomError(serverError, serverCode)
            }
            break;
        default:
            return CustomError(invalidRequest, invalidRequestCode)
    }
}

export async function POST(request) {

    try {
        const payload = await request.json()
        const data = await backendValidation()
        const groupId = await prisma.itemGroup.findFirst({
            where: {
                itemgroupname: payload.itemgroupname.toLowerCase(),
                companyId: data.companyId,
                businessId: payload.businessId
            },
            select: {
                id: true
            }
        })

        if (groupId) return CustomError('Item Group Exist Already', 400)

        await prisma.itemGroup.create({
            data: {
                businessId: payload.businessId,
                companyId: data.companyId,
                itemgroupname: payload.itemgroupname.toLowerCase(),

            }
        })

        return CustomResponse('Item Group Created Sucessfully', 201)

    } catch (error) {
     
        return CustomError('An unexpected error occurred. Please try again later', 500)
    }

}