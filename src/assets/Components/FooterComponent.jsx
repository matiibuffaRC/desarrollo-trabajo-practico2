import React from 'react';
import { NavLink } from 'react-router-dom';

//Import icons
import homeIcon from "../icons/homeIcon.svg";
import cardIcon from "../icons/cardIcon.svg";
import profileIcon from "../icons/profileIcon.svg";
import statsIcon from "../icons/statIcon.svg";

function FooterComponent() {
    return (
        <div
            className='bg-white border-gray-200 fixed bottom-0 w-screen h-15 flex flex-row justify-center items-center border-t md:top-0 md:left-0 md:h-screen md:w-20 md:flex-col md:border-t-0 md:border-r'>
            <div
                className='flex flex-row items-center justify-center gap-15 w-ful md:flex-col md:gap-8'>
                <NavLink to="/" className={({ isActive }) => `p-2 rounded-full ${isActive ? 'bg-[#eee]' : 'hover:bg-[#eee]'}`}>
                    <img src={homeIcon} alt="Home-icon" className='h-5 w-5 cursor-pointer'/>
                </NavLink>

                <NavLink to="/activity" className={({ isActive }) =>`p-2 rounded-full ${isActive ? 'bg-[#eee]' : 'hover:bg-[#eee]'}`}>
                    <img src={cardIcon} alt="Card-icon" className='h-5 w-5 cursor-pointer'/>
                </NavLink>

                <NavLink to="/stats" className={({ isActive }) =>`p-2 rounded-full ${isActive ? 'bg-[#eee]' : 'hover:bg-[#eee]'}`}>
                    <img src={statsIcon} alt="" className='h-5 w-5 cursor-pointer'/>
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) =>`p-2 rounded-full ${isActive ? 'bg-[#eee]' : 'hover:bg-[#eee]'}`}>
                    <img src={profileIcon} alt="Profile-icon" className='h-5 w-5 cursor-pointer'/>
                </NavLink>
            </div>
        </div>
    )
}

export default FooterComponent;
