"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { userAuthSchema } from "@/lib/validations/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Icons } from "@/components/shared/icons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "login" | "register";
}

type FormData = z.infer<typeof userAuthSchema>;

export function UserAuthForm({
  className,
  type = "login",
  ...props
}: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] =
    React.useState<boolean>(false);

  const searchParams = useSearchParams();

  const targetDestination = searchParams?.get("from") || "/pricing";
  const selectedPlan = (
    searchParams?.get("plan") || "starter"
  ).toLowerCase();

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      if (type === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email.toLowerCase(),
            password: data.password,
            plan: selectedPlan,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setIsLoading(false);

          return toast.error("Registration failed", {
            description:
              result.error || "Unable to create your account.",
          });
        }

        setIsLoading(false);

        toast.success("Verification email sent", {
          description: "Check your email for the verification code.",
        });

        window.location.href = `/verify-email?email=${encodeURIComponent(
          data.email.toLowerCase(),
        )}&plan=${encodeURIComponent(selectedPlan)}`;

        return;
      }

      const signInResult = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
        callbackUrl: targetDestination,
      });

      setIsLoading(false);

      if (!signInResult?.ok) {
        return toast.error("Something went wrong.", {
          description: "Your sign in request failed. Please try again.",
        });
      }

      toast.success("Success!", {
        description: "You have successfully signed in.",
      });

      window.location.href = targetDestination;
    } catch (error) {
      setIsLoading(false);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {type === "register" && (
            <div className="grid gap-1">
              <Label className="text-gray-300" htmlFor="name">
                Name
              </Label>

              <Input
                id="name"
                placeholder="John Doe"
                type="text"
                disabled={isLoading || isGoogleLoading}
                className="border-gray-800 bg-[#0b0f19] text-white"
                {...register("name")}
              />

              {errors.name && (
                <p className="text-xs text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-1">
            <Label className="text-gray-300" htmlFor="email">
              Email
            </Label>

            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              disabled={isLoading || isGoogleLoading}
              className="border-gray-800 bg-[#0b0f19] text-white"
              {...register("email")}
            />

            {errors.email && (
              <p className="text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <Label className="text-gray-300" htmlFor="password">
              Password
            </Label>

            <Input
              id="password"
              placeholder="********"
              type="password"
              disabled={isLoading || isGoogleLoading}
              className="border-gray-800 bg-[#0b0f19] text-white"
              {...register("password")}
            />

            {errors.password && (
              <p className="text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            className={cn(
              buttonVariants(),
              "w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-500",
            )}
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}

            {type === "register"
              ? "Create Account"
              : "Sign In with Email"}
          </button>
        </div>
      </form>

      <button
        type="button"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full border-gray-800 text-gray-200 hover:bg-gray-800/50",
        )}
        onClick={() => {
          setIsGoogleLoading(true);

          signIn("google", {
            callbackUrl: targetDestination,
          });
        }}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 size-4" />
        )}

        Google
      </button>
    </div>
  );
}
