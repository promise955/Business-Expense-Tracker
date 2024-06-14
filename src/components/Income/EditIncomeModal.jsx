import DataService from "@/lib/fetch";
import React, { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { NumericFormat } from "react-number-format";
import ReactDatePicker from "react-datepicker";
import { useAppContext } from "@/context/context";
import dayjs from "dayjs";

const EditIncomeModal = ({ updatedIncome, onClose }) => {
  const [isPending, startTransition] = useTransition();
  const [budgets, setBudgets] = useState([]);

  const fetchBudets = async () => {
    try {
      const { budgets } = await DataService.getDataNoAuth("/budget/api");
      setBudgets(budgets);
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    startTransition(async () => await fetchBudets());
  }, []);

  const newIncome = {
    incomename: null,
    amount: null,
    date: null,
    budgetCategoryId: null,
  };

  const validationSchema = Yup.object().shape({
    incomename: Yup.string().required("Income name is required"),
    amount: Yup.number()
      .required("Amount is required")
      .min(1, "Amount must be greater than or equal to 0"),
    budgetCategoryId: Yup.string().required("Category is required"),
    date: Yup.date().required("Date is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      const budget = budgets.find((a) => a.id === values.budgetCategoryId);

      const itemDate = dayjs(budget.monthyear);
      const selectedDate = dayjs(values.date);
      if (
        itemDate.month() !== selectedDate.month() &&
        itemDate.year() !== selectedDate.year()
      ) {
        return toast.error("Conflicting date selected");
      }

      if (updatedIncome) {
        const response = await DataService.patchDataNoAuth("/income/api", values);
        toast.success(response);
        setSubmitting(false);
        onClose();
      } else {
        const response = await DataService.postDataNoAuth(
          "/income/api",
          values
        );
        toast.success(response);
        onClose();
        setSubmitting(false);
      }
    } catch (error) {
      toast.error(error);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex  text-gray-800 justify-center items-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-4/5 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add Expense</h2>
        <Formik
          initialValues={updatedIncome || newIncome}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <label
                  htmlFor="incomename"
                  className="block text-sm font-medium text-gray-700"
                >
                  Income Name
                </label>
                <Field
                  type="text"
                  id="incomename"
                  name="incomename"
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10${
                    errors.incomename && touched.incomename
                      ? "border-red-500"
                      : ""
                  }`}
                />
                <ErrorMessage
                  name="incomename"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Income Amount
                </label>

                <NumericFormat
                  name={`amount`}
                  value={values.amount}
                  thousandSeparator={true}
                  min={0}
                  prefix={"₦"}
                  onValueChange={(values) => {
                    const { value } = values;
                    setFieldValue("amount", value);
                  }}
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10 ${
                    errors.budgetamount && touched.budgetamount
                      ? "border-red-500"
                      : ""
                  }`}
                />
                <ErrorMessage
                  name="amount"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

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
                      className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10${
                        errors.date && touched.date ? "border-red-500" : ""
                      }`}
                      value={
                        values.date
                          ? dayjs(values.date).format("MMMM YYYY")
                          : ""
                      }
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
                  error={touched.budgetCategoryId && errors.budgetCategoryId}
                  className={`block w-full mt-1 px-3 py-2 border ${
                    errors.date && touched.date
                      ? "border-red-500"
                      : "border-gray-300"
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10`}
                  disabled={!values.date}
                >
                  <option value="" disabled defaultValue hidden></option>
                  {values.date && budgets
                    ? budgets
                        .filter((item) => {
                          const itemDate = dayjs(item.monthyear);
                          return (
                            itemDate.month() === dayjs(values.date).month() &&
                            itemDate.year() === dayjs(values.date).year()
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
                    Expense date must be selected first before budget category
                  </p>
                )}
                {values.date &&
                  budgets.filter((item) => {
                    const itemDate = dayjs(item.monthyear);
                    return (
                      itemDate.month() === dayjs(values.date).month() &&
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 text-sm rounded-md bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isPending ? isPending : isSubmitting}
                >
                  {isPending ? "Close" : isSubmitting ? "Close" : " Close"}
                </button>
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
  );
};

export default EditIncomeModal;
