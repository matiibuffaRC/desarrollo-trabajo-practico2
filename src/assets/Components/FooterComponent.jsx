import React from 'react';
import { NavLink } from 'react-router-dom';

//Import icons
import homeIcon from "../icons/homeIcon.svg";
import cardIcon from "../icons/cardIcon.svg";
import profileIcon from "../icons/profileIcon.svg";
import statsIcon from "../icons/statIcon.svg";

function FooterComponent() {
    return (
        <div className='bg-white border-gray-200 fixed bottom-0 w-screen h-15 flex flex-row justify-center items-center border-t 
                        md:top-0 md:left-0 md:h-screen md:w-45 md:flex-col md:border-t-0 md:border-r md:justify-start md:pt-10'>

            <div className='flex flex-row items-center justify-center gap-10 w-full px-10
                            md:flex-col md:gap-3 md:items-start md:px-4'>

                <NavItem to="/" icon={homeIcon} label="Inicio" />
                <NavItem to="/activity" icon={cardIcon} label="Actividad" />
                <NavItem to="/stats" icon={statsIcon} label="Estadísticas" />
                <NavItem to="/profile" icon={profileIcon} label="Perfil" />

            </div>
        </div>
    )
}

function NavItem({ to, icon, label }) {
    return (
        <NavLink 
            to={to}
            className={({ isActive }) => `
                flex justify-center items-center gap-3 
                
                /* MOBILE */
                w-10 h-10 rounded-full
                
                /* DESKTOP */
                md:w-full md:h-auto md:justify-start md:px-3 md:py-2 md:rounded-lg
                
                ${isActive ? 'bg-[#eee]' : 'hover:bg-[#eee]'}
            `}
        >
            <img src={icon} alt={`${label}-icon`} className='h-5 w-5' />
            <span className='hidden md:block text-sm'>{label}</span>
        </NavLink>
    )
}

export default FooterComponent;
