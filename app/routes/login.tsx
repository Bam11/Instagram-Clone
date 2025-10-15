import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router';
import { useAuth } from '~/context/authContext';
import supabase from "~/lib/supabase";

const mockUsers = [
  {
    id: "1",
    fullName: "Daniel Omidiran",
    username: "daniel_diran",
    email: "daniel_diran@gmail.com",
    image: "images/daniel.jpg"
  },
  {
    id: "2",
    fullName: "Wicker Furniture",
    username: "wicker",
    email: "wickerfurniture@gmail.com",
    image: "images/wicker.jpg"
  },
  {
    id: "3",
    fullName: "Vibe With",
    username: "vibe_with",
    email: "Vube_with@gmail.com",
    image: "images/_vibe_with.jpg"
  },
]

export default function login() {

  const [FormData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setisLoading] = useState(false);
  const [showPassword, setshowPassword] = useState(false);
  const {setUser} = useAuth();
  const [selectedUser, setselectedUser] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setselectedUser(userId);
    
    if (userId) {
      const user = mockUsers.find((u) => u.id === userId);
      if (user) {
        setFormData({
          email: user.email,
          password: "password123", // Default password for demo
        });
      }  
    } else {
      setFormData({
        email: "",
        password: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setisLoading(true);
    try {
      // Simulate API call
      /* await new Promise((resolve) => setTimeout(resolve, 1000));

      const user = mockUsers.find((user) => user.email === FormData.email); */

      /* localStorage.setItem("user", JSON.stringify(user));
      setUser(user || null); */

      const user = await supabase.auth.signInWithPassword({
        email : FormData.email,
        password: FormData.password
      })
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-center justify-center ">
          <div className="min-w-[300px]">
            <img loading="lazy" src="images/landing-login.png" alt="" className=""/>
          </div>
          <div className='max-w-[350px] w-full'>
            <div className="p-8">
              <div className="mx-auto mb-8 bg-[url('images/bg-login.png')] w-[175px] h-[51px] bg-position-[0_-2959px] ">
              </div>
              <form onSubmit={handleSubmit} id='login' action="" className="space-y-4">
                
                <div>
                  <select
                    value={selectedUser}
                    onChange={handleUserSelect}
                    aria-label="Select a user to login"
                    className="w-full px-3 py-3 border border-[#dbdbdb] rounded-md dark:text-black dark:bg-white focus:outline-none focus:border-gray-400 text-sm"
                  >
                    <option value="">Select a user to login</option>
                    {mockUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.username})
                      </option>
                    ))}
                  </select>
                </div>

                <input 
                  type="text"
                  name="email"
                  value={FormData.email}
                  onChange={handleInputChange}
                  placeholder="Phone number, username, or email"
                  required
                  className='w-full px-2 py-2 bg-[#fafafa] border border-[#dbdbdb] rounded-sm  focus:outline-none focus:border-gray-500 text-sm dark:text-black'
                />

                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={FormData.password}
                    onChange={handleInputChange}
                    required
                    className='w-full px-2 py-2 bg-[#fafafa] border border-[#dbdbdb] rounded-sm  focus:outline-none focus:border-gray-500 text-sm dark:text-black'
                  />
                  <button type="button"
                    onClick={() => setshowPassword(!showPassword)} 
                    className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400 text-[12px] font-semibold cursor-pointer hover:text-black ">
                      {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <button type="submit"
                  disabled={isLoading || !FormData.email || !FormData.password}
                  className="w-full bg-[#808dfb] text-white py-1 rounded-md font-semibold text-sm cursor-pointer"
                >
                  {isLoading ? "Loggin in..." : "Log in"}
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="border-t border-[#dbdbdb] flex-1"/>
                <p className="px-4 text-[13px] text-[#737373] font-semibold">OR</p>
                <div className="border-t border-[#dbdbdb] flex-1"/>
              </div>

              <div className='flex items-center justify-center'>
                <div></div>
                <p className='font-semibold text-sm text-[#0095f6] text-center cursor-pointer'>
                  Log in with Facebook
                </p>
              </div>

              <div className='text-center my-3'>
                <button className=' cursor-pointer text-sm font-semibold hover:underline'>
                  Forgot password?
                </button>
              </div>
            </div>
            <div className='px-6 py-3 text-center'>
              <p className='text-sm'>
                Don't have an account?
                <Link to="/signup"
                  className="text-[#416ef9] font-semibold cursor-pointer"
                >
                   Sign up
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
            <div className='cursor-pointer'>
              <select name="" id="" className='text-[12px] focus:outline-none text-[#737373]'>
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
