import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import logo from "../img/logo.png"




const Navbar = (props) => {
  return (
    <nav className="App-nav">
      <section>
        <div className="strategygroup">
          <h2>STRATEGYGROUP</h2>
          <h2>STRATEGYGROUP</h2>
        </div>
      </section>
      <div className="nav-center">
        <div className="nav-header">
          <img className="logo" alt="logo" src={logo} />
          <button className="nav-toggle">
            <i className="fas fa-bars"></i>
          </button>
        </div>


        <ul className="nav-links" >
          <li >
            <a className="App-a" href="./index.html" style={{ fontSize: "20px", fontFamily: "italic" }}>
              home
            </a>
          </li>

          <li >
            <Link to="/login" style={{ fontSize: "20px", fontFamily: "italic" }}>Login</Link>
          </li>


          <li>
            <Link to="/logout" style={{ fontSize: "20px", fontFamily: "italic" }}>Logout</Link>
          </li>


          <li>
            <Link to="/user" style={{ fontSize: "20px", fontFamily: "italic" }}>User</Link>
          </li>


          <li>
            <Link to="/register" style={{ fontSize: "20px", fontFamily: "italic" }}>Register</Link>
          </li>

        </ul>
        <small style={{ fontSize: "20px", fontFamily: "italic" }}>
          <p className="white-text ">ACCOUNT NUMBER : <strong>{props.account}</strong></p>
          <p className="green-text gap margin"><strong>Balance USDT (stake) : {props.balanceCashTokenUser}</strong></p>
          <p className="blue-text gap" ><strong>Total Cupon Received from Stake: {props.balanceCouponUser}</strong></p>
          <p className="green-text gap"><strong>Balance USDT (accumulation): {props.BalanceUSDTcash}</strong></p>
          <p className="gold-text "><strong>Total AkToken Received from Accumulation Plane: {props.BalanceAkToken}</strong></p>
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