import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <form>
          <input type="text" placeholder="Enter your name" />
          <select multiple>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
          <input type="email" placeholder="Enter your email" />
          <button>Submit</button>
        </form>
      </header>
    </div>
  );
}

export default App;
