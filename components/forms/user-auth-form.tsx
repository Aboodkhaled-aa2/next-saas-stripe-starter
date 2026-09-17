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

export function UserAuthForm({ className, type = "login", ...props }: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const signInResult = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
        callbackUrl: searchParams?.get("from") || "/dashboard",
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
      
      window.location.href = searchParams?.get("from") || "/dashboard";
    } catch (error) {
      setIsLoading(false);
      toast.error("Error", {
        description: "An unexpected error occurred.",
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
                className="bg-[#0b0f19] border-gray-800 text-white"
                {...register("name")}
              />
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
              className="bg-[#0b0f19] border-gray-800 text-white"
              {...register("email")}
            />
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
              className="bg-[#0b0f19] border-gray-800 text-white"
              {...register("password")}
            />
          </div>

          <button
            className={cn(buttonVariants(), "w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg")}
            disabled={isLoading}
          >
            {isLoading && <Icons.spinner className="mr-2 size-4 animate-spin" />}
            {type === "register" ? "Create Account" : "Sign In with Email"}
          </button>
        </div>
      </form>

      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }), "w-full border-gray-800 text-gray-200 hover:bg-gray-800/50")}
        onClick={() => {
          setIsGoogleLoading(true);
          signIn("google", { callbackUrl: searchParams?.get("from") || "/dashboard" });
        }}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? <Icons.spinner className="mr-2 size-4 animate-spin" /> : <Icons.google className="mr-2 size-4" />} Google
      </button>
    </div>
  );
}
