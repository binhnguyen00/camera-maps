import React from "react";
import PocketBase from "pocketbase";
import { useNavigate } from "react-router-dom";

import { cn, addToast } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";

interface SignInForm {
  userOrEmail: string;
  password: string;
}

interface SignUpForm extends SignInForm {
  name: string;
  email: string;
  passwordConfirm: string;
}

interface PocketBaseCtx {
  client: PocketBase;
  signIn: (info: SignInForm) => void;
  isSigningIn: boolean;
  signUp: (info: SignUpForm) => void;
  isSigningUp: boolean;
  signOut: () => void;
}

export const PocketBaseContext = React.createContext({} as PocketBaseCtx);

export default function PocketBaseProvider({ client, children }: { client: PocketBase, children: React.ReactNode }) {
  const navigate = useNavigate();

  const onSignOut = async () => {
    if (client.authStore.isValid) {
      await client.authStore.clear();
      navigate("/sign-in");
    } else {
      console.log("Already logout");
    }
    return;
  }

  const signIn = useMutation({
    mutationKey: ["signin"],
    mutationFn: async ({ userOrEmail, password }: SignInForm) => {
      await client.collection("users").authWithPassword(userOrEmail, password);
    },
    retry: false,
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Login successfully",
        hideCloseButton: true,
        timeout: 1500,
        classNames: {
          base: cn([
            "border border-l-8 rounded-md",
            "flex flex-col items-start gap-4",
            "border-success-200 dark:border-success-100 border-l-success",
            "text-success-500",
          ]),
          icon: "w-6 h-6 fill-current",
        }
      });
      navigate("/");
    },
    onError: (error) => {
      addToast({
        title: "Signin failed",
        description: (
          <div className="space-y-2">
            <span className="text-xs"> {error.message} </span>
          </div>
        ),
        hideCloseButton: true,
        classNames: {
          base: cn([
            "border border-l-8 rounded-md",
            "flex flex-col items-start gap-4",
            "border-danger-200 dark:border-danger-100 border-l-danger",
            "text-danger-500",
          ]),
          icon: "w-6 h-6 fill-current",
        }
      });
    }
  })

  const signUp = useMutation({
    mutationKey: ["signup"],
    mutationFn: async ({ name, email, password, passwordConfirm }: SignUpForm) => {
      await client.collection("users").create({
        name: name,
        email: email,
        password: password,
        passwordConfirm: passwordConfirm,
      });
    },
    retry: false,
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Signup successfully",
        hideCloseButton: true,
        timeout: 1500,
        classNames: {
          base: cn([
            "border border-l-8 rounded-md",
            "flex flex-col items-start gap-4",
            "border-success-200 dark:border-success-100 border-l-success",
            "text-success-500",
          ]),
          icon: "w-6 h-6 fill-current",
        }
      });
    },
    onError: (error) => {
      addToast({
        title: "Signup failed",
        description: (
          <div className="space-y-2">
            <span className="text-xs"> {error.message} </span>
          </div>
        ),
        hideCloseButton: true,
        classNames: {
          base: cn([
            "border border-l-8 rounded-md",
            "flex flex-col items-start gap-4",
            "border-danger-200 dark:border-danger-100 border-l-danger",
            "text-danger-500",
          ]),
          icon: "w-6 h-6 fill-current",
        }
      });
    }
  });

  return (
    <PocketBaseContext.Provider value={{
      client: client,
      signIn: signIn.mutate,
      isSigningIn: signIn.isPending,
      signUp: signUp.mutate,
      isSigningUp: signUp.isPending,
      signOut: onSignOut,
    }}>
      {children}
    </PocketBaseContext.Provider>
  )
}