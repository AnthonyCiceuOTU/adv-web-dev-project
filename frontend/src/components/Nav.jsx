import React from 'react'
export default function Nav({onLogout}){
  return (<nav style={{display:'flex',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid #eee'}}>
    <strong>QuizMaster</strong><button onClick={onLogout}>Logout</button></nav>)
}
