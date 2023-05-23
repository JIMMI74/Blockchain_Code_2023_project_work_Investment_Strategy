import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import logo from "../img/logo.png"




const Navbar = (props) => {
  return (
    <nav className="App-nav">
      <div className="nav-center">
        <div className="nav-header">
          <img className="logo" alt="logo" src={logo} />
          <button className="nav-toggle">
            <i className="fas fa-bars"></i>
          </button>
        </div>


        <ul className="nav-links">
          <li>
            <a className="App-a" href="./index.html">
              home
            </a>
          </li>

          <li>
            <Link to="/login">Login</Link>
          </li>


          <li>
            <Link to="/logout">Logout</Link>
          </li>


          <li>
            <Link to="/user">User</Link>
          </li>


          <li>
            <Link to="/register">Register</Link>
          </li>

        </ul>
        <small>
          <p className="App-p">ACCOUNT NUMBER : <strong>{props.account}</strong></p>
          <p>Balance CashToken (stake) : <strong>{props.balanceCashTokenUser}</strong></p>
          <p>Total Cupon Received from Stake: <strong>{props.balanceCouponUser}</strong></p>
          <p>Balance USDTCash (accumulation): <strong>{props.BalanceUSDTcash}</strong></p>
          <p>Total AkToken Received from Acccumulation Plane: <strong>{props.BalanceAkToken}</strong></p>
        </small>

        <ul className="social-icons">
          <a href="https://www.facebook.com">
            <FontAwesomeIcon size="2x" icon={faFacebook} />{" "}
            {/* le size sono in XS LG SX*/}
          </a>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;