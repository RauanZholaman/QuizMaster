import './App.css';
import { useState } from 'react';
import Header from './Header.js';
import QuestionBank from './pages/QuestionBank.js';

import './firebaseConfig.js';
import { getFirestore, addDoc, collection, getDocs, querySnapshot } from "firebase/firestore"; 

export default function App() {
  // const [count, setCount] = useState(0);

  // function handleClick() {
  //   setCount(count + 1);
  // }

  const [inputValue1, setInputValue1] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  let [storedValues, setStoredValues] = useState([]);

  const db = getFirestore();

  const saveDataToFirestore = async () => {
    const docRef = await addDoc(collection(db, "myCollection"), {
      Email: inputValue1,
      Password: inputValue2,
    });
    alert("Input written tp Database");
  }; 

  const fetchDataFromFirestore = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const temporaryArr = [];
    querySnapshot.forEach((doc) => {
        temporaryArr.push(doc.data());
    });
    setStoredValues(temporaryArr);
  }

  return (
    <div className="App">

      <h1>Save data to database</h1>
      <input
        type="text"
        value={inputValue1}
        onChange={(e) => setInputValue1(e.target.value)}
      />
      <input
        type="text"
        value={inputValue2}
        onChange={(e) => setInputValue2(e.target.value)}
      />
      <button onClick={saveDataToFirestore}>Save to Firestore</button> <br/>
      <button onClick={fetchDataFromFirestore}>Fetch from Firestore</button> <br/>

      <div>
        {storedValues.map( (item, index) => (
          <div key={index}>
            <p>{item.field1}: {item.field2}</p>
          </div>
        )
        )}
      </div>

      <Header/>
      <div className="Body">
        
        {/* <MyButton count={count} onClick={handleClick}/>
        <MyButton count={count} onClick={handleClick}/>

        <h3>Displaying count: {count}</h3>
        <DisplayUserInfo/> */}
  
        <QuestionBank/>
      </div>
    </div>
  );
}

function MyButton({ count, onClick}) {
  return (
    <button onClick={onClick}>
       Clicked {count} times 
    </button>
  );
}

function DisplayUserInfo() {
  
  const user = {
    name: 'Zholaman Rauan',
    age: 23,
  };
  
  return (
    <>
    <h3>{user.name}</h3>
    <h3>Age: {user.age}</h3>
    </>
  )
}

function DisplayList() {

  const products = [
    { title: 'Cabbage', id: 1, isFruit: false},
    { title: 'Watermelon', id: 2, isFruit: true},
    { title: 'Apple', id: 3, isFruit: true},
  ];

  const listItems = products.map(product => 
    <li key={product.id}
        style={{
          color: product.isFruit ? 'magenta' : 'darkgreen'
        }}
    >
      {product.title}
    </li>
  );

  return (
    <ul>{listItems}</ul>
  );
}

function Profile() {

  return (
    <div class="container">
      <div class="img">
        <img
          src={myImage}
          alt="Big Boss "
          className="Profile-img"
        />
      </div>
      <div class="content"><h1>Big Boss</h1></div>
    </div>
  )
}


