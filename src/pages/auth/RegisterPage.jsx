import React, { useMemo, useState } from "react";
import AuthLayout from "@/layouts/AuthLayout";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import countryList from "react-select-country-list";
import libphonenumber from "google-libphonenumber";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import Spinner from "@/components/ui/Spinner";

import TextInput from "@/components/form/TextInput";
import Select from "@/components/form/Select";
import PhoneInput from "@/components/form/PhoneInput";
import AccentButton from "@/components/ui/AccentButton";
import Heading from "@/components/ui/Heading";

const schema = Yup.object().shape({
  full_name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  country_code: Yup.string().required("Country is required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  promo_code: Yup.string(),
});

const RegisterPage = () => {
  const options = useMemo(() => countryList().getData(), []);
  const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectedCountryCode = watch("country_code");

  const onSubmit = async (data) => {
    const isValidForm = await trigger();
    if (!isValidForm) {
      setPhoneError("");
      return;
    }

    try {
      const parsedNumber = phoneUtil.parseAndKeepRawInput(data.phone_number);
      if (!phoneUtil.isValidNumber(parsedNumber)) {
        setPhoneError("Invalid phone number");
        return;
      }
    } catch {
      setPhoneError("Invalid phone number");
      return;
    }

    setPhoneError("");
    setIsSubmitting(true);

    try {
      const payload = {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        phone_number: data.phone_number,
        country_code: data.country_code,
        promo_code: data.promo_code || null,
      };

      const res = await API.private.registerUser(payload);

      if (res.data.code === "OK") {
        Notification.success(res.data.data?.message || "Registration successful! Please check your email.");
        reset();
      } else {
        Notification.error(res.data.error || "Unexpected response from server.");
      }
    } catch (error) {
      const status = error.response?.status;
      let msg = "Something went wrong during registration.";
      if (status === 400) msg = error.response?.data?.error || "Email already in use.";
      else if (status === 500) msg = "Server error. Please try again later.";
      Notification.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-6 w-full max-w-md mx-auto border border-gray-100 dark:border-gray-700 transition-all duration-300">
        <Heading className="text-center">
          Register Now & Trade <span className="text-accent">With PrimeProX</span>
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <TextInput placeholder="Enter Your Fullname" {...register("full_name")} error={errors.full_name?.message} />

          <TextInput type="email" placeholder="Enter Your Email" {...register("email")} error={errors.email?.message} />

          <Controller
            name="country_code"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                options={options}
                placeholder="Select Country"
                error={errors.country_code?.message}
              />
            )}
          />

          <Controller
            name="phone_number"
            control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("phone_number", value, { shouldValidate: true });
                  setPhoneError("");
                }}
                error={errors.phone_number?.message || phoneError}
              />
            )}
          />

          <TextInput
            type="password"
            placeholder="Password"
            {...register("password")}
            error={errors.password?.message}
          />

          <TextInput placeholder="Promo Code (Optional)" {...register("promo_code")} />

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            By registering you agree to our <span className="text-accent cursor-pointer">Privacy Policy</span>,{" "}
            <span className="text-accent cursor-pointer">Terms of Use</span>
          </p>

          <AccentButton
            type="submit"
            loading={isSubmitting}
            text="Register with PrimeProX"
            spinner={<Spinner color="white" />}
          />

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-accent font-medium">
              Login
            </a>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
