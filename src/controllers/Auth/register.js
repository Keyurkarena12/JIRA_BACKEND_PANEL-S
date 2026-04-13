import User from "../../models/user.js";
import { registerValidation } from "../../validators/register.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { loginvalidation } from "../../validators/login.js";
import sendPasswordResetEmail from "../../middlewares/PasswordresetEmail.js";
import { resetpasswordValidation } from "../../validators/resetpassword.js";

export const register = async (req, res) => {
  try {
    const { error } = registerValidation.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        success: false
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      message: "User created successfully",
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false
    });
  }
};

export const login = async (req,res) =>{
  try {
    const{error}=loginvalidation.validate(req.body)
    if(error){
      return res.status(400).json({
        message: error.details[0].message,
        success: false
      });
    }

    const{email,password} = req.body;

    const user = await User.findOne({email});

    if(!user){
      return res.status(400).json({
        message:"User not found",
        success:false
      })
    }
    console.log("user", user)

    

    if (!user.password) {
      return res.status(500).json({
        message: "User password is missing or corrupted in database",
        success: false
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);



    if(!isPasswordValid){
      return res.status(400).json({
        message:"invalid password",
        success:false
      })
    }

    // console.log("isPasswordValid", isPasswordValid)
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });


    res.status(200).json({
      message:"User Logged in successfully",
      success:true,
      token,
      user:{
        _id:user._id,
        name:user.name,
        email:user.email
      }
    })




  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false
    });
  }
}

export const forgotpassword = async(req,res)=>{
  try {
    
    const {email} =req.body

    const user = await User.findOne({email});

    if(!user){
      return res.status(400).json({
        message:"User not found",
        success:false
      })
    }

    const resetpasswordcode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordCode = resetpasswordcode;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    await sendPasswordResetEmail(user.email, resetpasswordcode);

    res.status(200).json({
      message:"Password reset email sent successfully",
      success:true
    });



  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false
    });
  }
}  

export const resetpassword = async(req,res)=>{

  try {
   
    const {error} = resetpasswordValidation.validate(req.body);

    if(error){
      return res.status(400).json({
        message:error.details[0].message,
        success:false
      })
    }

    const {email, resetpasswordcode, newpassword} = req.body;

    const user = await User.findOne({email});

    if(!user){
      return res.status(400).json({
        message:"User not found",
        success:false
      })
    }

    if(user.resetPasswordCode !== resetpasswordcode){
      return res.status(400).json({
        message:"Invalid reset password code",
        success:false
      })
    }

    if(Date.now() > user.resetPasswordExpires){
      return res.status(400).json({
        message:"Reset password code expired",
        success:false
      })
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      message:"Password reset successfully",
      success:true
    });
  
    
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false
    });
  }

}