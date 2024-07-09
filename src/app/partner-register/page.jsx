"use client";
import React, { createContext } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import DataService from "@/lib/fetch";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/context";


const PartnerRegister = () => {

  const router = useRouter();
  
const initialValues = {
  email: "",
  businesscode: "",
  password: "",
  confirmpassword: "",
};

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password : Yup.string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  .matches(/[0-9]/, "Password must contain at least one number")
  .matches(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)")
  .matches(/^\S*$/, "Password must not contain spaces"),
  confirmpassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  businesscode: Yup.string().min(8,'Businesscode contains 8 characters').required("Business Code is Required"),
});

const handleSubmit = async (values, { setSubmitting }) => {
  setSubmitting(true);
  try {
    const message = await DataService.postDataNoAuth(
      "/partner-register/api",
      values
    );
     router.push("/verifyEmail");
   setSubmitting(false);
    toast.success(message);
  } catch (error) {
    setSubmitting(false);

    return toast.error(error);
  }
};
  return (
    <div className="flex justify-center  text-gray-800 items-center h-screen bg-gradient-to-r from-purple-600 to-indigo-600">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-white bg-btn-background hover:bg-btn-background-hover flex items-center group text-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-6 w-6 transition-transform group-hover:-translate-x-1 text-white"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Home
      </Link>
      <div className="max-w-md w-full p-4 bg-white m-4 rounded-lg shadow-lg sm:max-w-md sm:p-8">
        <Image
          src="/expense.svg"
          alt="Login"
          className="h-50 mx-auto mb-8"
          height={50}
          width={50}
        />
        <Formik
          initialValues={initialValues}
         validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field
                type="email"
                name="email"
                placeholder="Email"
               disabled={isSubmitting}
                className="w-full mb-4 px-4 py-2 border rounded-lg"
                required
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500"
              />
              <Field
                type="text"
                name="businesscode"
               disabled={isSubmitting}
                placeholder="Enter Business Code"
                className="w-full mb-4 px-4 py-2 border rounded-lg"
                required
              />
              <ErrorMessage
                name="businesscode"
                component="div"
                className="text-red-500"
              />

              <Field
                type="password"
                name="password"
               disabled={isSubmitting}
                placeholder="Password"
                className="w-full mb-4 px-4 py-2 border rounded-lg"
                required
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500"
              />
              <Field
                type="password"
                name="confirmpassword"
               disabled={isSubmitting}
                placeholder="Confirm Password"
                className="w-full mb-4 px-4 py-2 border rounded-lg"
                required
              />
              <ErrorMessage
                name="confirmpassword"
                component="div"
                className="text-red-500"
              />

              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signin Up..." : "SignUp"}
              </button>
              <div className="mt-4 p-4 bg-foreground/10 text-foreground text-center flex justify-around">
                <Link
                  href={"/login"}
                  className="block hover:text-blue-500 underline"
                >
                  Login
                </Link>
                <Link
                  href={"/register"}
                  className="block hover:text-blue-500 underline"
                >
                  Create a Company
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PartnerRegister;
