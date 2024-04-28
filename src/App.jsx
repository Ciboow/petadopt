import React from "react"
import Home from "./pages/Home"
import Adopt from "./pages/Adopt"
import Adopt_2 from "./pages/Adopt_2"
import Shop from "./pages/Shop"
import Shop_2 from "./pages/Shop_2"
import Signin from "./pages/Signin"
import Signupselect from "./pages/Signupselect"
import Signup from "./pages/Signup"
import AddShop from "./Dashboard/AddShop"
import Adminsettings from "./pages/Adminsettings"
import DelShop from "./Dashboard/DelShop"
import UpdateShopItem from "./Dashboard/UpdateShopItem"
import UserSettings from "./pages/UserSettings"
import PhoneVerification from "./templates/PhoneVerification"
import Cart from "./pages/Cart"
import MyPurchase from "./pages/MyPurchase"
import AdminPurchaseHistory from "./pages/AdminPurchaseHistory"
import "./index.css"


//----------ROUTER-----------//
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"





export default function App() {



  return (
    <Router>
      <div>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/adopt" element={<Adopt />} />
          <Route exact path="/adopt_2" element={<Adopt_2 />} />
          <Route exact path="/shop" element={<Shop />} />
          <Route exact path="/signin" element={<Signin />} />
          <Route exact path="/signupselect" element={<Signupselect />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route exact path="/shop_2" element={<Shop_2 />} />
          <Route exact path="/addshop" element={<AddShop />} />
          <Route exact path="/adminsettings" element={<Adminsettings />} />
          <Route exact path="/settings" element={<UserSettings />} />
          <Route exact path="/delshop" element={<DelShop />} />
          <Route exact path="/updateshopitem" element={<UpdateShopItem />} />
          <Route exact path="/phoneverification" element={<PhoneVerification />} />
          <Route exact path="/cart" element={<Cart />} />
          <Route exact path="/mypurchase" element={<MyPurchase />} />
          <Route exact path="/adminpurchasehistory" element={<AdminPurchaseHistory />} />
        </Routes>
      </div>
    </Router>

  )

}
