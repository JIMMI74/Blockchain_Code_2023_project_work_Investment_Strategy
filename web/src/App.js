import { BrowserRouter,Route,Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import StrategyOneInterface from  './utils/StrategyOneInterface';
import CahTokenInterface from './utils/CashTokenInterface';


function App() {
  return (
    <BrowserRouter>
      <div>
     
        <Routes>
          <Route path='/' element={<Home />} />
         
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

// Path: web/src/pages/Home.js
