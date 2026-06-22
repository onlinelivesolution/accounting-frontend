import { useLocation,useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axiosClient";

export default function AdminVerifyOTP(){

const location=useLocation();

const navigate=useNavigate();

const username=location.state?.username;

const [otp,setOtp]=useState("");

const handleVerify=async()=>{

try{

const res=await api.post(
"/admin/verify-otp",
{
username,
otp
}
);

localStorage.setItem(
"adminToken",
res.data.token
);

navigate("/admin/dashboard");

}
catch(error:any){

alert(
error.response?.data?.detail
);

}

};

return(

<div className="p-6">

<input
value={otp}
onChange={(e)=>setOtp(e.target.value)}
placeholder="Enter OTP"
className="border p-2"
/>

<button
onClick={handleVerify}
className="bg-green-500 text-white p-2 ml-2"
>

Verify

</button>

</div>

);

}