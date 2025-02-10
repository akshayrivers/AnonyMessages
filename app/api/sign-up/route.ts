import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/app/helpers/sendVerificationEmail";
import UserModel from "@/model/User";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await req.json();

    // Check if a verified user already exists with the given username.
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 400 }
      );
    }

    // Check if a user exists with the given email.
    const existingUserVerifiedByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserVerifiedByEmail) {
      if (existingUserVerifiedByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already exists",
          },
          { status: 400 }
        );
      } else {
        // Update the existing unverified user.
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserVerifiedByEmail.password = hashedPassword;
        existingUserVerifiedByEmail.verifyCode = verifyCode;
        existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserVerifiedByEmail.save();
      }
    } else {
      // Create a new user.
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: true,// for now lets set it true for all as resend email requires a domain to send email
        isAdmin: false,
        isAcceptingMessages: true,
        messages: [],
      });
      await newUser.save();
      console.log(newUser, "Sending a verification email");

      // Send verification email.
      const emailResponse = await sendVerificationEmail(email, username, verifyCode);
      if (!emailResponse.success) {
        return NextResponse.json(
          {
            success: false,
            message: emailResponse.message,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          success: true,
          message: "User registered successfully",
        },
        { status: 200 }
      );
    }

    // Optionally, if an existing unverified user was updated:
    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}
