import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { NumericFormat } from "react-number-format";
import ReactDatePicker from "react-datepicker";
import DataService from "@/lib/fetch";
import { toast } from "sonner";
import dayjs from "dayjs";


const EditBudgetModal = ({ updatedBudget, onClose }) => {

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      if (updatedBudget) {
        const response = await DataService.patchDataNoAuth("/budget/api",values);
        toast.success(response);
        setSubmitting(false);
        onClose();
      
      } else {

        const response = await DataService.postDataNoAuth("/budget/api",values);
        toast.success(response);
        setSubmitting(false);
        onClose();
  
      }
    } catch (error) {
      toast.error(error);
      setSubmitting(false);
    }
  };

  const newBudget = {
    categoryname: null,
    budgetamount: null,
    monthyear: null,
  };

  const validationSchema = Yup.object().shape({
    categoryname: Yup.string().required("Budget name is required"),
    budgetamount: Yup.number()
      .required("Amount is required")
      .min(1, "Amount must be greater than or equal to 0"),
    monthyear: Yup.string().required("Month and Year are required"),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 text-gray-800 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-4/5 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Budget Category</h2>
        <Formik
          initialValues={updatedBudget || newBudget}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <label
                  htmlFor="categoryname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter Budget Category
                </label>
                <Field
                  type="text"
                  id="categoryname"
                  name="categoryname"
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10 ${
                    errors.categoryname && touched.categoryname
                      ? "border-red-500"
                      : ""
                  }`}
                />
                <ErrorMessage
                  name="categoryname"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="budgetamount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter Budget Allocation Amount
                </label>

                <NumericFormat
                  name={`budgetamount`}
                  value={values.budgetamount}
                  thousandSeparator={true}
                  min={0}
                  prefix={"₦"}
                  onValueChange={(values) => {
                    const { value } = values;
                    setFieldValue("budgetamount", value);
                  }}
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10 ${
                    errors.budgetamount && touched.budgetamount
                      ? "border-red-500"
                      : ""
                  }`}
                />
                <ErrorMessage
                  name="budgetamount"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="monthyear"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Month and Year
                </label>
                <Field
                  id="monthyear"
                  name="monthyear"
                  render={({ field }) => (
                    <ReactDatePicker
                      {...field}
                      dateFormat="MMMM yyyy"
                      showMonthYearPicker
                      className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10${
                        errors.monthyear && touched.monthyear
                          ? "border-red-500"
                          : ""
                      }`}
                      value={values.monthyear ? dayjs(values.monthyear).format('MMMM YYYY') : ''}
                      selected={values.monthyear}
                      onChange={(value) => {
                
                        setFieldValue("monthyear", value);
                      }}
                    />
                  )}
                />
                <ErrorMessage
                  name="monthyear"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="mr-2 px-4 py-2 text-sm rounded-md bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "submitting ...." : "Save"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditBudgetModal;
