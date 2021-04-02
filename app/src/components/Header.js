import React from 'react';
import { AccountData } from '@drizzle/react-components';


const Header = () => {
    return (
        <header className='header'>
            <h1> User : </h1>
            <ul>
                <h2>  Account Data : </h2>
                <AccountData accountIndex={0} units={"ether"} precision={3}/>
            </ul>
        </header>    
    )
}

export default Header;
