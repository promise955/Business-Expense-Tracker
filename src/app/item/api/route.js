'use server'
import prisma from "@/lib/prisma";
import { CustomError, CustomResponse, backendValidation } from "@/app/auth/confirm/route";
import { invalidRequest, invalidRequestCode, Roles, serverCode, serverError } from "@/utils/constant/constant";


export async function DELETE(request) {

    try {

        const url = new URL(request.url)

        const searchParams = url.searchParams;

        const itemId = searchParams.get('id');

        const { companyId } = await backendValidation()
        await prisma.item.update({
            where: { deleted: false, companyId, id: itemId },
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

        const { companyId } = await backendValidation()

        const itemId = await prisma.item.findFirst({
            where: {
                itemname: payload.itemname.toLowerCase(),
                itemGroupId: payload.itemGroupId,
                price: Number(payload.price),
                businessId: payload.businessId,
                companyId

            },
            select: {
                id: true
            }
        })

        if (itemId) return CustomError('Item Exist Already', 400)


        await prisma.item.update({
            where: { deleted: false, companyId, id: payload.id },
            data: {
                itemname: payload.itemname.toLowerCase(),
                itemGroupId: payload.itemGroupId,
                price: Number(payload.price),
                businessId: payload.businessId,
            }
        })


        return CustomResponse('Update Sucessfully', 200)
    } catch (error) {

        return CustomError(serverError, serverCode)
    }


}


const getItems = async (data, page, pageSize) => {
    const { companyId, roles, userId } = data;
    try {
        let items = []
        let totalCount = 0

        if (roles.includes(Roles.BUSINESSOWNER)) {
            items = await prisma.item.findMany({
                where: {
                    deleted: false,
                    companyId: companyId
                },
                select: {
                    id: true,
                    itemname: true,
                    price: true,
                    itemGroupId: true,
                    businessId: true,
                    itemGroup: {
                        select: {
                            itemgroupname: true
                        }
                    },
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

            totalCount = await prisma.item.count({
                where: {
                    deleted: false,
                    companyId: companyId
                },

            });


        }

        if (roles.includes(Roles.PARTNER)) {
            const businessesId = await getPartnerBusiness(userId)
            items = await prisma.item.findMany({
                where: {
                    deleted: false,
                    companyId: companyId,
                    businessesId: {
                        in: businessesId
                    }
                },
                select: {
                    id: true,
                    itemname: true,
                    price: true,
                    itemGroup: {
                        select: {
                            itemgroupname: true
                        }
                    },
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

            totalCount = await prisma.item.count({
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
            items,
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
                const businesses = await getBuinessByRole(data);
                return CustomResponse({ businesses }, 200)
            } catch (error) {
                return CustomError(serverError, serverCode)
            }
            break;
        case 'getItems':
            try {
                const { items, totalCount } = await getItems(data, page, pageSize);

                return CustomResponse({ items, totalCount }, 200)
            } catch (error) {
            
                return CustomError(serverError, serverCode)
            }
            break;
        default:
            return CustomError(invalidRequest,invalidRequestCode)
    }
}

export async function POST(request) {

    try {

        const payload = await request.json()
        const { companyId } = await backendValidation()

        const itemId = await prisma.item.findFirst({
            where: {
                itemname: payload.itemname.toLowerCase(),
                itemGroupId: payload.itemGroupId,
                price: Number(payload.price),
                companyId,
                businessId: payload.businessId
            },
            select: {
                id: true
            }
        })

        if (itemId) return CustomError('Item Exist Already', 400)

        await prisma.item.create({
            data: {
                ...payload,
                companyId,
                price: Number(payload.price),
                itemname: payload.itemname.toLowerCase()
            }
        })

        return CustomResponse('Item Created Sucessfully', 201)

    } catch (error) {

        return CustomError(serverError, serverCode)
    }

}