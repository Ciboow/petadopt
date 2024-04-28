import React from "react";
import { NavLink } from "react-router-dom";
import Navbar from "../templates/Navbar";
import background from "../images/bg_1.jpg"
import leftarrow from "../icons/left-arrow.svg"
import cat from "../images/cat_peek.png"
import dog from "../images/dog_1.png"


export default function Home() {
    return (
        <div className="relative bg-fixed bg-no-repeat bg-center bg-cover h-screen" style={{ backgroundImage: `url(${background})` }}>
            <Navbar />

            
            <div className=" flex w-screen h-full justify-center">

                <div className=" flex flex-col justify-center items-center w-5/12 h-full">
                    <div className=" w-9/12 transition ease-in-out delay-150  hover:-translate-y-1 hover:scale-110  duration-300">
                    
                        <h1 className=" font-Roboto font-semibold text-6xl text-black">Welcome to PETSLAND!</h1>
                        <h2 className=" font-Roboto text-2xl mt-2 text-black">Unlock Pet Paradise - Where Quality Meets Convenience!</h2>

                    </div>




                </div>



            </div>


        </div>


    )

}
