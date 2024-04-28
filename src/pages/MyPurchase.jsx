import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, query, where } from "firebase/firestore";
import { DB, auth } from "../firebase";
import TableRow from "../templates/TableRow";
import Navbar from "../templates/Navbar";

export default function MyPurchase() {
    const [purchaseData, setPurchaseData] = useState([]);
    const [currentUserID, setCurrentUserID] = useState(null);

    useEffect(() => {
        // Listen for changes in authentication state
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in, get the user ID
                setCurrentUserID(user.uid);
            } else {
                // User is signed out
                setCurrentUserID(null);
            }
        });

        return () => unsubscribe(); // Cleanup function
    }, []);

    useEffect(() => {
        const fetchPurchaseData = async () => {
            try {
                if (currentUserID) {
                    const queryDocRef = doc(collection(DB, "purchases"), currentUserID);
                    const querySnapshot = await getDoc(queryDocRef);

                    if (querySnapshot.exists()) {
                        setPurchaseData([{ id: querySnapshot.id, ...querySnapshot.data() }]);
                    } else {
                        setPurchaseData([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching purchase data:", error);
            }
        };

        fetchPurchaseData();
    }, [currentUserID]);

    return (
        <div className="flex flex-col items-center overscroll-x-auto">
            <Navbar />
            <div className="pt-24">
                <h1 className="font-Roboto font-bold text-2xl mb-3">Purchase History</h1>
                <table className="border-separate border-spacing-10 border border-black rounded-md mb-6 max-w-5xl">
                    <thead>
                        <tr>
                            
                            <th className=" font-Roboto font-semibold text-lg text-black">Product Name</th>
                            <th className=" font-Roboto font-semibold text-lg text-black">Color</th>
                            <th className=" font-Roboto font-semibold text-lg text-black">Variety</th>
                            <th className=" font-Roboto font-semibold text-lg text-black">Size</th>
                            <th className=" font-Roboto font-semibold text-lg text-black">Quantity</th>
                            <th className=" font-Roboto font-semibold text-lg text-black">Price</th>
                            <th className=" font-Roboto font-semibold text-lg text-black">Total</th>
                            <th className=" font-Roboto font-semibold text-lg text-black">Timestamp</th>
                            <th className=" font-Roboto font-semibold text-lg text-black">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseData.map((purchase) => (
                            <TableRow key={purchase.id} purchase={purchase} />
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
