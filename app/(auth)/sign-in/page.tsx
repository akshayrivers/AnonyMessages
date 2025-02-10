/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Link from "next/link"
import {  useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signInSchema } from "@/app/schemas/signInSchema"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"





const page = () => {

  const [verifyUsername, setVerifyUsername] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  // zod implementation 
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues:{
      identifier: '',
      password: ''
    }
  });


  const onSubmit = async (data:z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials',{
        redirect:false,
        identifier: data.identifier,
        password:  data.password
    })
    if(result?.error){
        toast({
            title:"Login failed",
            description:"Incorect username or password",
            variant:"destructive"
        })
    }
    if(result?.url){
      router.replace('/dashboard')
    }
  }
  const verifyUser = () => {
    if (!verifyUsername) {
      toast({
        title: "Verification failed",
        description: "Please enter your username",
        variant: "destructive"
      });
      return;
    }
    
    router.push(`/verify/${verifyUsername}`);
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="flex flex-col space-y-7">
          <h1 className="text-2xl font-bold text-red-500 text-center">If only verification left</h1>
          <Input 
            placeholder="Your previous username"
            onChange={(e) => setVerifyUsername(e.target.value)}
          />
          <Button  onClick={verifyUser} className="mt-2">Verify</Button>
        </div>
        <h2 className="text-2xl font-bold text-red-500 text-center">NOTE: You are verified by default due to some issues with resend email!!</h2>
        <div className="text-center">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <Input {...field} name="email/Username" />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
              <Button type="submit">
                Sign In
              </Button>
            </form>
          </Form>
          <div>
            <p className="text-black">
              Do not have an Account?{' '}
              <Link href="/sign-up" className="text-blue-500 hover:text-blue-700">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default page;