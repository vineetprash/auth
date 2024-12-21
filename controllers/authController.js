import prisma from "../db/index.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from "fs";

function tokenise(email, role) {
  const token = jwt.sign(
    {
      email: email,
      expires: new Date().getTime() + 1000 * 60 * 60 * 60, // ONE HOUR
      role: role,
    },
    process.env.JWT_SECRET
  );
  return token;
}

export async function signup(req, res, next) {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // Hash password
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    const token = tokenise(email, "user");
    console.log(req.body, token);
    return { success: true, token: token, id: user.id };
  } catch (error) {
    console.error("Error during signup:", error);
    return { success: false, error: error.message };
  }
}

export async function signin(req, res) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email, deleted: false },
    });
    if (!user) return { success: false, message: "User not found" };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return { success: false, message: "Invalid password" };
    const token = tokenise(email, user);
    return { success: true, token: token, id: user.id };
  } catch (error) {
    console.error("Error during signin:", error);
    return { success: false, error: error.message };
  }
}

export async function resetPass(email, oldPass, newPass, bypass) {
  const user = await prisma.user.findUnique({
    where: { email, deleted: false },
  });
  if (!user) {
    return { success: false, message: "User not found" };
  }
  if (!bypass) {
    const isValid = await bcrypt.compare(oldPass, user.password);
    if (!isValid) return { success: false, message: "Invalid password" };
  }
  const hashedNewPass = await bcrypt.hash(newPass, 10);

  try {
    await prisma.user.update({
      where: { id },
      data: { password: hashedNewPass },
    });
    return { success: true, message: "Password successfully reset" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function sendOTP(req, email) {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const user = await prisma.user.findUnique({
    where: {
      email,
      deleted: false,
    },
  });
  if (!user) {
    return { success: false, message: "User not found" };
  }
  sendMail(otp, user.email);
  req.session.otp = otp;
  return { success: false, message: "OTP send to" + email };
}
function sendMail(otp, recepient) {
  // Create a transporter object

  const embed = fs
    .readFileSync(".\\view\\otp.html")
    .toString()
    .replace("${otp}", otp);

  console.log(process.env.EMAIL_ID);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Set up email options
  const mailOptions = {
    from: process.env.EMAIL_ID,
    to: recepient,
    subject: "Hello from Vineet",
    html: embed,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

export async function verifyOTP(req, otp, newPass) {
  console.log(otp, req.session.otp);
  if (otp === req.session.otp) {
    const res = await resetPass(email, "", newPass, true);
    if (res.success == true) {
      return { success: true, message: "Password reset successfully" };
    } else {
      return { success: false, message: "Password reset failed" };
    }
  } else {
    return { success: false, message: "Invalid OTP" };
  }
}
