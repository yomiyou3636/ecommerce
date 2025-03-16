import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // Correct import
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from reloading

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      // Store the token in localStorage
      localStorage.setItem("token", response.data.token);

      toast.success("Login successful!");
      console.log("User Data:", response.data.user);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className=" w-[100vw] h-[100vh] bg-[#white] flex justify-center items-center flex-col">
        <div className="p-2 w-[27vw] h-[80vh] flex justify-center items-start  flex-col ">
          <div className="w-full h-[10%]  flex justify-center items-center gap-2">
            <ShoppingCart size={35} className=" text-[#FFD915]" />
            <h2 className="text-[rgb(0,0,0)] text-[20px]">Ethio-Cart</h2>
          </div>
          <form
            onSubmit={handleLogin}
            className="w-full h-[90%] p-6 rounded-lg border-solid gap-1.5 border-gray-300 flex border-1 flex-col"
          >
            <h1 className="font-semibold text-[28px]">Sign In</h1>
            <label className="font-sans text-[15px]  font-semibold" for="email">
              Type your Email
            </label>
            <input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="w-full h-[35px] border-1 rounded-md border-gray-500 boder-soild pl-3  focus:border-2  focus:outline-yellow-300 "
            ></input>
            <label
              className="font-sans text-[15px]  font-semibold"
              for="password"
            >
              Type your Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              name="password"
              type="password"
              className="w-full h-[35px] border-1 rounded-md border-gray-500 boder-soild pl-3  focus:border-2  focus:outline-yellow-300 "
            ></input>
            <button
              type="submit"
              className="w-full h-[35px] bg-[#FFD915] rounded-lg  font-semibold text-[17px] cursor-pointer hover:bg-yellow-400"
            >
              {loading ? "Logging in..." : "Continue"}
            </button>
            <div className="w-full h-auto">
              <p
                onClick={() => navigate("/signup")}
                className="font-sans text-[15px]  text-gray-600 hover:underline cursor-pointer "
              >
                Create Account
              </p>
              <p className="font-sans text-[15px] text-gray-600 hover:underline cursor-pointer">
                Forgot Your Password?
              </p>
            </div>
            <hr className="border-gray-400" />
            <div className="w-full h-[100px]  flex flex-col justify-center items-center">
              <p className="text-[18px] font-sans font-semibold">
                Shop on Ethio-Cart
              </p>
              <p className="text-center text-gray-400 font-semibold ">
                Experience the convenience of quality, delivered to your door.
              </p>
            </div>
          </form>
        </div>
        <div className="flex justify-center items-center gap-3 h-[20vh] w-full    bg-[#FFD915] flex-col ">
          <div className="w-full h-[50%]  gap-4 flex justify-center items-end">
            <p className="text-[15px] font-sans text-gray-800 hover:underline cursor-pointer">
              Terms and Conditions
            </p>
            <p className="text-[15px] font-sans text-gray-800 hover:underline cursor-pointer">
              Privacy
            </p>
            <p className="text-[15px] font-sans text-gray-800 hover:underline cursor-pointer">
              Q&A
            </p>
          </div>
          © 2024-2025, ethiocart.com, Inc. or its affiliates
        </div>
      </div>
    </>
  );
}

export default Login;
