import React from 'react';

//Import icons
import homeIcon from "../icons/homeIcon.svg";
import cardIcon from "../icons/cardIcon.svg";
import profileIcon from "../icons/profileIcon.svg";
import statsIcon from "../icons/statIcon.svg";

function FooterComponent() {
  return (
    <div className='border border-black h-15 flex flex-col justify-center items-center'>
        <div className='flex flex-row items-center justify-center gap-15 w-full'>
            <div className='hover:bg-[#eee] p-2 rounded-full'>
                <img src={homeIcon} alt="Home-icon" className='h-5 w-5 hover:cursor-pointer'/>
            </div>
            <div className='hover:bg-[#eee] p-2 rounded-full'>
                <img src={cardIcon} alt="Card-icon" className='h-5 w-5 hover:cursor-pointer'/>
            </div>
            <div className='hover:bg-[#eee] p-2 rounded-full'>
                <img src={statsIcon} alt="" className='h-5 w-5 hover:cursor-pointer'/>
            </div>
            <div className='hover:bg-[#eee] p-2 rounded-full'>
                <img src={profileIcon} alt="Profile-icon" className='h-5 w-5 hover:cursor-pointer'/>
            </div>
        </div>
    </div>
  )
}

export default FooterComponent
