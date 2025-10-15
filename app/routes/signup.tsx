import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router';
import { useAuth } from '~/context/authContext';
import supabase from "~/lib/supabase";

export default function signup() {

  const [FormData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setisLoading] = useState(false);
  const [showPassword, setshowPassword] = useState(false);
  const [errors, seterrors] = useState<Record<string, string>>({});
  const {setUser} = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      seterrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    /* if (!FormData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!FormData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (FormData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } */

    if (!FormData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(FormData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!FormData.password) {
      newErrors.password = "Password is required";
    } else if (FormData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    seterrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setisLoading(true);

    try {
      //
      const user = await supabase.auth.signUp({
        email : FormData.email,
        password: FormData.password
      })
      supabase.auth.updateUser({
        data: {
          fullName: FormData.fullName,
          username: FormData.username
        }
      })
      navigate("/");
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-3">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className='border border-[#dbdbdb] max-w-[350px] w-full'>
            <div className="p-8">
              <div className="mx-auto mb-6 bg-[url('images/bg-login.png')] w-[175px] h-[51px] bg-position-[0_-2959px]">
              </div>
              <p className="text-center font-semibold text-[#737373] mb-5">
                Sign up to see photos and videos from your friends.
              </p>
              <button className="w-full rounded-md py-1 font-semibold text-sm bg-[#4A5DF9] text-white text-center cursor-pointer ">
                Log in with Facebook
              </button>

              <div className="flex items-center my-6">
                <div className="border-t border-[#dbdbdb] flex-1"/>
                <p className="px-4 text-[13px] text-[#737373] font-semibold">OR</p>
                <div className="border-t border-[#dbdbdb] flex-1"/>
              </div> 

              <form onSubmit={handleSubmit} id='login' action="" className="space-y-4">

                <div>
                  <input 
                    type="text"
                    name="email"
                    value={FormData.email}
                    onChange={handleInputChange}
                    placeholder="Mobile number or Email"
                    required
                    className={`w-full px-2 py-2 bg-[#fafafa] border border-[#dbdbdb] rounded-sm  focus:outline-none focus:border-gray-500 text-[12px] dark:text-black ${
                      errors.email ? "border-red-500" : "border-[#dbdbdb] focus:border-gray-500"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={FormData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-2 py-2 bg-[#fafafa] border border-[#dbdbdb] rounded-sm  focus:outline-none focus:border-gray-500 text-[12px] dark:text-black ${
                      errors.password ? "border-red-500" : "border-[#dbdbdb] focus:border-gray-500"
                    }`}
                  />
                  <button type="button"
                    onClick={() => setshowPassword(!showPassword)} 
                    className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400 text-[12px] font-semibold dark:text-white">
                      {showPassword ? "Hide" : "Show"}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <input 
                    type="text"
                    name="fullName"
                    value={FormData.fullName}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    
                    className={`w-full px-2 py-2 bg-[#fafafa] border border-[#dbdbdb] rounded-sm  focus:outline-none focus:border-gray-500 text-[12px] dark:text-black ${
                      errors.fullName ? "border-red-500" : "border-[#dbdbdb] focus:border-gray-500"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <input 
                    type="text"
                    name="username"
                    value={FormData.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    
                    className={`w-full px-2 py-2 bg-[#fafafa] border border-[#dbdbdb] rounded-sm  focus:outline-none focus:border-gray-500 text-[12px] dark:text-black ${
                      errors.username ? "border-red-500" : "border-[#dbdbdb] focus:border-gray-500"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.username}</p>
                  )}
                </div>

                <p className="text-[12px] font-normal -tracking-normal text-[#787878] text-center">
                  People who use our service may have uploaded your contact information to Instagram. 
                  <span className="text-[#416ef9]">
                     Learn More
                  </span>
                </p>

                <p className="text-[12px] font-normal -tracking-normal text-[#787878] text-center">
                  By signing up, you agree to our 
                  <span className="text-[#416ef9]"> Terms</span> , 
                  <span className="text-[#416ef9]"> Privacy Policy</span> and 
                  <span className="text-[#416ef9]"> Cookies Policy</span> .
                </p>

                <button type="submit"
                  disabled={isLoading || !FormData.email || !FormData.password}
                  className="w-full bg-[#808dfb] text-white py-1 rounded-md font-semibold text-sm"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </form>

                          

            </div>
            
          </div>
          <div className="border border-[#dbdbdb] max-w-[350px] w-full">
            <div className='p-8 text-center'>
              <p className='text-sm'>
                Have an account? <br />
                <Link to="/login"
                  className="text-[#416ef9] font-semibold cursor-pointer"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className='max-w-[1280px] mx-auto px-6 my-8'>
        <div className='flex flex-col items-center justify-center gap-3'>
          <ul className='flex items-center justify-center gap-3'>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Meta</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">About</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Blog</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Jobs</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Help</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">API</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Privacy</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Terms</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Locations</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Instagram Lite</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Meta AI</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Meta AI Article</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Threads</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Contact Uploading & Non-Users</Link>
            </li>
            <li className='text-[#737373] text-[12px] hover:underline'>
              <Link to="">Meta Verified</Link>
            </li>
          </ul>
          <div className='flex items-center justify-center gap-4'>
            <div className="">
              <select name="" id="" className='text-[12px] focus:outline-none text-[#737373] cursor-pointer'>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
                <option className='text-[#737373]' value="">English</option>
              </select>
            </div>
            <p className='text-[12px] text-[#737373]'>
              © 2025 Instagram from Meta
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
