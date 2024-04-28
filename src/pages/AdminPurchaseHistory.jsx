import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { DB } from "../firebase";
import Navbar from "../templates/Navbar";

export default function AdminPurchaseHistory() {
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchPurchaseHistory = async () => {
            try {
                const purchaseHistorySnapshot = await getDocs(collection(DB, "purchases"));
                const purchases = purchaseHistorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Purchase history:", purchases); // Log the fetched purchase history

                // Fetch user data for each item
                const updatedPurchaseHistory = await Promise.all(purchases.map(async purchase => {
                    const updatedItems = await Promise.all(purchase.items.map(async item => {
                        const userDocRef = doc(DB, "users", item.userId);
                        const userDocSnapshot = await getDoc(userDocRef);
                        const shopitemDocRef = doc(DB, "shopitems", item.docId)
                        const shopitemDocSnapshot = await getDoc(shopitemDocRef)

                        if (userDocSnapshot.exists() && shopitemDocSnapshot.exists()) {
                            const userData = userDocSnapshot.data();
                            const itemData = shopitemDocSnapshot.data();
                            return { ...item, username: userData.username, phone: userData.phoneNumber, barangay: userData.barangay, productname: itemData.name, costperitem: itemData.price };
                        }
                        return item;

                    }));
                    return { ...purchase, items: updatedItems };
                }));

                setPurchaseHistory(updatedPurchaseHistory);
            } catch (error) {
                console.error("Error fetching purchase history:", error);
            }
        };

        fetchPurchaseHistory();
    }, []);

    const handleStatusUpdate = async (userId, purchaseId, newStatus) => {
        try {
            const purchaseDocRef = doc(DB, "purchases", userId);
            const purchaseDocSnapshot = await getDoc(purchaseDocRef);

            if (!purchaseDocSnapshot.exists()) {
                console.error("Document does not exist for user:", userId);
                return;
            }

            const purchaseData = purchaseDocSnapshot.data();
            const updatedItems = purchaseData.items.map(item => {
                if (item.purchaseId === purchaseId) {
                    return { ...item, status: newStatus };
                }
                return item;
            });

            await setDoc(purchaseDocRef, { items: updatedItems }, { merge: true });
            console.log("Status updated successfully");
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };


    // Function to toggle expand/collapse for a specific purchase ID
    const toggleExpand = (id) => {
        if (expandedId === id) {
            setExpandedId(null); // Collapse if already expanded
        } else {
            setExpandedId(id); // Expand if collapsed
        }
    };

    return (
        <div className="overflow-x-auto">
            <Navbar />
            <div className="pt-28 pb-5 flex flex-col items-center w-screen">
                <div>
                    <h2 className="font-Roboto font-semibold text-2xl mb-3">Purchase History (Admin)</h2>
                    <table className="py-1 px-1 border-separate border-spacing-x-3 border-spacing-y-5 border border-black rounded-md mb-6 max-w-4xl overflow-x-auto">
                        <thead>
                            <tr>
                                <th className="font-Roboto font-semibold text-sm">Buyer</th>
                                <th className="font-Roboto font-semibold text-sm">Purchase ID</th>
                                <th className="font-Roboto font-semibold text-sm">Barangay</th>
                                <th className="font-Roboto font-semibold text-sm">Phone</th>
                                <th className="font-Roboto font-semibold text-sm">Product Name</th>
                                <th className="font-Roboto font-semibold text-sm">Cost/Item</th>
                                <th className="font-Roboto font-semibold text-sm">Color</th>
                                <th className="font-Roboto font-semibold text-sm">Variety</th>
                                <th className="font-Roboto font-semibold text-sm">Quantity</th>
                                <th className="font-Roboto font-semibold text-sm">Total</th>
                                <th className="font-Roboto font-semibold text-sm">Timestamp</th>

                                <th className="font-Roboto font-semibold text-base">Status</th>
                                <th className="font-Roboto font-semibold text-base">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseHistory.map((purchase, index) => (
                                <React.Fragment key={index}>
                                    {purchase.items.map((item, idx) => (
                                        <tr key={`${index}-${idx}`}>
                                            <td className="text-center font-Roboto font-normal text-sm">{item.username}</td>
                                            <td className="text-center font-Roboto font-normal text-sm">
                                                {expandedId === `${index}-${idx}` ? (
                                                    <>
                                                        {item.purchaseId}{" "}
                                                        <button onClick={() => toggleExpand(null)}>Collapse</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {item.purchaseId.split("-")[0]}-...{" "}
                                                        <button onClick={() => toggleExpand(`${index}-${idx}`)}>
                                                            ...
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                            <td className="text-center font-Roboto font-normal text-sm">{item.barangay}</td>
                                            <td className="text-center font-Roboto font-normal text-sm">{item.phone}</td>
                                            <td className="text-center font-Roboto font-normal text-sm">{item.productname}</td>
                                            <td className="text-center font-Roboto font-normal text-sm">₱{item.costperitem}</td>
                                            <td className="text-center font-Roboto font-normal text-sm">
                                                <div
                                                    className={`w-10 h-5 rounded ring-blue-gray-900 ring-1 m-auto`}
                                                    style={{ backgroundColor: item.color }}>
                                                </div>
                                            </td>
                                            <td className="text-center font-Roboto font-normal text-sm">{item.variety}</td>
                                            <td className="text-center font-Roboto font-normal text-sm">{item.quantity}</td>
                                            <td className="text-center font-Roboto font-normal text-sm">₱{item.costperitem * item.quantity}</td>
                                            <td className="text-center font-Roboto font-normal text-sm">
                                                {item.timestamp && new Date(item.timestamp.seconds * 1000).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </td>
                                            <td className="">
                                                <input
                                                    type="text"
                                                    value={item.status}
                                                    className="font-Roboto font-semibold text-sm text-center"
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value;
                                                        setPurchaseHistory(prevPurchaseHistory => {
                                                            const updatedPurchaseHistory = [...prevPurchaseHistory];
                                                            updatedPurchaseHistory[index].items[idx].status = newStatus;
                                                            return updatedPurchaseHistory;
                                                        });
                                                    }}
                                                />
                                            </td>
                                            <td className="text-center font-Roboto font-bold text-sm text-green-900">
                                                <button
                                                    onClick={() => handleStatusUpdate(purchase.id, item.purchaseId, item.status)}
                                                >
                                                    Update
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>

        </div>
    );
}
