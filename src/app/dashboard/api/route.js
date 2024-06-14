import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server'
import { readUserSession } from "@/lib/action";
import { backendValidation } from "@/app/auth/confirm/route";

export async function GET(request, response) {


    const { id, businessname } = await backendValidation()
    const url = new URL(request.url)
    const searchParams = url.searchParams;
    const report = searchParams.get('getReport');

    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;

    if (report) {

        try {


            const userReport = await prisma.expense.findMany({
                where: {
                    budgetCategory: {
                        userId: id
                    }
                },
                include: {
                    budgetCategory: true,
                },
                orderBy: { monthyear: 'asc' }
            });


            const expensesGroupedByDate = userReport.reduce((acc, expense) => {
                const date = expense.date.toISOString().split('T')[0];
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(expense);
                return acc;
            }, {});

            const expensesGroupedName = userReport.reduce((acc, expense) => {
                const budgetCategory = expense.budgetCategory.categoryname;
                acc[budgetCategory] = [...(acc[budgetCategory] || []), expense];
                return acc;
            }, {});



            const formattedBudgetPieChart = Object.keys(expensesGroupedName).map(budgetCategory => {
                const budgetSum = expensesGroupedName[budgetCategory].reduce((sum, expense) => sum + expense.budgetCategory.budgetamount, 0);
                return {
                    budgetCategory: budgetCategory,
                    //budgets: expensesGroupedByDate[budgetCategory].map(expense => expense.budgetCategory),
                    budgetSum: budgetSum
                };
            });

            const formattedExpenses = Object.keys(expensesGroupedByDate).map(dateString => {
                const date = new Date(dateString);
                const formattedDate = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

                const expensesSum = expensesGroupedByDate[dateString].reduce((sum, expense) => sum + expense.amount, 0);

                const budgetSum = expensesGroupedByDate[dateString].reduce((sum, expense) => sum + expense.budgetCategory.budgetamount, 0);

                return {
                    date: formattedDate,
                    expenses: expensesGroupedByDate[dateString].map(expense => expense.description),
                    expensesSum: expensesSum,
                    budgetSum: budgetSum
                };
            });


            return new Response(JSON.stringify({
                message: {
                    formattedExpenses: formattedExpenses, formattedBudgetPieChart: formattedBudgetPieChart
                }
            }), {
                headers: {
                    "Content-Type": "application/json"
                },
                status: 200
            })
        } catch (error) {
            console.log(error);

            return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 500 })
        }


    } else {

        try {

            const expenses = await prisma.expenseGroup.findMany({
                where: {
                    OR: [{ userId: id }, { businessname: businessname }],
                },
                select: {
                    Expense: true,
                    date: true,
                    totalamount: true
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            })


            const totalCount = await prisma.expenseGroup.count({
                where: {
                    OR: [
                        { userId: id },
                        { businessname: businessname },
                    ],
                },
            })

            const result = {
                expenses,
                totalCount
            }
            return new Response(JSON.stringify({ message: result }), {
                headers: {
                    "Content-Type": "application/json"
                },
                status: 200
            })
        } catch (error) {
          
            return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 500 })
        }



    }





}
