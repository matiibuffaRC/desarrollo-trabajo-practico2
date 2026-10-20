import React from 'react';
import { NavLink } from 'react-router-dom';

import homeIcon from "../icons/homeIcon.svg";
import cardIcon from "../icons/cardIcon.svg";
import profileIcon from "../icons/profileIcon.svg";
import statsIcon from "../icons/statIcon.svg";

function FooterComponent() {
    return (
        <div className='fixed bottom-0 left-0 z-50 h-16 w-full border-t border-slate-200/80 bg-white/90 backdrop-blur-md md:top-0 md:h-screen md:w-52 md:border-r md:border-t-0 md:pb-8 md:pt-8'>
            <div className='flex h-full w-full items-center justify-around px-4 md:flex-col md:items-stretch md:justify-start md:gap-3 md:px-3'>
                <NavItem to="/" icon={homeIcon} label="Inicio" />
                <NavItem to="/activity" icon={cardIcon} label="Actividad" />
                <NavItem to="/stats" icon={statsIcon} label="Estadísticas" />
                <NavItem to="/profile" icon={profileIcon} label="Perfil" />
            </div>
        </div>
    );
}

function NavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `flex items-center justify-center gap-3 rounded-full p-2.5 transition-all duration-200 md:w-full md:justify-start md:rounded-2xl md:px-3 md:py-2.5 ${isActive ? 'bg-violet-100 text-violet-700 shadow-sm ring-1 ring-violet-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
            <img src={icon} alt={`${label}-icon`} className='h-5 w-5' />
            <span className='hidden text-sm font-medium md:block'>{label}</span>
        </NavLink>
    );
}

export default FooterComponent;