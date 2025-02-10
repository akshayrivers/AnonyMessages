import { resend } from '@/lib/resend';
import VerificationEmail from '@/emails/VerificationEmail';
import { ApiResponse } from '../types/apiResponse';

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
):Promise<ApiResponse>{
     try {
        console.log(email,"sent to this email adress ");
        await resend.emails.send({
            from: 'onboarding@resend.dev',// our domain name which we don't have as of now 
            to: email,// in testing only our test email works
            subject: 'Verification Code',
            react: VerificationEmail({ username, otp: verifyCode }),
          });
          console.log("sent succesfully");
          return { success: true, message: 'Verification email sent successfully.' };
    }catch(emailError){
        console.error('Failed to send verification email', emailError);
        return {
            success: false,
            message: 'Failed to send verification email',
        };
    }
}