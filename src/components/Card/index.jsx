import React from 'react'

import classes from './classes.css'

const Card = () => (
  <div className={ classes.Card }>
    { process.env.NAME }
  </div>
)

export default Card
