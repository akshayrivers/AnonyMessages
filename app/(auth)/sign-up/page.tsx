/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/app/schemas/signUpSchema"
import axios, {AxiosError} from "axios";
import { ApiResponse } from "@/app/types/apiResponse"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"





const page = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyUsername, setVerifyUsername] = useState("");

  const debounced = useDebounceCallback(setUsername, 1000);
  const { toast } = useToast();
  const router = useRouter();
  // zod implementation 
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues:{
      username: '',
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if(username){
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`);
          setUsernameMessage(response.data.message)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message??"Error checking Username");
        } finally{
          setIsCheckingUsername(false);
        }
      }
    }
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data:z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      console.log(data);
      const response= await axios.post<ApiResponse>('/api/sign-up',data)
      toast({
        title:"Success",
        description: response.data.message
      })
      router.replace(`verify/${username}`)
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in signup of user",error);
      const axiosError= error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive"
      })
      setIsSubmitting(false);
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
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                    <Input className="text-black"placeholder="username" {...field} 
                    onChange={(e)=>{
                      field.onChange(e)
                      debounced(e.target.value)
                    }}
                    />
                    </FormControl>
                    {isCheckingUsername&& <Loader2 className="animate-spin"/>}
                    <p className={`text-sm ${usernameMessage==="Username is unique" ? 'text-red-400': 'text-green-400'}`}>
                        {usernameMessage}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} name="email" />
                  <p className='text-muted text-slate-800 text-sm'>We will send you a verification code</p>
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
              <Button type="submit" disabled={isSubmitting} >
                {
                  isSubmitting ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    </>
                  ): ('Signup')
                }
              </Button>
            </form>
          </Form>
          <div>
            <p className="text-black">
              Already a member?{' '}
              <Link href="/sign-in" className="text-blue-500 hover:text-blue-700">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default page;