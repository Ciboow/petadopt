// Cart.jsx
import React, { useEffect, useState } from "react";
import { doc, collection, getDoc, arrayRemove, updateDoc, setDoc } from "firebase/firestore";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../firebase";
import { DB } from "../firebase";
import ItemCart from "../templates/ItemCart";
import Navbar from "../templates/Navbar";
import cart from "../icons/cart.svg";
import { message } from "antd";
import { v4 } from "uuid";
import { useNavigate } from "react-router-dom";

export default function Cart() {
    const [userid, setUserId] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [userdata, setUserData] = useState([])

    const history = useNavigate()

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const loadCartData = async () => {
            try {
                const cartDocRef = doc(collection(DB, "cart"), userid);
                const cartDocSnap = await getDoc(cartDocRef);

                const userDocRef = doc(collection(DB, "users"), userid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userData) {
                        setUserData(userData);

                    }
                }

                if (cartDocSnap.exists()) {
                    const dataCart = cartDocSnap.data();
                    if (dataCart && dataCart.cart) {
                        setCartItems(dataCart.cart);
                    }
                }
            } catch (error) {
                console.error("Error loading cart data:", error);
            }
        };

        if (userid) {
            loadCartData();
        }
    }, [userid]);

    const handleToggleItem = (price, isChecked, index, docId) => {
        // Update the checked status, docId, and timestamp for the item
        const updatedCart = cartItems.map((cartItem, idx) => {
            if (index === idx) {
                // Include timestamp when the item is checked
                return { ...cartItem, checked: isChecked, docId: docId, timestamp: serverTimestamp() };
            }
            return cartItem;
        });
        setCartItems(updatedCart);
        // Update total price
        setTotalPrice((prevTotalPrice) =>
            isChecked ? prevTotalPrice + price : prevTotalPrice - price
        );
    };


    const handleDeleteItem = async (itemIndex) => {
        try {
            console.log("Item index to remove:", itemIndex);

            // Fetch the latest cart document data
            const cartDocRef = doc(DB, "cart", userid);
            const cartDocSnap = await getDoc(cartDocRef);

            if (cartDocSnap.exists()) {
                // Get the current cart data
                const cartData = cartDocSnap.data();
                console.log("Current cart data:", cartData);

                // Remove the item from the cart array
                const updatedCart = cartData.cart.filter((item, index) => index !== itemIndex);
                console.log("Updated cart:", updatedCart);

                // Update the cart document in Firestore
                await updateDoc(cartDocRef, { cart: updatedCart });
                console.log("Item removed from Firestore.");

                // Update the cartItems state to reflect the change
                setCartItems(updatedCart);
                console.log("Cart items state updated.");
            } else {
                console.log("Cart document does not exist.");
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    const handleConfirmPurchase = async () => {
        // Check if userdata.barangay and userdata.phoneNumber exist
        if (!userdata.barangay || !userdata.phoneNumber) {
            // If either userdata.barangay or userdata.phoneNumber is missing, display an error message
            message.error("Please set up phone number and barangay in settings before proceeding");
            return;
        }

        try {
            // Filter out only the checked items from the cart
            const checkedItems = cartItems.filter(item => item.checked)
                .map(item => ({
                    purchaseId: v4(),
                    docId: item.docId,
                    quantity: item.quantity,
                    color: item.color,
                    size: item.size,
                    variety: item.variety,
                    timestamp: new Date(), // Generate timestamp on the client side
                    status: "Pending",
                    userId: userid,

                }));

            if (checkedItems.length === 0) {
                // If no items are checked, display an error message
                message.error("Please select items to purchase before proceeding");
                return;
            }

            // Check if the requested quantity exceeds the available quantity for any product
            for (const item of checkedItems) {
                const productDocRef = doc(DB, "shopitems", item.docId);
                const productDocSnapshot = await getDoc(productDocRef);
                if (productDocSnapshot.exists()) {
                    const productData = productDocSnapshot.data(); // Fetch productData
                    if (item.quantity > productData.quantity) {
                        // If the requested quantity exceeds the available quantity, display an error message
                        message.error(`Not enough stock available for ${productData.name}. Please reduce the quantity.`);
                        return;
                    }
                } else {
                    // If the product document doesn't exist, display an error message
                    message.error(`Product with ID ${item.docId} not found.`);
                    return;
                }
            }

            // Create a new purchase document with the checked items
            const purchaseDocRef = doc(DB, `purchases/${userid}`);
            const purchaseDocSnapshot = await getDoc(purchaseDocRef);

            let mergedItems = [];
            if (purchaseDocSnapshot.exists()) {
                // If the document exists, merge existing items with new items
                const existingItems = purchaseDocSnapshot.data().items;
                mergedItems = [...existingItems, ...checkedItems];
            } else {
                // If the document doesn't exist, use only the new items
                mergedItems = checkedItems;
            }

            await setDoc(purchaseDocRef, {
                items: mergedItems
            });

            const quantityToUpdate = {};

            checkedItems.forEach(item => {
                if (quantityToUpdate[item.docId] === undefined) {
                    quantityToUpdate[item.docId] = 0;
                }
                quantityToUpdate[item.docId] += item.quantity;
            });

            // Update the quantity of each purchased item in the shopitems collection
            await Promise.all(Object.entries(quantityToUpdate).map(async ([docId, totalQuantity]) => {
                const productDocRef = doc(DB, "shopitems", docId);
                const productDocSnapshot = await getDoc(productDocRef);
            
                if (productDocSnapshot.exists()) {
                    const currentQuantity = productDocSnapshot.data().quantity;
                    const updatedQuantity = currentQuantity - totalQuantity;
            
                    // Ensure the updated quantity is not negative
                    const newQuantity = updatedQuantity >= 0 ? updatedQuantity : 0;
            
                    // Update the quantity of the product in the shopitems collection
                    await updateDoc(productDocRef, {
                        quantity: newQuantity
                    });
                }
            }));

            // Remove the checked items from both the cartItems state and Firestore
            const updatedCart = cartItems.filter(item => !item.checked);
            setCartItems(updatedCart); // Update the cartItems state

            // Update the cart document in Firestore
            const cartDocRef = doc(DB, "cart", userid);
            await updateDoc(cartDocRef, { cart: updatedCart });

            console.log("Checked items removed from Firestore.");

            setTotalPrice(0);

            // Provide feedback to the user
            message.success("Purchase confirmed successfully!");

            history("/mypurchase")

        } catch (error) {
            console.error("Error confirming purchase:", error);
            // Provide error feedback to the user
            message.error("Error confirming purchase. Please try again later.");
        }
    };







    return (
        <div>
            <Navbar />
            <div className="h-fit w-fit gap-3 p-3 pt-24 mb-2 flex flex-col items-center m-auto overflow-y-auto ">
                <div className="self-start flex justify-start items-center gap-2">
                    <img className="w-9 h-9" src={cart} alt="" />
                    <h1 className="font-Roboto font-bold text-2xl">CART</h1>
                </div>
                {cartItems.map((item, index) => (
                    <ItemCart
                        key={index}
                        item={item}
                        price={item.price}
                        index={index} // Pass index as prop
                        onDeleteItem={handleDeleteItem} // Pass handleDeleteItem directly
                        onToggleItem={handleToggleItem}
                    />
                ))}
                <div className="flex justify-between bg- px-5 py-1 w-full rounded">
                    <h1 className="font-Roboto font-semibold text-4xl">Total</h1>
                    <h1 className="font-Roboto font-semibold text-4xl">
                        ₱{totalPrice.toFixed(2)}
                    </h1>
                </div>
                <button
                    onClick={handleConfirmPurchase}
                    className="bg-green-600 py-2 px-5 rounded-lg tracking-wider text-white text-base font-Roboto font-semibold hover:bg-green-700 active:bg-green-800">
                    Confirm purchase
                </button>
            </div>
        </div>
    );
}
