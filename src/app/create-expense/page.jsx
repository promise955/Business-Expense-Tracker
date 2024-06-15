"use client";
import React, { useState, useEffect, useTransition } from "react";
import { Formik, Field, FieldArray, ErrorMessage, Form } from "formik";
import { NumericFormat } from "react-number-format";
import ReactDatePicker from "react-datepicker";
import * as Yup from "yup";
import { toast } from "sonner";
import _ from "lodash";
import numeral from "numeral";
import NavBar from "@/components/Layout/Nav";
import Loader from "@/components/Layout/Loader";
import Cookies from "js-cookie";
import DataService from "@/lib/fetch";
import NoRecord from "@/components/Layout/NoRecord";
import { readUserSession } from "@/lib/action";
import { useAppContext } from "@/context/context";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const CreateExpense = () => {
  const router = useRouter();
  const [budgets, setBudgets] = useState([]);
  const [searchState, setSearchState] = useState({
    isLoading: false,
    results: [],
    value: "",
  });
  const [loading, setLoading] = useState(false);
  const { isUser, setUser } = useAppContext();
  const [items, setItems] = useState([]);
  const [itemsReload, setItemsReload] = useState(false);
  const [expenseTotal, setExpenseTotal] = useState([]);
  const [isPending, setTransition] = useTransition();

  const schema = Yup.object().shape({
    name: Yup.array().of(Yup.string().required("Required")).min(1),
    price: Yup.array().of(Yup.number().required("Required")).min(1),
    quantity: Yup.array()
      .of(Yup.number().required("Quantity is required"))
      .min(1, "At least one quantity must be provided"),
    date: Yup.date().required("Required"),
    budgetCategoryId: Yup.string().required("Required"),
    amount: Yup.number().required("Required").min(1),
  });

  const retrieveItemVariables = () => {
    const expenseItem = Cookies.get("expenseItems")
      ? JSON.parse(Cookies.get("expenseItems"))
      : null;
    return expenseItem;
  };
  const defaultVariables = {
    name: [],
    price: [],
    group: [],
    quantity: [],
    totalRow: [],
    itemId: [],
    itemGroupId: [],
    amount: "",
    date: null,
    budgetCategoryId: null,
  };
  const [newItem, setItem] = useState(defaultVariables);

  const expenseItem = retrieveItemVariables() || defaultVariables;

  const saveItemVariables = (items) => {
    Cookies.set("expenseItems", JSON.stringify(items));
  };

  useEffect(() => {
    (async () => {
      let isSubscribed = true;
      fetchItems();
      getTotal();

      return () => (isSubscribed = false);
    })();
  }, [itemsReload]);

  const fetchBudets = async () => {
    try {
      const { budgets } = await DataService.getDataNoAuth("/budget/api");
      setBudgets(budgets);
    } catch (error) {
      console.log(error);
      toast.error(error);
    }
  };

  useEffect(() => {
    setTransition(async () => await fetchBudets());
  }, [isUser]);

  const fetchItems = async () => {
    try {
      setLoading(true);

      const items = await DataService.getDataNoAuth(`/create-expense/api`);
      setItems(items);
      setItemsReload(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const _saveExpenses = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);

      const sumOrder = expenseTotal?.reduce((total, num) => {
        return total + Number(num);
      }, 0);

      if (Number(values.amount) !== sumOrder) {
        setLoading(false);
        return toast.warning("Amount must be equal to total");
      }

      await DataService.postDataNoAuth("/create-expense/api", values);

      setSubmitting(false);

      toast.success(`Created  Successfully`);
      Cookies.remove("expenseItems");

      router.replace("/dashboard");
    } catch (error) {
      console.log("error", error);
      setSubmitting(false);
      toast.warning(error);
    }
  };

  useEffect(() => {
    const getUserAndRedirect = async () => {
      if (!isUser) {
        try {
          const { user } = await readUserSession();
          //setUser(user.email);
          Cookies.set("expense-user", user.email, { expires: 7 });
          router.prefetch("/create-expense");
        } catch (error) {
          router.replace("/login");
        }
      }
    };

    getUserAndRedirect();
  }, [isUser, router]);

  const handleResultSelect = ({ result }) => {
    let newPrice = 0;

    try {
      newPrice = result.price.toString().replaceAll(",", "");
    } catch (error) {
      function replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, "g"), replace);
      }
      newPrice = replaceAll(result.price.toString(), ",", "");
    }

    if (expenseItem.itemId.includes(result.id)) {
      getTotal();
      setSearchState({ value: "" });

      return toast.warning("Item already exist change quantity");
    }
    if (newPrice == 0) {
      return window.alert(`Please update ${result.itemname} price`);
    }

    const newExpenseItem = {
      ...expenseItem,
      ...expenseItem.name.push(result.itemname),
      ...expenseItem.price.push(Number(newPrice)),
      ...expenseItem.group.push(result.itemGroup.itemgroupname),
      ...expenseItem.itemGroupId.push(result.itemGroupId),
      ...expenseItem.quantity.push(1),
      ...expenseItem.itemId.push(result.id),
      ...expenseItem.totalRow.push(Number(newPrice)),
    };

    saveItemVariables(newExpenseItem);
    getTotal();
    setSearchState({ value: "" });
  };

  const removeItem = (index, remove) => {
    const newExpenseItem = {
      ...expenseItem,
      ...expenseItem.name.splice(index, 1),
      ...expenseItem.price.splice(index, 1),
      ...expenseItem.group.splice(index, 1),
      ...expenseItem.itemGroupId.splice(index, 1),
      ...expenseItem.quantity.splice(index, 1),
      ...expenseItem.itemId.splice(index, 1),
      ...expenseItem.totalRow.splice(index, 1),
    };

    remove(index);
    saveItemVariables(newExpenseItem);
    getTotal();
  };
  // const addItem = (push) => {

  //     // e.preventDefault()
  //     setItem({
  //         ...newItem,
  //         ...newItem.name.push(''),
  //         ...newItem.price.push(0),
  //         ...newItem.quantity.push(1),
  //         ...newItem.productId.push('')
  //     })

  //     //push('')
  //     getTotal()

  // }
  const getTotal = () => {
    let total = 0;
    if (!expenseItem) {
      total = newItem.price.map(
        (e, index) => Number(e) * Number(newItem.quantity[index])
      );
    } else {
      total = expenseItem.price.map(
        (e, index) => Number(e) * Number(expenseItem.quantity[index])
      );
    }
    setExpenseTotal(total);
  };
  const handleSearchChange = ({ target: { value } }) => {
    setSearchState({ isLoading: true, value });

    setTimeout(() => {
      if (value.length < 1) return setSearchState(searchState);
      const re = new RegExp(_.escapeRegExp(value), "i");
      const isMatch = (result) => re.test(result.itemname);
      setSearchState({
        isLoading: false,
        results: _.filter(items, isMatch),
      });
    }, 300);
    getTotal();
  };

  const updateValue = ({ value }, index) => {
    const itemprice = expenseItem.price[index];
    const newExpenseItem = {
      ...expenseItem,
      ...(expenseItem.quantity[index] = Number(value)),
      ...(expenseItem.totalRow[index] = Number(itemprice) * Number(value)),
    };

    saveItemVariables(newExpenseItem);
    getTotal();
  };

  const updatePrie = (value, index) => {
    const itemquantity = expenseItem.quantity[index];
    const newExpenseItem = {
      ...expenseItem,
      ...(expenseItem.price[index] = Number(value)),
      ...(expenseItem.totalRow[index] = Number(itemquantity) * Number(value)),
    };

    saveItemVariables(newExpenseItem);
    getTotal();
  };

  return (
    <>
      <NavBar isUser={Cookies.get("expense-user")} />
      <div className="w-full px-6 py-6 mx-auto min-h-screen flex flex-col bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Item Name"
                className="w-full text-gray-900 sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchState.value}
                onChange={_.debounce(handleSearchChange, 500, {
                  leading: true,
                })}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a8 8 0 016.32 12.906l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387A8 8 0 1110 2zm0 2a6 6 0 100 12 6 6 0 000-12z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {searchState.results && (
              <ul className="mt-2 bg-white  text-gray-900 border border-gray-200 rounded-md shadow-lg">
                {searchState.results.map((i) => (
                  <li
                    key={i.id}
                    className="px-4 py-2 text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleResultSelect({ result: i })}
                  >
                    <div className="flex justify-between ">
                      <span className="text-gray-900">{i.itemname}</span>
                      <span className="text-gray-900">
                        ₦{numeral(i.price).format("0,0")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setItemsReload(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Reload products
            </button>
          </div>
        </div>
        {loading ? (
          <Loader />
        ) : expenseItem.name.length == 0 ? (
          <NoRecord />
        ) : (
          <div className="flex flex-wrap -mx-4">
            <div className="w-full p-4">
              <div className="bg-white shadow-soft-xl rounded-2xl p-4 relative">
                <div className="">
                  <h2 className="text-lg font-semibold mb-4">
                    Total Expenses Added {expenseItem.name.length}
                  </h2>
                  <Formik
                    enableReinitialize={true}
                    initialValues={expenseItem || newItem}
                    validationSchema={schema}
                    onSubmit={_saveExpenses}
                    
                  >
                    {({
                      errors,
                      touched,
                      values,
                      setFieldValue,
                      isSubmitting,
                    }) => (
                      <Form>
                        <FieldArray name="name">
                          {({ push, remove }) =>
                            values.name
                              .map((_value, index) => (
                                <div key={index}>
                                  <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-x-4">
                                    {/* name */}
                                    <div className="flex-1">
                                      <Field
                                        type="text"
                                        readOnly
                                        id={`name[${index}]`}
                                        name={`name[${index}]`}
                                        className={`mt-1 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10 ${
                                          errors.name && touched.name
                                            ? "border-red-500"
                                            : ""
                                        }`}
                                      />
                                      <ErrorMessage
                                        name={`name[${index}]`}
                                        component="p"
                                        className="text-red-500 text-sm mt-1"
                                      />
                                    </div>
                                    {/* itemgroup */}

                                    <Field
                                      hidden
                                      type="text"
                                      id={`itemGroupId[${index}]`}
                                      name={`itemGroupId[${index}]`}
                                      className={``}
                                    />

                                    {/* price */}

                                    <div className="flex-1">
                                      <NumericFormat
                                        name={`price[${index}]`}
                                        value={values.price[index]}
                                        thousandSeparator={true}
                                        min={0}
                                        prefix={"₦"}
                                        onValueChange={(values) => {
                                          const { value } = values;
                                          updatePrie(value, index);
                                          setFieldValue(
                                            `price[${index}]`,
                                            value
                                          );
                                        }}
                                        className={`mt-1 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md ${
                                          errors.price && touched.price
                                            ? "border-red-500"
                                            : ""
                                        }`}
                                      />
                                      <ErrorMessage
                                        name={`price[${index}]`}
                                        component="p"
                                        className="text-red-500 text-sm mt-1"
                                      />
                                    </div>
                                    {/* quantity */}
                                    <div className="flex-1">
                                      <Field
                                        type="number"
                                        min={1}
                                        id={`quantity[${index}]`}
                                        onChange={(e) =>
                                          updateValue(e.currentTarget, index)
                                        }
                                        name={`quantity[${index}]`}
                                        className={`mt-1 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10 ${
                                          errors.quantity && touched.quantity
                                            ? "border-red-500"
                                            : ""
                                        }`}
                                      />
                                      <ErrorMessage
                                        name={`quantity[${index}]`}
                                        component="p"
                                        className="text-red-500 text-sm mt-1"
                                      />
                                    </div>
                                    {/* group  */}
                                    <div className="flex-1">
                                      <Field
                                        type="text"
                                        readOnly
                                        id={`group[${index}]`}
                                        name={`group[${index}]`}
                                        className={`mt-1 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10 ${
                                          errors.group && touched.group
                                            ? "border-red-500"
                                            : ""
                                        }`}
                                      />
                                      <ErrorMessage
                                        name={`group[${index}]`}
                                        component="p"
                                        className="text-red-500 text-sm mt-1"
                                      />
                                    </div>
                                    {/* total */}

                                    <div className="flex-1">
                                      <NumericFormat
                                        name={`totalRow[${index}]`}
                                        value={values.totalRow[index]}
                                        thousandSeparator={true}
                                        readOnly
                                        min={0}
                                        prefix={"₦"}
                                        onValueChange={(values) => {
                                          const { value } = values;
                                          setFieldValue(
                                            `totalRow[${index}]`,
                                            value
                                          );
                                        }}
                                        className={`mt-1 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md ${
                                          errors.totalRow && touched.totalRow
                                            ? "border-red-500"
                                            : ""
                                        }`}
                                      />
                                    </div>

                                    {/* delete button */}
                                    <div className="flex-1">
                                      <button
                                        className="px-3 py-1 text-sm rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500"
                                        onClick={() => {
                                          removeItem(index, remove);
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                              .reverse()
                          }
                        </FieldArray>

                        <div className="mb-4">
                          <label
                            htmlFor="date"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Select Date
                          </label>
                          <Field
                            id="date"
                            name="date"
                            placeholder="Select Date"
                            render={({ field }) => (
                              <ReactDatePicker
                                {...field}
                                dateFormat="MMMM yyyy"
                                showMonthYearPicker
                                className={`mt-1 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md ${
                                  errors.date && touched.date
                                    ? "border-red-500"
                                    : ""
                                }`}
                                selected={values.date}
                                onChange={(value) => {
                                  setFieldValue("date", value);
                                  setFieldValue("budgetCategoryId", null);
                                }}
                              />
                            )}
                          />
                          <ErrorMessage
                            name="date"
                            component="p"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        <div className="mb-4">
                          <label
                            htmlFor="budgetCategoryId"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Select Budget
                          </label>
                          <Field
                            as="select"
                            name="budgetCategoryId"
                            value={values.budgetCategoryId || ""}
                            onChange={(value) => {
                              value.persist();
                              let item = value.target.value;
                              setFieldValue("budgetCategoryId", item);
                            }}
                            error={
                              touched.budgetCategoryId &&
                              errors.budgetCategoryId
                            }
                            className={`block w-full mt-1 px-3 py-2 border ${
                              errors.date && touched.date
                                ? "border-red-500"
                                : "border-gray-300"
                            } bg-white text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            disabled={!values.date}
                          >
                            <option
                              value=""
                              disabled
                              defaultValue
                              hidden
                            ></option>
                            {values.date && budgets
                              ? budgets
                                  .filter((item) => {
                                    const itemDate = dayjs(item.monthyear);
                                    return (
                                      itemDate.month() ===
                                        dayjs(values.date).month() &&
                                      itemDate.year() ===
                                        dayjs(values.date).year()
                                    );
                                  })
                                  .map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.categoryname}
                                    </option>
                                  ))
                              : null}
                          </Field>
                          {!values.date && (
                            <p className="text-red-500 text-sm mt-1">
                              Expense date must be selected first before budget
                              category
                            </p>
                          )}
                          {values.date &&
                            budgets.filter((item) => {
                              const itemDate = dayjs(item.monthyear);
                              return (
                                itemDate.month() ===
                                  dayjs(values.date).month() &&
                                itemDate.year() === dayjs(values.date).year()
                              );
                            }).length == 0 && (
                              <p className="text-red-500 text-sm mt-1">
                                No record found! create budget category first
                              </p>
                            )}
                          <ErrorMessage
                            name="budgetCategoryId"
                            component="p"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        {/* sum */}

                        <div className="p-4 bg-white rounded-lg shadow-md">
                          <p className="text-lg font-bold text-green-600">
                            Total: ₦
                            {numeral(
                              expenseTotal?.reduce(
                                (total, num) => total + num,
                                0
                              )
                            ).format("0,0")}
                          </p>
                        </div>

                        <div className="mb-4">
                          {/* enter sum */}
                          <NumericFormat
                            name="amount"
                            value={values.amount}
                            thousandSeparator={true}
                            min={0}
                            onValueChange={(values) => {
                              const { value } = values;
                              setFieldValue("amount", value);
                            }}
                            placeholder="Enter Amount"
                            className={`mt-1 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10 ${
                              errors.amount && touched.amount
                                ? "border-red-500"
                                : ""
                            }`}
                          />

                          <ErrorMessage
                            name={`amount`}
                            component="p"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isPending ? isPending : isSubmitting}
                          >
                            {isPending
                              ? "Please wait.."
                              : isSubmitting
                              ? "submitting .."
                              : " Save"}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateExpense;
