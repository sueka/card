import React from 'react'
import { Switch, Route } from 'react-router-dom'

import IndexPage from '../IndexPage'

const App = () => (
  <Switch>
    <Route exact strict sensitive path="/" component={ IndexPage } />
  </Switch>
)

export default App
