import { createClient } from '@/utils/supabase/server'
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server'
import { readUserSession } from "@/lib/action";


export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')

  if (token_hash && type) {
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      redirectTo.searchParams.delete('next')
      return NextResponse.redirect(redirectTo)
    }
  }

  redirectTo.pathname = '/error'
  return NextResponse.redirect(redirectTo)
}


export async function backendValidation() {

  const { user, error } = await readUserSession()

  if (error) CustomError(error.message, 400)

  const localUser = await prisma.user.findUnique({
    where: {
      email: user.email
    },
    select: {
      id: true
    }

  })

  const [userRoles, company] = await Promise.all([

    prisma.userRole.findMany({
      where: { userId: localUser.id },
      include: { role: true },
    }),
    prisma.company.findFirst({
      where: {
        OR: [{ companyownerId: localUser.id }, {
          Partner: {
            some: {
              userId: localUser.id,
              approved: true,
            },
          }
        }]
      },

      select: {
        id: true,
        //  companyname: true,
        Partner: true

      }
    }),

  ]);

  const roles = userRoles.map((userRole) => userRole.role.name);
  const data = {
    companyId: company.id,
    userId: localUser.id,
    roles

  };

  if (!localUser) return CustomError('Invalid credentials or seesion expired', 400)

  return data

}

export async function assignRoleToUser(userId, roleName) {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) return new NextResponse(JSON.stringify({ message: "Role not found" }), { status: 400 })
  const userRole = await prisma.userRole.create({
    data: {
      userId: userId,
      roleId: role.id,
    },
  });
  return userRole
}


export async function assignBusinessToUser(userId, roleName) {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) return new NextResponse(JSON.stringify({ message: "Role not found" }), { status: 400 })
  const userRole = await prisma.userRole.create({
    data: {
      userId: userId,
      roleId: role.id,
    },
  });
  return userRole
}

export async function hasRole(userId, roleName) {
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId: userId,
      role: {
        name: roleName,
      },
    },
    include: {
      role: true,
    },
  });

  return !!userRole;
}

export function CustomResponse(message, status) {
  return new Response(JSON.stringify({ message: message }), { status: status })
}
export function CustomError(message, status) {
  return new NextResponse(JSON.stringify({ message: message }), { status: status })
}



