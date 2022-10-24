
import { StrictMode } from 'react'
import {render} from 'react-dom'
import { App } from './app'

const appContainer = document.getElementById('memex-root')

render(<StrictMode><App /></StrictMode>, appContainer)