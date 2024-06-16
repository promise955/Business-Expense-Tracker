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

            const groupedExpenses = expenses.reduce((acc, group) => {
                group.Expense.forEach(expense => {
                  const dateKey = expense.date.toISOString().split('T')[0]; // Simplifying date to YYYY-MM-DD format
                  if (!acc[dateKey]) {
                    acc[dateKey] = { date: expense.date, totalAmount: 0, totalQuantity: 0, totalTotal: 0 };
                  }
                  acc[dateKey].totalAmount += expense.amount;
                  acc[dateKey].totalQuantity += expense.quantity;
                  acc[dateKey].totalTotal += expense.total;
                });
                return acc;
              }, {});
              
              const expensesArray = Object.values(groupedExpenses);
              
              //console.log(expensesArray);

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
            console.log(error);
          
            return new NextResponse(JSON.stringify({ message: 'something went wrong' }), { status: 500 })
        }



    }





}
