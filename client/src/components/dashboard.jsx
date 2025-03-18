import React from "react";
import Swal from "sweetalert2";
import { ShoppingCart } from "lucide-react";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // Correct import
import { UserRoundCog } from "lucide-react";
import { IoStatsChartSharp } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [name, setName] = useState(null);
  const [price, setPrcie] = useState(null);
  const [itemCount, setItemCount] = useState(null);
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState(null);
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [error, setError] = useState(null);
  const [viewprofile, setViewprofile] = useState(false);
  const [viewedit, setviewedit] = useState(false);
  const [viewmore, setviewmore] = useState(false);
  const [productid, setproductid] = useState(null);
  // const [moreuser, setmoreuser] = useState(null);
  // const [morename, setmorename] = useState(null);
  // const [moredescription, setmoredescription] = useState(null);
  // const [moreitems, setmoreitems] = useState(null);
  // const [moreprice, setMoreUser] = useState(null);
  // const [morelocation, setMoreUser] = useState(null);
  // const [moreavailability, setMoreUser] = useState(null);
  // const [morecategory, setMoreUser] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleButtonClick = () => {
    document.getElementById("fileInput").click();
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (
      !name ||
      !price ||
      !itemCount ||
      !category ||
      !description ||
      !location ||
      !selectedFile
    ) {
      toast.error("Please fill in all fields and select an image.");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("items", itemCount);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("image", selectedFile);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/product/post",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Log the response
      console.log("Product posted successfully:", response.data);

      // Reset the form state
      setName("");
      setPrcie("");
      setItemCount("");
      setCategory("");
      setDescription("");
      setLocation("");
      setSelectedFile(null);

      toast.success("Product posted successfully!");
    } catch (error) {
      console.error("Error posting product:", error);
      alert("Error posting product. Please try again.");
    }
  };

  const fetchPosts = async (page) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/product/myposts",

        {
          params: { page },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts(response.data.products);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  function handlePageNumber(direction) {
    let newPage = currentPage;

    if (direction === "p" && currentPage > 1) {
      newPage = currentPage - 1;
    } else if (direction === "n" && currentPage < totalPages) {
      newPage = currentPage + 1;
    }

    setCurrentPage(newPage);
    fetchPosts(newPage);

    const prevButton = document.getElementById("previous");
    const nextButton = document.getElementById("next");

    if (prevButton && nextButton) {
      prevButton.disabled = newPage === 1;

      nextButton.disabled = newPage === totalPages;
    }
  }
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUserName(data.name);
      setUserEmail(data.email);
      console.log(userEmail);
    } catch (err) {
      setError(err.message);
    }
  };
  const editpost = async () => {
    if (
      !name ||
      !price ||
      !itemCount ||
      !category ||
      !description ||
      !location
    ) {
      toast.error("Please fill in all fields and select an image.");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("items", itemCount);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("location", location);
    if (selectedFile != null) {
      formData.append("image", selectedFile);
    }
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/product/update/${productid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Log the response
      console.log("Product posted successfully:", response.data);

      toast.success("Post edited successfully!");
    } catch {
      toast.error("Edit failed");
    }
  };
  const deletePost = async () => {
    try {
      if (!productid) {
        console.error("Product ID is undefined!");
        return;
      }

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `http://localhost:5000/product/delete/${productid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Post deleted successfully:", response.data);
        Swal.fire("Deleted!", "Your post has been deleted.", "success");
        return response.data;
      } else {
        Swal.fire("Cancelled", "Your post is safe :)", "error");
        return null;
      }
    } catch (error) {
      console.error(
        "Error deleting post:",
        error.response?.data || error.message
      );
      Swal.fire("Error!", "An error occurred during deletion.", "error");
    }
  };

  useEffect(() => {
    if (selectedFile) {
      console.log(selectedFile.name);
    }
  }, [selectedFile]);

  useEffect(() => {
    fetchPosts(currentPage);
    fetchUserData();
  }, []);
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-[100vw] h-[100vh]  flex flex-col relative  ">
        {viewmore && (
          <div className=" flex absolute w-full h-full  justify-center  items-center inset-0 backdrop-blur-lg bg-white/30">
            <div className="w-[45%] h-[80%] bg-white flex flex-col justify-between items-end p-2">
              <button
                className="cursor-pointer text-yellow-300 "
                onClick={() => {
                  setviewmore(false);
                }}
              >
                <IoMdClose className="text-[25px] " />
              </button>
              <div className="w-full p-2 h-[90%] bg-[#FEAE1F] flex">
                <div className="w-[40%] h-full flex items-center justify-center">
                  <div
                    className="h-[50%] w-full  border-4 border-white bg-cover bg-center bg-no-repeat "
                    style={{
                      backgroundImage: `url(http://localhost:5000/uploads/${image})`,
                    }}
                  ></div>
                </div>
                <div className="h-full w-[60%] text-white flex px-2  justify-center items-center flex-col gap-0 ">
                  <div className="h-[50%] w-full bg-white p-2 text-black grid grid-rows-7">
                    <div className="w-full h-full border-b-2 border-t-4 border-yellow-300  flex ">
                      <p className="w-1/2 px-2">Name</p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {name}
                      </div>
                    </div>
                    <div className="w-full h-full border-y-2 border-yellow-300  flex ">
                      <p className="border-2 border-white w-1/2 px-2">Price</p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {price}
                      </div>
                    </div>
                    <div className="w-full h-full border-y-2 border-yellow-300  flex ">
                      <p className="border-2 border-white w-1/2 px-2">Items</p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {itemCount}
                      </div>
                    </div>
                    <div className="w-full h-full border-y-2 border-yellow-300  flex ">
                      <p className="border-2 border-white w-1/2 px-2">
                        Description
                      </p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {description}
                      </div>
                    </div>
                    <div className="w-full h-full border-y-2 border-yellow-300  flex ">
                      <p className="border-2 border-white w-1/2 px-2">
                        Location
                      </p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {location}
                      </div>
                    </div>
                    <div className="w-full h-full border-y-2 border-yellow-300  flex ">
                      <p className="border-2 border-white w-1/2 px-2">
                        Category
                      </p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {category}
                      </div>
                    </div>
                    <div className="w-full h-full border-t-2 border-b-4 border-yellow-300  flex ">
                      <p className="border-2 border-white w-1/2 px-2">
                        Product ID
                      </p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {productid}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {viewedit && (
          <div className=" flex absolute w-full h-full  justify-center  items-center inset-0 backdrop-blur-lg bg-white/30">
            <div className="w-[45%] h-[80%] bg-white flex flex-col justify-between items-end p-2">
              <button
                className="cursor-pointer text-yellow-300 "
                onClick={() => {
                  setviewedit(false);
                }}
              >
                <IoMdClose className="text-[25px] " />
              </button>
              <div className="w-full p-2  h-[90%] bg-[#FEAE1F] flex">
                <div className="w-[40%] h-full flex items-center gap-2 flex-col justify-center">
                  <div
                    className="h-[50%] w-full  border-4 border-white bg-cover bg-center bg-no-repeat "
                    style={{
                      backgroundImage: `url(http://localhost:5000/uploads/${image})`,
                    }}
                  ></div>
                  <button
                    type="button"
                    className="w-full cursor-pointer h-[40px] rounded-2xl  border-2 flex flex-col justify-center items-center"
                    onClick={handleButtonClick}
                  >
                    Change Image
                  </button>
                  <input
                    type="file"
                    id="fileInput"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept="image/jpeg, image/png, image/gif,image/jpg"
                  />
                </div>
                <div className="w-[60%] px-2 h-full  flex justify-center flex-col gap-2 items-center  ">
                  <div className="h-[50%]  w-full p-2  bg-white text-black grid grid-rows-6 px-0 justify-center items-center flex-col ">
                    <div className="w-full h-full flex border-amber-300 border-b-2 border-t-4  border-x-0  ">
                      <p className="w-1/2 flex items-center  px-2 ">Name</p>
                      <input
                        className="border-2 focus:outline-none border-x-gray-500 border-y-0 w-1/2 px-2 h-full break-words whitespace-normal "
                        placeholder={name}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="w-full h-full flex border-y-amber-300 border-2 border-x-0  ">
                      <p className="w-1/2 flex items-center  px-2 ">Price</p>
                      <input
                        className="border-2 focus:outline-none border-x-gray-500 border-y-0 w-1/2 px-2 h-full break-words whitespace-normal "
                        placeholder={price}
                        value={price}
                        onChange={(e) => setPrcie(e.target.value)}
                      />
                    </div>
                    <div className="w-full h-full flex border-y-amber-300 border-2 border-x-0  ">
                      <p className="w-1/2 flex items-center  px-2 ">Items</p>
                      <input
                        className="border-2 focus:outline-none border-x-gray-500 border-y-0 w-1/2 px-2 h-full break-words whitespace-normal "
                        placeholder={itemCount}
                        value={itemCount}
                        onChange={(e) => setItemCount(e.target.value)}
                      />
                    </div>
                    <div className="w-full h-full flex border-y-amber-300 border-2 border-x-0  ">
                      <p className="w-1/2 flex items-center  px-2 ">
                        Description
                      </p>
                      <input
                        className="border-2 focus:outline-none border-x-gray-500 border-y-0 w-1/2 px-2 h-full break-words whitespace-normal "
                        placeholder={description}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div className="w-full h-full flex border-y-amber-300 border-2 border-x-0  ">
                      <p className="w-1/2 flex items-center  px-2 ">Location</p>
                      <input
                        className="border-2 focus:outline-none border-x-gray-500 border-y-0 w-1/2 px-2 h-full break-words whitespace-normal "
                        placeholder={location}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="w-full h-full flex border-amber-300 border-t-2 border-b-4  border-x-0  ">
                      <p className="w-1/2 flex items-center  px-2 ">Category</p>
                      <select
                        className="border-2 focus:outline-none border-x-gray-500 border-y-0 w-1/2 px-2 h-full break-words whitespace-normal "
                        value={category} // Set default value
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="" disabled>
                          Product Category
                        </option>
                        <option value="shoes">Shoes</option>
                        <option value="clothes">Clothes</option>
                        <option value="electronics">Electronics</option>
                        <option value="accessories">Accessories</option>
                      </select>
                    </div>
                  </div>
                  <div className="w-full h-[40px]  grid grid-cols-2 gap-2">
                    <button
                      onClick={deletePost}
                      className="w-full h-full  rounded-2xl bg-[#C8C7C6] text-[17px] font-semibold cursor-pointer transition-all duration-150 hover:bg-[#AFACAC]"
                    >
                      Delete
                    </button>
                    <button
                      onClick={editpost}
                      className="w-full h-full  rounded-2xl bg-black text-[17px] cursor-pointer text-yellow-300"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative h-[8%] w-full bg-black flex justify-between items-center">
          <div className="w-[20vw]  h-full flex justify-center gap-1 items-center bodrer-r-solid border-yellow-300 border-r-[1px]">
            <ShoppingCart size={35} className=" text-yellow-300" />
            <h1 className="text-[20px] text-white">Ethio-Carts</h1>
          </div>

          <div className="w-[15vw] cursor-pointer  gap-2  h-full flex justify-center   items-center ">
            <button
              onClick={() => {
                setViewprofile(true);
              }}
              className="w-[100px] cursor-pointer rounded-sm h-[38px] border-yellow-200 flex  justify-center items-center text-yellow-200 border-1"
            >
              <User size={20} className=" text-yellow-300" />
              Profile
            </button>
          </div>
          {viewprofile && (
            <div className="absolute overflow-hidden border-1 border-gray-300 pt-2 w-[23%] h-[60vh] z-45 bg-yellow-300 top-[8vh] rounded-2xl left-[76vw] flex items-center flex-col">
              <IoMdClose
                className="text-[25px] absolute top-[3%] left-[90%] cursor-pointer"
                onClick={() => {
                  setViewprofile(false);
                }}
              />
              <div className="w-full h-[45%] flex flex-col  justify-center items-center ">
                <div className=" p-4 bg-gray-900 rounded-full border-4 border-white flex justify-center items-center">
                  <ShoppingCart size={30} className=" text-yellow-300" />
                </div>
                <p className="text-[23px] font-semibold ">Hi, {userName}</p>
                <h1>{userEmail}</h1>
              </div>
              <div className="w-full h-[55%] py-6 p-12 grid gap-2 grid-rows-3">
                <button className="w-full h-full flex justify-center items-center gap-2 bg-black text-white ">
                  <UserRoundCog size={24} />
                  Edit Profile
                </button>
                <button className="w-full h-full  bg-black text-white flex justify-center items-center gap-2">
                  <IoStatsChartSharp className="text-[20px]" />
                  My Stat
                </button>
                <button className="w-full h-full flex justify-center items-center gap-2 bg-black text-white ">
                  <IoLogOutOutline className="text-[25px]" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-[100vw] h-[92vh] flex ">
          <div className="w-full h-[92vh] hidden  z-50 inset-0 backdrop-blur-lg bg-white/30 absolute justify-center items-center  ">
            <form className="w-[45%] h-[90%] bg-[#FFAD1B] shadow-gray-500 shadow-md p-4 rounded-3xl  flex flex-col justify-start items-center  ">
              <button
                type="button"
                className="w-full h-[30%] rounded-2xl border-dashed border-2 flex flex-col justify-center items-center"
                onClick={handleButtonClick}
              >
                <Plus size={50}></Plus>

                {selectedFile && (
                  <p className="text-center font-sans text-[17px]">
                    {/* Selected file: {selectedFile.name} */}
                    Change Image
                  </p>
                )}
                {!selectedFile && (
                  <p className="text-center font-sans text-[17px]">
                    Upload Product Image
                  </p>
                )}
              </button>
              <div className="w-full h-[70%]  flex justify-between items-center flex-wrap ">
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png, image/gif,image/jpg"
                />

                <div className="w-[48%] h-[50px]">
                  <label className="h-[10%]">Product name</label>
                  <input
                    type="text"
                    placeholder="Name"
                    className="pl-2 w-full h-[90%] bg-white text-[16px]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  ></input>
                </div>
                <div className="w-[48%] h-[50px]">
                  <label className="h-[10%]">Product Price</label>
                  <input
                    type="text"
                    placeholder="Price"
                    className="pl-2 w-full h-[90%] bg-white text-[16px]"
                    value={price}
                    onChange={(e) => setPrcie(e.target.value)}
                  ></input>
                </div>
                <div className="w-[48%] h-[50px]">
                  <label className="h-[10%]">Number of Items</label>
                  <input
                    type="text"
                    placeholder="count"
                    className="pl-2 w-full h-[90%] bg-white text-[16px]"
                    value={itemCount}
                    onChange={(e) => setItemCount(e.target.value)}
                  ></input>
                </div>
                <div className="w-[48%] h-[50px]">
                  <label className="h-[10%]">Loctaion</label>
                  <input
                    type="text"
                    placeholder="location"
                    className="pl-2 w-full h-[90%] bg-white text-[16px]"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  ></input>
                </div>
                <div className="w-[48%] h-[50px]">
                  <label className="h-[10%]">Select Category</label>
                  <select
                    className="w-full h-[90%] bg-white"
                    value={category || ""} // Set default value
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="" disabled>
                      Product Category
                    </option>
                    <option value="shoes">Shoes</option>
                    <option value="clothes">Clothes</option>
                    <option value="electronics">Electronics</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div className="w-[48%] h-[50px]">
                  <label className="h-[10%]">Delivery option</label>
                  <select
                    className="w-full h-[90%] bg-white"
                    value={category || ""} // Set default value
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="" disabled>
                      Delivery Option
                    </option>
                    <option value="shoes">No delivery</option>
                    <option value="clothes">Self-Delivery</option>
                    <option value="electronics">Ethio-cart delivery</option>
                  </select>
                </div>

                <div className="h-[50px] w-full">
                  <label className="h-[10%]">Product Description</label>
                  <textarea
                    placeholder="Description"
                    className="pl-2 w-full bg-white h-[90%]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  onClick={handlePost}
                  placeholder="Product name"
                  className="pl-2 w-full rounded-lg h-[50px] text-[18px] text-white hover:bg-gray-900 transition-all duration-100 cursor-pointer font-semibold bg-black"
                >
                  Post Product
                </button>
              </div>
            </form>
          </div>
          <div className="w-[20%] h-full bg-black border-t-1 border-r-1 border-yellow-300"></div>
          <div className="w-[80%] h-full ">
            <div className="w-full  h-full  flex flex-col p-2 ">
              <div className="w-full h-[90%]  grid grid-cols-4 gap-2 grid-rows-2">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div
                      key={post._id}
                      className=" w-full h-full rounded-md border-4 border-gray-200"
                    >
                      <div
                        className="w-full h-[50%] bg-cover bg-center bg-no-repeat "
                        style={{
                          backgroundImage: `url(http://localhost:5000/uploads/${post.image})`,
                        }}
                      ></div>

                      <div className="w-full h-[50%] px-2 flex flex-col  bg-gray-200">
                        <div className="w-ful h-[75%] ">
                          <p className="text-[18px] w-full">
                            Category: {post.category}
                          </p>
                          <p className="text-[18px] w-full ">
                            Price: {post.price}
                          </p>
                          <p className="text-[18px] w-full ">
                            Items: {post.items}
                          </p>
                        </div>
                        <div className="w-full h-[25%] grid gap-2 grid-cols-2">
                          <button
                            onClick={() => {
                              setName(post.name);
                              setDescription(post.description);
                              setPrcie(post.price);
                              setCategory(post.category);
                              setItemCount(post.items);
                              setLocation(post.location);
                              setproductid(post.id);
                              setImage(post.image);
                              setviewmore(true);
                            }}
                            className="w-full h-full border-1 cursor-pointer bg-black border-yellow-300 rounded-lg text-yellow-300"
                          >
                            More
                          </button>
                          <button
                            onClick={() => {
                              setName(post.name);
                              setDescription(post.description);
                              setPrcie(post.price);
                              setCategory(post.category);
                              setItemCount(post.items);
                              setLocation(post.location);
                              setproductid(post.id);
                              setImage(post.image);
                              setviewedit(true);
                            }}
                            className="w-full cursor-pointer h-full border-2 bg-yellow-300 border-yellow rounded-lg"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No posts found.</p>
                )}
                {/* You could also add pagination controls here */}
              </div>
              <div className="w-full h-[10%] gap-2 flex p-2">
                <button
                  id="previous"
                  className="w-[50%] bg-yellow-400 text-[16px] cursor-pointer"
                  onClick={() => handlePageNumber("p")}
                >
                  Previous
                </button>
                <button
                  id="next"
                  className="w-[50%] bg-black text-white text-[16px] cursor-pointer"
                  onClick={() => handlePageNumber("n")}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
