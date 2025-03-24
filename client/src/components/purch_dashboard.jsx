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
import { MdDashboard } from "react-icons/md";
import { AiOutlineHistory } from "react-icons/ai";
import { MdOutlinePostAdd } from "react-icons/md";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { BiSolidPurchaseTagAlt } from "react-icons/bi";
import { MdOutlinePending } from "react-icons/md";
import { FaCartFlatbed } from "react-icons/fa6";
import { TbTruckDelivery } from "react-icons/tb";
import { ImCancelCircle } from "react-icons/im";
import { CiEdit } from "react-icons/ci";
import { FaCartPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Purch_Dashboard() {
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
  const [viewmore, setviewmore] = useState(false);
  const [vieworder, setvieworder] = useState(false);
  const [activeView, setActiveView] = useState("allpost");
  const [productid, setproductid] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartTtemCounts, setCartTtemCounts] = useState({});
  const [totalCartItems, SettotalCartItems] = useState(0);
  const [totalCartAmount, settotalCartAmount] = useState(0);
  const [deliveryLocation, setdeliveryLocation] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Initialize navigate

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handlefileselect = () => {
    document.getElementById("fileInput").click();
  };
  const handleIncrement = (postId) => {
    setCartTtemCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 1) + 1,
    }));
  };
  const handleDecrement = (postId) => {
    setCartTtemCounts((prev) => ({
      ...prev,
      [postId]: prev[postId] > 1 ? prev[postId] - 1 : 0,
    }));
  };
  // handle product post
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

      console.log("Product posted successfully:", response.data);

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
  //fetch products posted by logged in user
  const fetchPosts = async (page) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/product/all",

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
  // pagination hanlde while fetching data
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
  // fetch logged in user data
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

  // deleted an existing post
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

        // console.log("Post deleted successfully:", response.data);
        Swal.fire("Deleted!", "Your post has been deleted.", "success");
        return response.data;
      } else {
        // Swal.fire("Cancelled", "Your post is safe :)", "error");
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
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart[item.productId];

      if (existingItem) {
        // Update existing item
        return {
          ...prevCart,
          [item.productId]: {
            ...existingItem,
            itemsCount: existingItem.itemsCount + item.itemsCount,
            totalAmount: existingItem.totalAmount + item.totalAmount,
          },
        };
      } else {
        // Add new item
        return {
          ...prevCart,
          [item.productId]: item,
        };
      }
    });
  };

  // Function to remove an item from the cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      delete updatedCart[productId]; // Remove item
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const calculateCartTotals = () => {
    let totalItems = 0;
    let totalAmount = 0;
    Object.values(cart).forEach((item) => {
      totalItems += item.itemsCount;
      totalAmount += item.totalAmount;
    });

    settotalCartAmount(totalAmount);
    SettotalCartItems(totalItems);
  };

  const sendOrderToBackend = async () => {
    if (Object.keys(cart).length === 0) {
      alert("Cart is empty!");
      return;
    }

    // Convert the cart object into an array of { productId, itemsCount }
    const formattedOrders = Object.values(cart).map((item) => ({
      productId: item.productId,
      itemsCount: item.itemsCount,
    }));

    const orderData = {
      customerEmail: userEmail, // Replace with the actual customer email
      deliveryLocation: deliveryLocation, // Replace with the actual delivery location
      orders: formattedOrders, // Formatted orders
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/order/addorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token if authentication is required
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        setvieworder(false);
        toast.success("Order placed successfully!");
        setCart({});
      } else {
        toast.error(`${data.message}`);
        setvieworder(false);
      }
    } catch (error) {
      toast.error("Failed to send order:", error);
    }
  };

  const displayOrdersfun = async () => {
    try {
      const token = localStorage.getItem("token"); // Get token from storage
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      const response = await axios.get("http://localhost:5000/order/myorders", {
        headers: {
          Authorization: `Bearer ${token}`, // Send token to backend
        },
      });

      setOrders(response.data);
      setActiveView("displayOrders");
      setViewprofile(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const cancelOrder = async (orderId) => {
    const token = localStorage.getItem("token"); // Get JWT token from local storage or wherever it is stored

    try {
      const response = await axios.put(
        `http://localhost:5000/order/cancel/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the JWT token to the Authorization header
          },
        }
      );

      if (response.status === 200) {
        toast.success("Order canceled successfully");
        // Handle success (e.g., update UI)
      } else {
        toast.error("Failed to cancel order: " + response.data.message);
        // Handle failure (e.g., display an error message)
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error canceling the order: " + error.message);
      // Handle error (e.g., display an error message)
    }
  };
  useEffect(() => {
    if (selectedFile) {
      console.log(selectedFile.name);
    }
  }, [selectedFile]);

  useEffect(() => {
    fetchUserData();
    fetchPosts(1);

    const intervalId = setInterval(() => {
      fetchUserData();
      fetchPosts(1);
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    calculateCartTotals();
  }, [cart]);
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="relative overflow-clip w-[100vw] h-[100vh]  flex flex-col   ">
        {viewmore && (
          <div className="  flex absolute w-full h-full  justify-center  items-center inset-0 backdrop-blur-lg bg-white/30">
            <div className="w-[45%] h-[80%] bg-white flex flex-col justify-between items-end p-2">
              <button
                className="cursor-pointer text-[#1ecbe1] "
                onClick={() => {
                  setviewmore(false);
                }}
              >
                <IoMdClose className="text-[25px] " />
              </button>
              <div className="w-full p-2 h-[90%] bg-[#1ecbe1] flex">
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
                    <div className="w-full h-full border-b-2 border-t-4 border-[#1ecbe1]  flex ">
                      <p className="w-1/2 px-2">Name</p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {name}
                      </div>
                    </div>
                    <div className="w-full h-full border-y-2 border-[#1ecbe1]  flex ">
                      <p className="border-2 border-white w-1/2 px-2">Price</p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {price}
                      </div>
                    </div>
                    <div className="w-full h-full border-y-2 border-[#1ecbe1]  flex ">
                      <p className="border-2 border-white w-1/2 px-2">Items</p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {itemCount}
                      </div>
                    </div>
                    <div className="w-full h-full border-y-2 border-[#1ecbe1]  flex ">
                      <p className="border-2 border-white w-1/2 px-2">
                        Description
                      </p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {description}
                      </div>
                    </div>
                    <div className="w-full h-full border-y-2 border-[#1ecbe1]  flex ">
                      <p className="border-2 border-white w-1/2 px-2">
                        Location
                      </p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {location}
                      </div>
                    </div>
                    <div className="w-full h-full border-y-2 border-[#1ecbe1]  flex ">
                      <p className="border-2 border-white w-1/2 px-2">
                        Category
                      </p>
                      <div className="border-l-2 border-gray-500 w-1/2 px-2 h-auto break-words whitespace-normal">
                        {category}
                      </div>
                    </div>
                    <div className="w-full h-full border-t-2 border-b-4 border-[#1ecbe1]  flex ">
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

        {vieworder && (
          <div className="  flex absolute w-full h-full  justify-center  items-center inset-0 backdrop-blur-lg bg-white/30">
            <div className="w-[45%] h-[80%] bg-white flex flex-col justify-start items-end p-2">
              <button
                className="cursor-pointer text-[#1ecbe1] "
                onClick={() => {
                  setvieworder(false);
                }}
              >
                <IoMdClose className="text-[23px] " />
              </button>
              {Object.keys(cart).length === 0 ? (
                <p className="w-full h-full text-center">Your cart is empty.</p>
              ) : (
                <ul className="flex flex-col w-full h-[80%] border-2 border-blue-200 overflow-y-scroll ">
                  {Object.values(cart).map((item) => (
                    <li
                      className="p-1 border-white border-2 h-auto bg-blue-200"
                      key={item.productId}
                    >
                      <div className=" w-full pr-2  flex items-center justify-between">
                        <p>name: {item.productname}</p>
                        <button
                          className="cursor-pointer h-full w-[10%] bg-white"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          X
                        </button>
                      </div>
                      <p>Items: {item.itemsCount}</p>
                      <p>Total Price: ${item.totalAmount}</p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="w-full  flex-col  gap-1 h-[15%] flex mt-2">
                <div className="grid grid-cols-2  w-full gap-2 h-1/2">
                  <p className="w-full h-full bg-blue-200 pl-2">
                    Total Amount: {totalCartAmount}
                  </p>
                  <p className="w-full h-full bg-blue-200 pl-2">
                    Total Number of Items: {totalCartItems}
                  </p>
                </div>
                <div className="w-full h-1/2 gap grid grid-cols-2 gap-2  ">
                  <input
                    className="pl-2 w-full h-full bg-blue-200 focus:outline-blue-950"
                    placeholder="Enter Delivery Location"
                    onChange={(e) => setdeliveryLocation(e.target.value)}
                  ></input>
                  <button
                    onClick={sendOrderToBackend}
                    className="w-full h-full bg-blue-900 text-white text-[17px] cursor-pointer font-semibold"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* top navingation bar  */}
        <div className="relative h-[10%] w-full bg-[#F5FCFC] border-b-1 border-[#1ecbe1] flex justify-between items-center">
          <div className="w-[20vw]  h-full flex justify-center gap-1 items-center bodrer-r-solid border-[#1ecbe1] border-r-[1px]">
            <ShoppingCart
              size={45}
              className=" text-[#1ecbe1] border-2 p-2 rounded-full bg-black"
            />
            <h1 className="text-[20px] ">Ethio-Carts</h1>
          </div>

          <div className="w-[20vw] cursor-pointer  gap-2  h-full flex justify-center   items-center ">
            <button
              onClick={() => {
                navigate("/dashboard");
              }}
              className="w-[100px] cursor-pointer rounded-sm h-[38px] bg-[#1ecbe1] flex  justify-center items-center "
            >
              Sell Product
            </button>
            <button
              onClick={() => {
                setViewprofile(true);
              }}
              className="w-[100px] cursor-pointer rounded-sm h-[38px] bg-[#1ecbe1] flex  justify-center items-center "
            >
              <User size={20} className=" text-black" />
              Profile
            </button>
          </div>
          {viewprofile && (
            <div className="absolute overflow-hidden border-1 border-[#F5FCFC] pt-2 w-[23%] h-[60vh] z-45 bg-[#1ecbe1] top-[10vh] rounded-2xl left-[76vw] flex items-center flex-col">
              <IoMdClose
                className="text-[25px] absolute top-[3%] left-[90%] cursor-pointer"
                onClick={() => {
                  setViewprofile(false);
                }}
              />
              <div className="w-full h-[45%] flex flex-col  justify-center items-center ">
                <div className=" p-4 bg-gray-900 rounded-full border-4 border-white flex justify-center items-center">
                  <ShoppingCart size={30} className=" text-[#1ecbe1]" />
                </div>
                <p className="text-[23px] font-semibold ">Hi, {userName}</p>
                <h1>{userEmail}</h1>
              </div>
              <div className="w-full h-[55%] py-6 p-12 grid gap-2 grid-rows-3">
                <button
                  onClick={displayOrdersfun}
                  className="w-full h-full flex cursor-pointer justify-center items-center gap-2 bg-black text-white "
                >
                  <UserRoundCog size={24} />
                  My Orders
                </button>
                <button className="w-full h-full  bg-black text-white flex justify-center items-center gap-2">
                  <IoStatsChartSharp className="text-[20px]" />
                  My Purcahse
                </button>
                <button className="w-full h-full flex justify-center items-center gap-2 bg-black text-white ">
                  <IoLogOutOutline className="text-[25px]" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {activeView === "allpost" && (
          <div className="w-[100vw] h-[90vh] flex  ">
            <div className="w-[80%] h-full  ">
              <div className="w-full  h-full  flex flex-col p-2 ">
                <div className="w-full h-[90%]  grid grid-cols-4 gap-2 grid-rows-2">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <div
                        key={post._id}
                        className=" w-full h-full rounded-md border-4  border-[#F5FCFC] shadow-lg shadow-gray-400"
                      >
                        <div
                          className="w-full h-[82%] bg-[#F5FCFC]"
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
                        >
                          <div
                            className="w-full h-[50%] bg-cover bg-center bg-no-repeat "
                            style={{
                              backgroundImage: `url(http://localhost:5000/uploads/${post.image})`,
                            }}
                          ></div>

                          <div className="w-full h-[50%]   flex flex-col  ">
                            <div className="w-full  pb-1 h-[65%] px-2">
                              <p className="text-[18px] w-full">
                                Name: {post.name}
                              </p>
                              <p className="text-[18px] w-full ">
                                Price: {post.price}
                              </p>
                              <p className="text-[18px] w-full ">
                                Items: {post.items}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="w-full h-[18%] grid gap-2 p-1 bg-[#F5FCFC] grid-cols-2">
                          <div className="w-full h-full text-white grid grid-cols-3 rounded-lg overflow-hidden ">
                            <button
                              onClick={() => handleDecrement(post._id)}
                              className="h-full w-full  cursor-pointer bg-[#1ecbe1] hover:bg-blue-600 transition-all duration-100 text-[25px]"
                            >
                              -
                            </button>
                            <div className="w-full  text-black h-full flex items-center justify-center">
                              {cartTtemCounts[post._id] || 1}
                            </div>
                            <button
                              onClick={() => handleIncrement(post._id)}
                              className="h-full w-full  cursor-pointer bg-[#1ecbe1] hover:bg-blue-600 transition-all duration-100 text-[25px]"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              //   setPrcie(post.price);
                              //   setItemCount(post.items);
                              //   setproductid(post.id);
                              addToCart({
                                productname: post.name,
                                productId: post.id,
                                customerEmail: userEmail,
                                itemsCount: cartTtemCounts[post._id] || 1,
                                sellerId: post.seller,
                                totalAmount:
                                  (cartTtemCounts[post._id] || 1) * post.price,
                              });
                            }}
                            className="w-full cursor-pointer gap-1 h-full hover:bg-blue-600 transition-all duration-150 flex justify-center items-center  bg-[#1ecbe1] text-white  rounded-lg"
                          >
                            <FaCartPlus className="text[23px]" /> Add to Cart
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No posts found.</p>
                  )}
                </div>
                <div className="w-full h-[10%] gap-2 flex p-2">
                  <button
                    id="previous"
                    className="w-[50%] bg-[#1ecbe1] hover:bg-blue-500 text-[16px] cursor-pointer"
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

            <div className="w-[20%] relative max-h-full   gap-2 flex-col border-t-1  border-r-1 border-[#1ecbe1] bg-[#1ecbe1] p-2 flex  justify-start items-center  ">
              <div className="w-full h-[8%] bg-blue-950 flex justify-center items-center">
                <p className="text-white font-bold text-[23px] text-center">
                  My Cart
                </p>
              </div>
              <div className="w-full min-h-[10%] overflow-y-scroll   max-h-[90%] flex flex-col bg-white gap-2">
                {Object.keys(cart).length === 0 ? (
                  <p className="w-full h-full text-center">
                    Your cart is empty.
                  </p>
                ) : (
                  <ul className="flex flex-col  bg-white">
                    {Object.values(cart).map((item) => (
                      <li
                        className="p-1 border-white border-2 h-auto bg-blue-200"
                        key={item.productId}
                      >
                        <div className=" w-full pr-2  flex items-center justify-between">
                          <p>name: {item.productname}</p>
                          <button
                            className="cursor-pointer h-full w-[10%] bg-white"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            X
                          </button>
                        </div>
                        <p>Items: {item.itemsCount}</p>
                        <p>Total Price: ${item.totalAmount}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="w-full h-[10%]  p-2 gap-1 flex">
                <button
                  onClick={clearCart}
                  className="h-full w-1/2 bg-blue-950 text-[18px] cursor-pointer text-white"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    setvieworder(true);
                    calculateCartTotals();
                  }}
                  className="h-full w-1/2 bg-black text-[18px] cursor-pointer text-[#1ecbe1]"
                >
                  Order
                </button>
              </div>
            </div>
          </div>
        )}
        {activeView === "displayOrders" && (
          <div className="w-full h-[90vh] p-4 ">
            {orders.length === 0 && !loading && !error && (
              <p className="text-center">No orders found.</p>
            )}

            {orders.length > 0 && (
              <div className="w-full h-full ">
                <div className="grid grid-cols-7 font-bold bg-[#1ecbe1] p-2 rounded">
                  <p>Order ID</p>
                  <p>Product ID</p>
                  <p>Product Name</p>
                  <p>Items Count</p>
                  <p>Total Amount</p>
                  <p>Status</p>
                  <p className="w-full h-full text-center">cancle</p>
                </div>
                <div className="w-full h-[90%] overflow-y-scroll">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="grid grid-cols-7 border-b border-[#1ecbe1] p-1 "
                    >
                      <p className="h-[35px]">{order.orderId}</p>
                      <p>{order.productId}</p>
                      <p>{order.productName}</p>
                      <p>{order.itemsCount}</p>
                      <p>{order.totalAmount}</p>
                      <p>{order.status}</p>
                      <div className="w-full h-full flex justify-center items-center">
                        <button
                          onClick={() => cancelOrder(order.orderId)}
                          className="bg-red-600 h-full w-[60%] text-white rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Purch_Dashboard;
